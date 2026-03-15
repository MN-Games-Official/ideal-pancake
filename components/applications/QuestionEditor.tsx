"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Plus, Trash2, Save } from "lucide-react";

export interface Question {
  id: string;
  type: 'multiple_choice' | 'short_answer' | 'true_false';
  text: string;
  options?: string[];
  correct_answer?: number | string | boolean;
  max_score: number;
  grading_criteria?: string;
}

export function QuestionEditor({ 
  question, 
  index, 
  updateQuestion, 
  removeQuestion 
}: { 
  question: Question; 
  index: number; 
  updateQuestion: (index: number, q: Question) => void;
  removeQuestion: (index: number) => void;
}) {

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as Question['type'];
    let updated = { ...question, type };
    if (type === 'multiple_choice' && !updated.options) {
      updated.options = ["Option 1", "Option 2"];
      updated.correct_answer = 0;
    } else if (type === 'true_false') {
      updated.correct_answer = true;
      delete updated.options;
    } else {
      delete updated.options;
      delete updated.correct_answer;
    }
    updateQuestion(index, updated);
  };

  const updateOption = (optIndex: number, val: string) => {
    if (!question.options) return;
    const newOptions = [...question.options];
    newOptions[optIndex] = val;
    updateQuestion(index, { ...question, options: newOptions });
  };

  const addOption = () => {
    if (!question.options) return;
    updateQuestion(index, { ...question, options: [...question.options, `Option ${question.options.length + 1}`] });
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm flex gap-4 items-start group relative">
      <div className="flex-1 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
          <div className="w-full space-y-1">
            <Input 
              value={question.text} 
              onChange={(e) => updateQuestion(index, { ...question, text: e.target.value })} 
              placeholder="Enter question text here..."
              className="font-medium text-lg border-0 bg-transparent px-0 hover:bg-slate-50 focus:bg-white dark:hover:bg-slate-800 focus:dark:bg-slate-900 focus:ring-0 shadow-none"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto shrink-0">
            <select 
              value={question.type} 
              onChange={handleTypeChange}
              className="h-10 px-3 py-2 rounded-md border border-slate-300 bg-white text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="short_answer">Short Answer</option>
              <option value="true_false">True / False</option>
            </select>
            <Input 
              type="number" 
              value={question.max_score} 
              onChange={(e) => updateQuestion(index, { ...question, max_score: parseInt(e.target.value) })}
              className="w-20"
              title="Points"
            />
            <Button variant="ghost" size="sm" onClick={() => removeQuestion(index)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 h-10">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {question.type === 'multiple_choice' && question.options && (
          <div className="space-y-2 pl-2">
            {question.options.map((opt, oIdx) => (
              <div key={oIdx} className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name={`q-${question.id}-correct`} 
                  checked={question.correct_answer === oIdx}
                  onChange={() => updateQuestion(index, { ...question, correct_answer: oIdx })}
                />
                <Input value={opt} onChange={(e) => updateOption(oIdx, e.target.value)} className="h-8 py-1" />
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={addOption} className="text-xs">
              <Plus className="h-3 w-3 mr-1" /> Add Option
            </Button>
          </div>
        )}

        {question.type === 'true_false' && (
          <div className="space-y-2 pl-2 flex flex-col">
             <label className="text-xs font-medium text-slate-500 mb-1">Select the correct answer.</label>
             <select 
              value={question.correct_answer ? "true" : "false"} 
              onChange={(e) => updateQuestion(index, { ...question, correct_answer: e.target.value === "true" })}
              className="w-24 h-8 px-2 py-1 rounded-md border border-slate-300 bg-white text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
        )}

        {question.type === 'short_answer' && (
          <div className="space-y-2 pl-2">
             <label className="text-xs font-medium text-slate-500">Grading Criteria (For AI)</label>
             <textarea 
               className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900"
               rows={2}
               placeholder="E.g., Must mention teamwork and communication..."
               value={question.grading_criteria || ""}
               onChange={(e) => updateQuestion(index, { ...question, grading_criteria: e.target.value })}
             />
          </div>
        )}
      </div>
    </div>
  );
}
