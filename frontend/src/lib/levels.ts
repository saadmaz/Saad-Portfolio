import type { Skill } from "@/types";

// Stored levels → plain-language labels on a 4-step meter.
export const SKILL_LEVEL: Record<Skill["level"], { value: number; label: string }> = {
  Expert: { value: 4, label: "Daily driver" },
  Advance: { value: 3, label: "Proficient" },
  Intermediate: { value: 2, label: "Familiar" },
  Beginner: { value: 1, label: "Learning" },
};
