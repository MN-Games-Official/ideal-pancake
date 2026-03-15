import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function getUser() {
  const token = cookies().get("accessToken")?.value;
  if (!token) return null;
  try {
    // Note: Falling back to static keys here is for demonstration MVP only, 
    // real environments MUST supply JWT_SECRET securely.
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-super-secret-key-min-32-chars") as { id: number, full_name?: string };
    return decoded;
  } catch {
    return null;
  }
}

export const metadata = {
  title: "Dashboard - Polaris Pilot",
};

export default async function DashboardPage() {
  const user = await getUser();
  
  let stats = {
     applications: 0,
     submissions: 0,
     rankCenters: 0,
  };

  if (user) {
     stats.applications = await db.application.count({ where: { user_id: user.id } });
     stats.submissions = await db.applicationSubmission.count({ 
         where: { application: { user_id: user.id } } 
     });
     stats.rankCenters = await db.rankCenter.count({ where: { user_id: user.id } });
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, {user?.full_name || 'Admin'}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Here&apos;s an overview of your automated operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Applications</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{stats.applications}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Submissions</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{stats.submissions}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Rank Centers</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{stats.rankCenters}</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col items-center justify-center min-h-[300px]">
         <p className="text-slate-500 text-center">Your recent activity feed will appear here.<br/>Use the sidebar to navigate your modules.</p>
      </div>
    </div>
  );
}
