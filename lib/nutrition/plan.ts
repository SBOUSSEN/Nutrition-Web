import type { NutritionPhase, ThreeDayPlanStep } from "@/types/nutrition";

export function buildThreeDayPlan(
  phase: NutritionPhase,
  minKcal: number,
  maxKcal: number,
  alreadyReceivingEnteral: boolean,
): ThreeDayPlanStep[] {
  if (phase !== "stabilisation" && phase !== "rehabilitation") {
    return [];
  }

  if (alreadyReceivingEnteral) {
    return [
      { day: "Jour 1", kcal: (minKcal + maxKcal) / 2 },
      { day: "Jour 2", kcal: maxKcal },
    ];
  }

  return [
    { day: "Jour 1", kcal: minKcal },
    { day: "Jour 2", kcal: (minKcal + maxKcal) / 2 },
    { day: "Jour 3", kcal: maxKcal },
  ];
}
