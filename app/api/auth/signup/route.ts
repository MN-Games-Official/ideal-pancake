import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import crypto from "crypto";

const signupSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
  full_name: z.string().max(100).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = signupSchema.parse(body);

    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: validated.email },
          { username: validated.username },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email or username already exists" },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(validated.password, salt);

    const user = await db.user.create({
      data: {
        email: validated.email,
        username: validated.username,
        full_name: validated.full_name,
        password_hash: hashedPassword,
      },
    });

    // We generate verification token here but for MVP simulation skipping actual SMTP sending if env not set
    const token = crypto.randomBytes(32).toString('hex');
    await db.emailVerification.create({
      data: {
        user_id: user.id,
        token: token,
        expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created. Please verify your email.",
        user: { id: user.id, email: user.email, username: user.username },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input data", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
