import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const QuestionSchema = z.object({
  id: z.string(),
  type: z.enum(['multiple_choice', 'short_answer', 'true_false']),
  text: z.string(),
  options: z.array(z.string()).optional(),
  correct_answer: z.union([z.number(), z.string(), z.boolean()]).optional(),
  max_score: z.number().min(1),
  grading_criteria: z.string().optional(),
});

const ApplicationSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  group_id: z.string().regex(/^\d+$/),
  target_role: z.string(),
  pass_score: z.number().min(0).max(100),
  style: z.object({
    primary_color: z.string(),
    secondary_color: z.string(),
  }).optional(),
  questions: z.array(QuestionSchema)
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

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const applications = await db.application.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ success: true, applications }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = ApplicationSchema.parse(body);

    const shortAnswerCount = validated.questions.filter(q => q.type === 'short_answer').length;
    if (shortAnswerCount > 3) {
      return NextResponse.json(
        { success: false, error: "Maximum 3 short-answer questions allowed" },
        { status: 400 }
      );
    }

    const application = await db.application.create({
      data: {
        user_id: user.id,
        name: validated.name,
        description: validated.description,
        group_id: validated.group_id,
        target_role: validated.target_role,
        pass_score: validated.pass_score,
        primary_color: validated.style?.primary_color || "#ff4b6e",
        secondary_color: validated.style?.secondary_color || "#1f2933",
        questions_json: JSON.stringify(validated.questions),
        style_json: JSON.stringify(validated.style || {}),
      }
    });

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
