import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { get, patch } from "../services/api";

export default function AdminAccessRequests() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all"); // pending, approved, rejected, all
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNotes, setRejectNotes] = useState("");

  async function loadRequests() {
    setLoading(true);
    setError("");
    try {
      const query = filter !== "all" ? `?status=${encodeURIComponent(filter)}` : "";
      const data = await get(`/access-requests${query}`, token);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[ADMIN-REQUESTS] Error:", err);
      setError(err.message || "No se pudieron cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadRequests();
    }
  }, [token, filter]);

  async function handleApprove(requestId) {
    try {
      setError("");
      setMessage("");
      console.log("[ADMIN-REQUESTS] Approving request:", requestId);

      await patch(`/access-requests/${requestId}/approve`, undefined, token);
      setMessage("Solicitud aprobada. Cliente creado exitosamente.");
      await loadRequests();
    } catch (err) {
      console.error("[ADMIN-REQUESTS] Approve error:", err);
      setError(err.message || "No se pudo aprobar la solicitud");
    }
  }

  async function handleReject(requestId) {
    try {
      setError("");
      setMessage("");
      console.log("[ADMIN-REQUESTS] Rejecting request:", requestId, "Notes:", rejectNotes);

      await patch(
        `/access-requests/${requestId}/reject`,
        { admin_notes: rejectNotes },
        token
      );

      setMessage("Solicitud rechazada.");
      setRejectingId(null);
      setRejectNotes("");
      await loadRequests();
    } catch (err) {
      console.error("[ADMIN-REQUESTS] Reject error:", err);
      setError(err.message || "No se pudo rechazar la solicitud");
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusBadgeStyle(status) {
    const baseStyle = {
      display: "inline-block",
      padding: "4px 12px",
      borderRadius: "16px",
      fontSize: "0.85rem",
      fontWeight: "600",
    };

    switch (status) {
      case "pending":
        return { ...baseStyle, background: "#fef3c7", color: "#92400e" };
      case "approved":
        return { ...baseStyle, background: "#dcfce7", color: "#166534" };
      case "rejected":
        return { ...baseStyle, background: "#fee2e2", color: "#991b1b" };
      default:
        return baseStyle;
    }
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <p style={{ fontSize: "1.1rem", color: "#6b7280" }}>Cargando solicitudes...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "24px", color: "#0f172a" }}>Solicitudes de Acceso</h1>

      {message && (
        <div
          style={{
            background: "#dcfce7",
            border: "1px solid #bbf7d0",
            color: "#166534",
            padding: "12px 16px",
            borderRadius: "6px",
            marginBottom: "16px",
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "12px 16px",
            borderRadius: "6px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      {/* Filter Buttons */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {["all", "pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
              background:
                filter === status
                  ? "#f97316"
                  : "#e5e7eb",
              color: filter === status ? "white" : "#374151",
            }}
            onMouseEnter={(e) => {
              if (filter !== status) {
                e.target.style.background = "#d1d5db";
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== status) {
                e.target.style.background = "#e5e7eb";
              }
            }}
          >
            {status === "all"
              ? "Todas"
              : status === "pending"
              ? "Pendientes"
              : status === "approved"
              ? "Aprobadas"
              : "Rechazadas"}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      {requests.length === 0 ? (
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          No hay solicitudes para mostrar
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "white",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }}>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Empresa
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Contacto
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Teléfono
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Estado
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Fecha
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request, index) => (
                <tr
                  key={request.id}
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    background: index % 2 === 0 ? "white" : "#f9fafb",
                  }}
                >
                  <td
                    style={{
                      padding: "12px",
                      fontSize: "0.9rem",
                      color: "#0f172a",
                      fontWeight: "500",
                    }}
                  >
                    {request.company_name}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      fontSize: "0.9rem",
                      color: "#374151",
                    }}
                  >
                    {request.contact_name}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      fontSize: "0.85rem",
                      color: "#6b7280",
                    }}
                  >
                    {request.email}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      fontSize: "0.9rem",
                      color: "#374151",
                    }}
                  >
                    {request.phone}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div style={getStatusBadgeStyle(request.status)}>
                      {request.status === "pending"
                        ? "Pendiente"
                        : request.status === "approved"
                        ? "Aprobado"
                        : "Rechazado"}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      fontSize: "0.85rem",
                      color: "#6b7280",
                    }}
                  >
                    {formatDate(request.created_at)}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      display: "flex",
                      gap: "8px",
                      justifyContent: "center",
                    }}
                  >
                    {request.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(request.id)}
                          style={{
                            background: "#10b981",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => (e.target.style.background = "#059669")}
                          onMouseLeave={(e) => (e.target.style.background = "#10b981")}
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => setRejectingId(request.id)}
                          style={{
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => (e.target.style.background = "#dc2626")}
                          onMouseLeave={(e) => (e.target.style.background = "#ef4444")}
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
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
            zIndex: 1000,
          }}
          onClick={() => {
            setRejectingId(null);
            setRejectNotes("");
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              padding: "24px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "16px", color: "#0f172a" }}>Rechazar Solicitud</h3>
            <textarea
              placeholder="Notas del rechazo (opcional)"
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              rows="4"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d0d5dd",
                borderRadius: "6px",
                fontSize: "0.9rem",
                fontFamily: "inherit",
                marginBottom: "16px",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setRejectingId(null);
                  setRejectNotes("");
                }}
                style={{
                  background: "#e5e7eb",
                  color: "#374151",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#d1d5db")}
                onMouseLeave={(e) => (e.target.style.background = "#e5e7eb")}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleReject(rejectingId)}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#dc2626")}
                onMouseLeave={(e) => (e.target.style.background = "#ef4444")}
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
