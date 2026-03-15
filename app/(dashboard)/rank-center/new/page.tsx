import { RankCenterBuilder } from "@/components/rank-center/RankCenterBuilder";

export default function NewRankCenterPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Rank Center</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Configure a new automated ranking center for your Roblox group.</p>
      </div>
      <RankCenterBuilder />
    </div>
  );
}
