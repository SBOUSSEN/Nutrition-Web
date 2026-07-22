import type {
  CandidateComponent,
  PatientDraft,
  PrescriptionOption,
  RouteOption,
  SoluteRecord,
  NutritionRules,
  NutritionSummary,
} from "@/types/nutrition";

function allowedPathways(patient: PatientDraft): RouteOption[] {
  if (patient.enteralContraindications.length > 0) {
    return ["Parenterale"];
  }
  if (patient.routePreference === "Mixte") {
    return ["Enterale", "Parenterale", "Mixte"];
  }
  if (
    patient.routePreference === "Enterale" ||
    patient.routePreference === "Parenterale"
  ) {
    return [patient.routePreference];
  }
  return ["Enterale"];
}

function buildComponents(
  solutes: SoluteRecord[],
  pathways: RouteOption[],
  quantities: number[],
): Record<"Enterale" | "Parenterale", CandidateComponent[]> {
  const grouped: Record<"Enterale" | "Parenterale", CandidateComponent[]> = {
    Enterale: [],
    Parenterale: [],
  };

  for (const row of solutes) {
    const voie = row.voie;
    if (!(voie in grouped) || (!pathways.includes(voie) && !pathways.includes("Mixte"))) {
      continue;
    }

    for (const qty of quantities) {
      grouped[voie].push({
        voie,
        solute: row.solute,
        qty,
        kcal: row.kcal * qty,
        proteinG: row.proteines_g * qty,
        volumeMl: row.volume_ml * qty,
      });
    }
  }

  return grouped;
}

function optionFromComponents(
  components: CandidateComponent[],
  summary: NutritionSummary,
): PrescriptionOption | null {
  const nutritionalKcal = components.reduce((sum, item) => sum + item.kcal, 0);
  if (nutritionalKcal > summary.kcalNutritionMax + 1e-9) {
    return null;
  }

  const proteinG = components.reduce((sum, item) => sum + item.proteinG, 0);
  const volumeMlDay = components.reduce((sum, item) => sum + item.volumeMl, 0);
  const totalKcal = nutritionalKcal + summary.nonNutritionalKcal;
  const proteinDeficitG = Math.max(0, summary.defaultProteinTargetG - proteinG);
  const voies = new Set(components.map((item) => item.voie));
  const pathway: RouteOption = voies.size === 1 ? components[0].voie : "Mixte";
  const description = components.map((item) => item.solute).join(" + ");
  const quantitySummary = components.map((item) => `${item.qty}`).join(" + ");
  const componentDetails = components.map(
    (item) =>
      `${Math.round(item.volumeMl)} mL/24 h de ${item.solute} en ${item.voie.toLowerCase()}`,
  );
  const componentBreakdown = components.map((item) => ({
    voie: item.voie,
    solute: item.solute,
    qty: item.qty,
    volumeMlDay: item.volumeMl,
    kcal: item.kcal,
    proteinG: item.proteinG,
  }));

  return {
    pathway,
    description,
    quantitySummary,
    componentDetails,
    componentBreakdown,
    volumeMlDay,
    rateMlH: volumeMlDay / 24,
    nutritionalKcal,
    proteinG,
    totalKcal,
    proteinDeficitG,
    isProteinTargetMet: proteinDeficitG <= 0.05,
    componentCount: components.length,
    isWithinCalorieRange:
      nutritionalKcal >= summary.kcalNutritionMin &&
      nutritionalKcal <= summary.kcalNutritionMax,
    isUnderTargetOnly: nutritionalKcal < summary.kcalNutritionMin,
  };
}

function sortKey(option: PrescriptionOption, summary: NutritionSummary) {
  return [
    option.isWithinCalorieRange ? 0 : 1,
    Math.abs(summary.kcalNutritionMax - option.nutritionalKcal),
    option.proteinDeficitG,
    option.volumeMlDay,
    option.componentCount,
    option.description,
  ] as const;
}

function compareSortKey(
  a: ReturnType<typeof sortKey>,
  b: ReturnType<typeof sortKey>,
): number {
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] < b[index]) {
      return -1;
    }
    if (a[index] > b[index]) {
      return 1;
    }
  }
  return 0;
}

export function findBestPrescriptions(
  solutes: SoluteRecord[],
  patient: PatientDraft,
  summary: NutritionSummary,
  rules: NutritionRules,
  topN = 5,
): PrescriptionOption[] {
  const pathways = allowedPathways(patient);
  const quantities = rules.optimizer.allowedQuantitiesPerDay.map(Number);
  if (quantities.length === 0) {
    return [];
  }

  const componentsByPathway = buildComponents(solutes, pathways, quantities);
  const options: PrescriptionOption[] = [];

  for (const pathway of ["Enterale", "Parenterale"] as const) {
    if (!pathways.includes(pathway)) {
      continue;
    }
    for (const component of componentsByPathway[pathway]) {
      const option = optionFromComponents([component], summary);
      if (option) {
        options.push(option);
      }
    }
  }

  if (pathways.includes("Mixte")) {
    for (const enteralComponent of componentsByPathway.Enterale) {
      for (const parenteralComponent of componentsByPathway.Parenterale) {
        const option = optionFromComponents(
          [enteralComponent, parenteralComponent],
          summary,
        );
        if (option) {
          options.push(option);
        }
      }
    }
  }

  const unique = new Map<string, PrescriptionOption>();
  for (const option of options) {
    const key = `${option.pathway}|${option.description}|${option.quantitySummary}`;
    unique.set(key, option);
  }

  const ranked = [...unique.values()].sort((left, right) =>
    compareSortKey(sortKey(left, summary), sortKey(right, summary)),
  );

  const maxResults = Math.min(topN, rules.optimizer.maxResults);
  return ranked.slice(0, maxResults);
}
