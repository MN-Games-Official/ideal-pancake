import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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
  questions: z.array(z.any())
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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = ApplicationSchema.parse(body);

    const existingApp = await db.application.findUnique({
       where: { id: params.id, user_id: user.id }
    });

    if (!existingApp) {
       return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const shortAnswerCount = validated.questions.filter(q => q.type === 'short_answer').length;
    if (shortAnswerCount > 3) {
      return NextResponse.json(
        { success: false, error: "Maximum 3 short-answer questions allowed" },
        { status: 400 }
      );
    }

    const application = await db.application.update({
      where: { id: params.id },
      data: {
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

    return NextResponse.json({ success: true, application }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
