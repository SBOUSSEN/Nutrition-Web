import type { NutritionRules } from "@/types/nutrition";

const DEFAULT_ALLOWED_QUANTITIES_PER_DAY = [
  0.25,
  0.5,
  0.75,
  1,
  1.25,
  1.5,
  1.75,
  2,
  2.25,
  2.5,
  2.75,
  3,
  3.25,
  3.5,
  3.75,
  4,
];

export function normalizeRules(input: any): NutritionRules {
  const energyTargets = input.energy_targets;
  const proteinTargets = input.protein_targets_by_phase;
  const propofol = input.inputs.non_nutritional_calories.propofol;
  const glucose = input.inputs.non_nutritional_calories.glucose;
  const citrate = input.inputs.non_nutritional_calories.citrate;
  const stabilization = input.monitoring_checklists?.stabilisation ?? {};
  const rehabilitation = input.monitoring_checklists?.rehabilitation ?? [];
  const optimizerRaw = input.optimizer ?? {};

  return {
    metadata: input.metadata ?? {},
    phaseTargets: {
      aigue_defaillance: {
        label: energyTargets.aigue_defaillance.label,
        kcalPerKg: [
          energyTargets.aigue_defaillance.kcal_per_kg_min,
          energyTargets.aigue_defaillance.kcal_per_kg_max,
        ],
        proteinGeneralGPerKg: [
          proteinTargets.aigue_defaillance.g_per_kg_min,
          proteinTargets.aigue_defaillance.g_per_kg_max,
        ],
        defaultProteinGPerKg:
          proteinTargets.aigue_defaillance.g_per_kg_max,
      },
      stabilisation: {
        label: energyTargets.stabilisation.label,
        kcalPerKg: [
          energyTargets.stabilisation.kcal_per_kg_min,
          energyTargets.stabilisation.kcal_per_kg_max,
        ],
        proteinGeneralGPerKg: [
          proteinTargets.stabilisation.g_per_kg_min,
          proteinTargets.stabilisation.g_per_kg_max,
        ],
        defaultProteinGPerKg: proteinTargets.stabilisation.g_per_kg_max,
      },
      rehabilitation: {
        label: energyTargets.rehabilitation.label,
        kcalPerKg: [
          energyTargets.rehabilitation.kcal_per_kg_min,
          energyTargets.rehabilitation.kcal_per_kg_max,
        ],
        proteinGeneralGPerKg: [
          proteinTargets.rehabilitation.g_per_kg_min,
          proteinTargets.rehabilitation.g_per_kg_max,
        ],
        defaultProteinGPerKg: proteinTargets.rehabilitation.g_per_kg_max,
        rehabilitationSpecialCases: {
          eerGPerKg: 1.5,
          renalFailureNoRrtGPerKg: 0.9,
        },
      },
    },
    nonNutritionalConstants: {
      propofolKcalPerMl: propofol.kcal_per_ml,
      glucoseKcalPerG: glucose.kcal_per_g,
      citrateKcalPerMmol: citrate.kcal_per_mmol_metabolized,
      citrateBloodFlowConversionLDay:
        citrate.blood_flow_conversion_l_day_per_ml_min,
    },
    glucoseSolutionsGPer100Ml: Object.fromEntries(
      Object.entries(input.glucose_solutions).map(([name, value]: [string, any]) => [
        name,
        value.glucose_g_per_100ml,
      ]),
    ),
    enteralContraindications: (input.enteral_nutrition_contraindications ?? []).map(
      (item: { label: string }) => item.label,
    ),
    surveillance: {
      stabilisation: [
        ...(stabilization.digestive ?? []),
        ...(stabilization.metabolic ?? []),
      ],
      rehabilitation,
    },
    routeOptions: ["Enterale", "Parenterale", "Mixte"],
    optimizer: {
      allowedQuantitiesPerDay:
        optimizerRaw.allowed_quantities_per_day ??
        DEFAULT_ALLOWED_QUANTITIES_PER_DAY,
      maxResults: 5,
      strictNonExceedance: true,
      missingBusinessRules:
        optimizerRaw.allowed_quantities_per_day === undefined
          ? ["allowed_quantities_per_day"]
          : [],
    },
    defaults: {
      citrateSolutionName: "Regiocit",
      citrateDoseMmolLBlood: citrate.default_dose_mmol_l_blood,
      citrateEliminationFraction: citrate.default_elimination_fraction,
    },
    clinicalPhaseDefinitions: input.clinical_phase_definitions,
    nutritionProgression: {
      notAlreadyReceivingEnteral: {
        source: input.nutrition_progression.not_already_receiving_enteral.source,
        steps: input.nutrition_progression.not_already_receiving_enteral.steps.map(
          (step: { day: "J1" | "J2" | "J3"; range_position: number }) => ({
            day: step.day.replace("J", "Jour ") as "Jour 1" | "Jour 2" | "Jour 3",
            rangePosition: step.range_position,
          }),
        ),
      },
      alreadyReceivingEnteral: {
        source: input.nutrition_progression.already_receiving_enteral.source,
        steps: input.nutrition_progression.already_receiving_enteral.steps.map(
          (step: { day: "J1" | "J2" | "J3"; range_position: number }) => ({
            day: step.day.replace("J", "Jour ") as "Jour 1" | "Jour 2" | "Jour 3",
            rangePosition: step.range_position,
          }),
        ),
      },
    },
    enteralAdministration: {
      defaultMode: input.enteral_administration.default_mode,
      modes: input.enteral_administration.modes,
      periodVolumes: {
        standardPeriodHours:
          input.enteral_administration.period_volumes.standard_period_hours,
        dailyHours: input.enteral_administration.period_volumes.daily_hours,
        maxBagsWithStandardPeriod:
          input.enteral_administration.period_volumes.max_bags_with_standard_period,
        note: input.enteral_administration.period_volumes.note,
      },
    },
    validationNeeded: input.validation_needed ?? [],
  };
}
