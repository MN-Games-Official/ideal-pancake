import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Login to Polaris Pilot</h1>
        <LoginForm />
      </div>
    </div>
  );
}
