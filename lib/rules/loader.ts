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

  function optionalNumber(value: string | undefined): number | null {
    if (value === undefined || value === "") {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function optionalText(value: string | undefined): string | null {
    return value ? value : null;
  }

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index]]));

    return {
      voie: row.voie as SoluteRecord["voie"],
      solute: row.solute,
      kcal: Number(row.kcal),
      proteines_g: Number(row.proteines_g),
      volume_ml: Number(row.volume_ml),
      lipides_g: optionalNumber(row.lipides_g),
      glucides_g: optionalNumber(row.glucides_g),
      fibres_g: optionalNumber(row.fibres_g),
      eau_ml: optionalNumber(row.eau_ml),
      osmolarite_mosm_l: optionalNumber(row.osmolarite_mosm_l),
      tcm_g: optionalNumber(row.tcm_g),
      reference: optionalText(row.reference),
      code_lppr: optionalText(row.code_lppr),
      specificites: optionalText(row.specificites),
    };
  });
}
