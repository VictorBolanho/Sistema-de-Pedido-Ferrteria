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
      <h1>Carrito</h1>

      {items.length === 0 ? <p>Tu carrito esta vacio.</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {items.length > 0 ? (
        <div className="card">
          {items.map((item) => {
            const subtotal = Number(item.product.price) * item.quantity;
            return (
              <div key={item.product.id} className="cart-row">
                <div>
                  <strong>{item.product.name}</strong>
                  <p>Precio: ${Number(item.product.price).toLocaleString()}</p>
                  <p>Subtotal: ${subtotal.toLocaleString()}</p>
                </div>
                <div className="cart-actions">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) =>
                      changeQuantity(item.product.id, event.target.value)
                    }
                  />
                  <button type="button" onClick={() => removeProduct(item.product.id)}>
                    Quitar
                  </button>
                </div>
              </div>
            );
          })}
          <hr />
          <h3>Total: ${total.toLocaleString()}</h3>
          <button type="button" onClick={handleCreateOrder} disabled={submitting}>
            {submitting ? "Creando pedido..." : "Crear pedido"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
