import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
     const existingKey = await db.apiKey.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!existingKey || existingKey.user_id !== user.id) {
       return NextResponse.json({ error: "API Key not found" }, { status: 404 });
    }

    await db.apiKey.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
