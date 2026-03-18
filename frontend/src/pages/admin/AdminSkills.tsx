import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Zap, 
  Plus, 
  Trash2, 
  GripVertical,
  ChevronDown,
  ChevronUp,
  Save
} from 'lucide-react';
import { CommonService } from '@/shared/services/common-service';
import { SkillSet, Skill } from '@/types';
import { toast } from "sonner";

const AdminSkills = () => {
  const [skillSets, setSkillSets] = useState<SkillSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  const removeCategory = (index: number) => {
    if (!window.confirm('Remove this entire category?')) return;
    setSkillSets(skillSets.filter((_, i) => i !== index));
  };

  const addSkill = (catIndex: number) => {
    const newSkillSets = [...skillSets];
    newSkillSets[catIndex].skills.push({ name: 'New Skill', level: 'Intermediate', years: 1 });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Skills & Tools</h1>
          <p className="text-muted-foreground">Manage your technical expertise and categories.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={addCategory} className="border-white/10 hover:bg-white/5">
                <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-accent hover:bg-accent/90 text-black font-bold">
                <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save All Changes'}
            </Button>
        </div>
      </div>

      <div className="space-y-8">
        {isLoading ? (
            <div className="h-40 bg-white/5 rounded-2xl animate-pulse" />
        ) : skillSets.map((set, catIndex) => (
          <Card key={catIndex} className="bg-white/5 border-white/10 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                <Input 
                  value={set.category} 
                  onChange={(e) => {
                    const next = [...skillSets];
                    next[catIndex].category = e.target.value;
                    setSkillSets(next);
                  }}
                  className="bg-transparent border-none text-lg font-bold p-0 h-auto focus-visible:ring-0 w-48"
                />
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveCategory(catIndex, 'up')} disabled={catIndex === 0}>
                    <ChevronUp className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveCategory(catIndex, 'down')} disabled={catIndex === skillSets.length - 1}>
                    <ChevronDown className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-500/10" onClick={() => removeCategory(catIndex)}>
                    <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {set.skills.map((skill, skillIndex) => (
                  <div key={skillIndex} className="p-3 rounded-xl bg-white/3 border border-white/5 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                        <Input 
                            value={skill.name} 
                            onChange={(e) => updateSkill(catIndex, skillIndex, 'name', e.target.value)}
                            className="bg-transparent border-none font-medium p-0 h-auto focus-visible:ring-0 text-sm"
                        />
                        <button onClick={() => removeSkill(catIndex, skillIndex)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-opacity">
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <select 
                            value={skill.level}
                            onChange={(e) => updateSkill(catIndex, skillIndex, 'level', e.target.value)}
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] w-full"
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advance">Advance</option>
                            <option value="Expert">Expert</option>
                        </select>
                        <Input 
                            type="number"
                            value={skill.years}
                            onChange={(e) => updateSkill(catIndex, skillIndex, 'years', parseInt(e.target.value))}
                            className="bg-white/5 border-white/10 h-6 text-[10px] py-0 px-2"
                            placeholder="Yrs"
                        />
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
    </div>
  );
};

export default AdminSkills;
