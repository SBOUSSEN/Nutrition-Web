import { loadBusinessDataset } from "@/lib/rules/business-data";
import { NutritionWorkspace } from "@/components/nutrition/workspace";

export default async function HomePage() {
  const dataset = await loadBusinessDataset();

  return (
    <NutritionWorkspace
      initialRules={dataset.rules}
      initialSolutes={dataset.solutes}
      sourcePaths={dataset.sources}
    />
  );
}
