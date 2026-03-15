import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const RankEntrySchema = z.object({
  id: z.string(),
  rank_id: z.number().min(1).max(255),
  gamepass_id: z.number(),
  name: z.string().min(1),
  description: z.string(),
  price: z.number().min(0),
  is_for_sale: z.boolean(),
  regional_pricing: z.boolean(),
});

const RankCenterSchema = z.object({
  name: z.string().min(3).max(100),
  group_id: z.string().regex(/^\d+$/),
  universe_id: z.string().optional(),
  ranks: z.array(RankEntrySchema)
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

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rankCenter = await db.rankCenter.findUnique({
      where: { id: params.id, user_id: user.id },
    });

    if (!rankCenter) {
      return NextResponse.json({ error: "Rank Center not found" }, { status: 404 });
    }

    const data = {
      ...rankCenter,
      ranks: JSON.parse(rankCenter.ranks_json)
    };

    return NextResponse.json({ success: true, rankCenter: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch rank center" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = RankCenterSchema.parse(body);

    const existingCenter = await db.rankCenter.findUnique({
      where: { id: params.id, user_id: user.id },
    });

    if (!existingCenter) {
       return NextResponse.json({ error: "Rank Center not found" }, { status: 404 });
    }

    const rankCenter = await db.rankCenter.update({
      where: { id: params.id },
      data: {
        name: validated.name,
        group_id: validated.group_id,
        universe_id: validated.universe_id,
        ranks_json: JSON.stringify(validated.ranks),
      }
    });

    return NextResponse.json({ success: true, rankCenter }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
     const existingCenter = await db.rankCenter.findUnique({
      where: { id: params.id, user_id: user.id },
    });

    if (!existingCenter) {
       return NextResponse.json({ error: "Rank Center not found" }, { status: 404 });
    }

    await db.rankCenter.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
