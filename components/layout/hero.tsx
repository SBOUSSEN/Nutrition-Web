import Image from "next/image";

export function Hero() {
  return (
    <section
      className="hero-grid"
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "minmax(340px, 420px) minmax(0, 1fr)",
        gap: "1rem",
        padding: "1.1rem",
        borderRadius: "28px",
        background:
          "linear-gradient(135deg, rgba(235,245,255,0.98) 0%, rgba(255,250,245,0.98) 55%, rgba(244,249,255,0.98) 100%)",
        border: "1px solid rgba(13, 71, 161, 0.08)",
        boxShadow: "0 24px 70px rgba(13, 71, 161, 0.08)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top left, rgba(13,71,161,0.08) 0, transparent 32%), radial-gradient(circle at right center, rgba(255,122,0,0.08) 0, transparent 24%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="hero-logo-panel"
        style={{
          position: "relative",
          borderRadius: 22,
          padding: "0.75rem 0.85rem 0.9rem",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(239,246,255,0.88) 58%, rgba(255,246,236,0.9) 100%)",
          border: "1px solid rgba(13, 71, 161, 0.12)",
          boxShadow: "0 14px 34px rgba(13, 71, 161, 0.09)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "center",
          overflow: "hidden",
        }}
      >
        <Image
          src="/branding/logo-reanimations-aphm-v2.png"
          alt="Logo Réanimations AP-HM"
          width={2172}
          height={724}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: 176,
            objectFit: "contain",
            filter: "drop-shadow(0 6px 10px rgba(13, 71, 161, 0.08))",
          }}
          priority
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "12%",
            right: "12%",
            bottom: 0,
            height: 4,
            borderRadius: "999px 999px 0 0",
            background: "linear-gradient(90deg, #0d47a1 0%, #0d47a1 48%, #ff7a00 52%, #ff7a00 100%)",
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.3rem 0.7rem",
            borderRadius: 999,
            background: "rgba(13, 71, 161, 0.08)",
            color: "#0d47a1",
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Nutrition en réanimation
        </div>

        <h1
          style={{
            margin: "0.65rem 0 0",
            color: "#0d47a1",
            fontSize: "clamp(1.7rem, 3.3vw, 2.5rem)",
            lineHeight: 1.02,
            fontFamily: '"Iowan Old Style", "Palatino Linotype", serif',
            maxWidth: 760,
          }}
        >
          Aide à la prescription nutritionnelle
        </h1>

        <p
          style={{
            margin: "0.4rem 0 0",
            color: "#173a78",
            fontWeight: 700,
            fontSize: "1rem",
          }}
        >
          Calcul des cibles, intégration des calories non nutritionnelles et
          proposition de stratégie sans dépassement calorique.
        </p>

        <p
          style={{
            margin: "0.75rem 0 0",
            color: "#23406f",
            fontSize: "0.9rem",
            lineHeight: 1.55,
            maxWidth: 760,
          }}
        >
          Commencer par la saisie des données patient et des éléments de sécurité,
          puis accéder à l&apos;espace d&apos;analyse détaillée et de proposition.
        </p>

        <p
          style={{
            margin: "0.65rem 0 0",
            color: "#5e6f88",
            fontSize: "0.88rem",
            lineHeight: 1.55,
            maxWidth: 760,
          }}
        >
          Cette application n&apos;a pas vocation à se substituer aux diététiciens.
          Un conseil diététique personnalisé reste toujours préférable.
        </p>

        <p
          style={{
            margin: "0.75rem 0 0",
            color: "#d66500",
            fontWeight: 700,
            fontSize: "0.9rem",
          }}
        >
          Outil d&apos;aide à la décision. Validation médicale obligatoire.
        </p>

        <div
          style={{
            marginTop: "0.7rem",
            display: "inline-flex",
            alignItems: "center",
            padding: "0.45rem 0.75rem",
            borderRadius: 12,
            background: "rgba(255,255,255,0.72)",
            borderLeft: "3px solid #ff7a00",
            color: "#173a78",
            fontSize: "0.84rem",
            fontWeight: 700,
          }}
        >
          Concepteurs : Bénédicte Grigoresco - Salah Boussen
        </div>

        <div
          style={{
            marginTop: "0.75rem",
            display: "flex",
            gap: "0.55rem",
            flexWrap: "wrap",
          }}
        >
          <a
            href="/rfe/Version-longue.pdf"
            download
            style={{
              padding: "0.52rem 0.75rem",
              borderRadius: 12,
              background: "#0d47a1",
              color: "#fff",
              fontSize: "0.82rem",
              fontWeight: 700,
            }}
          >
            Télécharger les RFE - version longue
          </a>
          <a
            href="/rfe/Figures-RFE-Nutrition.pdf"
            download
            style={{
              padding: "0.52rem 0.75rem",
              borderRadius: 12,
              background: "#fff",
              border: "1px solid rgba(13,71,161,0.18)",
              color: "#0d47a1",
              fontSize: "0.82rem",
              fontWeight: 700,
            }}
          >
            Télécharger les RFE - version courte
          </a>
        </div>
      </div>

    </section>
  );
}
