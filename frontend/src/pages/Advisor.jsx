import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getClients } from "../services/clients.service";
import { getCommissions } from "../services/commissions.service";
import { getOrders } from "../services/orders.service";

export default function Advisor() {
  const { token } = useAuth();
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [clientsData, ordersData, commissionsData] = await Promise.all([
          getClients(token),
          getOrders(token),
          getCommissions(token),
        ]);
        setClients(clientsData);
        setOrders(ordersData);
        setCommissions(commissionsData);
      } catch (err) {
        setError(err.message || "No se pudo cargar el panel de asesor");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [token]);

  if (loading) {
    return <div className="page-column">Cargando panel de asesor...</div>;
  }

  return (
    <div className="page-column">
      <h1>Panel de Asesor</h1>
      {error ? <p className="error">{error}</p> : null}

      <section id="clientes" className="card wide-card">
        <h2>Mis Clientes</h2>
        {clients.length === 0 ? <p>No hay clientes asignados.</p> : null}
        {clients.map((client) => (
          <p key={client.id}>
            {client.businessName} | Estado: {client.status}
          </p>
        ))}
      </section>

      <section id="pedidos" className="card wide-card">
        <h2>Pedidos de mis clientes</h2>
        {orders.length === 0 ? <p>No hay pedidos.</p> : null}
        {orders.map((order) => (
          <p key={order.id}>
            {order.id} | ${Number(order.total).toLocaleString()} |{" "}
            <span className={`status-badge status-${order.status}`}>{order.status}</span>
          </p>
        ))}
      </section>

      <section id="comisiones" className="card wide-card">
        <h2>Comisiones</h2>
        {commissions.length === 0 ? <p>No hay comisiones registradas.</p> : null}
        {commissions.map((commission) => (
          <p key={commission.id}>
            Pedido {commission.orderId} | {commission.percentage}% | $
            {Number(commission.value).toLocaleString()}
          </p>
        ))}
      </section>
    </div>
  );
}

