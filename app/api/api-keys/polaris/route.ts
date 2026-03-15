import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import crypto from "crypto";
import { encryptKey } from "@/lib/encryption";

const PolarisKeySchema = z.object({
  name: z.string().min(1),
  scopes: z.array(z.string()),
  expires_in: z.number().optional()
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

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = PolarisKeySchema.parse(body);

    const randomBytes = crypto.randomBytes(32).toString('hex');
    const fullKey = `polaris_${randomBytes}`;
    const encryptedKey = encryptKey(fullKey);
    const prefix = fullKey.substring(0, 12);

    const apiKey = await db.apiKey.create({
      data: {
        user_id: user.id,
        type: 'polaris',
        encrypted_key: encryptedKey,
        key_prefix: prefix,
      }
    });

    return NextResponse.json({ 
        success: true, 
        message: "Copy this key now. You won't be able to see it again.",
        api_key: fullKey,
        preview: prefix
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
