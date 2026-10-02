import { calculateCitrateFromRfe } from "@/lib/nutrition/eer";
import {
  calculateGlucoseKcal,
  calculatePropofolFromDose,
  calculatePropofolFromRate,
} from "@/lib/nutrition/non-nutritional";
import { calculateReferenceWeight } from "@/lib/nutrition/patient";
import {
  getDefaultProteinFactor,
  getPhaseRules,
  getProteinRange,
} from "@/lib/nutrition/targets";
import type {
  NonNutritionalInputs,
  NutritionRules,
  NutritionSummary,
  PatientDraft,
} from "@/types/nutrition";

export function shouldBlockPrescription(patient: PatientDraft): boolean {
  return [
    patient.shockMultivisceral,
    patient.majorInstability,
    patient.highOrRisingCatecholamines,
    patient.hypoperfusion,
    patient.hyperlactatemia,
  ].some(Boolean);
}

export function buildSummary(
  patient: PatientDraft,
  inputs: NonNutritionalInputs,
  rules: NutritionRules,
): NutritionSummary {
  const reference = calculateReferenceWeight(
    patient.actualWeightKg,
    patient.heightM,
  );
  const phaseRules = getPhaseRules(rules, patient.phase);
  const [kcalLowFactor, kcalHighFactor] = phaseRules.kcalPerKg;
  const [proteinLowFactor, proteinHighFactor] = getProteinRange(patient, rules);
  const defaultProteinFactor = getDefaultProteinFactor(patient, rules);

  const propofolKcal =
    inputs.propofolRateMlH > 0
      ? calculatePropofolFromRate(inputs.propofolRateMlH, rules)
      : calculatePropofolFromDose(
          inputs.propofolDoseMgH,
          inputs.propofolConcentrationMgMl,
          rules,
        );
  const glucoseKcal = calculateGlucoseKcal(
    inputs.glucoseSolution,
    inputs.glucoseVolumeMlDay,
    rules,
  );

  let bloodFlowMlMin = 0;
  let citrateDoseMmolLBlood = 0;
  let citrateEliminationFraction = rules.defaults.citrateEliminationFraction;
  let citrateAdministeredMmolDay = 0;
  let citrateMetabolizedMmolDay = 0;
  let citrateKcal = 0;

  if (patient.eer && patient.citrateAnticoagulation) {
    bloodFlowMlMin = inputs.bloodFlowMlMin;
    citrateDoseMmolLBlood = inputs.citrateDoseMmolLBlood;
    const eer = calculateCitrateFromRfe(
      bloodFlowMlMin,
      citrateDoseMmolLBlood,
      rules,
    );
    citrateEliminationFraction = eer.citrateEliminationFraction;
    citrateAdministeredMmolDay = eer.citrateAdministeredMmolDay;
    citrateMetabolizedMmolDay = eer.citrateMetabolizedMmolDay;
    citrateKcal = eer.citrateKcal;
  }

  const nonNutritionalKcal = propofolKcal + glucoseKcal + citrateKcal;
  const kcalTargetMin = reference.referenceWeightKg * kcalLowFactor;
  const kcalTargetMax = reference.referenceWeightKg * kcalHighFactor;
  const proteinTargetMinG = reference.referenceWeightKg * proteinLowFactor;
  const proteinTargetMaxG = reference.referenceWeightKg * proteinHighFactor;
  const defaultProteinTargetG = reference.referenceWeightKg * defaultProteinFactor;
  const proteinTargetDisplay =
    proteinTargetMinG === proteinTargetMaxG
      ? `${proteinTargetMinG.toFixed(1)} g/j`
      : `${proteinTargetMinG.toFixed(1)}–${proteinTargetMaxG.toFixed(1)} g/j`;

  return {
    bmi: reference.bmi,
    actualWeightKg: patient.actualWeightKg,
    idealWeightKg: reference.idealWeightKg,
    adjustedWeightKg: reference.adjustedWeightKg,
    referenceWeightKg: reference.referenceWeightKg,
    kcalTargetMin,
    kcalTargetMax,
    proteinTargetMinG,
    proteinTargetMaxG,
    defaultProteinTargetG,
    proteinTargetDisplay,
    propofolKcal,
    glucoseKcal,
    citrateKcal,
    bloodFlowMlMin,
    citrateDoseMmolLBlood,
    citrateEliminationFraction,
    citrateAdministeredMmolDay,
    citrateMetabolizedMmolDay,
    nonNutritionalKcal,
    kcalNutritionMin: Math.max(0, kcalTargetMin - nonNutritionalKcal),
    kcalNutritionMax: Math.max(0, kcalTargetMax - nonNutritionalKcal),
    shouldBlockPrescription: shouldBlockPrescription(patient),
  };
}
