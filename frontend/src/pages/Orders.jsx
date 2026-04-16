import { useEffect, useState } from "react";
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

  return (
    <div className="page-column">
      <h1>Pedidos</h1>

      {successMessage ? <p className="success">{successMessage}</p> : null}
      {loading ? <p>Cargando pedidos...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {!loading && !error ? (
        <div className="card">
          {orders.length === 0 ? <p>No hay pedidos aun.</p> : null}
          {orders.map((order) => (
            <div key={order.id} className="order-row">
              <p>
                <strong>ID:</strong> {order.id}
              </p>
              <p>
                <strong>Total:</strong> ${Number(order.total).toLocaleString()}
              </p>
              <p>
                <strong>Estado:</strong>{" "}
                <span className={`status-badge status-${order.status}`}>{order.status}</span>
              </p>
              <p>
                <strong>Fecha:</strong> {new Date(order.createdAt).toLocaleString()}
              </p>
              <hr />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
