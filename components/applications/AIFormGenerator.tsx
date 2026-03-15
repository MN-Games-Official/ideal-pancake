"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Wand2, Loader2, Sparkles } from "lucide-react";
import type { Question } from "./QuestionEditor";

export function AIFormGenerator({ 
  appId, 
  onGenerate 
}: { 
  appId?: string; 
  onGenerate: (questions: Question[]) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [params, setParams] = useState({
    name: "Application Name",
    description: "Short description",
    group_id: "123456",
    rank: "218",
    questions_count: 6,
    vibe: "professional",
    instructions: "",
  });

  const handleGenerate = async () => {
    if (!appId) {
      alert("Please save the application first before using AI generation.");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/applications/${appId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await response.json();
      if (data.success && data.form && data.form.questions) {
        onGenerate(data.form.questions);
        setIsOpen(false);
      } else {
        alert(data.error || "Failed to generate form");
      }
    } catch (error) {
      alert("An unexpected error occurred during AI generation.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button variant="outline" onClick={() => setIsOpen(true)} className="w-full flex justify-center py-6 border-dashed border-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
        <Sparkles className="mr-2 h-5 w-5" />
        Generate with Polaris AI
      </Button>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Wand2 className="h-32 w-32" />
      </div>
      
      <div className="relative z-10 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 flex items-center">
            <Sparkles className="mr-2 h-5 w-5" />
            Polaris AI Builder
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Close</Button>
        </div>
        
        <p className="text-sm text-indigo-700 dark:text-indigo-400">Describe what you need, and Polaris AI will generate a tailored application form using the Abacus AI engine.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
             <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Tone / Vibe</label>
             <select 
              value={params.vibe} 
              onChange={(e) => setParams({ ...params, vibe: e.target.value })}
              className="w-full h-10 px-3 py-2 rounded-md border border-slate-300 bg-white text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly & Welcoming</option>
              <option value="strict">Strict & Formal</option>
              <option value="creative">Creative & Open</option>
            </select>
          </div>
          <div className="space-y-1">
             <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Question Count</label>
             <Input 
              type="number" 
              value={params.questions_count} 
              onChange={(e) => setParams({ ...params, questions_count: parseInt(e.target.value) })}
              min={1} max={15}
             />
          </div>
          <div className="space-y-1 md:col-span-2">
             <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Custom Instructions (Optional)</label>
             <textarea 
               className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900"
               rows={3}
               placeholder="E.g., Include a question about dealing with difficult users, and make sure to test grammar."
               value={params.instructions}
               onChange={(e) => setParams({ ...params, instructions: e.target.value })}
             />
          </div>
        </div>
        
        <div className="pt-2 flex justify-end">
          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !appId}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Form"
            )}
          </Button>
        </div>
        
        {!appId && (
          <p className="text-xs text-amber-600 dark:text-amber-400 text-right italic mt-1">
            * Save the application first to enable AI generation.
          </p>
        )}
      </div>
    </div>
  );
}
