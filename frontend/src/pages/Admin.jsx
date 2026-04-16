import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getClients, assignAdvisor } from "../services/clients.service";
import { getOrders, updateOrderStatus } from "../services/orders.service";
import {
  createProduct,
  getProducts,
  updateProduct,
} from "../services/products.service";
import AdminProductForm from "../components/AdminProductForm";
import AdminBulkUpload from "../components/AdminBulkUpload";

const EMPTY_PRODUCT_FORM = {
  name: "",
  sku: "",
  price: "",
  stock: "",
  category: "",
  active: true,
};

export default function Admin() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [assignInputs, setAssignInputs] = useState({});

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [ordersData, productsData, clientsData] = await Promise.all([
        getOrders(token),
        getProducts(token),
        getClients(token),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
      setClients(clientsData);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los datos de admin");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [token]);

  const advisorHints = useMemo(() => {
    const map = new Map();
    clients.forEach((client) => {
      if (!map.has(client.advisorId)) {
        map.set(client.advisorId, client.advisorName || client.advisorId);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [clients]);

  async function handleOrderStatus(orderId, status) {
    try {
      await updateOrderStatus(orderId, status, token);
      setMessage("Estado del pedido actualizado.");
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudo actualizar el estado");
    }
  }

  async function handleAssignAdvisor(clientId) {
    const advisorId = assignInputs[clientId];
    if (!advisorId) {
      setError("Ingresa un advisorId para asignar.");
      return;
    }

    setError("");
    setMessage("");
    try {
      await assignAdvisor(clientId, advisorId, token);
      setMessage("Asesor asignado.");
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudo asignar el asesor");
    }
  }

  if (loading) {
    return <div className="page-column">Cargando panel de admin...</div>;
  }

  return (
    <div className="page-column">
      <h1>Panel de Administracion</h1>
      {message ? <p className="success">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <section className="card wide-card" style={{ marginBottom: "20px" }}>
        <h2>Solicitudes de Acceso</h2>
        <p style={{ marginBottom: "12px", color: "#6b7280" }}>
          Gestiona las solicitudes de registro de nuevos clientes.
        </p>
        <Link
          to="/admin/access-requests"
          style={{
            display: "inline-block",
            background: "#f97316",
            color: "white",
            padding: "10px 20px",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "600",
            transition: "background 0.2s"
          }}
          onMouseEnter={(e) => e.target.style.background = "#ea580c"}
          onMouseLeave={(e) => e.target.style.background = "#f97316"}
        >
          Ver Solicitudes →
        </Link>
      </section>

      <section id="pedidos" className="card wide-card">
        <h2>Pedidos (gestion)</h2>
        {orders.map((order) => (
          <div key={order.id} className="row-line">
            <span>
              {order.id} | ${Number(order.total).toLocaleString()} |{" "}
              <span className={`status-badge status-${order.status}`}>{order.status}</span>
            </span>
            <div className="actions-inline">
              <button type="button" onClick={() => handleOrderStatus(order.id, "aprobado")}>
                Aprobar
              </button>
              <button type="button" onClick={() => handleOrderStatus(order.id, "denegado")}>
                Denegar
              </button>
            </div>
          </div>
        ))}
      </section>

      <section id="productos" className="card wide-card">
        <h2>Productos</h2>
        
        {/* New Product Form Component */}
        <AdminProductForm onProductAdded={() => loadData()} />

        {/* Bulk Upload Component */}
        <AdminBulkUpload onProductsAdded={() => loadData()} />

        {/* Products List */}
        <div style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb"
        }}>
          <h3 style={{ marginBottom: "15px", color: "#0f172a" }}>Productos Existentes ({products.length})</h3>
          {products.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No hay productos</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.9rem"
              }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: "10px", textAlign: "left" }}>Nombre</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>SKU</th>
                    <th style={{ padding: "10px", textAlign: "right" }}>Precio</th>
                    <th style={{ padding: "10px", textAlign: "right" }}>Stock</th>
                    <th style={{ padding: "10px", textAlign: "left" }}>Categoría</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "10px" }}>{product.name}</td>
                      <td style={{ padding: "10px" }}>{product.sku}</td>
                      <td style={{ padding: "10px", textAlign: "right" }}>${Number(product.price).toFixed(2)}</td>
                      <td style={{ padding: "10px", textAlign: "right" }}>{product.stock}</td>
                      <td style={{ padding: "10px" }}>{product.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section id="clientes" className="card wide-card">
        <h2>Clientes</h2>
        {advisorHints.length > 0 ? (
          <p>
            Asesores actuales:{" "}
            {advisorHints.map((a) => `${a.label} (${a.id})`).join(" | ")}
          </p>
        ) : null}
        {clients.map((client) => (
          <div key={client.id} className="row-line">
            <span>
              {client.businessName} | {client.status} | {client.advisorName}
            </span>
            <div className="actions-inline">
              <input
                placeholder="Nuevo advisorId"
                value={assignInputs[client.id] || ""}
                onChange={(e) =>
                  setAssignInputs((state) => ({
                    ...state,
                    [client.id]: e.target.value,
                  }))
                }
              />
              <button type="button" onClick={() => handleAssignAdvisor(client.id)}>
                Asignar asesor
              </button>
              <button type="button" disabled title="Endpoint no disponible">
                Eliminar cliente
              </button>
            </div>
          </div>
        ))}
      </section>

      <section id="promociones" className="card wide-card">
        <h2>Promociones</h2>
        <p>Seccion base lista para futuras integraciones de promociones.</p>
      </section>
    </div>
  );
}

