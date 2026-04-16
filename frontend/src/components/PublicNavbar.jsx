import { Link } from "react-router-dom";

export default function PublicNavbar({ onOpenLogin, onOpenRegister }) {
  return (
    <nav style={{
      background: "white",
      borderBottom: "1px solid #e5e7eb",
      padding: "16px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      height: "56px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
    }}>
      {/* Logo */}
      <Link
        to="/"
        style={{
          fontSize: "1.3rem",
          fontWeight: "700",
          color: "#f97316",
          textDecoration: "none"
        }}
      >
        Andimat
      </Link>

      {/* Right actions */}
      <div style={{
        display: "flex",
        gap: "16px",
        alignItems: "center"
      }}>
        <button
          onClick={onOpenLogin}
          style={{
            color: "#0f172a",
            background: "transparent",
            border: "none",
            fontSize: "0.95rem",
            fontWeight: "500",
            padding: "8px 16px",
            borderRadius: "6px",
            transition: "all 0.3s",
            cursor: "pointer"
          }}
          onMouseEnter={(e) => {
            e.style.background = "#f0f0f0";
          }}
          onMouseLeave={(e) => {
            e.style.background = "transparent";
          }}
        >
          Ingresar
        </button>
        <button
          onClick={onOpenRegister}
          style={{
            background: "#f97316",
            color: "white",
            border: "none",
            padding: "8px 20px",
            fontSize: "0.95rem",
            fontWeight: "600",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => {
            e.style.background = "#ea580c";
          }}
          onMouseLeave={(e) => {
            e.style.background = "#f97316";
          }}
        >
          Solicitar acceso
        </button>
      </div>
    </nav>
  );
}
