import Image from "next/image";

export function Hero() {
  return (
    <section
      className="hero-grid"
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "220px minmax(0, 1fr) 136px",
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
        style={{
          position: "relative",
          borderRadius: 22,
          padding: "0.55rem",
          background: "rgba(255,255,255,0.72)",
          border: "1px solid rgba(13, 71, 161, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          src="/branding/logo-reanimations.png"
          alt="Logo des réanimations"
          width={360}
          height={216}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: 138,
            objectFit: "contain",
          }}
          priority
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
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          borderRadius: 24,
          overflow: "hidden",
          border: "1px solid rgba(255, 122, 0, 0.16)",
          background: "rgba(255,255,255,0.78)",
          alignSelf: "stretch",
          minHeight: 136,
        }}
      >
        <Image
          src="/branding/conseils-benedicte.png"
          alt="Vignette conseils diététiques"
          width={512}
          height={512}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
          }}
        />
      </div>
    </section>
  );
}
