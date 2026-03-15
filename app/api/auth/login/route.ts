import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email: validated.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(validated.password, user.password_hash);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET || "your-super-secret-key-min-32-chars";
    
    // In jsonwebtoken type definitions, expiresIn accepts numeric or a subset of string types (e.g., "24h").
    // We enforce the casting or literal usage to satisfy TypeScript.
    const expiresInValue: any = process.env.JWT_EXPIRES_IN || "24h";
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      secret,
      { expiresIn: expiresInValue }
    );

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          full_name: user.full_name,
        },
        access_token: accessToken,
      },
      { status: 200 }
    );

    response.cookies.set({
      name: "accessToken",
      value: accessToken,
      httpOnly: true,
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input data" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
