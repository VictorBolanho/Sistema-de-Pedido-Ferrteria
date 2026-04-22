import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function getProductBadge(product) {
  if (Number(product.unitsSold || 0) >= 10) {
    return { label: "Mas comprado", tone: "sale" };
  }

  if (Number(product.stock || 0) <= 12) {
    return { label: "Ultimas unidades", tone: "stock" };
  }

  return { label: "Disponible", tone: "neutral" };
}

export default function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate();
  const { items } = useCart();
  const [isPressed, setIsPressed] = useState(false);
  const timeoutRef = useRef(null);

  const cartItem = items.find((item) => item.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;
  const isActive = quantity > 0;
  const badge = getProductBadge(product);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const handleOpenDetail = () => {
    navigate(`/catalog/${product.id}`);
  };

  const handleAddToCart = (event) => {
    event.stopPropagation();
    onAddToCart(product);
    setIsPressed(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsPressed(false), 180);
  };

  return (
    <article
      className="card product-card product-card-interactive"
      onClick={handleOpenDetail}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpenDetail();
        }
      }}
      role="button"
      tabIndex={0}
      style={{
        padding: "0",
        overflow: "hidden",
        borderRadius: "24px",
        border: "1px solid #f1dfcb",
        background: "linear-gradient(180deg, #ffffff 0%, #fffaf5 100%)",
        boxShadow: "0 22px 44px rgba(15,23,42,0.08)",
      }}
    >
      <div style={{ position: "relative" }}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{
              width: "100%",
              height: "220px",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "220px",
              background: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
              fontSize: "0.9rem",
            }}
          >
            Sin imagen
          </div>
        )}

        <div
          style={{
            position: "absolute",
            top: "14px",
            left: "14px",
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <span className="catalog-chip catalog-chip-dark">
            {String(product.category || "general").toUpperCase()}
          </span>
          <span
            className={`catalog-chip ${
              badge.tone === "sale"
                ? "catalog-chip-sale"
                : badge.tone === "stock"
                  ? "catalog-chip-stock"
                  : "catalog-chip-light"
            }`}
          >
            {badge.label}
          </span>
        </div>
      </div>

      <div style={{ padding: "18px" }}>
        <h3
          style={{
            margin: "0 0 8px 0",
            fontSize: "1.02rem",
            lineHeight: 1.35,
            color: "#111827",
            minHeight: "54px",
          }}
        >
          {product.name}
        </h3>
        <p style={{ margin: "0 0 6px 0", fontSize: "0.82rem", color: "#64748b" }}>
          SKU: {product.sku}
        </p>
        <p style={{ margin: "0 0 12px 0", fontSize: "0.82rem", color: "#64748b" }}>
          {Number(product.unitsSold || 0) > 0
            ? `${Number(product.unitsSold).toLocaleString("es-CO")} unidades vendidas`
            : `Disponibles: ${product.stock}`}
        </p>

        <div className="product-card-price">
          <strong>${Number(product.price).toLocaleString("es-CO")}</strong>
          <p>Precio actual para pedido en portal.</p>
        </div>

        <div className="product-card-actions">
          <button
            type="button"
            onClick={handleAddToCart}
            style={{
              width: "100%",
              padding: "13px 20px",
              border: "none",
              borderRadius: "16px",
              fontSize: "0.98rem",
              fontWeight: "800",
              cursor: "pointer",
              color: "white",
              background: isActive
                ? "linear-gradient(135deg, #16a34a 0%, #15803d 100%)"
                : "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              boxShadow: isActive
                ? "0 12px 24px rgba(22,163,74,0.24)"
                : "0 14px 28px rgba(249,115,22,0.24)",
              transform: isPressed ? "scale(1.03)" : "scale(1)",
              transition: "transform 0.15s ease, box-shadow 0.2s ease",
              marginTop: 0,
            }}
          >
            {isActive ? `Agregar otra unidad (${quantity})` : "Agregar al carrito"}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleOpenDetail();
            }}
            className="product-card-link"
          >
            Ver detalle
          </button>
        </div>
      </div>
    </article>
  );
}
