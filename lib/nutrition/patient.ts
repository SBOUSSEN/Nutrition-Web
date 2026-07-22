import type { PatientComputed } from "@/types/nutrition";

export function calculateBmi(weightKg: number, heightM: number): number {
  if (heightM <= 0) {
    throw new Error("Height must be positive.");
  }
  return weightKg / (heightM * heightM);
}

export function calculateIdealWeight(heightM: number): number {
  return 25 * heightM * heightM;
}

export function calculateReferenceWeight(
  actualWeightKg: number,
  heightM: number,
): PatientComputed {
  const bmi = calculateBmi(actualWeightKg, heightM);
  const idealWeightKg = calculateIdealWeight(heightM);

  if (bmi <= 30) {
    return {
      bmi,
      idealWeightKg,
      adjustedWeightKg: null,
      referenceWeightKg: actualWeightKg,
    };
  }

  const adjustedWeightKg =
    idealWeightKg + 0.25 * (actualWeightKg - idealWeightKg);

  return {
    bmi,
    idealWeightKg,
    adjustedWeightKg,
    referenceWeightKg: adjustedWeightKg,
  };
}
