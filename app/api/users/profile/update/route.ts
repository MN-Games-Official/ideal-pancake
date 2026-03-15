import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const UpdateProfileSchema = z.object({
  full_name: z.string().max(100).optional(),
  avatar_url: z.string().url().or(z.literal("")).optional(),
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

export async function PUT(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = UpdateProfileSchema.parse(body);

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        full_name: validated.full_name,
        avatar_url: validated.avatar_url,
      }
    });

    return NextResponse.json({ success: true, user: { id: updatedUser.id, full_name: updatedUser.full_name, avatar_url: updatedUser.avatar_url } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input data", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
