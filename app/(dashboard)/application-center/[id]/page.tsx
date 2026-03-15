import { ApplicationBuilder } from "@/components/applications/ApplicationBuilder";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function EditApplicationPage({ params }: { params: { id: string } }) {
  const token = cookies().get("accessToken")?.value;
  if (!token) return redirect("/login");
  
  let user;
  try {
     user = jwt.verify(token, process.env.JWT_SECRET || "your-super-secret-key-min-32-chars") as { id: number };
  } catch {
     return redirect("/login");
  }

  const application = await db.application.findUnique({
    where: { id: params.id, user_id: user.id }
  });

  if (!application) {
    return (
       <div className="mx-auto max-w-7xl">
           <p className="text-red-500">Application not found or access denied.</p>
       </div>
    );
  }

  const initialData = {
     ...application,
     questions: application.questions_json,
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Application: {application.name}</h1>
      </div>
      <ApplicationBuilder initialData={initialData} />
    </div>
  );
}
