import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product, onAddToCart }) {
  const { items } = useCart();
  const [isPressed, setIsPressed] = useState(false);
  const timeoutRef = useRef(null);

  const cartItem = items.find((item) => item.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;
  const isActive = quantity > 0;

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const handleAddToCart = () => {
    onAddToCart(product);
    setIsPressed(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsPressed(false), 180);
  };

  const buttonText = isActive ? `Agregado (x${quantity})` : "🛒 Agregar al carrito";
  const buttonStyle = {
    width: "100%",
    padding: "12px 20px",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    color: "white",
    background: isActive ? "#16a34a" : "#f97316",
    boxShadow: isActive
      ? "0 0 0 4px rgba(16, 185, 129, 0.15), 0 12px 24px rgba(16, 185, 129, 0.15)"
      : "0 4px 16px rgba(249, 115, 22, 0.18)",
    transform: isPressed ? "scale(1.03)" : "scale(1)",
    transition: "transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease",
  };

  return (
    <div className="card product-card" style={{ padding: "16px" }}>
      {/* Product Image */}
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{
            width: "100%",
            height: "150px",
            objectFit: "cover",
            borderRadius: "8px",
            marginBottom: "10px"
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "150px",
            background: "#f3f4f6",
            borderRadius: "8px",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ca3af",
            fontSize: "0.85rem"
          }}
        >
          Sin imagen
        </div>
      )}
      <h3 style={{ margin: "0 0 8px 0", fontSize: "1rem", lineHeight: "1.3", color: "#111827" }}>
        {product.name}
      </h3>
      <p style={{ margin: "0 0 4px 0", fontSize: "0.82rem", color: "#4b5563" }}>
        SKU: {product.sku}
      </p>
      <p style={{ margin: "0 0 6px 0", fontSize: "0.82rem", color: "#4b5563" }}>
        Categoría: {product.category}
      </p>
      <p style={{ margin: "0 0 10px 0", fontSize: "1rem", fontWeight: "700", color: "#f97316" }}>
        ${Number(product.price).toLocaleString()}
      </p>
      <p style={{ margin: "0 0 14px 0", fontSize: "0.85rem", color: "#6b7280" }}>
        Stock: {product.stock}
      </p>
      <button type="button" style={buttonStyle} onClick={handleAddToCart}>
        {buttonText}
      </button>
    </div>
  );
}
