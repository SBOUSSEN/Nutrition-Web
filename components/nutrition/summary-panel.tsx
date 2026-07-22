import type { NutritionSummary } from "@/types/nutrition";

type SummaryPanelProps = {
  summary: NutritionSummary;
  phaseLabel: string;
};

export function SummaryPanel({ summary, phaseLabel }: SummaryPanelProps) {
  const safetyTone = summary.shouldBlockPrescription
    ? {
        label: "Alerte clinique",
        value: "Prudence majeure",
        background: "linear-gradient(180deg, #fff4f1 0%, #ffe8e1 100%)",
        border: "1px solid rgba(199, 68, 34, 0.16)",
        color: "#9a3412",
      }
    : {
        label: "Securite",
        value: "Pas de blocage majeur",
        background: "linear-gradient(180deg, #f5fbf8 0%, #ecf8f1 100%)",
        border: "1px solid rgba(17, 138, 88, 0.14)",
        color: "#166534",
      };

  return (
    <section
      style={{
        padding: "1.1rem",
        borderRadius: 24,
        background:
          "linear-gradient(180deg, rgba(249,251,255,0.98) 0%, rgba(238,245,255,0.96) 100%)",
        border: "1px solid rgba(13, 71, 161, 0.1)",
        boxShadow: "0 18px 50px rgba(13, 71, 161, 0.06)",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "0.2rem", fontSize: "1.08rem" }}>
        Synthèse rapide
      </h2>
      <p style={{ margin: "0 0 0.75rem", color: "#6d7c95", fontSize: "0.9rem" }}>
        {phaseLabel}
      </p>
      <div
        style={{
          marginBottom: "0.75rem",
          borderRadius: 16,
          padding: "0.85rem",
          background: safetyTone.background,
          border: safetyTone.border,
        }}
      >
        <div style={{ color: "#6d7c95", fontSize: "0.78rem" }}>{safetyTone.label}</div>
        <div style={{ color: safetyTone.color, fontWeight: 800 }}>{safetyTone.value}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
        {[
          ["IMC", summary.bmi.toFixed(1)],
          ["Poids retenu", `${summary.referenceWeightKg.toFixed(1)} kg`],
          [
            "Poids ideal",
            summary.idealWeightKg ? `${summary.idealWeightKg.toFixed(1)} kg` : "N/A",
          ],
          [
            "Cible kcal",
            `${summary.kcalTargetMin.toFixed(0)}-${summary.kcalTargetMax.toFixed(0)} kcal/j`,
          ],
          ["Cible proteines", summary.proteinTargetDisplay],
          ["Non nutritionnel", `${summary.nonNutritionalKcal.toFixed(0)} kcal/j`],
          ["Regiocit", `${summary.regiocitFlowMlH.toFixed(0)} mL/h`],
          ["Fenetre nutrition", `${summary.kcalNutritionMax.toFixed(0)} kcal/j max`],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              borderRadius: 14,
              padding: "0.75rem",
              background: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(13,71,161,0.08)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            <div style={{ color: "#6d7c95", fontSize: "0.78rem" }}>{label}</div>
            <div style={{ color: "#173a78", fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
