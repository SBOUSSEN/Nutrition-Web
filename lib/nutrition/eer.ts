import type { EerComputed, NutritionRules } from "@/types/nutrition";

export function getDefaultBloodFlowMlMin(weightKg: number): number {
  if (weightKg < 70) {
    return 110;
  }
  if (weightKg <= 90) {
    return 120;
  }
  return 130;
}

export function calculateCitrateFromRfe(
  bloodFlowMlMin: number,
  citrateDoseMmolLBlood: number,
  rules: NutritionRules,
): Omit<EerComputed, "bloodFlowMlMin" | "citrateDoseMmolLBlood"> {
  const citrateEliminationFraction = rules.defaults.citrateEliminationFraction;
  const citrateAdministeredMmolDay =
    bloodFlowMlMin *
    citrateDoseMmolLBlood *
    rules.nonNutritionalConstants.citrateBloodFlowConversionLDay;
  const citrateMetabolizedMmolDay =
    citrateAdministeredMmolDay * (1 - citrateEliminationFraction);
  const citrateKcal =
    citrateMetabolizedMmolDay * rules.nonNutritionalConstants.citrateKcalPerMmol;

  return {
    citrateEliminationFraction,
    citrateAdministeredMmolDay,
    citrateMetabolizedMmolDay,
    citrateKcal,
  };
}
