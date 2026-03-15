import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import crypto from "crypto";

const GenerationParamsSchema = z.object({
  name: z.string(),
  description: z.string(),
  group_id: z.string(),
  rank: z.string(),
  questions_count: z.number().min(1).max(20),
  vibe: z.string(),
  instructions: z.string().optional(),
});

async function getUser() {
  const token = cookies().get("accessToken")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-super-secret-key-min-32-chars") as { id: number };
    return decoded;
  } catch {
    return null;
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = GenerationParamsSchema.parse(body);

    const application = await db.application.findUnique({
      where: { id: params.id, user_id: user.id },
    });

    if (!application) {
       return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const apiKey = process.env.ABACUS_AI_API_KEY;
    const baseUrl = process.env.ABACUS_AI_BASE_URL || "https://routellm.abacus.ai/v1";
    const model = process.env.ABACUS_AI_MODEL || "gemini-3-flash-preview";

    // If API Key is not configured, return a mock response for testing/MVP
    if (!apiKey) {
      console.warn("ABACUS_AI_API_KEY is missing. Returning mocked AI generated form.");
      const mockQuestions = Array.from({ length: validated.questions_count }).map((_, i) => ({
        id: crypto.randomUUID(),
        type: i % 3 === 0 ? "multiple_choice" : (i % 3 === 1 ? "short_answer" : "true_false"),
        text: `Mocked AI Question ${i + 1} (${validated.vibe} tone)`,
        options: i % 3 === 0 ? ["Option A", "Option B", "Option C"] : undefined,
        correct_answer: i % 3 === 0 ? 0 : (i % 3 === 2 ? true : undefined),
        max_score: 10,
        grading_criteria: i % 3 === 1 ? "Must demonstrate logic." : undefined,
      }));

      return NextResponse.json({
        success: true,
        form: {
          questions: mockQuestions
        }
      });
    }

    const prompt = `
      You are an expert form designer for Roblox group applications.
      Create a ${validated.questions_count}-question application form with the following specs:
      - Name: ${validated.name}
      - Description: ${validated.description}
      - Target Group: ${validated.group_id}
      - Target Rank: ${validated.rank}
      - Tone: ${validated.vibe}
      ${validated.instructions ? `- Additional Instructions: ${validated.instructions}` : ""}
      
      Generate varied questions (multiple choice, short answer, true/false). Max 3 short answer questions.
      For each question provide:
      - id: unique string
      - type: one of the three types ('multiple_choice', 'short_answer', 'true_false')
      - text: the question
      - options: array of strings (if multiple_choice)
      - correct_answer: index for multiple choice, boolean for true_false
      - max_score: integer (usually 10)
      - grading_criteria: string (if short_answer)
      
      Return ONLY valid JSON with key "form" containing "questions" array.
    `;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
        stream: false,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
        throw new Error(`AI Provider Error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
       throw new Error("Failed to parse JSON from AI response.");
    }
    
    const parsedForm = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ success: true, form: parsedForm });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid parameters", details: error.issues }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to generate form" }, { status: 500 });
  }
}
