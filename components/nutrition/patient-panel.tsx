import type {
  NonNutritionalInputs,
  NutritionPhase,
  PatientDraft,
} from "@/types/nutrition";

type PatientPanelProps = {
  patient: PatientDraft;
  enteralContraindicationsCatalog: string[];
  phaseDefinitions: Record<NutritionPhase, string>;
  onPatientChange: <K extends keyof PatientDraft>(
    key: K,
    value: PatientDraft[K],
  ) => void;
  nonNutritionalInputs: NonNutritionalInputs;
  onNonNutritionalChange: <K extends keyof NonNutritionalInputs>(
    key: K,
    value: NonNutritionalInputs[K],
  ) => void;
};

export function PatientPanel({
  patient,
  enteralContraindicationsCatalog,
  phaseDefinitions,
  onPatientChange,
  nonNutritionalInputs,
  onNonNutritionalChange,
}: PatientPanelProps) {
  const hasLowPhosphorus =
    Number.isFinite(patient.phosphoremiaMmolL) && patient.phosphoremiaMmolL < 0.8;
  const hasSafetyAlert =
    patient.shockMultivisceral ||
    patient.majorInstability ||
    patient.highOrRisingCatecholamines ||
    patient.hypoperfusion ||
    patient.hyperlactatemia;

  const hasEnteralContraindication = patient.enteralContraindications.length > 0;
  const isEerSectionActive = patient.eer && patient.citrateAnticoagulation;

  const sectionStyle = {
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid rgba(13, 71, 161, 0.08)",
    display: "grid",
    gap: "0.8rem",
  } as const;

  const checkboxRowStyle = {
    display: "grid",
    gridTemplateColumns: "18px minmax(0, 1fr)",
    gap: "0.75rem",
    alignItems: "start",
    padding: "0.75rem 0.85rem",
    borderRadius: 16,
    border: "1px solid rgba(13,71,161,0.08)",
    background: "rgba(248,251,255,0.82)",
    color: "#173a78",
  } as const;

  function toggleContraindication(label: string, checked: boolean) {
    const nextValues = checked
      ? [...patient.enteralContraindications, label]
      : patient.enteralContraindications.filter((item) => item !== label);
    onPatientChange("enteralContraindications", nextValues);
    if (checked && patient.routePreference === "Enterale") {
      onPatientChange("routePreference", "Parenterale");
    }
  }

  return (
    <section
      style={{
        padding: "1.2rem",
        borderRadius: 24,
        background: "rgba(255,255,255,0.96)",
        border: "1px solid rgba(13, 71, 161, 0.1)",
        boxShadow: "0 18px 50px rgba(13, 71, 161, 0.06)",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "0.25rem", fontSize: "1.08rem" }}>
        Données patient
      </h2>
      <p style={{ margin: "0 0 1rem", color: "#6d7c95", fontSize: "0.88rem" }}>
        Saisie clinique initiale, sécurité et paramètres utiles à la proposition.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
        <label style={{ display: "grid", gap: "0.25rem" }}>
          <span style={{ color: "#173a78", fontSize: "0.85rem" }}>Taille (m)</span>
          <input
            type="number"
            step="0.01"
            value={patient.heightM}
            onChange={(event) => onPatientChange("heightM", Number(event.target.value))}
          />
        </label>
        <label style={{ display: "grid", gap: "0.25rem" }}>
          <span style={{ color: "#173a78", fontSize: "0.85rem" }}>Poids réel (kg)</span>
          <input
            type="number"
            step="0.5"
            value={patient.actualWeightKg}
            onChange={(event) =>
              onPatientChange("actualWeightKg", Number(event.target.value))
            }
          />
        </label>
        <label style={{ display: "grid", gap: "0.25rem" }}>
          <span
            style={{
              color: "#173a78",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
            }}
          >
            Phase clinique
            <details style={{ position: "relative" }}>
              <summary
                aria-label="Afficher la définition des phases cliniques"
                title="Définition des phases cliniques"
                style={{
                  cursor: "pointer",
                  listStyle: "none",
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  background: "#edf4ff",
                  border: "1px solid rgba(13,71,161,0.18)",
                  color: "#0d47a1",
                  fontWeight: 800,
                }}
              >
                ?
              </summary>
              <div
                style={{
                  position: "absolute",
                  zIndex: 20,
                  top: 28,
                  left: 0,
                  width: "min(520px, 78vw)",
                  padding: "1rem",
                  borderRadius: 16,
                  background: "#fff",
                  border: "1px solid rgba(13,71,161,0.14)",
                  boxShadow: "0 18px 50px rgba(13,71,161,0.16)",
                  color: "#405579",
                  lineHeight: 1.55,
                }}
              >
                <strong>État de choc / défaillance multiviscérale</strong>
                <p>{phaseDefinitions.aigue_defaillance}</p>
                <strong>Stabilisation</strong>
                <p>{phaseDefinitions.stabilisation}</p>
                <strong>Réhabilitation</strong>
                <p style={{ marginBottom: 0 }}>{phaseDefinitions.rehabilitation}</p>
              </div>
            </details>
          </span>
          <select
            value={patient.phase}
            onChange={(event) =>
              onPatientChange("phase", event.target.value as PatientDraft["phase"])
            }
          >
            <option value="aigue_defaillance">Phase aiguë / défaillance</option>
            <option value="stabilisation">Stabilisation</option>
            <option value="rehabilitation">Réhabilitation</option>
          </select>
        </label>
        <label style={{ display: "grid", gap: "0.25rem" }}>
          <span style={{ color: "#173a78", fontSize: "0.85rem" }}>
            Phosphorémie (mmol/L)
          </span>
          <input
            type="number"
            step="0.1"
            value={patient.phosphoremiaMmolL}
            onChange={(event) =>
              onPatientChange("phosphoremiaMmolL", Number(event.target.value))
            }
          />
        </label>
      </div>

      <div style={sectionStyle}>
        <div>
          <div style={{ fontWeight: 700, color: "#173a78", fontSize: "0.95rem" }}>
            Sécurité clinique
          </div>
          <div style={{ marginTop: "0.2rem", color: "#6d7c95", fontSize: "0.86rem" }}>
            Toute cause cochée correspond à une situation où l&apos;alimentation n&apos;est pas
            recommandée à ce stade.
          </div>
        </div>

        {hasSafetyAlert && (
          <div
            style={{
              borderRadius: 16,
              padding: "0.95rem 1rem",
              background: "linear-gradient(180deg, #fff5f1 0%, #ffe7de 100%)",
              border: "1px solid rgba(199, 68, 34, 0.18)",
              color: "#7c2d12",
            }}
          >
            <div style={{ fontWeight: 800, color: "#9a3412", marginBottom: "0.25rem" }}>
              Alimentation non recommandée
            </div>
            <div style={{ lineHeight: 1.55 }}>
              Une cause majeure de non-alimentation est présente. Réévaluation médicale
              nécessaire avant toute stratégie nutritionnelle.
            </div>
          </div>
        )}

        {hasLowPhosphorus && (
          <div
            style={{
              borderRadius: 16,
              padding: "0.95rem 1rem",
              background: "linear-gradient(180deg, #fff8f2 0%, #fff1e3 100%)",
              border: "1px solid rgba(255,122,0,0.16)",
              color: "#7a4a17",
            }}
          >
            <div style={{ fontWeight: 800, color: "#d66500", marginBottom: "0.25rem" }}>
              Phosphore bas
            </div>
            <div style={{ lineHeight: 1.55 }}>
              Si le phosphore est &lt; 0,8 mmol/L, une correction du phosphore est
              recommandée avant de débuter une alimentation.
            </div>
          </div>
        )}

        <label style={checkboxRowStyle}>
          <input
            type="checkbox"
            checked={patient.shockMultivisceral}
            onChange={(event) =>
              onPatientChange("shockMultivisceral", event.target.checked)
            }
          />
          <span>État de choc ou défaillance multiviscérale</span>
        </label>
        <label style={checkboxRowStyle}>
          <input
            type="checkbox"
            checked={patient.majorInstability}
            onChange={(event) => onPatientChange("majorInstability", event.target.checked)}
          />
          <span>Instabilité majeure</span>
        </label>
        <label style={checkboxRowStyle}>
          <input
            type="checkbox"
            checked={patient.highOrRisingCatecholamines}
            onChange={(event) =>
              onPatientChange("highOrRisingCatecholamines", event.target.checked)
            }
          />
          <span>Catécholamines élevées ou croissantes</span>
        </label>
        <label style={checkboxRowStyle}>
          <input
            type="checkbox"
            checked={patient.hypoperfusion}
            onChange={(event) => onPatientChange("hypoperfusion", event.target.checked)}
          />
          <span>Hypoperfusion</span>
        </label>
        <label style={checkboxRowStyle}>
          <input
            type="checkbox"
            checked={patient.hyperlactatemia}
            onChange={(event) => onPatientChange("hyperlactatemia", event.target.checked)}
          />
          <span>Hyperlactatémie</span>
        </label>
      </div>

      <div style={sectionStyle}>
        <div>
          <div style={{ fontWeight: 700, color: "#173a78", fontSize: "0.95rem" }}>
            Voie d&apos;administration
          </div>
          <div style={{ marginTop: "0.2rem", color: "#6d7c95", fontSize: "0.86rem" }}>
            La voie entérale doit être privilégiée au maximum quand elle est possible.
          </div>
        </div>

        {hasEnteralContraindication && (
          <div
            style={{
              borderRadius: 16,
              padding: "0.95rem 1rem",
              background: "linear-gradient(180deg, #fff8f2 0%, #fff1e3 100%)",
              border: "1px solid rgba(255,122,0,0.16)",
              color: "#7a4a17",
            }}
          >
            <div style={{ fontWeight: 800, color: "#d66500", marginBottom: "0.25rem" }}>
              Voie entérale contre-indiquée
            </div>
            <div style={{ lineHeight: 1.55 }}>
              Au moins une contre-indication à la voie entérale est cochée. Une stratégie
              parentérale ou mixte doit être discutée selon le contexte clinique.
            </div>
          </div>
        )}

        <div style={{ display: "grid", gap: "0.7rem" }}>
          {enteralContraindicationsCatalog.map((label) => {
            const checked = patient.enteralContraindications.includes(label);
            return (
              <label key={label} style={checkboxRowStyle}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => toggleContraindication(label, event.target.checked)}
                />
                <span>{label}</span>
              </label>
            );
          })}
        </div>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          <span style={{ color: "#173a78", fontSize: "0.85rem" }}>
            Voie d&apos;administration privilégiée
          </span>
          <select
            value={patient.routePreference}
            onChange={(event) =>
              (() => {
                const route = event.target.value as PatientDraft["routePreference"];
                onPatientChange("routePreference", route);
                if (route === "Parenterale") {
                  onPatientChange("alreadyReceivingEnteral", false);
                }
              })()
            }
          >
            <option value="Enterale">Entérale</option>
            <option value="Parenterale">Parentérale</option>
            <option value="Mixte">Mixte</option>
          </select>
        </label>

        {(patient.routePreference === "Enterale" || patient.routePreference === "Mixte") && (
          <fieldset
            style={{
              margin: 0,
              padding: "0.85rem",
              borderRadius: 16,
              border: "1px solid rgba(13,71,161,0.1)",
              background: "rgba(248,251,255,0.82)",
            }}
          >
            <legend style={{ padding: "0 0.35rem", color: "#173a78", fontWeight: 700 }}>
              Présentation de la prescription entérale
            </legend>
            <div style={{ display: "grid", gap: "0.6rem", marginTop: "0.35rem" }}>
              {[
                ["continuous_rate", "Débit continu en mL/h"],
                ["period_volumes", "Volumes à administrer par périodes"],
              ].map(([value, label]) => (
                <label key={value} style={{ display: "flex", gap: "0.45rem" }}>
                  <input
                    type="radio"
                    name="enteralAdministrationMode"
                    checked={patient.enteralAdministrationMode === value}
                    onChange={() =>
                      onPatientChange(
                        "enteralAdministrationMode",
                        value as PatientDraft["enteralAdministrationMode"],
                      )
                    }
                    style={{ width: "auto" }}
                  />
                  <span>{label}</span>
                </label>
              ))}
              <div style={{ color: "#5b6f90", fontSize: "0.82rem", lineHeight: 1.5 }}>
                En mode volumes, les poches sont réparties sur 12 h jusqu&apos;à deux
                poches, puis régulièrement sur 24 h (trois poches : 8 h par poche).
              </div>
            </div>
          </fieldset>
        )}

        {(patient.routePreference === "Enterale" || patient.routePreference === "Mixte") && (
          <fieldset
            style={{
              margin: 0,
              padding: "0.85rem",
              borderRadius: 16,
              border: "1px solid rgba(13,71,161,0.1)",
              background: "rgba(248,251,255,0.82)",
            }}
          >
            <legend style={{ padding: "0 0.35rem", color: "#173a78", fontWeight: 700 }}>
              Le patient reçoit-il déjà une nutrition entérale ?
            </legend>
            <div style={{ display: "flex", gap: "1.2rem", marginTop: "0.35rem" }}>
              {[false, true].map((value) => (
                <label key={String(value)} style={{ display: "flex", gap: "0.45rem" }}>
                  <input
                    type="radio"
                    name="alreadyReceivingEnteral"
                    checked={patient.alreadyReceivingEnteral === value}
                    onChange={() => onPatientChange("alreadyReceivingEnteral", value)}
                    style={{ width: "auto" }}
                  />
                  <span>{value ? "Oui" : "Non"}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </div>

      <div style={sectionStyle}>
        <div>
          <div style={{ fontWeight: 700, color: "#173a78", fontSize: "0.95rem" }}>
            EER et citrate
          </div>
          <div style={{ marginTop: "0.2rem", color: "#6d7c95", fontSize: "0.86rem" }}>
            Déclarer l&apos;épuration extrarénale puis préciser l&apos;anticoagulation citrate
            si elle est utilisée.
          </div>
        </div>

        <div style={{ display: "grid", gap: "0.7rem" }}>
          <label style={checkboxRowStyle}>
            <input
              type="checkbox"
              checked={patient.eer}
              onChange={(event) => onPatientChange("eer", event.target.checked)}
            />
            <span>Épuration extrarénale en cours</span>
          </label>
          <label
            style={{
              ...checkboxRowStyle,
              opacity: patient.eer ? 1 : 0.55,
            }}
          >
            <input
              type="checkbox"
              checked={patient.citrateAnticoagulation}
              disabled={!patient.eer}
              onChange={(event) =>
                onPatientChange("citrateAnticoagulation", event.target.checked)
              }
            />
            <span>Anticoagulation citrate</span>
          </label>
        </div>

        {isEerSectionActive && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.85rem",
              padding: "0.95rem",
              borderRadius: 18,
              background: "linear-gradient(180deg, #f8fbff 0%, #f2f7ff 100%)",
              border: "1px solid rgba(13,71,161,0.08)",
            }}
          >
            <label style={{ display: "grid", gap: "0.25rem" }}>
              <span style={{ color: "#173a78", fontSize: "0.85rem" }}>Débit sang (mL/min)</span>
              <input
                type="number"
                step="5"
                value={nonNutritionalInputs.bloodFlowMlMin}
                onChange={(event) =>
                  onNonNutritionalChange("bloodFlowMlMin", Number(event.target.value))
                }
              />
            </label>
            <label style={{ display: "grid", gap: "0.25rem" }}>
              <span style={{ color: "#173a78", fontSize: "0.85rem" }}>
                Dose de citrate (mmol/L de sang traité)
              </span>
              <input
                type="number"
                step="0.1"
                value={nonNutritionalInputs.citrateDoseMmolLBlood}
                onChange={(event) =>
                  onNonNutritionalChange(
                    "citrateDoseMmolLBlood",
                    Number(event.target.value),
                  )
                }
              />
            </label>
            <div
              style={{
                gridColumn: "1 / -1",
                color: "#5b6f90",
                fontSize: "0.83rem",
                lineHeight: 1.5,
              }}
            >
              Calcul RFE avec une fraction d&apos;élimination du citrate fixée à 50 %.
            </div>
          </div>
        )}
      </div>

      <div style={sectionStyle}>
        <div style={{ fontWeight: 700, color: "#173a78", fontSize: "0.95rem" }}>
          Apports non nutritionnels
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
          <label style={{ display: "grid", gap: "0.25rem" }}>
            <span style={{ color: "#173a78", fontSize: "0.85rem" }}>Propofol (mL/h)</span>
            <input
              type="number"
              step="1"
              value={nonNutritionalInputs.propofolRateMlH}
              onChange={(event) =>
                onNonNutritionalChange("propofolRateMlH", Number(event.target.value))
              }
            />
          </label>
          <label style={{ display: "grid", gap: "0.25rem" }}>
            <span style={{ color: "#173a78", fontSize: "0.85rem" }}>
              Concentration propofol (mg/mL)
            </span>
            <select
              value={nonNutritionalInputs.propofolConcentrationMgMl}
              onChange={(event) =>
                onNonNutritionalChange(
                  "propofolConcentrationMgMl",
                  Number(event.target.value),
                )
              }
            >
              <option value={10}>10 mg/mL</option>
              <option value={20}>20 mg/mL</option>
            </select>
          </label>
          <label style={{ display: "grid", gap: "0.25rem" }}>
            <span style={{ color: "#173a78", fontSize: "0.85rem" }}>Glucose</span>
            <select
              value={nonNutritionalInputs.glucoseSolution ?? ""}
              onChange={(event) =>
                onNonNutritionalChange(
                  "glucoseSolution",
                  event.target.value ? event.target.value : null,
                )
              }
            >
              <option value="">Aucun</option>
              <option value="G2.5">G2.5</option>
              <option value="G5">G5</option>
              <option value="G10">G10</option>
              <option value="G30">G30</option>
            </select>
          </label>
          <label style={{ display: "grid", gap: "0.25rem" }}>
            <span style={{ color: "#173a78", fontSize: "0.85rem" }}>Volume glucose (mL/j)</span>
            <input
              type="number"
              step="50"
              value={nonNutritionalInputs.glucoseVolumeMlDay}
              onChange={(event) =>
                onNonNutritionalChange("glucoseVolumeMlDay", Number(event.target.value))
              }
            />
          </label>
        </div>
      </div>
    </section>
  );
}
