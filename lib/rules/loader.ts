import { readFile } from "node:fs/promises";

import { normalizeRules } from "@/lib/rules/normalizer";
import type { NutritionRules, SoluteRecord } from "@/types/nutrition";

export async function loadRulesFromFile(path: string): Promise<NutritionRules> {
  const raw = await readFile(path, "utf-8");
  return normalizeRules(JSON.parse(raw));
}

export async function loadSolutesFromCsv(path: string): Promise<SoluteRecord[]> {
  const raw = await readFile(path, "utf-8");
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(",").map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index]]));

    return {
      voie: row.voie as SoluteRecord["voie"],
      solute: row.solute,
      kcal: Number(row.kcal),
      proteines_g: Number(row.proteines_g),
      volume_ml: Number(row.volume_ml),
    };
  });
}
