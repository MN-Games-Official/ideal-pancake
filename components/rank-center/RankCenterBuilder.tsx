"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Plus, Trash2, Save } from "lucide-react";

interface RankEntry {
  id: string;
  rank_id: number;
  gamepass_id: number;
  name: string;
  description: string;
  price: number;
  is_for_sale: boolean;
  regional_pricing: boolean;
}

export function RankCenterBuilder({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || "");
  const [groupId, setGroupId] = useState(initialData?.group_id || "");
  const [universeId, setUniverseId] = useState(initialData?.universe_id || "");
  const [ranks, setRanks] = useState<RankEntry[]>(
    initialData?.ranks || []
  );
  const [isSaving, setIsSaving] = useState(false);

  const addRank = () => {
    setRanks([
      ...ranks,
      {
        id: crypto.randomUUID(),
        rank_id: 1,
        gamepass_id: 0,
        name: "New Rank",
        description: "",
        price: 0,
        is_for_sale: false,
        regional_pricing: false,
      },
    ]);
  };

  const updateRank = (index: number, field: keyof RankEntry, value: any) => {
    const newRanks = [...ranks];
    newRanks[index] = { ...newRanks[index], [field]: value };
    setRanks(newRanks);
  };

  const removeRank = (index: number) => {
    const newRanks = [...ranks];
    newRanks.splice(index, 1);
    setRanks(newRanks);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name,
        group_id: groupId,
        universe_id: universeId,
        ranks,
      };

      const url = initialData?.id
        ? `/api/rank-centers/${initialData.id}`
        : "/api/rank-centers";
      
      const response = await fetch(url, {
        method: initialData?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push("/rank-center");
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
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Rank Center Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Center Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Premium Ranks" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Roblox Group ID</label>
            <Input value={groupId} onChange={(e) => setGroupId(e.target.value)} placeholder="123456" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Universe ID (Optional)</label>
            <Input value={universeId} onChange={(e) => setUniverseId(e.target.value)} placeholder="9876543" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Ranks Configuration</h2>
          <Button onClick={addRank} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Rank
          </Button>
        </div>

        <div className="space-y-4">
          {ranks.length === 0 ? (
            <p className="text-slate-500 text-sm italic">No ranks configured yet. Click &quot;Add Rank&quot; to start.</p>
          ) : (
            ranks.map((rank, index) => (
              <div key={rank.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-md relative bg-slate-50 dark:bg-slate-800/50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => removeRank(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Rank Name</label>
                    <Input value={rank.name} onChange={(e) => updateRank(index, 'name', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Roblox Rank ID (1-255)</label>
                    <Input type="number" value={rank.rank_id} onChange={(e) => updateRank(index, 'rank_id', parseInt(e.target.value))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Gamepass ID</label>
                    <Input type="number" value={rank.gamepass_id} onChange={(e) => updateRank(index, 'gamepass_id', parseInt(e.target.value))} />
                  </div>
                  <div className="space-y-1 md:col-span-3">
                    <label className="text-xs font-medium text-slate-500">Description</label>
                    <Input value={rank.description} onChange={(e) => updateRank(index, 'description', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Price (Robux)</label>
                    <Input type="number" value={rank.price} onChange={(e) => updateRank(index, 'price', parseInt(e.target.value))} />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id={`sale-${index}`}
                      checked={rank.is_for_sale}
                      onChange={(e) => updateRank(index, 'is_for_sale', e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <label htmlFor={`sale-${index}`} className="text-sm">For Sale</label>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id={`regional-${index}`}
                      checked={rank.regional_pricing}
                      onChange={(e) => updateRank(index, 'regional_pricing', e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <label htmlFor={`regional-${index}`} className="text-sm">Regional Pricing</label>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={isSaving || !name || !groupId}>
          {isSaving ? "Saving..." : "Save Rank Center"}
          {!isSaving && <Save className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
