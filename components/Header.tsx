"use client";

import { LogOut, Bell, Menu } from "lucide-react";
import { Button } from "./ui/Button";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 ml-0 md:ml-64">
      <div className="flex items-center md:hidden">
        <button className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <div className="flex-1 flex justify-end items-center space-x-4">
        <button className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
          <span className="sr-only">View notifications</span>
          <Bell className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="relative flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
          <div className="text-sm">
            <p className="text-slate-700 dark:text-slate-200 font-medium">Administrator</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500">
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
