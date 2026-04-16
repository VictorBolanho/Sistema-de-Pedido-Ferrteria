import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDefaultRouteByRole } from "../utils/rbac";

export default function LoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const user = await login(email, password);
      // Reset form
      setEmail("");
      setPassword("");
      // Close modal and redirect
      onClose();
      navigate(getDefaultRouteByRole(user.role), { replace: true });
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  }

  function handleOverlayClick(event) {
    // Close only if clicking the overlay itself, not the modal
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
      }}
      onClick={handleOverlayClick}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "40px",
          maxWidth: "400px",
          width: "90%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          position: "relative"
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
            color: "#6b7280",
            transition: "color 0.2s"
          }}
          onMouseEnter={(e) => e.target.style.color = "#000"}
          onMouseLeave={(e) => e.target.style.color = "#6b7280"}
        >
          ✕
        </button>

        {/* Title */}
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "#0f172a",
            marginBottom: "24px",
            paddingRight: "30px"
          }}
        >
          Iniciar sesión
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Email Input */}
          <div>
            <label
              htmlFor="login-email"
              style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "6px"
              }}
            >
              Correo
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d0d5dd",
                borderRadius: "6px",
                fontSize: "0.95rem",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#f97316"}
              onBlur={(e) => e.target.style.borderColor = "#d0d5dd"}
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="login-password"
              style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "6px"
              }}
            >
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d0d5dd",
                borderRadius: "6px",
                fontSize: "0.95rem",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#f97316"}
              onBlur={(e) => e.target.style.borderColor = "#d0d5dd"}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: "#fee2e2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                padding: "10px 12px",
                borderRadius: "6px",
                fontSize: "0.9rem"
              }}
            >
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: "#f97316",
              color: "white",
              border: "none",
              padding: "10px 16px",
              fontSize: "0.95rem",
              fontWeight: "600",
              borderRadius: "6px",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
              transition: "all 0.2s",
              marginTop: "8px"
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.target.style.background = "#ea580c";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#f97316";
            }}
          >
            {submitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
