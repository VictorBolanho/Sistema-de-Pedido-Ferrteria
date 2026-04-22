import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  assignAdvisor,
  createAdvisor,
  createClient,
  deleteAdvisor,
  getAdvisors,
  getClients,
  updateAdvisorStatus,
  updateClientStatus,
} from "../services/clients.service";
import { getOrders, getOrderById, updateOrderStatus } from "../services/orders.service";
import { getProducts } from "../services/products.service";
import AdminProductForm from "../components/AdminProductForm";
import AdminBulkUpload from "../components/AdminBulkUpload";
import AdminAccessRequests from "./AdminAccessRequests";

const DEFAULT_PASSWORD = "admin123";

const SECTIONS = {
  DASHBOARD: "dashboard",
  ORDERS: "orders",
  CLIENTS: "clients",
  PRODUCTS: "products",
  ADVISORS: "advisors",
  ACCESS_REQUESTS: "accessRequests",
};

export default function Admin({ initialSection = SECTIONS.DASHBOARD }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(initialSection);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [assignInputs, setAssignInputs] = useState({});
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [orderDetailError, setOrderDetailError] = useState("");
  const [creatingAdvisor, setCreatingAdvisor] = useState(false);
  const [processingAdvisorId, setProcessingAdvisorId] = useState(null);
  const [processingClientId, setProcessingClientId] = useState(null);
  const [advisorForm, setAdvisorForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: DEFAULT_PASSWORD,
  });
  const [clientForm, setClientForm] = useState({
    businessName: "",
    taxId: "",
    contactName: "",
    email: "",
    phone: "",
    advisorId: "",
    status: "pendiente",
    password: DEFAULT_PASSWORD,
  });

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [ordersData, productsData, clientsData, advisorsData] = await Promise.all([
        getOrders(token),
        getProducts(token),
        getClients(token),
        getAdvisors(token),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
      setClients(clientsData);
      setAdvisors(advisorsData);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los datos del panel");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [token]);

  const advisorOptions = useMemo(
    () =>
      advisors
        .filter((advisor) => advisor.isActive)
        .map((advisor) => ({
          id: advisor.id,
          label: `${advisor.firstName} ${advisor.lastName} (${advisor.email})`,
        })),
    [advisors]
  );

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === "pendiente"),
    [orders]
  );

  const approvedOrders = useMemo(
    () => orders.filter((order) => order.status === "aprobado"),
    [orders]
  );

  const deniedOrders = useMemo(
    () => orders.filter((order) => order.status === "denegado"),
    [orders]
  );

  const activeClients = useMemo(
    () => clients.filter((client) => client.status === "activo"),
    [clients]
  );

  const pendingClients = useMemo(
    () => clients.filter((client) => client.status === "pendiente"),
    [clients]
  );

  const activeAdvisors = useMemo(
    () => advisors.filter((advisor) => advisor.isActive),
    [advisors]
  );

  const totalApprovedSales = useMemo(
    () =>
      approvedOrders.reduce((total, order) => total + Number(order.total || 0), 0),
    [approvedOrders]
  );

  const totalPendingSales = useMemo(
    () =>
      pendingOrders.reduce((total, order) => total + Number(order.total || 0), 0),
    [pendingOrders]
  );

  const salesByDay = useMemo(() => {
    const days = [];
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 29);
    start.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i += 1) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      const key = current.toISOString().slice(0, 10);
      days.push({ key, label: `${current.getDate()}/${current.getMonth() + 1}`, amount: 0 });
    }

    const mapByDay = new Map(days.map((item) => [item.key, item]));
    approvedOrders.forEach((order) => {
      const createdAt = new Date(order.createdAt);
      const key = createdAt.toISOString().slice(0, 10);
      if (mapByDay.has(key)) {
        const item = mapByDay.get(key);
        item.amount += Number(order.total || 0);
      }
    });

    return days;
  }, [approvedOrders]);

  const maxDailySale = useMemo(
    () => Math.max(...salesByDay.map((item) => item.amount), 1),
    [salesByDay]
  );

  const inventoryValue = useMemo(
    () =>
      products.reduce(
        (total, product) => total + Number(product.price || 0) * Number(product.stock || 0),
        0
      ),
    [products]
  );

  const advisorClientSummary = useMemo(() => {
    const clientCountByAdvisor = new Map();
    const salesByAdvisor = new Map();

    clients.forEach((client) => {
      clientCountByAdvisor.set(
        client.advisorId,
        (clientCountByAdvisor.get(client.advisorId) || 0) + 1
      );
    });

    approvedOrders.forEach((order) => {
      salesByAdvisor.set(
        order.advisorId,
        (salesByAdvisor.get(order.advisorId) || 0) + Number(order.total || 0)
      );
    });

    return advisors
      .map((advisor) => ({
        id: advisor.id,
        name: `${advisor.firstName} ${advisor.lastName}`,
        email: advisor.email,
        isActive: advisor.isActive,
        clientCount: clientCountByAdvisor.get(advisor.id) || 0,
        sales: salesByAdvisor.get(advisor.id) || 0,
      }))
      .sort((a, b) => b.sales - a.sales);
  }, [advisors, clients, approvedOrders]);

  function updateAdvisorFormField(field, value) {
    setAdvisorForm((current) => ({ ...current, [field]: value }));
  }

  function updateClientFormField(field, value) {
    setClientForm((current) => ({ ...current, [field]: value }));
  }

  async function handleOrderStatus(orderId, status) {
    setError("");
    setMessage("");
    try {
      await updateOrderStatus(orderId, status, token);
      setMessage(`Pedido ${status === "aprobado" ? "aprobado" : "denegado"} correctamente.`);
      await loadData();
      if (selectedOrderId === orderId) {
        setSelectedOrderId(null);
        setSelectedOrderDetails(null);
      }
    } catch (err) {
      setError(err.message || "No se pudo actualizar el pedido");
    }
  }

  async function loadOrderDetails(orderId) {
    if (orderId === selectedOrderId) {
      setSelectedOrderId(null);
      setSelectedOrderDetails(null);
      setOrderDetailError("");
      return;
    }

    setSelectedOrderId(orderId);
    setOrderDetailLoading(true);
    setOrderDetailError("");

    try {
      const order = await getOrderById(orderId, token);
      setSelectedOrderDetails(order);
    } catch (err) {
      setOrderDetailError(err.message || "No se pudo cargar el detalle del pedido.");
      setSelectedOrderDetails(null);
    } finally {
      setOrderDetailLoading(false);
    }
  }

  function formatOrderTxt(order) {
    const lines = [];
    lines.push(`Pedido: ${order.id}`);
    lines.push(`Estado: ${order.status}`);
    lines.push(`Fecha: ${new Date(order.createdAt).toLocaleString()}`);
    lines.push(`Total: $${Number(order.total).toLocaleString("es-CO")}`);
    if (order.observations) {
      lines.push(`Observaciones: ${order.observations}`);
    }
    lines.push("");
    lines.push("Productos:");
    lines.push("SKU | Nombre | Cantidad | Valor unitario | Total");
    order.items.forEach((item) => {
      lines.push(
        `${item.productSku || "-"} | ${item.productName || "-"} | ${item.quantity} | $${Number(
          item.unitPrice
        ).toLocaleString("es-CO")} | $${Number(item.subtotal).toLocaleString("es-CO")}`
      );
    });
    return lines.join("\n");
  }

  function formatOrderXml(order) {
    const escapeXml = (value) =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    const createdDate = new Date(order.createdAt).toISOString();
    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<order id="${escapeXml(order.id)}">`,
      `  <status>${escapeXml(order.status)}</status>`,
      `  <createdAt>${escapeXml(createdDate)}</createdAt>`,
      `  <total>${Number(order.total).toFixed(2)}</total>`,
    ];

    if (order.observations) {
      lines.push(`  <observations>${escapeXml(order.observations)}</observations>`);
    }

    lines.push("  <items>");
    order.items.forEach((item) => {
      lines.push("    <item>");
      lines.push(`      <sku>${escapeXml(item.productSku || "-")}</sku>`);
      lines.push(`      <name>${escapeXml(item.productName || "-")}</name>`);
      lines.push(`      <quantity>${item.quantity}</quantity>`);
      lines.push(`      <unitPrice>${Number(item.unitPrice).toFixed(2)}</unitPrice>`);
      lines.push(`      <subtotal>${Number(item.subtotal).toFixed(2)}</subtotal>`);
      lines.push("    </item>");
    });
    lines.push("  </items>");
    lines.push("</order>");
    return lines.join("\n");
  }

  function downloadOrderFile(order, format) {
    const content = format === "xml" ? formatOrderXml(order) : formatOrderTxt(order);
    const blob = new Blob([content], {
      type: format === "xml" ? "application/xml;charset=utf-8" : "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pedido-${order.id}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleCreateAdvisor(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setCreatingAdvisor(true);

    try {
      await createAdvisor(advisorForm, token);
      setMessage(`Vendedor creado. Clave inicial: ${advisorForm.password}`);
      setAdvisorForm({
        firstName: "",
        lastName: "",
        email: "",
        password: DEFAULT_PASSWORD,
      });
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudo crear el vendedor");
    } finally {
      setCreatingAdvisor(false);
    }
  }

  async function handleCreateClient(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!clientForm.advisorId) {
      setError("Selecciona un vendedor para crear el cliente.");
      return;
    }

    try {
      const result = await createClient(clientForm, token);
      setMessage(
        `Cliente creado correctamente. Clave inicial del portal: ${
          result.temporaryPassword || clientForm.password
        }`
      );
      setClientForm({
        businessName: "",
        taxId: "",
        contactName: "",
        email: "",
        phone: "",
        advisorId: "",
        status: "pendiente",
        password: DEFAULT_PASSWORD,
      });
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudo crear el cliente");
    }
  }

  async function handleAssignAdvisor(clientId) {
    const advisorId = assignInputs[clientId];
    if (!advisorId) {
      setError("Selecciona un vendedor para reasignar el cliente.");
      return;
    }

    setProcessingClientId(clientId);
    setError("");
    setMessage("");
    try {
      await assignAdvisor(clientId, advisorId, token);
      setMessage("Vendedor reasignado correctamente.");
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudo reasignar el vendedor");
    } finally {
      setProcessingClientId(null);
    }
  }

  async function handleClientStatus(clientId, status) {
    setProcessingClientId(clientId);
    setError("");
    setMessage("");
    try {
      await updateClientStatus(clientId, status, token);
      setMessage(`Estado del cliente actualizado a ${status}.`);
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudo actualizar el estado del cliente");
    } finally {
      setProcessingClientId(null);
    }
  }

  async function handleAdvisorStatus(advisorId, isActive) {
    setProcessingAdvisorId(advisorId);
    setError("");
    setMessage("");
    try {
      await updateAdvisorStatus(advisorId, isActive, token);
      setMessage(`Vendedor ${isActive ? "activado" : "desactivado"} correctamente.`);
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudo actualizar el estado del vendedor");
    } finally {
      setProcessingAdvisorId(null);
    }
  }

  async function handleDeleteAdvisor(advisorId) {
    setProcessingAdvisorId(advisorId);
    setError("");
    setMessage("");
    try {
      await deleteAdvisor(advisorId, token);
      setMessage("Vendedor eliminado correctamente.");
      await loadData();
    } catch (err) {
      setError(err.message || "No se pudo eliminar el vendedor");
    } finally {
      setProcessingAdvisorId(null);
    }
  }

  function renderDashboard() {
    return (
      <>
        <section className="dashboard-hero">
          <div className="panel-header">
            <div>
              <h1 style={{ margin: 0, fontSize: "2rem" }}>Dashboard Comercial</h1>
              <p className="panel-subtitle">
                Vista general del negocio: pedidos, vendedores, clientes activos y movimiento de ventas.
              </p>
            </div>
            <button type="button" onClick={() => setActiveSection(SECTIONS.ACCESS_REQUESTS)}>
              Ver solicitudes
            </button>
          </div>
          <div className="dashboard-grid">
            <div className="metric-card">
              <strong>{orders.length}</strong>
              <span>Pedidos totales</span>
            </div>
            <div className="metric-card">
              <strong>{pendingOrders.length}</strong>
              <span>Pedidos pendientes</span>
            </div>
            <div className="metric-card">
              <strong>${totalApprovedSales.toLocaleString()}</strong>
              <span>Ventas aprobadas</span>
            </div>
            <div className="metric-card">
              <strong>{activeClients.length}</strong>
              <span>Clientes activos</span>
            </div>
          </div>
        </section>

        <section className="sales-grid">
          <div className="panel-card">
            <h2>Resumen de ventas</h2>
            <p className="panel-subtitle">Indicadores clave del periodo actual.</p>
            <div className="mini-list">
              <div className="mini-item">
                <span>Ventas pendientes</span>
                <strong>${totalPendingSales.toLocaleString()}</strong>
              </div>
              <div className="mini-item">
                <span>Pedidos aprobados</span>
                <strong>{approvedOrders.length}</strong>
              </div>
              <div className="mini-item">
                <span>Pedidos denegados</span>
                <strong>{deniedOrders.length}</strong>
              </div>
              <div className="mini-item">
                <span>Valor del inventario</span>
                <strong>${inventoryValue.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div className="panel-card">
            <h2>Desempeno de vendedores</h2>
            <p className="panel-subtitle">Top comercial por ventas aprobadas y cartera asignada.</p>
            <div className="mini-list">
              {advisorClientSummary.slice(0, 4).map((advisor) => (
                <div key={advisor.id} className="mini-item">
                  <div>
                    <strong style={{ display: "block" }}>{advisor.name}</strong>
                    <span style={{ color: "#6b7280" }}>
                      {advisor.clientCount} clientes | {advisor.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <strong>${advisor.sales.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel-card">
          <h2>Ventas últimos 30 días</h2>
          <p className="panel-subtitle">Tendencia diaria de ventas aprobadas.</p>
          <div className="sales-chart">
            {salesByDay.map((item) => (
              <div key={item.key} className="sales-chart-bar" title={`${item.label}: $${item.amount.toLocaleString()}`}>
                <div
                  className="sales-chart-fill"
                  style={{ height: `${Math.round((item.amount / maxDailySale) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="sales-chart-labels">
            <span>{salesByDay[0]?.label}</span>
            <span>{salesByDay[14]?.label}</span>
            <span>{salesByDay[29]?.label}</span>
          </div>
        </section>

        <section className="panel-card">
          <div className="panel-header">
            <div>
              <h2>Acciones rapidas</h2>
              <p className="panel-subtitle">Navega desde aqui a los modulos principales.</p>
            </div>
          </div>
          <div className="dashboard-grid">
            {[
              { label: "Gestionar pedidos", section: SECTIONS.ORDERS },
              { label: "Gestionar clientes", section: SECTIONS.CLIENTS },
              { label: "Gestionar productos", section: SECTIONS.PRODUCTS },
              { label: "Gestionar asesores", section: SECTIONS.ADVISORS },
              { label: "Solicitudes de acceso", section: SECTIONS.ACCESS_REQUESTS },
            ].map((item) => (
              <button
                key={item.section}
                type="button"
                onClick={() => setActiveSection(item.section)}
                style={{ marginTop: 0 }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>
      </>
    );
  }

  function renderOrders() {
    return (
      <>
        <section className="panel-card">
          <h2>Pedidos pendientes</h2>
          <p className="panel-subtitle">Aprobacion y rechazo rapido desde administracion.</p>
          {pendingOrders.length === 0 ? (
            <p>No hay pedidos pendientes.</p>
          ) : (
            pendingOrders.map((order) => (
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
                  <button type="button" onClick={() => loadOrderDetails(order.id)}>
                    {selectedOrderId === order.id ? "Cerrar" : "Ver pedido"}
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="panel-card">
          <h2>Historial de pedidos</h2>
          {orders.filter((order) => order.status !== "pendiente").length === 0 ? (
            <p>No hay pedidos procesados.</p>
          ) : (
            orders
              .filter((order) => order.status !== "pendiente")
              .map((order) => (
                <div key={order.id} className="row-line">
                  <div>
                    <p style={{ margin: 0 }}>
                      <strong>{order.id}</strong> | ${Number(order.total).toLocaleString()} |{" "}
                      <span className={`status-badge status-${order.status}`}>{order.status}</span>
                    </p>
                    <p style={{ margin: 4, color: "#6b7280" }}>
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="actions-inline">
                    <button type="button" onClick={() => loadOrderDetails(order.id)}>
                      {selectedOrderId === order.id ? "Cerrar" : "Ver pedido"}
                    </button>
                  </div>
                </div>
              ))
          )}
        </section>
        {selectedOrderDetails && (
          <section className="panel-card">
            <h2>Detalle de pedido</h2>
            {orderDetailLoading ? (
              <p>Cargando detalle del pedido...</p>
            ) : orderDetailError ? (
              <p style={{ color: "#dc2626" }}>{orderDetailError}</p>
            ) : (
              <>
                <div style={{ display: "grid", gap: "10px", marginBottom: "16px" }}>
                  <p style={{ margin: 0 }}>
                    <strong>Pedido:</strong> {selectedOrderDetails.id}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Estado:</strong>{" "}
                    <span className={`status-badge status-${selectedOrderDetails.status}`}>
                      {selectedOrderDetails.status}
                    </span>
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Fecha:</strong> {new Date(selectedOrderDetails.createdAt).toLocaleString()}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Total:</strong> ${Number(selectedOrderDetails.total).toLocaleString()}
                  </p>
                  {selectedOrderDetails.observations && (
                    <p style={{ margin: 0 }}>
                      <strong>Observaciones:</strong> {selectedOrderDetails.observations}
                    </p>
                  )}
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #e5e7eb" }}>SKU</th>
                        <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #e5e7eb" }}>Producto</th>
                        <th style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #e5e7eb" }}>Cantidad</th>
                        <th style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #e5e7eb" }}>Valor unitario</th>
                        <th style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #e5e7eb" }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrderDetails.items.map((item) => (
                        <tr key={`${item.productSku}-${item.quantity}`}>
                          <td style={{ padding: "8px", borderBottom: "1px solid #e5e7eb" }}>{item.productSku || "-"}</td>
                          <td style={{ padding: "8px", borderBottom: "1px solid #e5e7eb" }}>{item.productName}</td>
                          <td style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #e5e7eb" }}>{item.quantity}</td>
                          <td style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #e5e7eb" }}>${Number(item.unitPrice).toLocaleString()}</td>
                          <td style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #e5e7eb" }}>${Number(item.subtotal).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="actions-inline" style={{ marginTop: "16px" }}>
                  <button type="button" onClick={() => downloadOrderFile(selectedOrderDetails, "txt")}>Descargar TXT</button>
                  <button type="button" onClick={() => downloadOrderFile(selectedOrderDetails, "xml")}>Descargar XML</button>
                  <button type="button" onClick={() => loadOrderDetails(selectedOrderDetails.id)}>Cerrar</button>
                </div>
              </>
            )}
          </section>
        )}
      </>
    );
  }

  function renderClients() {
    return (
      <>
        <section className="panel-card">
          <h2>Crear cliente del portal</h2>
          <p className="panel-subtitle">
            Registra clientes con cuenta propia del portal y asignacion directa de vendedor.
          </p>
          <form
            onSubmit={handleCreateClient}
            style={{
              display: "grid",
              gap: "12px",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            <input
              placeholder="Empresa"
              value={clientForm.businessName}
              onChange={(event) => updateClientFormField("businessName", event.target.value)}
              required
            />
            <input
              placeholder="NIT / RUT"
              value={clientForm.taxId}
              onChange={(event) => updateClientFormField("taxId", event.target.value)}
              required
            />
            <input
              placeholder="Contacto"
              value={clientForm.contactName}
              onChange={(event) => updateClientFormField("contactName", event.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Correo del portal"
              value={clientForm.email}
              onChange={(event) => updateClientFormField("email", event.target.value)}
              required
            />
            <input
              placeholder="Telefono"
              value={clientForm.phone}
              onChange={(event) => updateClientFormField("phone", event.target.value)}
              required
            />
            <select
              value={clientForm.advisorId}
              onChange={(event) => updateClientFormField("advisorId", event.target.value)}
              required
            >
              <option value="">Seleccionar vendedor</option>
              {advisorOptions.map((advisor) => (
                <option key={advisor.id} value={advisor.id}>
                  {advisor.label}
                </option>
              ))}
            </select>
            <select
              value={clientForm.status}
              onChange={(event) => updateClientFormField("status", event.target.value)}
            >
              <option value="pendiente">Pendiente</option>
              <option value="activo">Activo</option>
              <option value="bloqueado">Bloqueado</option>
            </select>
            <input
              type="text"
              placeholder="Clave inicial"
              value={clientForm.password}
              onChange={(event) => updateClientFormField("password", event.target.value)}
              required
            />
            <div style={{ gridColumn: "1 / -1" }}>
              <button type="submit">Crear cliente</button>
            </div>
          </form>
        </section>

        <section className="panel-card">
          <h2>Clientes registrados</h2>
          {clients.length === 0 ? <p>No hay clientes registrados.</p> : null}
          {clients.map((client) => (
            <div key={client.id} className="row-line" style={{ alignItems: "flex-start", gap: "14px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "260px" }}>
                <p style={{ margin: "0 0 4px 0" }}>
                  <strong>{client.businessName}</strong>
                </p>
                <p style={{ margin: 0, color: "#475569" }}>
                  {client.email} | Estado: {client.status} | Portal: {client.portalEnabled ? "Habilitado" : "Bloqueado"} | Vendedor:{" "}
                  {client.advisorName || "Sin asignar"}
                </p>
              </div>
              <div className="actions-inline" style={{ flexWrap: "wrap", gap: "10px" }}>
                <select
                  value={assignInputs[client.id] || client.advisorId || ""}
                  onChange={(event) =>
                    setAssignInputs((current) => ({
                      ...current,
                      [client.id]: event.target.value,
                    }))
                  }
                >
                  <option value="">Seleccionar vendedor</option>
                  {advisorOptions.map((advisor) => (
                    <option key={advisor.id} value={advisor.id}>
                      {advisor.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={processingClientId === client.id}
                  onClick={() => handleAssignAdvisor(client.id)}
                >
                  Reasignar vendedor
                </button>
                <button
                  type="button"
                  disabled={processingClientId === client.id || client.status === "activo"}
                  onClick={() => handleClientStatus(client.id, "activo")}
                >
                  Aprobar / Activar
                </button>
                <button
                  type="button"
                  disabled={processingClientId === client.id || client.status === "bloqueado"}
                  onClick={() => handleClientStatus(client.id, "bloqueado")}
                >
                  Bloquear
                </button>
              </div>
            </div>
          ))}
        </section>
      </>
    );
  }

  function renderProducts() {
    return (
      <>
        <section className="panel-card">
          <h2>Productos</h2>
          <p className="panel-subtitle">Carga individual, carga masiva y acceso directo al detalle del producto.</p>
          <AdminProductForm onProductAdded={loadData} />
          <AdminBulkUpload onProductsAdded={loadData} />
        </section>

        <section className="panel-card">
          <h2>Inventario actual</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ padding: "10px", textAlign: "left" }}>Nombre</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>SKU</th>
                  <th style={{ padding: "10px", textAlign: "right" }}>Precio</th>
                  <th style={{ padding: "10px", textAlign: "right" }}>Stock</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Categoria</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    style={{ borderBottom: "1px solid #e5e7eb", cursor: "pointer" }}
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <td style={{ padding: "10px" }}>{product.name}</td>
                    <td style={{ padding: "10px" }}>{product.sku}</td>
                    <td style={{ padding: "10px", textAlign: "right" }}>${Number(product.price).toFixed(2)}</td>
                    <td style={{ padding: "10px", textAlign: "right" }}>{product.stock}</td>
                    <td style={{ padding: "10px" }}>{product.category}</td>
                    <td style={{ padding: "10px" }}>{product.active ? "Activo" : "Inactivo"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  function renderAccessRequests() {
    return <AdminAccessRequests />;
  }

  function renderAdvisors() {
    return (
      <>
        <section className="panel-card">
          <h2>Crear asesor</h2>
          <p className="panel-subtitle">Administra usuarios comerciales con estado activo o inactivo.</p>
          <form
            onSubmit={handleCreateAdvisor}
            style={{
              display: "grid",
              gap: "12px",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            <input
              placeholder="Nombre"
              value={advisorForm.firstName}
              onChange={(event) => updateAdvisorFormField("firstName", event.target.value)}
            />
            <input
              placeholder="Apellido"
              value={advisorForm.lastName}
              onChange={(event) => updateAdvisorFormField("lastName", event.target.value)}
            />
            <input
              type="email"
              placeholder="Correo"
              value={advisorForm.email}
              onChange={(event) => updateAdvisorFormField("email", event.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Clave inicial"
              value={advisorForm.password}
              onChange={(event) => updateAdvisorFormField("password", event.target.value)}
              required
            />
            <div style={{ gridColumn: "1 / -1" }}>
              <button type="submit" disabled={creatingAdvisor}>
                {creatingAdvisor ? "Creando..." : "Crear vendedor"}
              </button>
            </div>
          </form>
        </section>

        <section className="panel-card">
          <h2>Asesores comerciales</h2>
          <div className="mini-list">
            {advisors.map((advisor) => (
              <div key={advisor.id} className="mini-item">
                <div>
                  <strong style={{ display: "block" }}>
                    {advisor.firstName} {advisor.lastName}
                  </strong>
                  <span style={{ color: "#6b7280" }}>
                    {advisor.email} | {advisor.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div className="actions-inline" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    disabled={processingAdvisorId === advisor.id || advisor.isActive}
                    onClick={() => handleAdvisorStatus(advisor.id, true)}
                  >
                    Activar
                  </button>
                  <button
                    type="button"
                    disabled={processingAdvisorId === advisor.id || !advisor.isActive}
                    onClick={() => handleAdvisorStatus(advisor.id, false)}
                  >
                    Desactivar
                  </button>
                  <button
                    type="button"
                    disabled={processingAdvisorId === advisor.id}
                    onClick={() => handleDeleteAdvisor(advisor.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  }

  function renderSection() {
    if (activeSection === SECTIONS.ORDERS) {
      return renderOrders();
    }
    if (activeSection === SECTIONS.CLIENTS) {
      return renderClients();
    }
    if (activeSection === SECTIONS.PRODUCTS) {
      return renderProducts();
    }
    if (activeSection === SECTIONS.ADVISORS) {
      return renderAdvisors();
    }
    if (activeSection === SECTIONS.ACCESS_REQUESTS) {
      return renderAccessRequests();
    }
    return renderDashboard();
  }

  if (loading) {
    return <div className="page-column">Cargando dashboard administrativo...</div>;
  }

  return (
    <div className="page-column">
      {message ? <p className="success">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <div className="admin-shell">
        <aside className="admin-sidebar">
          <h2>Andimat Admin</h2>
          <p>Control total de pedidos, clientes, productos y fuerza comercial.</p>

          <div className="admin-nav">
            <button
              type="button"
              className={activeSection === SECTIONS.DASHBOARD ? "admin-nav-active" : ""}
              onClick={() => setActiveSection(SECTIONS.DASHBOARD)}
            >
              Dashboard principal
            </button>
            <button
              type="button"
              className={activeSection === SECTIONS.ORDERS ? "admin-nav-active" : ""}
              onClick={() => setActiveSection(SECTIONS.ORDERS)}
            >
              Pedidos
            </button>
            <button
              type="button"
              className={activeSection === SECTIONS.CLIENTS ? "admin-nav-active" : ""}
              onClick={() => setActiveSection(SECTIONS.CLIENTS)}
            >
              Clientes
            </button>
            <button
              type="button"
              className={activeSection === SECTIONS.PRODUCTS ? "admin-nav-active" : ""}
              onClick={() => setActiveSection(SECTIONS.PRODUCTS)}
            >
              Productos
            </button>
            <button
              type="button"
              className={activeSection === SECTIONS.ADVISORS ? "admin-nav-active" : ""}
              onClick={() => setActiveSection(SECTIONS.ADVISORS)}
            >
              Asesores
            </button>
            <button
              type="button"
              className={activeSection === SECTIONS.ACCESS_REQUESTS ? "admin-nav-active" : ""}
              onClick={() => setActiveSection(SECTIONS.ACCESS_REQUESTS)}
            >
              Solicitudes de acceso
            </button>
          </div>
        </aside>

        <div className="admin-main">{renderSection()}</div>
      </div>
    </div>
  );
}
