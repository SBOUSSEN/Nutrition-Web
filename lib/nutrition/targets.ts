import type {
  NutritionPhase,
  NutritionRules,
  PatientDraft,
} from "@/types/nutrition";

export function getPhaseRules(rules: NutritionRules, phase: NutritionPhase) {
  return rules.phaseTargets[phase];
}

export function getProteinRange(
  patient: PatientDraft,
  rules: NutritionRules,
): [number, number] {
  const phaseRules = getPhaseRules(rules, patient.phase);

  if (patient.phase === "rehabilitation") {
    const rehab = phaseRules.rehabilitationSpecialCases;
    if (patient.eer && rehab?.eerGPerKg !== undefined) {
      return [rehab.eerGPerKg, rehab.eerGPerKg];
    }
    if (
      patient.renalFailureNoRrt &&
      rehab?.renalFailureNoRrtGPerKg !== undefined
    ) {
      return [rehab.renalFailureNoRrtGPerKg, rehab.renalFailureNoRrtGPerKg];
    }
  }

  return phaseRules.proteinGeneralGPerKg;
}

export function getDefaultProteinFactor(
  patient: PatientDraft,
  rules: NutritionRules,
): number {
  const phaseRules = getPhaseRules(rules, patient.phase);

  if (patient.phase === "rehabilitation") {
    const rehab = phaseRules.rehabilitationSpecialCases;
    if (patient.eer && rehab?.eerGPerKg !== undefined) {
      return rehab.eerGPerKg;
    }
    if (
      patient.renalFailureNoRrt &&
      rehab?.renalFailureNoRrtGPerKg !== undefined
    ) {
      return rehab.renalFailureNoRrtGPerKg;
    }
  }

  return phaseRules.defaultProteinGPerKg;
}
