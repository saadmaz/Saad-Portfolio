import React, { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Save,
} from 'lucide-react';
import { CommonService } from '@/shared/services/common-service';
import BackButton from '@/components/admin/BackButton';
import { SkillSet, Skill } from '@/types';
import { toast } from "sonner";

const AdminSkills = () => {
  const [skillSets, setSkillSets] = useState<SkillSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteCatIndex, setDeleteCatIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const data = await CommonService.getSkills();
      setSkillSets(data);
    } catch (error) {
      toast.error('Failed to load skills');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await CommonService.updateSkills(skillSets);
      toast.success('Skills updated successfully');
    } catch (error) {
      toast.error('Failed to save skills');
    } finally {
      setIsSaving(false);
    }
  };

  const addCategory = () => {
    setSkillSets([...skillSets, { category: 'New Category', skills: [] }]);
  };

  const removeCategory = (index: number) => setDeleteCatIndex(index);
  const handleConfirmRemoveCategory = () => {
    if (deleteCatIndex === null) return;
    setSkillSets(skillSets.filter((_, i) => i !== deleteCatIndex));
    setDeleteCatIndex(null);
  };

  const addSkill = (catIndex: number) => {
    const newSkillSets = [...skillSets];
    newSkillSets[catIndex].skills.push({ name: 'New Skill', level: 'Intermediate', startYear: new Date().getFullYear() });
    setSkillSets(newSkillSets);
  };

  const updateSkill = (catIndex: number, skillIndex: number, field: keyof Skill, value: string | number) => {
    const newSkillSets = [...skillSets];
    const skill = { ...newSkillSets[catIndex].skills[skillIndex], [field]: value };
    newSkillSets[catIndex].skills[skillIndex] = skill as Skill;
    setSkillSets(newSkillSets);
  };

  const removeSkill = (catIndex: number, skillIndex: number) => {
    const newSkillSets = [...skillSets];
    newSkillSets[catIndex].skills = newSkillSets[catIndex].skills.filter((_, i) => i !== skillIndex);
    setSkillSets(newSkillSets);
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= skillSets.length) return;
    const newSkillSets = [...skillSets];
    [newSkillSets[index], newSkillSets[newIndex]] = [newSkillSets[newIndex], newSkillSets[index]];
    setSkillSets(newSkillSets);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton to="/admin/dashboard" className="flex-shrink-0" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 text-white">Skills & Tools</h1>
            <p className="text-muted-foreground">Manage your technical expertise and group them by category.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={addCategory}
              className="border-white/10 hover:bg-white/5 rounded-xl px-4 py-2 text-white/80 hover:text-white transition-all shadow-lg"
            >
                <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-accent hover:bg-accent/90 text-black font-bold shadow-[0_0_20px_rgba(255,184,0,0.2)] rounded-xl transition-all hover:scale-105 active:scale-95"
            >
                <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save All Changes'}
            </Button>
        </div>
      </div>

      <div className="space-y-8">
        {isLoading ? (
            <div className="h-40 bg-white/5 rounded-2xl animate-pulse" />
        ) : skillSets.map((set, catIndex) => (
          <Card key={catIndex} className="bg-white/5 border-white/10 overflow-hidden rounded-2xl shadow-xl shadow-black/20 group/card transition-all hover:border-white/20">
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-white/5 bg-white/[0.03]">
              <div className="flex items-center gap-4 flex-1">
                <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing hover:text-accent transition-colors" />
                <div className="relative group/input flex-1 max-w-sm">
                  <Input 
                    value={set.category} 
                    onChange={(e) => {
                      const next = [...skillSets];
                      next[catIndex].category = e.target.value;
                      setSkillSets(next);
                    }}
                    className="bg-transparent border-none text-xl font-bold p-0 h-auto focus-visible:ring-0 text-white placeholder:text-white/20"
                    placeholder="Enter category name..."
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-focus-within/input:w-full" />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white/10" onClick={() => moveCategory(catIndex, 'up')} disabled={catIndex === 0}>
                    <ChevronUp className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white/10" onClick={() => moveCategory(catIndex, 'down')} disabled={catIndex === skillSets.length - 1}>
                    <ChevronDown className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg ml-1" onClick={() => removeCategory(catIndex)}>
                    <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {set.skills.map((skill, skillIndex) => (
                  <div key={skillIndex} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-4 relative group transition-all hover:bg-white/[0.05] hover:border-white/10 shadow-lg">
                    <div className="flex items-center justify-between gap-2">
                        <Input 
                            value={skill.name} 
                            onChange={(e) => updateSkill(catIndex, skillIndex, 'name', e.target.value)}
                            className="bg-transparent border-none font-bold p-0 h-auto focus-visible:ring-0 text-sm text-white/90 group-hover:text-white transition-colors"
                            placeholder="Skill name"
                        />
                        <button 
                          onClick={() => removeSkill(catIndex, skillIndex)} 
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-all active:scale-90"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <select
                            value={skill.level}
                            onChange={(e) => updateSkill(catIndex, skillIndex, 'level', e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] font-bold text-white/70 outline-none focus:border-accent/50 cursor-pointer"
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advance">Advance</option>
                            <option value="Expert">Expert</option>
                        </select>
                        <div className="relative">
                          <Input
                              type="number"
                              value={skill.startYear}
                              onChange={(e) => updateSkill(catIndex, skillIndex, 'startYear', parseInt(e.target.value))}
                              className="bg-black/40 border-white/10 h-8 text-[11px] py-0 px-3 pl-7 rounded-lg font-mono focus:border-accent/50 ring-0"
                              placeholder="Year"
                              min={1990}
                              max={new Date().getFullYear()}
                          />
                          <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-accent" />
                          {skill.startYear > 0 && (
                            <span className="absolute -top-4 right-0 text-[9px] text-accent/70 font-mono">
                              {new Date().getFullYear() - skill.startYear}y
                            </span>
                          )}
                        </div>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => addSkill(catIndex)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-white/10 hover:border-accent hover:text-accent transition-all text-sm text-muted-foreground gap-1 min-h-[82px]"
                >
                  <Plus className="w-4 h-4" />
                  Add Skill
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={deleteCatIndex !== null}
        onOpenChange={(o) => !o && setDeleteCatIndex(null)}
        title="Remove Category?"
        description={deleteCatIndex !== null ? `"${skillSets[deleteCatIndex]?.category}" and all its skills will be permanently removed.` : ''}
        confirmLabel="Remove"
        onConfirm={handleConfirmRemoveCategory}
      />
    </div>
  );
};

export default AdminSkills;
