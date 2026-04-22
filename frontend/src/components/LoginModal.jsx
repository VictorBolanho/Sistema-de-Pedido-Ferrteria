import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDefaultRouteByRole } from "../utils/rbac";
import { requestPasswordReset, resetPassword } from "../services/auth.service";

export default function LoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recoveryInfo, setRecoveryInfo] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function resetFeedback() {
    setError("");
    setSuccess("");
  }

  function resetFormState() {
    setPassword("");
    setResetCode("");
    setNewPassword("");
    setRecoveryInfo(null);
    resetFeedback();
  }

  async function handleLogin(event) {
    event.preventDefault();
    resetFeedback();
    setSubmitting(true);

    try {
      const user = await login(email, password);
      setEmail("");
      resetFormState();
      onClose();
      navigate(getDefaultRouteByRole(user.role), { replace: true });
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesion");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRequestReset(event) {
    event.preventDefault();
    resetFeedback();
    setSubmitting(true);

    try {
      const response = await requestPasswordReset(email);
      setRecoveryInfo(response.recoveryPreview || null);
      setSuccess(
        response.recoveryPreview
          ? `Codigo generado. Usa el codigo ${response.recoveryPreview.resetCode} antes de ${new Date(
              response.recoveryPreview.expiresAt
            ).toLocaleTimeString()}.`
          : response.message
      );
      setMode("reset");
    } catch (err) {
      setError(err.message || "No se pudo generar el codigo");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    resetFeedback();
    setSubmitting(true);

    try {
      const response = await resetPassword(email, resetCode, newPassword);
      setSuccess(response.message || "Contrasena actualizada.");
      setPassword("");
      setResetCode("");
      setNewPassword("");
      setRecoveryInfo(null);
      setMode("login");
    } catch (err) {
      setError(err.message || "No se pudo restablecer la contrasena");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setMode("login");
    resetFormState();
    onClose();
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
        background: "rgba(15, 23, 42, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "22px",
          padding: "34px",
          maxWidth: "430px",
          width: "100%",
          boxShadow: "0 28px 70px rgba(15,23,42,0.25)",
          position: "relative",
        }}
      >
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
            color: "#64748b",
          }}
        >
          x
        </button>

        <h2 style={{ fontSize: "1.7rem", fontWeight: "800", color: "#0f172a", margin: "0 0 8px 0", paddingRight: "28px" }}>
          {mode === "login" ? "Ingresar al portal" : mode === "request-reset" ? "Recuperar acceso" : "Restablecer contrasena"}
        </h2>
        <p style={{ color: "#64748b", marginTop: 0, lineHeight: 1.6 }}>
          {mode === "login"
            ? "Ingresa con tu correo y contrasena para consultar pedidos, clientes o gestion administrativa."
            : mode === "request-reset"
            ? "Te generaremos un codigo temporal de recuperacion."
            : "Usa el codigo temporal y define una nueva contrasena segura."}
        </p>

        {mode === "login" ? (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <label htmlFor="login-email" style={{ fontWeight: "600", color: "#334155" }}>
              Correo
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={{ width: "100%", padding: "12px 14px", border: "1px solid #d0d5dd", borderRadius: "10px", boxSizing: "border-box" }}
            />

            <label htmlFor="login-password" style={{ fontWeight: "600", color: "#334155" }}>
              Contrasena
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={{ width: "100%", padding: "12px 14px", border: "1px solid #d0d5dd", borderRadius: "10px", boxSizing: "border-box" }}
            />

            {error ? <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 12px", borderRadius: "10px" }}>{error}</div> : null}
            {success ? <div style={{ background: "#dcfce7", color: "#166534", padding: "10px 12px", borderRadius: "10px" }}>{success}</div> : null}

            <button
              type="submit"
              disabled={submitting}
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                color: "white",
                border: "none",
                padding: "12px 16px",
                fontWeight: "700",
                borderRadius: "12px",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Ingresando..." : "Ingresar"}
            </button>

            <button
              type="button"
              onClick={() => {
                resetFeedback();
                setMode("request-reset");
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#ea580c",
                fontWeight: "700",
                cursor: "pointer",
                marginTop: "2px",
              }}
            >
              Olvide mi contrasena
            </button>
          </form>
        ) : null}

        {mode === "request-reset" ? (
          <form onSubmit={handleRequestReset} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <label htmlFor="reset-email" style={{ fontWeight: "600", color: "#334155" }}>
              Correo de la cuenta
            </label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={{ width: "100%", padding: "12px 14px", border: "1px solid #d0d5dd", borderRadius: "10px", boxSizing: "border-box" }}
            />

            {error ? <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 12px", borderRadius: "10px" }}>{error}</div> : null}
            {success ? <div style={{ background: "#dcfce7", color: "#166534", padding: "10px 12px", borderRadius: "10px" }}>{success}</div> : null}

            <button
              type="submit"
              disabled={submitting}
              style={{
                background: "#0f172a",
                color: "white",
                border: "none",
                padding: "12px 16px",
                fontWeight: "700",
                borderRadius: "12px",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Generando..." : "Generar codigo"}
            </button>

            <button
              type="button"
              onClick={() => {
                resetFeedback();
                setMode("login");
              }}
              style={{ background: "transparent", border: "none", color: "#475569", fontWeight: "700", cursor: "pointer" }}
            >
              Volver a ingreso
            </button>
          </form>
        ) : null}

        {mode === "reset" ? (
          <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <label htmlFor="reset-code" style={{ fontWeight: "600", color: "#334155" }}>
              Codigo temporal
            </label>
            <input
              id="reset-code"
              value={resetCode}
              onChange={(event) => setResetCode(event.target.value)}
              required
              style={{ width: "100%", padding: "12px 14px", border: "1px solid #d0d5dd", borderRadius: "10px", boxSizing: "border-box" }}
            />

            <label htmlFor="new-password" style={{ fontWeight: "600", color: "#334155" }}>
              Nueva contrasena
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              style={{ width: "100%", padding: "12px 14px", border: "1px solid #d0d5dd", borderRadius: "10px", boxSizing: "border-box" }}
            />

            {recoveryInfo ? (
              <div style={{ background: "#fff7ed", color: "#9a3412", padding: "10px 12px", borderRadius: "10px" }}>
                Codigo activo para {recoveryInfo.email}: <strong>{recoveryInfo.resetCode}</strong>
              </div>
            ) : null}
            {error ? <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 12px", borderRadius: "10px" }}>{error}</div> : null}
            {success ? <div style={{ background: "#dcfce7", color: "#166534", padding: "10px 12px", borderRadius: "10px" }}>{success}</div> : null}

            <button
              type="submit"
              disabled={submitting}
              style={{
                background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                color: "white",
                border: "none",
                padding: "12px 16px",
                fontWeight: "700",
                borderRadius: "12px",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Actualizando..." : "Actualizar contrasena"}
            </button>

            <button
              type="button"
              onClick={() => {
                resetFeedback();
                setMode("login");
              }}
              style={{ background: "transparent", border: "none", color: "#475569", fontWeight: "700", cursor: "pointer" }}
            >
              Volver a ingreso
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
