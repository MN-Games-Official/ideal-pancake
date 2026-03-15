import { ApplicationBuilder } from "@/components/applications/ApplicationBuilder";

export const metadata = {
  title: "New Application - Polaris Pilot",
};

export default function NewApplicationPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Application</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Design a new application form to evaluate candidates.</p>
      </div>
      <ApplicationBuilder />
    </div>
  );
}
