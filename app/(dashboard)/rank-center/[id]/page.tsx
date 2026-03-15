import { RankCenterBuilder } from "@/components/rank-center/RankCenterBuilder";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function EditRankCenterPage({ params }: { params: { id: string } }) {
  const token = cookies().get("accessToken")?.value;
  if (!token) return redirect("/login");
  
  let user;
  try {
     user = jwt.verify(token, process.env.JWT_SECRET || "your-super-secret-key-min-32-chars") as { id: number };
  } catch {
     return redirect("/login");
  }

  const rankCenter = await db.rankCenter.findUnique({
    where: { id: params.id, user_id: user.id }
  });

  if (!rankCenter) {
    return (
       <div className="mx-auto max-w-7xl">
           <p className="text-red-500">Rank Center not found or access denied.</p>
       </div>
    );
  }

  const initialData = {
     ...rankCenter,
     ranks: JSON.parse(rankCenter.ranks_json),
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Rank Center: {rankCenter.name}</h1>
      </div>
      <RankCenterBuilder initialData={initialData} />
    </div>
  );
}
