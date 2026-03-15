import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { RobloxService } from "@/lib/roblox-service";
import { decryptKey } from "@/lib/encryption";

const SubmissionSchema = z.object({
  app_id: z.string().uuid(),
  applicant_id: z.number().or(z.string()),
  membership_id: z.string().optional(),
  answers: z.record(z.string(), z.any())
});

async function batchGradeShortAnswers(items: any[], apiKey: string) {
  if (items.length === 0) return [];
  const prompt = `
    You are an objective grader for Roblox group applications.
    Grade each short answer on a scale of 0-max_score.
    
    ${items.map((item, i) => `
      ITEM ${i} (id=${item.id})
      Max score: ${item.max_score}
      Question: ${item.question}
      Answer: ${item.answer}
      Criteria: ${item.criteria || 'No specific criteria'}
    `).join('\n')}
    
    Return ONLY valid JSON:
    { "results": [
      {"id": "q1", "score": 8.5, "feedback": "Good answer"},
      ...
    ]}
  `;

  const baseUrl = process.env.ABACUS_AI_BASE_URL || "https://routellm.abacus.ai/v1";
  const model = process.env.ABACUS_AI_MODEL || "gemini-3-flash-preview";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  const data = await response.json();
  const text = data.choices[0].message.content;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch[0]);
  
  return parsed.results;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = SubmissionSchema.parse(body);

    const application = await db.application.findUnique({
      where: { id: validated.app_id },
      include: { user: true }
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const questions = JSON.parse(application.questions_json);
    let totalScore = 0;
    let maxScore = 0;
    const breakdown: any = {};
    const shortAnswersToGrade = [];

    // First pass: grade multiple choice and true/false
    for (const q of questions) {
      maxScore += q.max_score;
      const userAnswer = validated.answers[q.id];

      if (q.type === 'multiple_choice' || q.type === 'true_false') {
        const isCorrect = String(userAnswer) === String(q.correct_answer);
        const score = isCorrect ? q.max_score : 0;
        totalScore += score;
        breakdown[q.id] = {
           type: q.type,
           score,
           max_score: q.max_score,
           feedback: isCorrect ? "Correct" : "Incorrect"
        };
      } else if (q.type === 'short_answer') {
        shortAnswersToGrade.push({
          id: q.id,
          question: q.text,
          max_score: q.max_score,
          answer: userAnswer,
          criteria: q.grading_criteria
        });
      }
    }

    // Second pass: AI grading for short answers
    const aiApiKey = process.env.ABACUS_AI_API_KEY;
    if (shortAnswersToGrade.length > 0) {
       if (aiApiKey) {
           const aiResults = await batchGradeShortAnswers(shortAnswersToGrade, aiApiKey);
           for (const res of aiResults) {
              totalScore += res.score;
              breakdown[res.id] = {
                 type: "short_answer",
                 score: res.score,
                 max_score: shortAnswersToGrade.find(s => s.id === res.id)?.max_score || 10,
                 feedback: res.feedback
              };
           }
       } else {
           // Mock grading if no API key
           for (const q of shortAnswersToGrade) {
               totalScore += q.max_score;
               breakdown[q.id] = {
                 type: "short_answer",
                 score: q.max_score,
                 max_score: q.max_score,
                 feedback: "Mock perfectly graded due to missing AI Key"
              };
           }
       }
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const passed = percentage >= application.pass_score;

    let promotionResult = { success: false, message: "Not attempted" };

    if (passed) {
       // Attempt to promote user if passed
       try {
           const apiKeyRecord = await db.apiKey.findFirst({
               where: { user_id: application.user_id, type: 'roblox' }
           });

           if (apiKeyRecord) {
               const decryptedKey = decryptKey(apiKeyRecord.encrypted_key);
               const robloxService = new RobloxService(decryptedKey);

               let memberId = validated.membership_id;
               if (!memberId) {
                  const membership = await robloxService.getMembership(application.group_id, String(validated.applicant_id));
                  if (membership) {
                      memberId = membership.path.split('/').pop();
                  }
               }

               if (memberId) {
                   await robloxService.promoteUser(application.group_id, memberId, application.target_role);
                   promotionResult = { success: true, message: `Promoted to ${application.target_role}` };
               } else {
                   promotionResult = { success: false, message: "Could not locate group membership" };
               }
           } else {
               promotionResult = { success: false, message: "No Roblox API Key configured" };
           }
       } catch (error: any) {
           promotionResult = { success: false, message: error.message || "Promotion API call failed" };
       }
    }

    await db.applicationSubmission.create({
        data: {
           application_id: application.id,
           roblox_user_id: String(validated.applicant_id),
           membership_id: validated.membership_id,
           answers_json: JSON.stringify(validated.answers),
           score: totalScore,
           max_score: maxScore,
           passed: passed,
           promotion_status: promotionResult.success ? "success" : "failed",
           feedback: passed ? "Congratulations!" : "Keep trying!"
        }
    });

    return NextResponse.json({
        success: true,
        passed,
        total_score: totalScore,
        max_score: maxScore,
        percentage,
        breakdown,
        promotion: {
            ...promotionResult,
            group_id: application.group_id,
            target_role: application.target_role,
        }
    }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input", details: error.issues }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
