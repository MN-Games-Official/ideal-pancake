"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Lock, Plus, Copy, Trash2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export function PolarisKeyGenerator({ keys }: { keys?: any[] }) {
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newKeyData, setNewKeyData] = useState<{ api_key: string, preview: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const availableScopes = ["applications:read", "applications:write", "submissions:read", "submissions:write"];

  const handleGenerate = async () => {
    if (!name) return;
    setIsGenerating(true);
    setNewKeyData(null);
    setCopied(false);

    try {
      const response = await fetch("/api/api-keys/polaris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, scopes, expires_in: 2592000 }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setNewKeyData(data);
        setName("");
        setScopes([]);
      } else {
        alert(data.error || "Failed to generate key.");
      }
    } catch (e) {
      alert("An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (newKeyData) {
      navigator.clipboard.writeText(newKeyData.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to revoke this Polaris key? Integrations using it will fail.")) return;
    try {
      await fetch(`/api/api-keys/polaris/${id}`, { method: "DELETE" });
      window.location.reload();
    } catch (e) {
      alert("Failed to delete key.");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-6 mt-8">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
          <Lock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Polaris Integration Keys</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Generate keys to access the Polaris Pilot API from external services (like Roblox games).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Integration Name</label>
              <Input
                placeholder="My Game Client"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
               <label className="text-sm font-medium">Permissions (Scopes)</label>
               <div className="flex flex-wrap gap-2">
                  {availableScopes.map(scope => (
                     <label key={scope} className="inline-flex items-center space-x-2 text-xs border p-1.5 rounded bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                        <input
                           type="checkbox"
                           checked={scopes.includes(scope)}
                           onChange={(e) => {
                              if (e.target.checked) setScopes([...scopes, scope]);
                              else setScopes(scopes.filter(s => s !== scope));
                           }}
                           className="rounded border-slate-300"
                        />
                        <span>{scope}</span>
                     </label>
                  ))}
               </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleGenerate} disabled={isGenerating || !name}>
              {isGenerating ? "Generating..." : "Generate New Key"}
              {!isGenerating && <Plus className="ml-2 h-4 w-4" />}
            </Button>
          </div>

          {newKeyData && (
            <div className="mt-6 p-4 border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/50 rounded-lg">
              <h4 className="text-amber-800 dark:text-amber-400 font-medium mb-2 flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Key Generated Successfully
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-500 mb-4">
                Please copy this key now. You will not be able to see it again!
              </p>
              <div className="flex items-center gap-2">
                 <code className="flex-1 block px-3 py-2 rounded bg-white dark:bg-slate-950 font-mono text-sm border border-amber-200 dark:border-amber-900 overflow-x-auto text-slate-800 dark:text-slate-300">
                   {newKeyData.api_key}
                 </code>
                 <Button variant="outline" onClick={handleCopy}>
                   {copied ? "Copied!" : <Copy className="h-4 w-4" />}
                 </Button>
              </div>
            </div>
          )}

          {keys && keys.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-200 mb-4">Active Keys</h4>
              <ul className="space-y-3">
                {keys.map(k => (
                   <li key={k.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                     <div>
                       <p className="font-medium text-sm text-slate-900 dark:text-white">{k.key_prefix}••••••••</p>
                       <p className="text-xs text-slate-500">Created {format(new Date(k.created_at), "MMM d, yyyy")} • Scopes: {k.scopes?.join(", ") || "All"}</p>
                     </div>
                     <Button variant="ghost" size="sm" onClick={() => handleDelete(k.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
