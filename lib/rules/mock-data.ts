import type { NutritionRules, SoluteRecord } from "@/types/nutrition";

export const demoRules: NutritionRules = {
  metadata: {
    name: "nutrition_reanimation_rules",
    version: "0.2.0-web-demo",
  },
  phaseTargets: {
    aigue_defaillance: {
      label: "phase aiguë / défaillance",
      kcalPerKg: [5, 10],
      proteinGeneralGPerKg: [0.2, 0.4],
      defaultProteinGPerKg: 0.4,
    },
    stabilisation: {
      label: "stabilisation",
      kcalPerKg: [10, 20],
      proteinGeneralGPerKg: [0.7, 0.9],
      defaultProteinGPerKg: 0.9,
    },
    rehabilitation: {
      label: "réhabilitation",
      kcalPerKg: [20, 25],
      proteinGeneralGPerKg: [1.2, 1.5],
      defaultProteinGPerKg: 1.2,
      rehabilitationSpecialCases: {
        eerGPerKg: 1.5,
        renalFailureNoRrtGPerKg: 0.9,
      },
    },
  },
  nonNutritionalConstants: {
    propofolKcalPerMl: 1.1,
    glucoseKcalPerG: 4,
    citrateKcalPerG: 3,
    citrateKcalPerMmol: 0.59,
  },
  glucoseSolutionsGPer100Ml: {
    G2.5: 2.5,
    G5: 5,
    G10: 10,
    G30: 30,
  },
  enteralContraindications: [
    "Hémorragie digestive haute non contrôlée",
    "Ischémie intestinale suspectée ou avérée",
    "Occlusion intestinale",
    "Syndrome du compartiment abdominal",
    "Fistule digestive à haut débit en l’absence d’accès distal",
  ],
  surveillance: {
    stabilisation: [
      "vomissements",
      "regurgitation",
      "diarrhee",
      "distension_abdominale",
      "pression_intra_abdominale",
      "phosphate",
      "magnesium",
      "potassium",
      "glycemie",
      "insuline",
      "triglycerides",
      "bilan_hepatique",
      "uree",
    ],
    rehabilitation: [
      "evaluation_denutrition",
      "evaluation_fonction_musculaire",
      "mobilisation",
      "exercice_physique",
      "prise_en_charge_psychologique",
      "depistage_dysphagie_post_extubation",
      "suivi_dietetique_post_reanimation",
    ],
  },
  routeOptions: ["Enterale", "Parenterale", "Mixte"],
  optimizer: {
    allowedQuantitiesPerDay: [
      0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5,
      3.75, 4,
    ],
    maxResults: 5,
    strictNonExceedance: true,
    missingBusinessRules: [],
  },
  defaults: {
    citrateSolutionName: "Regiocit",
    citrateConcentrationGMl: 0,
  },
  validationNeeded: [],
};

export const demoSolutes: SoluteRecord[] = [
  { voie: "Parenterale", solute: "Somofkabiven", kcal: 550, proteines_g: 25, volume_ml: 493 },
  { voie: "Parenterale", solute: "Somofkabiven", kcal: 1100, proteines_g: 50, volume_ml: 986 },
  { voie: "Parenterale", solute: "Somofkabiven", kcal: 1300, proteines_g: 75, volume_ml: 1477 },
  { voie: "Parenterale", solute: "Somofkabiven", kcal: 1800, proteines_g: 100, volume_ml: 1970 },
  { voie: "Parenterale", solute: "Somofkabiven", kcal: 2200, proteines_g: 125, volume_ml: 2463 },
  { voie: "Parenterale", solute: "Smofprot", kcal: 900, proteines_g: 66, volume_ml: 1012 },
  { voie: "Parenterale", solute: "Olimel N7", kcal: 1140, proteines_g: 44, volume_ml: 1000 },
  { voie: "Parenterale", solute: "Olimel N7", kcal: 1710, proteines_g: 66, volume_ml: 1500 },
  { voie: "Parenterale", solute: "Olimel N7", kcal: 2270, proteines_g: 88, volume_ml: 2000 },
  { voie: "Parenterale", solute: "Olimel N9", kcal: 1070, proteines_g: 56, volume_ml: 1000 },
  { voie: "Parenterale", solute: "Olimel N9", kcal: 1600, proteines_g: 85, volume_ml: 1500 },
  { voie: "Parenterale", solute: "Olimel N9", kcal: 2140, proteines_g: 113, volume_ml: 2000 },
  { voie: "Parenterale", solute: "Olimel N12", kcal: 620, proteines_g: 49, volume_ml: 650 },
  { voie: "Enterale", solute: "Original", kcal: 500, proteines_g: 12, volume_ml: 500 },
  { voie: "Enterale", solute: "Megareal", kcal: 700, proteines_g: 34, volume_ml: 500 },
  { voie: "Enterale", solute: "2kcal", kcal: 1000, proteines_g: 50, volume_ml: 500 },
];
