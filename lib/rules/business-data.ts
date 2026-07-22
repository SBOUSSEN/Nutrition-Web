import { access } from "node:fs/promises";
import path from "node:path";

import { loadRulesFromFile, loadSolutesFromCsv } from "@/lib/rules/loader";
import type { NutritionRules, SoluteRecord } from "@/types/nutrition";

export const LOCAL_BUSINESS_RULES_PATH =
  "/Users/salahboussen2/Documents/recherche/NUTRITION/nutrition_rules_v0_2.json";
export const LOCAL_BUSINESS_SOLUTES_PATH =
  "/Users/salahboussen2/Documents/recherche/NUTRITION/nutrition_solutes.csv";
export const BUNDLED_BUSINESS_RULES_PATH = path.join(
  process.cwd(),
  "data",
  "nutrition_rules_v0_2.json",
);
export const BUNDLED_BUSINESS_SOLUTES_PATH = path.join(
  process.cwd(),
  "data",
  "nutrition_solutes.csv",
);

export type BusinessDataset = {
  rules: NutritionRules;
  solutes: SoluteRecord[];
  sources: {
    rulesPath: string;
    solutesPath: string;
    mode: "bundled" | "external";
  };
};

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveBusinessPaths() {
  const envRulesPath = process.env.NUTRITION_RULES_PATH;
  const envSolutesPath = process.env.NUTRITION_SOLUTES_PATH;

  if (envRulesPath && envSolutesPath) {
    return {
      rulesPath: envRulesPath,
      solutesPath: envSolutesPath,
      mode: "external" as const,
    };
  }

  const localFilesExist =
    (await pathExists(LOCAL_BUSINESS_RULES_PATH)) &&
    (await pathExists(LOCAL_BUSINESS_SOLUTES_PATH));

  if (localFilesExist) {
    return {
      rulesPath: LOCAL_BUSINESS_RULES_PATH,
      solutesPath: LOCAL_BUSINESS_SOLUTES_PATH,
      mode: "external" as const,
    };
  }

  return {
    rulesPath: BUNDLED_BUSINESS_RULES_PATH,
    solutesPath: BUNDLED_BUSINESS_SOLUTES_PATH,
    mode: "bundled" as const,
  };
}

export async function loadBusinessDataset(): Promise<BusinessDataset> {
  const resolved = await resolveBusinessPaths();
  const [rules, solutes] = await Promise.all([
    loadRulesFromFile(resolved.rulesPath),
    loadSolutesFromCsv(resolved.solutesPath),
  ]);

  return {
    rules,
    solutes,
    sources: {
      rulesPath: resolved.rulesPath,
      solutesPath: resolved.solutesPath,
      mode: resolved.mode,
    },
  };
}
