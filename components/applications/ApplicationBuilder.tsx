"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Plus, Save } from "lucide-react";
import { QuestionEditor, Question } from "./QuestionEditor";
import { AIFormGenerator } from "./AIFormGenerator";

export function ApplicationBuilder({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [groupId, setGroupId] = useState(initialData?.group_id || "");
  const [targetRole, setTargetRole] = useState(initialData?.target_role || "");
  const [passScore, setPassScore] = useState(initialData?.pass_score || 70);
  const [primaryColor, setPrimaryColor] = useState(initialData?.primary_color || "#ff4b6e");
  const [secondaryColor, setSecondaryColor] = useState(initialData?.secondary_color || "#1f2933");
  const [questions, setQuestions] = useState<Question[]>(
    initialData?.questions ? JSON.parse(initialData.questions) : []
  );
  const [isSaving, setIsSaving] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        type: 'multiple_choice',
        text: "New Question",
        options: ["Option 1", "Option 2"],
        correct_answer: 0,
        max_score: 10,
      },
    ]);
  };

  const updateQuestion = (index: number, q: Question) => {
    const newQuestions = [...questions];
    newQuestions[index] = q;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleAIGeneration = (generatedQuestions: Question[]) => {
     setQuestions([...questions, ...generatedQuestions]);
  };

  const handleSave = async () => {
    const shortAnswerCount = questions.filter(q => q.type === 'short_answer').length;
    if (shortAnswerCount > 3) {
      alert("Maximum 3 short-answer questions are allowed.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name,
        description,
        group_id: groupId,
        target_role: targetRole,
        pass_score: passScore,
        style: {
          primary_color: primaryColor,
          secondary_color: secondaryColor,
        },
        questions,
      };

      const url = initialData?.id
        ? `/api/applications/${initialData.id}`
        : "/api/applications";
      
      const response = await fetch(url, {
        method: initialData?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push("/application-center");
        router.refresh();
      } else {
        const err = await response.json();
        alert(`Error saving: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
      alert("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Application Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Application Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Moderator Application" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Roblox Group ID</label>
            <Input value={groupId} onChange={(e) => setGroupId(e.target.value)} placeholder="123456" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Role</label>
            <Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="rank: 218" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Pass Score (%)</label>
            <Input type="number" min="0" max="100" value={passScore} onChange={(e) => setPassScore(parseInt(e.target.value))} />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200 mb-3">Theme Colors</h3>
          <div className="flex space-x-6">
            <div className="flex items-center space-x-2">
              <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
              <span className="text-xs text-slate-500">Primary Color</span>
            </div>
            <div className="flex items-center space-x-2">
              <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
              <span className="text-xs text-slate-500">Secondary Color</span>
            </div>
          </div>
        </div>
      </div>

      <AIFormGenerator appId={initialData?.id} onGenerate={handleAIGeneration} />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Questions</h2>
          <Button onClick={addQuestion} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {questions.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-slate-500">No questions added yet. Use the AI Generator or add them manually.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, i) => (
              <QuestionEditor 
                key={q.id} 
                question={q} 
                index={i} 
                updateQuestion={updateQuestion} 
                removeQuestion={removeQuestion} 
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 pb-12">
        <Button onClick={handleSave} disabled={isSaving || !name || !groupId}>
          {isSaving ? "Saving..." : "Save Application"}
          {!isSaving && <Save className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
