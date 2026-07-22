import type { EerComputed } from "@/types/nutrition";

export function getDefaultBloodFlowMlMin(weightKg: number): number {
  if (weightKg < 70) {
    return 110;
  }
  if (weightKg <= 90) {
    return 120;
  }
  return 130;
}

export function calculateRegiocitFlowMlH(bloodFlowMlMin: number): number {
  return bloodFlowMlMin * 11;
}

export function calculateCitrateDeliveryMmol(
  bloodFlowMlMin: number,
  citrateConcentrationMmolL: number,
): Pick<
  EerComputed,
  "regiocitFlowMlH" | "citrateMmolH" | "citrateMmolDay"
> {
  const regiocitFlowMlH = calculateRegiocitFlowMlH(bloodFlowMlMin);
  const citrateMmolH = (regiocitFlowMlH / 1000) * citrateConcentrationMmolL;
  const citrateMmolDay = citrateMmolH * 24;

  return {
    regiocitFlowMlH,
    citrateMmolH,
    citrateMmolDay,
  };
}

export function calculateCitrateKcalFromMmol(citrateMmolDay: number): number {
  if (citrateMmolDay <= 0) {
    return 0;
  }
  return citrateMmolDay * 0.59;
}
