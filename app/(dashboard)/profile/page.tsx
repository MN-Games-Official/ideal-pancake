import { ProfileForm } from "@/components/profile/ProfileForm";
import { PasswordChangeForm } from "@/components/profile/PasswordChangeForm";

export const metadata = {
  title: "Profile - Polaris Pilot",
};

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile & Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your account information and security preferences.</p>
      </div>
      <ProfileForm />
      <PasswordChangeForm />
    </div>
  );
}
