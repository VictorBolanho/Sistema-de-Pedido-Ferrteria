import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOrders } from "../services/orders.service";

export default function Orders() {
  const location = useLocation();
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const successMessage = location.state?.successMessage || "";

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      setError("");
      try {
        const data = await getOrders(token);
        setOrders(data);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los pedidos");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [token]);

  const totals = useMemo(
    () => ({
      totalOrders: orders.length,
      approved: orders.filter((order) => order.status === "aprobado").length,
      pending: orders.filter((order) => order.status === "pendiente").length,
      denied: orders.filter((order) => order.status === "denegado").length,
    }),
    [orders]
  );

  return (
    <div className="page-column">
      <div className="panel-card" style={{ maxWidth: "1200px", margin: "0 auto", borderRadius: "28px" }}>
        <div className="panel-header">
          <div>
            <h1 style={{ margin: 0 }}>Historial de pedidos</h1>
            <p className="panel-subtitle">
              Consulta cada solicitud enviada, su fecha y el estado actual del proceso.
            </p>
          </div>
        </div>

        {successMessage ? <p className="success">{successMessage}</p> : null}
        {loading ? <p>Cargando pedidos...</p> : null}
        {error ? <p className="error">{error}</p> : null}

        {!loading && !error ? (
          <>
            <div className="dashboard-grid" style={{ marginBottom: "20px" }}>
              <div className="metric-card">
                <strong>{totals.totalOrders}</strong>
                <span>Pedidos registrados</span>
              </div>
              <div className="metric-card">
                <strong>{totals.pending}</strong>
                <span>Pendientes</span>
              </div>
              <div className="metric-card">
                <strong>{totals.approved}</strong>
                <span>Aprobados</span>
              </div>
              <div className="metric-card">
                <strong>{totals.denied}</strong>
                <span>Denegados</span>
              </div>
            </div>

            {orders.length === 0 ? (
              <p>No hay pedidos aun.</p>
            ) : (
              <div className="mini-list">
                {orders.map((order) => (
                  <div key={order.id} className="panel-card" style={{ borderRadius: "22px", boxShadow: "none" }}>
                    <div className="panel-header">
                      <div>
                        <h2 style={{ fontSize: "1.1rem" }}>Pedido {order.id}</h2>
                        <p className="panel-subtitle">
                          Registrado el {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className={`status-badge status-${order.status}`}>{order.status}</span>
                    </div>
                    <div className="sales-grid">
                      <div>
                        <strong style={{ display: "block", marginBottom: "6px" }}>Total</strong>
                        <span>${Number(order.total).toLocaleString("es-CO")}</span>
                      </div>
                      <div>
                        <strong style={{ display: "block", marginBottom: "6px" }}>Observaciones</strong>
                        <span>{order.observations || "Sin observaciones registradas"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
