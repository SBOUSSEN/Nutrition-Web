import type { NutritionPhase, ThreeDayPlanStep } from "@/types/nutrition";

export function buildThreeDayPlan(
  phase: NutritionPhase,
  minKcal: number,
  maxKcal: number,
): ThreeDayPlanStep[] {
  if (phase !== "stabilisation" && phase !== "rehabilitation") {
    return [];
  }

  return [
    { day: "Jour 1", kcal: minKcal },
    { day: "Jour 2", kcal: (minKcal + maxKcal) / 2 },
    { day: "Jour 3", kcal: maxKcal },
  ];
}
