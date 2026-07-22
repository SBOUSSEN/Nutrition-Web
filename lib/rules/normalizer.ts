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
        label: "phase aiguë / défaillance",
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
        label: "stabilisation",
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
        label: "réhabilitation",
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
      citrateKcalPerG: citrate.kcal_per_g,
      citrateKcalPerMmol: 0.59,
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
      citrateConcentrationGMl: 0,
    },
    validationNeeded: input.validation_needed ?? [],
  };
}
