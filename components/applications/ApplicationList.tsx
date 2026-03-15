"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { format } from "date-fns";

type Application = {
  id: string;
  name: string;
  description: string;
  group_id: string;
  created_at: string;
  updated_at: string;
  submission_count?: number;
  pass_count?: number;
};

export function ApplicationList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchApplications() {
      try {
        const response = await fetch("/api/applications");
        if (response.ok) {
          const data = await response.json();
          setApplications(data.applications || []);
        }
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchApplications();
  }, []);

  const filteredApps = applications.filter(app => 
    app.name.toLowerCase().includes(search.toLowerCase()) || 
    app.group_id.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Application Center</h1>
        <Link href="/application-center/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search applications..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 border-dashed">
          <FolderKanban className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">No applications</h3>
          <p className="mt-1 text-sm text-slate-500">Get started by creating a new application.</p>
          <div className="mt-6">
            <Link href="/application-center/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Application
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          <ul role="list" className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredApps.map((app) => (
              <li key={app.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1 flex items-center gap-4">
                    <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                      <FolderKanban className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                        {app.name}
                      </p>
                      <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">
                        <span className="truncate">Group ID: {app.group_id}</span>
                        <span>•</span>
                        <span>Created {format(new Date(app.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <Link href={`/application-center/${app.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit2 className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Just defining the missing import locally for simplicity
import { FolderKanban } from "lucide-react";
