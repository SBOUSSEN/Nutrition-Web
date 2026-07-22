"use client";

import { useMemo, useState } from "react";

import { Hero } from "@/components/layout/hero";
import { Shell } from "@/components/layout/shell";
import { PatientPanel } from "@/components/nutrition/patient-panel";
import { SummaryPanel } from "@/components/nutrition/summary-panel";
import { TabsShell } from "@/components/nutrition/tabs-shell";
import { getDefaultBloodFlowMlMin } from "@/lib/nutrition/eer";
import { findBestPrescriptions } from "@/lib/nutrition/optimizer";
import { buildThreeDayPlan } from "@/lib/nutrition/plan";
import { buildSummary } from "@/lib/nutrition/summary";
import type {
  NonNutritionalInputs,
  NutritionRules,
  PatientDraft,
  SoluteRecord,
  ThreeDayPlanStep,
} from "@/types/nutrition";

const defaultPatient: PatientDraft = {
  heightM: 1.75,
  actualWeightKg: 70,
  phosphoremiaMmolL: 1,
  phase: "stabilisation",
  shockMultivisceral: false,
  majorInstability: false,
  highOrRisingCatecholamines: false,
  hypoperfusion: false,
  hyperlactatemia: false,
  eer: false,
  citrateAnticoagulation: false,
  renalFailureNoRrt: false,
  enteralContraindications: [],
  routePreference: "Enterale",
};

type NutritionWorkspaceProps = {
  initialRules: NutritionRules;
  initialSolutes: SoluteRecord[];
  sourcePaths: {
    rulesPath: string;
    solutesPath: string;
    mode: "bundled" | "external";
  };
};

export function NutritionWorkspace({
  initialRules,
  initialSolutes,
  sourcePaths,
}: NutritionWorkspaceProps) {
  const [patient, setPatient] = useState<PatientDraft>(defaultPatient);
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [inputs, setInputs] = useState<NonNutritionalInputs>({
    propofolRateMlH: 0,
    propofolDoseMgH: 0,
    propofolConcentrationMgMl: 10,
    glucoseSolution: null,
    glucoseVolumeMlDay: 0,
    bloodFlowMlMin: getDefaultBloodFlowMlMin(defaultPatient.actualWeightKg),
    citrateConcentrationMmolL: 3.3,
  });

  const summary = useMemo(
    () => buildSummary(patient, inputs, initialRules),
    [initialRules, patient, inputs],
  );

  const proposals = useMemo(
    () => findBestPrescriptions(initialSolutes, patient, summary, initialRules, 5),
    [initialRules, initialSolutes, patient, summary],
  );

  const threeDayPlan = useMemo<ThreeDayPlanStep[]>(
    () =>
      buildThreeDayPlan(
        patient.phase,
        summary.kcalTargetMin,
        summary.kcalTargetMax,
      ),
    [patient.phase, summary.kcalTargetMin, summary.kcalTargetMax],
  );

  const bestProposal = proposals[0] ?? null;
  const canContinue = patient.heightM > 0 && patient.actualWeightKg > 0;
  const hasSafetyAlert = summary.shouldBlockPrescription;

  function updatePatient<K extends keyof PatientDraft>(
    key: K,
    value: PatientDraft[K],
  ) {
    setPatient((current) => {
      const next = { ...current, [key]: value };
      if (key === "actualWeightKg") {
        setInputs((existing) => ({
          ...existing,
          bloodFlowMlMin: getDefaultBloodFlowMlMin(value as number),
        }));
      }
      return next;
    });
  }

  function updateInputs<K extends keyof NonNutritionalInputs>(
    key: K,
    value: NonNutritionalInputs[K],
  ) {
    setInputs((current) => ({ ...current, [key]: value }));
  }

  const setupContent = (
    <div
      style={{
        width: "min(1100px, 100%)",
        margin: "0 auto",
        display: "grid",
        gap: "1rem",
      }}
    >
      <section
        style={{
          padding: "1.1rem",
          borderRadius: 24,
          background: "rgba(255,255,255,0.94)",
          border: "1px solid rgba(13, 71, 161, 0.1)",
          boxShadow: "0 18px 50px rgba(13, 71, 161, 0.06)",
          display: "grid",
          gap: "1rem",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              padding: "0.32rem 0.72rem",
              borderRadius: 999,
              background: "rgba(13,71,161,0.08)",
              color: "#0d47a1",
              fontSize: "0.78rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Étape 1
          </div>
          <h2 style={{ margin: "0.7rem 0 0.25rem", fontSize: "1.35rem", color: "#173a78" }}>
            Données patient et sécurité
          </h2>
          <p style={{ margin: 0, color: "#62728e", lineHeight: 1.6 }}>
            Saisir les informations initiales, vérifier les éléments de sécurité,
            puis valider pour accéder à l&apos;analyse nutritionnelle.
          </p>
        </div>

        <PatientPanel
          patient={patient}
          enteralContraindicationsCatalog={initialRules.enteralContraindications}
          onPatientChange={updatePatient}
          nonNutritionalInputs={inputs}
          onNonNutritionalChange={updateInputs}
        />
      </section>

      <section
        style={{
          padding: "1.1rem",
          borderRadius: 24,
          background: "rgba(255,255,255,0.94)",
          border: "1px solid rgba(13, 71, 161, 0.1)",
          boxShadow: "0 18px 50px rgba(13, 71, 161, 0.06)",
          display: "grid",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "0.8rem",
          }}
        >
          {[
            ["Phase sélectionnée", initialRules.phaseTargets[patient.phase].label],
            ["Poids retenu", `${summary.referenceWeightKg.toFixed(1)} kg`],
            [
              "Cible calorique",
              `${summary.kcalTargetMin.toFixed(0)}-${summary.kcalTargetMax.toFixed(0)} kcal/j`,
            ],
            ["Cible protéique", summary.proteinTargetDisplay],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                borderRadius: 18,
                padding: "0.95rem",
                background: "linear-gradient(180deg, #f8fbff 0%, #f2f7ff 100%)",
                border: "1px solid rgba(13,71,161,0.08)",
              }}
            >
              <div style={{ color: "#6d7c95", fontSize: "0.8rem" }}>{label}</div>
              <div style={{ color: "#173a78", fontWeight: 800 }}>{value}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            borderRadius: 18,
            padding: "1rem",
            background: hasSafetyAlert
              ? "linear-gradient(180deg, #fff5f1 0%, #ffe7de 100%)"
              : "linear-gradient(180deg, #f5fbf8 0%, #ecf8f1 100%)",
            border: hasSafetyAlert
              ? "1px solid rgba(199, 68, 34, 0.18)"
              : "1px solid rgba(17, 138, 88, 0.16)",
          }}
        >
          <div
            style={{
              color: hasSafetyAlert ? "#9a3412" : "#166534",
              fontWeight: 800,
              marginBottom: "0.3rem",
            }}
          >
            {hasSafetyAlert ? "Alerte sécurité" : "Sécurité initiale"}
          </div>
          <div style={{ color: hasSafetyAlert ? "#7c2d12" : "#166534", lineHeight: 1.6 }}>
            {hasSafetyAlert
              ? "Une prudence majeure est détectée. L'espace d'analyse reste accessible, mais la proposition devra être interprétée avec réévaluation médicale prioritaire."
              : "Aucun signal majeur de blocage n'est repéré sur cette saisie initiale."}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <p style={{ margin: 0, color: "#62728e", fontSize: "0.92rem" }}>
            La saisie reste modifiable ensuite via le bouton de retour.
          </p>
          <button
            type="button"
            onClick={() => setSetupCompleted(true)}
            disabled={!canContinue}
            style={{
              padding: "0.9rem 1.2rem",
              borderRadius: 16,
              border: "none",
              cursor: canContinue ? "pointer" : "not-allowed",
              background: canContinue
                ? "linear-gradient(90deg, #0d47a1 0%, #ff7a00 100%)"
                : "linear-gradient(180deg, #dbe5f2 0%, #d3ddea 100%)",
              color: "#fff",
              fontWeight: 800,
              boxShadow: canContinue ? "0 14px 34px rgba(13, 71, 161, 0.18)" : "none",
              minWidth: 250,
            }}
          >
            Valider et ouvrir l&apos;analyse
          </button>
        </div>
      </section>
    </div>
  );

  const analysisContent = (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          gap: "1rem",
          alignItems: "start",
        }}
      >
        <SummaryPanel
          summary={summary}
          phaseLabel={initialRules.phaseTargets[patient.phase].label}
        />
        <button
          type="button"
          onClick={() => setSetupCompleted(false)}
          style={{
            padding: "0.85rem 1rem",
            borderRadius: 16,
            border: "1px solid rgba(13,71,161,0.12)",
            background: "rgba(255,255,255,0.92)",
            color: "#173a78",
            fontWeight: 700,
            cursor: "pointer",
            minWidth: 220,
          }}
        >
          Retour à la saisie patient
        </button>
      </div>

      <TabsShell
        patient={patient}
        summary={summary}
        proposals={proposals}
        bestProposal={bestProposal}
        threeDayPlan={threeDayPlan}
        sourcePaths={sourcePaths}
        validationNeeded={initialRules.validationNeeded ?? []}
      />
    </div>
  );

  return (
    <Shell
      hero={<Hero />}
      content={setupCompleted ? analysisContent : setupContent}
    />
  );
}
