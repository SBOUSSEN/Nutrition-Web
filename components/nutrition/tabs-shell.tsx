"use client";

import { useMemo, useState } from "react";

import type {
  NutritionSummary,
  PatientDraft,
  PrescriptionOption,
  ThreeDayPlanStep,
} from "@/types/nutrition";

const tabs = [
  "Sécurité clinique",
  "Voie d'administration",
  "EER",
  "Apports non nutritionnels",
  "Synthèse",
  "Proposition",
  "Surveillance",
] as const;

type TabsShellProps = {
  patient: PatientDraft;
  summary: NutritionSummary;
  proposals: PrescriptionOption[];
  bestProposal: PrescriptionOption | null;
  threeDayPlan: ThreeDayPlanStep[];
  sourcePaths: {
    rulesPath: string;
    solutesPath: string;
    mode: "bundled" | "external";
  };
  validationNeeded: string[];
};

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderRadius: 16,
        padding: "0.9rem",
        background: "linear-gradient(180deg, #f8fbff 0%, #f1f7ff 100%)",
        border: "1px solid rgba(13,71,161,0.08)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
      }}
    >
      <div style={{ color: "#6d7c95", fontSize: "0.8rem" }}>{label}</div>
      <div style={{ color: "#173a78", fontWeight: 800 }}>{value}</div>
    </div>
  );
}

export function TabsShell({
  patient,
  summary,
  proposals,
  bestProposal,
  threeDayPlan,
  sourcePaths,
  validationNeeded,
}: TabsShellProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Proposition");

  const progressivePlan = useMemo(() => {
    if (!bestProposal || threeDayPlan.length === 0 || bestProposal.nutritionalKcal <= 0) {
      return [];
    }

    return threeDayPlan.map((step) => {
      const ratio = Math.min(1, Math.max(0, step.kcal / bestProposal.nutritionalKcal));
      const details = bestProposal.componentBreakdown.map((component) => {
        const volume = component.volumeMlDay * ratio;
        return `${Math.round(volume)} mL/24 h de ${component.solute} en ${component.voie.toLowerCase()}`;
      });
      return { ...step, details };
    });
  }, [bestProposal, threeDayPlan]);

  const activeContent = (() => {
    if (summary.shouldBlockPrescription && activeTab !== "Sécurité clinique") {
      return (
        <div
          style={{
            borderRadius: 18,
            padding: "1rem",
            background: "linear-gradient(180deg, #fff5f1 0%, #ffe7de 100%)",
            border: "1px solid rgba(199, 68, 34, 0.18)",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#9a3412" }}>Alerte securite</h3>
          <p style={{ marginBottom: 0, color: "#7c2d12", lineHeight: 1.6 }}>
            Pas de nutrition ou prudence majeure : etat de defaillance, hypoperfusion
            ou instabilite clinique. Reevaluation medicale necessaire avant toute
            proposition.
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case "Sécurité clinique":
        return (
          <div>
            <h3>Securite clinique</h3>
            <p style={{ lineHeight: 1.6 }}>
              {summary.shouldBlockPrescription
                ? "Pas de nutrition ou prudence majeure : etat de defaillance ou hypoperfusion."
                : "Aucun signal de blocage majeur detecte dans ce scenario de demonstration."}
            </p>
          </div>
        );
      case "Voie d'administration":
        return (
          <div>
            <h3>Voie d&apos;administration</h3>
            <p style={{ lineHeight: 1.6 }}>
              Voie preferee actuelle : {patient.routePreference}. La voie enterale reste a
              privilegier au maximum.
            </p>
          </div>
        );
      case "EER":
        return (
          <div style={{ display: "grid", gap: "0.85rem" }}>
            <h3>EER</h3>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              {patient.eer && patient.citrateAnticoagulation
                ? `Debit sang ${summary.bloodFlowMlMin.toFixed(0)} mL/min, Regiocit ${summary.regiocitFlowMlH.toFixed(0)} mL/h, citrate ${summary.citrateMmolH.toFixed(3)} mmol/h soit ${summary.citrateMmolDay.toFixed(3)} mmol/24 h.`
                : "EER non activee."}
            </p>
            {patient.eer && patient.citrateAnticoagulation && (
              <MetricCard
                label="Apport energetique du citrate"
                value={`${summary.citrateKcal.toFixed(1)} kcal/j`}
              />
            )}
          </div>
        );
      case "Apports non nutritionnels":
        return (
          <div style={{ display: "grid", gap: "0.8rem" }}>
            <h3>Apports non nutritionnels</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "0.75rem",
              }}
            >
              <MetricCard label="Propofol" value={`${summary.propofolKcal.toFixed(0)} kcal/j`} />
              <MetricCard label="Glucose" value={`${summary.glucoseKcal.toFixed(0)} kcal/j`} />
              <MetricCard label="Citrate" value={`${summary.citrateKcal.toFixed(1)} kcal/j`} />
              <MetricCard
                label="Total non nutritionnel"
                value={`${summary.nonNutritionalKcal.toFixed(0)} kcal/j`}
              />
            </div>
          </div>
        );
      case "Synthèse":
        return (
          <div style={{ display: "grid", gap: "1rem" }}>
            <div>
              <h3>Synthese clinique</h3>
              <p style={{ lineHeight: 1.6 }}>
                IMC {summary.bmi.toFixed(1)}, poids retenu {summary.referenceWeightKg.toFixed(1)} kg,
                poids ideal {summary.idealWeightKg?.toFixed(1) ?? "N/A"} kg, cible calorique{" "}
                {summary.kcalTargetMin.toFixed(0)}-{summary.kcalTargetMax.toFixed(0)} kcal/j,
                cible proteique {summary.proteinTargetDisplay}.
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "0.75rem",
              }}
            >
              <MetricCard
                label="Calories non nutritionnelles"
                value={`${summary.nonNutritionalKcal.toFixed(0)} kcal/j`}
              />
              <MetricCard
                label="Fenetre nutritionnelle"
                value={`${summary.kcalNutritionMin.toFixed(0)}-${summary.kcalNutritionMax.toFixed(0)} kcal/j`}
              />
              <MetricCard
                label="Objectif proteique par defaut"
                value={`${summary.defaultProteinTargetG.toFixed(1)} g/j`}
              />
            </div>
          </div>
        );
      case "Proposition":
        return (
          <div style={{ display: "grid", gap: "1rem" }}>
            {threeDayPlan.length > 0 && (
              <div>
                <h3>Progression proposee</h3>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  {threeDayPlan.map((step) => (
                    <div
                      key={step.day}
                      style={{
                        minWidth: 140,
                        padding: "0.8rem",
                        borderRadius: 14,
                        background: "#f7faff",
                        border: "1px solid rgba(13,71,161,0.08)",
                      }}
                    >
                      <div style={{ color: "#6d7c95", fontSize: "0.78rem" }}>{step.day}</div>
                      <div style={{ color: "#173a78", fontWeight: 700 }}>
                        {step.kcal.toFixed(0)} kcal/j
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {bestProposal ? (
              <div
                style={{
                  borderRadius: 24,
                  padding: "1.15rem",
                  background: "linear-gradient(135deg, #fff9f3 0%, #fff0df 100%)",
                  border: "1px solid rgba(255,122,0,0.18)",
                  boxShadow: "0 16px 40px rgba(255, 122, 0, 0.08)",
                }}
              >
                <div style={{ color: "#d66500", fontWeight: 800, marginBottom: "0.35rem" }}>
                  Meilleure proposition
                </div>
                <div style={{ color: "#173a78", fontWeight: 800, marginBottom: "0.35rem" }}>
                  {bestProposal.pathway} | {bestProposal.description}
                </div>
                <div style={{ color: "#5d4d39", lineHeight: 1.5 }}>
                  Objectif final J3 : {bestProposal.nutritionalKcal.toFixed(0)} kcal
                  nutritionnelles | {bestProposal.proteinG.toFixed(1)} g proteines
                </div>
                <div style={{ marginTop: "0.85rem", display: "grid", gap: "0.65rem" }}>
                  {progressivePlan.map((step) => (
                    <div
                      key={step.day}
                      style={{
                        borderRadius: 16,
                        padding: "0.8rem 0.9rem",
                        background: "rgba(255,255,255,0.76)",
                        border: "1px solid rgba(255,122,0,0.14)",
                      }}
                    >
                      <div style={{ color: "#d66500", fontWeight: 700 }}>{step.day}</div>
                      <div style={{ color: "#173a78", fontWeight: 700 }}>
                        {step.kcal.toFixed(0)} kcal/j
                      </div>
                      <div style={{ color: "#5d4d39", marginTop: "0.2rem", lineHeight: 1.55 }}>
                        {step.details.join(" ; ")}
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ margin: "0.9rem 0 0", color: "#5d4d39" }}>
                  La voie enterale doit rester privilegiee au maximum, avec montee
                  progressive selon la tolerance clinique et digestive.
                </p>
              </div>
            ) : (
              <div
                style={{
                  borderRadius: 18,
                  padding: "1rem",
                  background: "#f7faff",
                  border: "1px solid rgba(13,71,161,0.08)",
                  color: "#173a78",
                }}
              >
                Aucune proposition disponible avec la configuration actuelle.
              </div>
            )}
            <div>
              <h3>Top propositions</h3>
              <div style={{ display: "grid", gap: "0.65rem" }}>
                {proposals.map((proposal) => (
                  <div
                    key={`${proposal.pathway}-${proposal.description}-${proposal.quantitySummary}`}
                    style={{
                      borderRadius: 16,
                      padding: "0.9rem",
                      background: "#ffffff",
                      border: "1px solid rgba(13,71,161,0.08)",
                    }}
                  >
                    <div style={{ color: "#173a78", fontWeight: 700 }}>
                      {proposal.pathway} | {proposal.description}
                    </div>
                    <div style={{ color: "#6d7c95", marginTop: "0.2rem" }}>
                      {proposal.nutritionalKcal.toFixed(0)} kcal nutritionnelles |{" "}
                      {proposal.proteinG.toFixed(1)} g proteines
                    </div>
                    <div style={{ color: "#5d4d39", marginTop: "0.35rem", lineHeight: 1.5 }}>
                      {proposal.componentDetails.join(" ; ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "Surveillance":
        return (
          <div style={{ display: "grid", gap: "0.9rem" }}>
            <h3>Surveillance</h3>
            <p>La checklist de surveillance sera branchee ici dans l&apos;etape UI suivante.</p>
            <div
              style={{
                borderRadius: 16,
                padding: "0.9rem",
                background: "#f7faff",
                border: "1px solid rgba(13,71,161,0.08)",
              }}
            >
              <div style={{ color: "#173a78", fontWeight: 700 }}>Sources metier chargees</div>
              <div style={{ color: "#5d4d39", marginTop: "0.35rem", lineHeight: 1.55 }}>
                Mode : {sourcePaths.mode === "external" ? "source externe" : "source embarquee"}
                <br />
                {sourcePaths.solutesPath}
                <br />
                {sourcePaths.rulesPath}
              </div>
            </div>
            {validationNeeded.length > 0 && (
              <div
                style={{
                  borderRadius: 16,
                  padding: "0.9rem",
                  background: "#fff9f3",
                  border: "1px solid rgba(255,122,0,0.16)",
                }}
              >
                <div style={{ color: "#d66500", fontWeight: 700 }}>Points a valider du JSON</div>
                <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.2rem", color: "#5d4d39" }}>
                  {validationNeeded.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  })();

  return (
    <section
      style={{
        padding: "1rem",
        borderRadius: 24,
        background: "rgba(255,255,255,0.94)",
        border: "1px solid rgba(13, 71, 161, 0.1)",
        boxShadow: "0 18px 50px rgba(13, 71, 161, 0.06)",
      }}
    >
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.55rem 0.95rem",
              borderRadius: 999,
              background:
                activeTab === tab
                  ? "linear-gradient(90deg, #0d47a1 0%, #ff7a00 100%)"
                  : "linear-gradient(180deg, #f7faff 0%, #eef4fb 100%)",
              color: activeTab === tab ? "#fff" : "#173a78",
              fontWeight: 600,
              fontSize: "0.92rem",
              border: "none",
              cursor: "pointer",
              boxShadow:
                activeTab === tab
                  ? "0 10px 24px rgba(13, 71, 161, 0.18)"
                  : "inset 0 1px 0 rgba(255,255,255,0.7)",
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div
        style={{
          marginTop: "1rem",
          minHeight: 420,
          borderRadius: 20,
          border: "1px solid rgba(13, 71, 161, 0.08)",
          padding: "1.05rem",
          color: "#6d7c95",
          background:
            "linear-gradient(180deg, rgba(250,252,255,0.9) 0%, rgba(245,249,255,0.86) 100%)",
        }}
      >
        {activeContent}
      </div>
    </section>
  );
}
