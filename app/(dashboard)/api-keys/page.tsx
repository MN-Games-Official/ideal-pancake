import { RobloxKeyUpload } from "@/components/api-keys/RobloxKeyUpload";
import { PolarisKeyGenerator } from "@/components/api-keys/PolarisKeyGenerator";

export const metadata = {
  title: "API Keys - Polaris Pilot",
};

export default function ApiKeysPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">API Keys Management</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage connections to external services securely.</p>
      </div>
      <RobloxKeyUpload />
      <PolarisKeyGenerator />
    </div>
  );
}
