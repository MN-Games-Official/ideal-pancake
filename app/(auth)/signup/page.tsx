import { SignupForm } from "@/components/auth/SignupForm";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create an Account</h1>
        <p className="text-sm text-slate-500 mb-6">Join Polaris Pilot for advanced Roblox automation.</p>
        <SignupForm />
        <p className="mt-4 text-sm text-slate-500">
          Already have an account? <Link href="/login" className="text-indigo-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
