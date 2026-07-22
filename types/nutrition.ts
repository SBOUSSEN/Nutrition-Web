export type NutritionPhase =
  | "aigue_defaillance"
  | "stabilisation"
  | "rehabilitation";

export type RouteOption = "Enterale" | "Parenterale" | "Mixte";

export type PatientDraft = {
  heightM: number;
  actualWeightKg: number;
  phosphoremiaMmolL: number;
  phase: NutritionPhase;
  shockMultivisceral: boolean;
  majorInstability: boolean;
  highOrRisingCatecholamines: boolean;
  hypoperfusion: boolean;
  hyperlactatemia: boolean;
  eer: boolean;
  citrateAnticoagulation: boolean;
  renalFailureNoRrt: boolean;
  enteralContraindications: string[];
  routePreference: RouteOption;
};

export type NonNutritionalInputs = {
  propofolRateMlH: number;
  propofolDoseMgH: number;
  propofolConcentrationMgMl: number;
  glucoseSolution: string | null;
  glucoseVolumeMlDay: number;
  bloodFlowMlMin: number;
  citrateConcentrationMmolL: number;
};

export type PhaseTargets = {
  label: string;
  kcalPerKg: [number, number];
  proteinGeneralGPerKg: [number, number];
  defaultProteinGPerKg: number;
  rehabilitationSpecialCases?: {
    eerGPerKg?: number;
    renalFailureNoRrtGPerKg?: number;
  };
};

export type NutritionRules = {
  metadata?: Record<string, unknown>;
  phaseTargets: Record<NutritionPhase, PhaseTargets>;
  nonNutritionalConstants: {
    propofolKcalPerMl: number;
    glucoseKcalPerG: number;
    citrateKcalPerG: number;
    citrateKcalPerMmol?: number;
  };
  glucoseSolutionsGPer100Ml: Record<string, number>;
  enteralContraindications: string[];
  surveillance: Record<string, string[]>;
  routeOptions: RouteOption[];
  optimizer: {
    allowedQuantitiesPerDay: number[];
    maxResults: number;
    strictNonExceedance: boolean;
    missingBusinessRules: string[];
  };
  defaults: {
    citrateSolutionName: string;
    citrateConcentrationGMl: number;
  };
  validationNeeded?: string[];
};

export type PatientComputed = {
  bmi: number;
  idealWeightKg: number;
  adjustedWeightKg: number | null;
  referenceWeightKg: number;
};

export type EerComputed = {
  bloodFlowMlMin: number;
  citrateConcentrationMmolL: number;
  regiocitFlowMlH: number;
  citrateMmolH: number;
  citrateMmolDay: number;
  citrateKcal: number;
};

export type NutritionSummary = {
  bmi: number;
  actualWeightKg: number;
  idealWeightKg: number | null;
  adjustedWeightKg: number | null;
  referenceWeightKg: number;
  kcalTargetMin: number;
  kcalTargetMax: number;
  proteinTargetMinG: number;
  proteinTargetMaxG: number;
  defaultProteinTargetG: number;
  proteinTargetDisplay: string;
  propofolKcal: number;
  glucoseKcal: number;
  citrateKcal: number;
  bloodFlowMlMin: number;
  citrateConcentrationMmolL: number;
  regiocitFlowMlH: number;
  citrateMmolH: number;
  citrateMmolDay: number;
  nonNutritionalKcal: number;
  kcalNutritionMin: number;
  kcalNutritionMax: number;
  shouldBlockPrescription: boolean;
};

export type ThreeDayPlanStep = {
  day: "Jour 1" | "Jour 2" | "Jour 3";
  kcal: number;
};

export type SoluteRecord = {
  voie: "Enterale" | "Parenterale";
  solute: string;
  kcal: number;
  proteines_g: number;
  volume_ml: number;
};

export type CandidateComponent = {
  voie: "Enterale" | "Parenterale";
  solute: string;
  qty: number;
  kcal: number;
  proteinG: number;
  volumeMl: number;
};

export type PrescriptionComponentBreakdown = {
  voie: "Enterale" | "Parenterale";
  solute: string;
  qty: number;
  volumeMlDay: number;
  kcal: number;
  proteinG: number;
};

export type PrescriptionOption = {
  pathway: RouteOption;
  description: string;
  quantitySummary: string;
  componentDetails: string[];
  componentBreakdown: PrescriptionComponentBreakdown[];
  volumeMlDay: number;
  rateMlH: number;
  nutritionalKcal: number;
  proteinG: number;
  totalKcal: number;
  proteinDeficitG: number;
  isProteinTargetMet: boolean;
  componentCount: number;
  isWithinCalorieRange: boolean;
  isUnderTargetOnly: boolean;
};
