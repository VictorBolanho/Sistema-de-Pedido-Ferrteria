export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="card product-card">
      {/* Product Image */}
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{
            width: "100%",
            height: "180px",
            objectFit: "cover",
            borderRadius: "6px 6px 0 0",
            marginBottom: "12px"
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "180px",
            background: "#f3f4f6",
            borderRadius: "6px 6px 0 0",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ca3af",
            fontSize: "0.9rem"
          }}
        >
          Sin imagen
        </div>
      )}
      <h3>{product.name}</h3>
      <p>SKU: {product.sku}</p>
      <p>Categoría: {product.category}</p>
      <p style={{ fontSize: "1.2rem", fontWeight: "600", color: "#f97316" }}>
        ${Number(product.price).toLocaleString()}
      </p>
      <p>Stock: {product.stock}</p>
      <button type="button" onClick={() => onAddToCart(product)}>
        🛒 Agregar al carrito
      </button>
    </div>
  );
}
