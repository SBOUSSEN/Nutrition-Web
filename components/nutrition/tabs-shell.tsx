"use client";

import { useMemo, useState } from "react";

import type {
  NutritionRules,
  NutritionSummary,
  PatientDraft,
  PrescriptionComponentBreakdown,
  PrescriptionOption,
  SoluteRecord,
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
  "Produits disponibles",
] as const;

type TabsShellProps = {
  patient: PatientDraft;
  summary: NutritionSummary;
  proposals: PrescriptionOption[];
  bestProposal: PrescriptionOption | null;
  threeDayPlan: ThreeDayPlanStep[];
  enteralAdministration: NutritionRules["enteralAdministration"];
  solutes: SoluteRecord[];
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
  enteralAdministration,
  solutes,
}: TabsShellProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Proposition");
  const [monitoringChecks, setMonitoringChecks] = useState<Set<string>>(new Set());
  const enteralProducts = solutes.filter((solute) => solute.voie === "Enterale");
  const [selectedProductKey, setSelectedProductKey] = useState(
    enteralProducts[0]?.solute ?? "",
  );
  const selectedProduct =
    enteralProducts.find((product) => product.solute === selectedProductKey) ??
    enteralProducts[0];
  const kcalPerKgMin = summary.kcalTargetMin / summary.referenceWeightKg;
  const kcalPerKgMax = summary.kcalTargetMax / summary.referenceWeightKg;
  const kcalPerKgMidpoint = (kcalPerKgMin + kcalPerKgMax) / 2;
  const formatKcalPerKg = (value: number) =>
    Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1).replace(".", ",");

  function formatHours(value: number) {
    return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1).replace(".", ",");
  }

  function formatAdministration(
    component: PrescriptionComponentBreakdown,
    ratio = 1,
  ): string {
    const volume = component.volumeMlDay * ratio;
    const roundedVolume = Math.round(volume);

    if (
      component.voie !== "Enterale" ||
      patient.enteralAdministrationMode === "continuous_rate"
    ) {
      const continuousLabel = component.voie === "Enterale" ? " en continu" : "";
      return `${roundedVolume} mL/24 h de ${component.solute} en ${component.voie.toLowerCase()} (${(volume / 24).toFixed(1).replace(".", ",")} mL/h${continuousLabel})`;
    }

    const bagVolume =
      component.qty > 0 ? component.volumeMlDay / component.qty : component.volumeMlDay;
    const bagCount = Math.max(1, Math.ceil((volume - 1e-9) / bagVolume));
    const periodRules = enteralAdministration.periodVolumes;
    const periodHours =
      bagCount <= periodRules.maxBagsWithStandardPeriod
        ? periodRules.standardPeriodHours
        : periodRules.dailyHours / bagCount;
    const portions: number[] = [];
    let remainingVolume = volume;

    for (let index = 0; index < bagCount; index += 1) {
      const portion = Math.min(bagVolume, remainingVolume);
      if (portion > 0) {
        portions.push(portion);
        remainingVolume -= portion;
      }
    }

    const schedule = portions
      .map(
        (portion) =>
          `${Math.round(portion)} mL sur ${formatHours(periodHours)} h`,
      )
      .join(" puis ");
    return `${schedule} de ${component.solute} par voie entérale`;
  }

  function toggleMonitoringItem(item: string) {
    setMonitoringChecks((current) => {
      const next = new Set(current);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  }

  function monitoringItem(id: string, label: string) {
    return (
      <label
        key={id}
        style={{
          display: "grid",
          gridTemplateColumns: "20px minmax(0, 1fr)",
          gap: "0.65rem",
          alignItems: "start",
          padding: "0.7rem 0.75rem",
          borderRadius: 14,
          background: monitoringChecks.has(id) ? "rgba(20, 134, 137, 0.1)" : "#fff",
          border: monitoringChecks.has(id)
            ? "1px solid rgba(20, 134, 137, 0.25)"
            : "1px solid rgba(13,71,161,0.08)",
          color: "#29466f",
          lineHeight: 1.45,
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={monitoringChecks.has(id)}
          onChange={() => toggleMonitoringItem(id)}
          style={{ width: 18, height: 18, marginTop: 2 }}
        />
        <span>{label}</span>
      </label>
    );
  }

  const progressivePlan = useMemo(() => {
    if (!bestProposal || threeDayPlan.length === 0 || bestProposal.nutritionalKcal <= 0) {
      return [];
    }

    return threeDayPlan.map((step) => {
      const nutritionalTarget = Math.max(0, step.kcal - summary.nonNutritionalKcal);
      const ratio = Math.min(
        1,
        Math.max(0, nutritionalTarget / bestProposal.nutritionalKcal),
      );
      const details = bestProposal.componentBreakdown.map((component) =>
        formatAdministration(component, ratio),
      );
      return { ...step, details };
    });
  }, [
    bestProposal,
    enteralAdministration,
    patient.enteralAdministrationMode,
    summary.nonNutritionalKcal,
    threeDayPlan,
  ]);

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
            {(patient.routePreference === "Enterale" ||
              patient.routePreference === "Mixte") && (
              <p style={{ lineHeight: 1.6 }}>
                Présentation retenue pour la nutrition entérale : {" "}
                <strong>
                  {patient.enteralAdministrationMode === "continuous_rate"
                    ? "débit continu en mL/h"
                    : "volumes à administrer par périodes"}
                </strong>
                .
              </p>
            )}
          </div>
        );
      case "EER":
        return (
          <div style={{ display: "grid", gap: "0.85rem" }}>
            <h3>EER</h3>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              {patient.eer && patient.citrateAnticoagulation
                ? `Débit sanguin ${summary.bloodFlowMlMin.toFixed(0)} mL/min, dose de citrate ${summary.citrateDoseMmolLBlood.toFixed(1)} mmol/L de sang traité. ${summary.citrateAdministeredMmolDay.toFixed(1)} mmol/j administrés, dont ${summary.citrateMetabolizedMmolDay.toFixed(1)} mmol/j métabolisés après ${Math.round(summary.citrateEliminationFraction * 100)} % d'élimination.`
                : "EER non activee."}
            </p>
            {patient.eer && patient.citrateAnticoagulation && (
              <>
                <MetricCard
                  label="Apport énergétique du citrate"
                  value={`${summary.citrateKcal.toFixed(1)} kcal/j`}
                />
                <p style={{ margin: 0, fontSize: "0.84rem", lineHeight: 1.55 }}>
                  Formule RFE : débit sanguin × dose de citrate × 1,44 ×
                  (1 - fraction éliminée) × 0,59 kcal/mmol.
                </p>
              </>
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
                <p style={{ lineHeight: 1.55 }}>
                  {patient.alreadyReceivingEnteral &&
                  (patient.routePreference === "Enterale" || patient.routePreference === "Mixte")
                    ? `Patient déjà alimenté par voie entérale : objectif de ${formatKcalPerKg(kcalPerKgMidpoint)} kcal/kg/j à J1, puis ${formatKcalPerKg(kcalPerKgMax)} kcal/kg/j à J2.`
                    : "Montée progressive du bas vers le haut de la fourchette selon la tolérance et l'état clinique."}
                </p>
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
                  Objectif final {threeDayPlan.at(-1)?.day} : {bestProposal.nutritionalKcal.toFixed(0)} kcal
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
                      {proposal.componentBreakdown
                        .map((component) => formatAdministration(component))
                        .join(" ; ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "Surveillance":
        return (
          <div style={{ display: "grid", gap: "1rem" }}>
            <div>
              <h3 style={{ marginBottom: "0.35rem", color: "#173a78" }}>
                Surveillance de la tolérance et de l&apos;efficacité
              </h3>
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                Suivre régulièrement la tolérance et l&apos;efficacité du support
                nutritionnel pour adapter la prise en charge et prévenir les complications.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "0.85rem",
              }}
            >
              <section
                style={{
                  padding: "1rem",
                  borderRadius: 20,
                  background: "linear-gradient(180deg, #f1fbfb 0%, #e7f5f6 100%)",
                  border: "1px solid rgba(20,134,137,0.2)",
                }}
              >
                <div style={{ color: "#0f777a", fontWeight: 800, marginBottom: "0.7rem" }}>
                  Tolérance clinique
                </div>
                <div style={{ display: "grid", gap: "0.55rem" }}>
                  {monitoringItem("gids", "Évaluation clinique par le score GIDS")}
                  <div
                    style={{
                      padding: "0.7rem 0.75rem",
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.72)",
                      border: "1px dashed rgba(20,134,137,0.3)",
                      color: "#0f686b",
                      lineHeight: 1.45,
                    }}
                  >
                    Le recueil du volume résiduel gastrique n&apos;est pas recommandé.
                  </div>
                </div>
              </section>

              <section
                style={{
                  padding: "1rem",
                  borderRadius: 20,
                  background: "linear-gradient(180deg, #f1fbfb 0%, #e7f5f6 100%)",
                  border: "1px solid rgba(20,134,137,0.2)",
                }}
              >
                <div style={{ color: "#0f777a", fontWeight: 800, marginBottom: "0.7rem" }}>
                  Tolérance métabolique
                </div>
                <div style={{ display: "grid", gap: "0.55rem" }}>
                  {monitoringItem(
                    "hepatic",
                    "Si nutrition parentérale et/ou dose élevée de propofol : bilan hépatique 2 fois/semaine",
                  )}
                  {monitoringItem(
                    "triglycerides",
                    "Si nutrition parentérale et/ou dose élevée de propofol : triglycérides 1 fois/semaine",
                  )}
                  {monitoringItem(
                    "refeeding",
                    "Dépistage du syndrome de renutrition : kaliémie, phosphatémie et magnésémie 1 fois/jour jusqu’à J3-J5",
                  )}
                </div>
              </section>
            </div>

            <div>
              <div
                style={{
                  color: "#a94f58",
                  fontWeight: 800,
                  marginBottom: "0.7rem",
                  fontSize: "1rem",
                }}
              >
                Efficacité du support nutritionnel
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "0.85rem",
                }}
              >
                {[
                  {
                    title: "Court terme",
                    items: [
                      ["weight", "Pesée régulière"],
                      ["prealbumin", "Préalbumine 1 fois/semaine"],
                      ["calorimetry", "Discuter un monitorage par calorimétrie indirecte"],
                    ],
                  },
                  {
                    title: "Moyen terme",
                    items: [
                      [
                        "muscle",
                        "Évaluation de la masse musculaire : imagerie, impédancemétrie ou DEXA",
                      ],
                    ],
                  },
                  {
                    title: "Long terme",
                    items: [["functional", "Tests fonctionnels"]],
                  },
                ].map((group) => (
                  <section
                    key={group.title}
                    style={{
                      padding: "1rem",
                      borderRadius: 20,
                      background: "linear-gradient(180deg, #fff7f7 0%, #fbeeee 100%)",
                      border: "1px solid rgba(169,79,88,0.18)",
                    }}
                  >
                    <div
                      style={{ color: "#a94f58", fontWeight: 800, marginBottom: "0.7rem" }}
                    >
                      {group.title}
                    </div>
                    <div style={{ display: "grid", gap: "0.55rem" }}>
                      {group.items.map(([id, label]) => monitoringItem(id, label))}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            <div
              style={{
                borderRadius: 18,
                padding: "0.9rem 1rem",
                background: "linear-gradient(90deg, #eef9f9 0%, #fff5f4 100%)",
                border: "1px solid rgba(13,71,161,0.1)",
                color: "#29466f",
                lineHeight: 1.55,
              }}
            >
              <strong>Objectif :</strong> prévenir la dénutrition, détecter précocement les
              complications et optimiser les résultats cliniques.
            </div>

            <details style={{ color: "#5d6f8a", fontSize: "0.84rem" }}>
              <summary style={{ cursor: "pointer", fontWeight: 700 }}>Abréviations</summary>
              <p style={{ lineHeight: 1.6 }}>
                BH : bilan hépatique ; DEXA : absorptiométrie biphotonique à rayons X ;
                GIDS : Gastrointestinal Dysfunction Score ; NP : nutrition parentérale ;
                SRI : syndrome de renutrition inappropriée.
              </p>
            </details>
          </div>
        );
      case "Produits disponibles":
        return (
          <div style={{ display: "grid", gap: "1rem" }}>
            <div>
              <h3 style={{ marginBottom: "0.35rem", color: "#173a78" }}>
                Produits de nutrition entérale disponibles
              </h3>
              <p style={{ margin: 0, color: "#5b6f90", lineHeight: 1.6 }}>
                Sélectionnez une poche pour afficher ses caractéristiques issues du
                livret de nutrition entérale AP-HM.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "0.7rem",
              }}
            >
              {enteralProducts.map((product) => {
                const selected = product.solute === selectedProduct?.solute;
                return (
                  <button
                    key={product.solute}
                    type="button"
                    onClick={() => setSelectedProductKey(product.solute)}
                    style={{
                      padding: "0.85rem",
                      borderRadius: 16,
                      border: selected
                        ? "1px solid rgba(255,122,0,0.5)"
                        : "1px solid rgba(13,71,161,0.1)",
                      background: selected
                        ? "linear-gradient(135deg, #fff8ef 0%, #ffecd8 100%)"
                        : "#fff",
                      color: selected ? "#a94f00" : "#173a78",
                      textAlign: "left",
                      fontWeight: 750,
                      lineHeight: 1.35,
                      cursor: "pointer",
                      boxShadow: selected ? "0 10px 24px rgba(255,122,0,0.09)" : "none",
                    }}
                  >
                    {product.solute}
                  </button>
                );
              })}
            </div>

            {selectedProduct && (
              <section
                style={{
                  padding: "1.1rem",
                  borderRadius: 22,
                  background: "linear-gradient(145deg, #f8fbff 0%, #edf5ff 100%)",
                  border: "1px solid rgba(13,71,161,0.12)",
                  boxShadow: "0 14px 34px rgba(13,71,161,0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "1rem",
                    flexWrap: "wrap",
                    marginBottom: "0.9rem",
                  }}
                >
                  <div>
                    <div style={{ color: "#173a78", fontSize: "1.08rem", fontWeight: 850 }}>
                      {selectedProduct.solute}
                    </div>
                    {selectedProduct.specificites && (
                      <div style={{ color: "#5b6f90", marginTop: "0.25rem" }}>
                        {selectedProduct.specificites}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      padding: "0.45rem 0.7rem",
                      borderRadius: 999,
                      background: "#fff",
                      color: "#0d47a1",
                      border: "1px solid rgba(13,71,161,0.12)",
                      fontWeight: 750,
                    }}
                  >
                    {selectedProduct.volume_ml} mL
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
                    gap: "0.7rem",
                  }}
                >
                  <MetricCard label="Énergie" value={`${selectedProduct.kcal} kcal`} />
                  <MetricCard label="Protéines" value={`${selectedProduct.proteines_g} g`} />
                  <MetricCard label="Lipides" value={`${selectedProduct.lipides_g ?? "N/D"} g`} />
                  <MetricCard label="Glucides" value={`${selectedProduct.glucides_g ?? "N/D"} g`} />
                  <MetricCard label="Fibres" value={`${selectedProduct.fibres_g ?? "N/D"} g`} />
                  <MetricCard label="TCM" value={`${selectedProduct.tcm_g ?? "N/D"} g`} />
                  <MetricCard label="Eau" value={`${selectedProduct.eau_ml ?? "N/D"} mL`} />
                  <MetricCard
                    label="Osmolarité"
                    value={`${selectedProduct.osmolarite_mosm_l ?? "N/D"} mOsm/L`}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "0.7rem 1.4rem",
                    flexWrap: "wrap",
                    marginTop: "0.9rem",
                    color: "#405579",
                    fontSize: "0.86rem",
                  }}
                >
                  <span>Référence : {selectedProduct.reference ?? "N/D"}</span>
                  <span>Code LPPR : {selectedProduct.code_lppr ?? "N/D"}</span>
                </div>
              </section>
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
