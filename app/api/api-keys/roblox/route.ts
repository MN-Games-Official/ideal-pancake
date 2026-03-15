import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { encryptKey } from "@/lib/encryption";

const RobloxKeySchema = z.object({
  api_key: z.string().min(10),
  validate: z.boolean().optional()
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
    const validated = RobloxKeySchema.parse(body);

    if (validated.validate) {
       // Optional: Ping Roblox API here to validate the token
       // e.g., fetch("https://apis.roblox.com/cloud/v2/groups/...", { headers: {"x-api-key": validated.api_key} })
    }

    const encryptedKey = encryptKey(validated.api_key);
    const prefix = "roblox_" + validated.api_key.substring(0, 4);

    const existingKey = await db.apiKey.findFirst({
       where: { user_id: user.id, type: 'roblox' }
    });

    if (existingKey) {
        await db.apiKey.update({
            where: { id: existingKey.id },
            data: { encrypted_key: encryptedKey, key_prefix: prefix, updated_at: new Date() }
        });
    } else {
        await db.apiKey.create({
            data: {
                user_id: user.id,
                type: 'roblox',
                encrypted_key: encryptedKey,
                key_prefix: prefix,
            }
        });
    }

    return NextResponse.json({ success: true, message: "Roblox API Key saved successfully" }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await db.apiKey.deleteMany({
       where: { user_id: user.id, type: 'roblox' }
    });
    return NextResponse.json({ success: true, message: "Roblox API Key deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
