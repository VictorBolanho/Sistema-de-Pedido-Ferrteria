import { Link } from "react-router-dom";

export default function PublicNavbar({ onOpenLogin, onOpenRegister }) {
  return (
    <nav
      style={{
        background: "rgba(255,255,255,0.86)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(229,231,235,0.9)",
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "64px",
        boxShadow: "0 6px 24px rgba(15,23,42,0.05)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <Link
        to="/"
        style={{
          fontSize: "1.35rem",
          fontWeight: "800",
          color: "#ea580c",
          textDecoration: "none",
          letterSpacing: "0.02em",
        }}
      >
        Andimat
      </Link>

      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <button
          onClick={onOpenLogin}
          style={{
            background: "white",
            color: "#0f172a",
            border: "1px solid #e2e8f0",
            padding: "8px 18px",
            fontSize: "0.95rem",
            fontWeight: "600",
            borderRadius: "999px",
            cursor: "pointer",
          }}
        >
          Ingresar
        </button>
        <button
          onClick={onOpenRegister}
          style={{
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            color: "white",
            border: "none",
            padding: "8px 20px",
            fontSize: "0.95rem",
            fontWeight: "700",
            borderRadius: "999px",
            cursor: "pointer",
            boxShadow: "0 10px 24px rgba(249,115,22,0.28)",
          }}
        >
          Registrarse
        </button>
      </div>
    </nav>
  );
}
