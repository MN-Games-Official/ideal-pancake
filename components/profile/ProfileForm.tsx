"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { UserCircle, Save } from "lucide-react";

export function ProfileForm({ user }: { user?: any }) {
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/users/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, avatar_url: avatarUrl }),
      });

      if (response.ok) {
        setMessage("Profile updated successfully!");
      } else {
        const data = await response.json();
        setMessage(`Error: ${data.error}`);
      }
    } catch (e) {
      setMessage("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-4 mb-6">
        {avatarUrl ? (
          <picture>
             <img src={avatarUrl} alt="Avatar" className="h-16 w-16 rounded-full border border-slate-200 dark:border-slate-700 object-cover" />
          </picture>
        ) : (
          <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
            <UserCircle className="h-8 w-8 text-slate-400" />
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Information</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Update your account details and public avatar.</p>
        </div>
      </div>

      <div className="space-y-4 max-w-md">
        <div className="space-y-2">
          <label className="text-sm font-medium">Username</label>
          <Input value={user?.username || ""} disabled className="bg-slate-50 dark:bg-slate-800/50" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address</label>
          <Input value={user?.email || ""} disabled className="bg-slate-50 dark:bg-slate-800/50" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name</label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Avatar URL</label>
          <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
        </div>

        {message && (
          <p className={`text-sm ${message.includes("Error") ? "text-red-500" : "text-green-500"}`}>{message}</p>
        )}

        <div className="pt-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
            {!isSaving && <Save className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
