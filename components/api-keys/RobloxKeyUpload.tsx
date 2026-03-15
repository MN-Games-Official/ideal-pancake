"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { CheckCircle2, XCircle, Key, Loader2, ExternalLink } from "lucide-react";

export function RobloxKeyUpload({ currentKey }: { currentKey?: any }) {
  const [apiKey, setApiKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleValidateAndSave = async () => {
    if (!apiKey) return;
    setIsValidating(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch("/api/api-keys/roblox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey, validate: true }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setStatus("success");
        setMessage(data.message || "API key validated and saved successfully.");
        setApiKey("");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to validate API key.");
      }
    } catch (e) {
      setStatus("error");
      setMessage("An unexpected error occurred.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your Roblox API key? Automations will stop working.")) return;
    try {
      await fetch("/api/api-keys/roblox", { method: "DELETE" });
      window.location.reload();
    } catch (e) {
      alert("Failed to delete key.");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <Key className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Roblox Cloud API Key</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Required for automated group promotions and membership checks.
            </p>
          </div>

          {currentKey ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-900 dark:text-white">Current Key</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Active
                </span>
              </div>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mb-4">{currentKey.key_prefix}••••••••</p>
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={handleDelete}>Delete Key</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Paste your Roblox API Key here..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono"
                />
                <Button onClick={handleValidateAndSave} disabled={isValidating || !apiKey}>
                  {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & Validate"}
                </Button>
              </div>

              {status === "success" && (
                <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {message}
                </div>
              )}
              {status === "error" && (
                <div className="flex items-center text-sm text-red-600 dark:text-red-400">
                  <XCircle className="h-4 w-4 mr-2" />
                  {message}
                </div>
              )}

              <div className="pt-2">
                <a
                  href="https://create.roblox.com/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  Generate a key in the Creator Dashboard
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
