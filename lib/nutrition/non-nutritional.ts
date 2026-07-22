import type { NutritionRules } from "@/types/nutrition";

export function calculatePropofolFromRate(
  rateMlH: number,
  rules: NutritionRules,
): number {
  return rateMlH * 24 * rules.nonNutritionalConstants.propofolKcalPerMl;
}

export function calculatePropofolFromDose(
  doseMgH: number,
  concentrationMgMl: number,
  rules: NutritionRules,
): number {
  if (doseMgH <= 0 || concentrationMgMl <= 0) {
    return 0;
  }

  const volumeMlDay = (doseMgH * 24) / concentrationMgMl;
  return volumeMlDay * rules.nonNutritionalConstants.propofolKcalPerMl;
}

export function calculateGlucoseKcal(
  solutionName: string | null,
  volumeMlDay: number,
  rules: NutritionRules,
): number {
  if (!solutionName || volumeMlDay <= 0) {
    return 0;
  }

  const concentration = rules.glucoseSolutionsGPer100Ml[solutionName];
  if (concentration === undefined) {
    return 0;
  }

  return (
    (volumeMlDay * concentration) /
    100 *
    rules.nonNutritionalConstants.glucoseKcalPerG
  );
}
