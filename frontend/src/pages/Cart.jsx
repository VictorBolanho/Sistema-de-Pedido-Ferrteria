import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../services/orders.service";

export default function Cart() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { items, changeQuantity, removeProduct, clearCart, total } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateOrder() {
    if (items.length === 0 || submitting) {
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const payload = {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };
      await createOrder(payload, token);
      clearCart();
      navigate("/orders", {
        replace: true,
        state: { successMessage: "Pedido creado correctamente." },
      });
    } catch (err) {
      setError(err.message || "No se pudo crear el pedido");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-column">
      <div className="panel-card" style={{ maxWidth: "1200px", margin: "0 auto", borderRadius: "28px" }}>
        <div className="panel-header">
          <div>
            <h1 style={{ margin: 0 }}>Tu carrito de compra</h1>
            <p className="panel-subtitle">
              Revisa cantidades, confirma referencias y envianos tu pedido cuando este listo.
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div
            style={{
              padding: "34px",
              borderRadius: "24px",
              background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)",
              border: "1px solid #fed7aa",
              textAlign: "center",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Tu carrito esta vacio</h2>
            <p style={{ color: "#64748b", maxWidth: "520px", margin: "0 auto 16px" }}>
              Agrega productos del catalogo para construir un pedido de manera rapida y organizada.
            </p>
            <button type="button" onClick={() => navigate("/catalog")} style={{ marginTop: 0 }}>
              Volver al catalogo
            </button>
          </div>
        ) : (
          <div className="sales-grid" style={{ alignItems: "start" }}>
            <div className="panel-card" style={{ borderRadius: "24px", boxShadow: "none" }}>
              {error ? <p className="error">{error}</p> : null}
              {items.map((item) => {
                const subtotal = Number(item.product.price) * item.quantity;
                return (
                  <div key={item.product.id} className="mini-item" style={{ alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        style={{ width: "88px", height: "88px", objectFit: "cover", borderRadius: "18px" }}
                      />
                      <div>
                        <strong style={{ display: "block" }}>{item.product.name}</strong>
                        <span style={{ color: "#64748b" }}>
                          ${Number(item.product.price).toLocaleString("es-CO")} c/u
                        </span>
                        <p style={{ margin: "8px 0 0 0", color: "#c2410c", fontWeight: "700" }}>
                          Subtotal: ${subtotal.toLocaleString("es-CO")}
                        </p>
                      </div>
                    </div>
                    <div className="actions-inline" style={{ alignItems: "center" }}>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) => changeQuantity(item.product.id, event.target.value)}
                        style={{ width: "90px" }}
                      />
                      <button type="button" onClick={() => removeProduct(item.product.id)}>
                        Quitar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
                color: "white",
                borderRadius: "24px",
                padding: "24px",
                boxShadow: "0 24px 50px rgba(15,23,42,0.18)",
              }}
            >
              <h2 style={{ marginTop: 0 }}>Resumen del pedido</h2>
              <div className="mini-list">
                <div className="mini-item">
                  <span>Items</span>
                  <strong>{items.length}</strong>
                </div>
                <div className="mini-item">
                  <span>Unidades</span>
                  <strong>{items.reduce((acc, item) => acc + item.quantity, 0)}</strong>
                </div>
                <div className="mini-item">
                  <span>Total estimado</span>
                  <strong>${total.toLocaleString("es-CO")}</strong>
                </div>
              </div>
              <p style={{ color: "rgba(255,255,255,0.74)", lineHeight: 1.7 }}>
                Cuando confirmes el pedido, el administrador revisara disponibilidad y aprobara el proceso comercial.
              </p>
              <button
                type="button"
                onClick={handleCreateOrder}
                disabled={submitting}
                style={{
                  width: "100%",
                  marginTop: "14px",
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                }}
              >
                {submitting ? "Creando pedido..." : "Confirmar pedido"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
