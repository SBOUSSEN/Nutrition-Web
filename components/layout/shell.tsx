type ShellProps = {
  hero: React.ReactNode;
  sidebar?: React.ReactNode;
  content: React.ReactNode;
};

export function Shell({ hero, sidebar, content }: ShellProps) {
  return (
    <main
      style={{
        width: "min(1440px, calc(100vw - 32px))",
        margin: "0 auto",
        padding: "16px 0 32px",
      }}
    >
      {hero}
      {sidebar ? (
        <div
          className="app-shell-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "320px minmax(0, 1fr)",
            gap: "24px",
            marginTop: "16px",
          }}
        >
          <aside style={{ display: "grid", gap: "16px", alignSelf: "start" }}>
            {sidebar}
          </aside>
          <section>{content}</section>
        </div>
      ) : (
        <section style={{ marginTop: "16px" }}>{content}</section>
      )}
    </main>
  );
}
