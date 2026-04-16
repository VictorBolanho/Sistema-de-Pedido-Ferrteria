import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/products.service";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Catalog() {
  const { token } = useAuth();
  const { addProduct } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError("");
      try {
        const response = await getProducts(token);
        setProducts(response || []);
      } catch (err) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [token]);

  const activeProducts = products.filter((p) => p.active !== false);

  // Extract unique categories from active products
  const categories = [...new Set(activeProducts.map((p) => p.category).filter(Boolean))].sort();
  
  // Get featured products (first 4)
  const featuredProducts = activeProducts.slice(0, 4);
  
  // Filter products based on selected category
  const filteredProducts = selectedCategory 
    ? activeProducts.filter((p) => p.category === selectedCategory)
    : activeProducts;

  if (loading) {
    return (
      <div className="page-column" style={{ textAlign: "center", padding: "40px" }}>
        <p style={{ fontSize: "18px", color: "#666" }}>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-column" style={{ textAlign: "center", padding: "40px" }}>
        <p style={{ fontSize: "18px", color: "#dc2626" }}>Error al cargar productos</p>
        <p style={{ fontSize: "14px", color: "#999" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="page-column" style={{ padding: 0 }}>
      {/* PROMOTIONS BANNER */}
      <section style={{
        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
        color: "white",
        padding: "60px 24px",
        textAlign: "center",
        marginBottom: "40px"
      }}>
        <h1 style={{ fontSize: "2.5rem", margin: "0 0 10px 0", fontWeight: "700" }}>
          🔥 Promociones del Mes
        </h1>
        <p style={{ fontSize: "1.1rem", margin: "0 0 20px 0", opacity: 0.95 }}>
          Descuentos especiales en herramientas y cerámicas
        </p>
        <button style={{
          background: "white",
          color: "#f97316",
          border: "none",
          padding: "12px 30px",
          fontSize: "1rem",
          fontWeight: "600",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "transform 0.2s"
        }} onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.target.style.transform = "scale(1)"}>
          Ver ofertas
        </button>
      </section>

      {/* CATEGORIES SECTION */}
      {categories.length > 0 && (
        <section style={{
          background: "white",
          padding: "30px 24px",
          marginBottom: "40px",
          borderRadius: "8px",
          margin: "0 24px 40px 24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "20px", color: "#1f2937", fontWeight: "600" }}>
            Categorías
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                padding: "10px 20px",
                background: selectedCategory === null ? "#f97316" : "#f0f0f0",
                color: selectedCategory === null ? "white" : "#333",
                border: "2px solid transparent",
                borderRadius: "25px",
                cursor: "pointer",
                fontWeight: selectedCategory === null ? "600" : "500",
                fontSize: "0.95rem",
                transition: "all 0.2s",
                borderColor: selectedCategory === null ? "#f97316" : "transparent"
              }}
            >
              Todas
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: "10px 20px",
                  background: selectedCategory === category ? "#f97316" : "#f0f0f0",
                  color: selectedCategory === category ? "white" : "#333",
                  border: "2px solid transparent",
                  borderRadius: "25px",
                  cursor: "pointer",
                  fontWeight: selectedCategory === category ? "600" : "500",
                  fontSize: "0.95rem",
                  transition: "all 0.2s",
                  borderColor: selectedCategory === category ? "#f97316" : "transparent"
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS SECTION */}
      {featuredProducts.length > 0 && (
        <section style={{
          background: "white",
          padding: "40px 24px",
          marginBottom: "40px",
          borderRadius: "8px",
          margin: "0 24px 40px 24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        }}>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "30px", color: "#1f2937", fontWeight: "600" }}>
            Productos Destacados
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "25px"
          }}>
            {featuredProducts.map(product => (
              <div key={product.id} style={{
                border: "2px solid #f97316",
                borderRadius: "8px",
                padding: "0",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(249, 115, 22, 0.2)"
              }}>
                <ProductCard product={product} onAddToCart={addProduct} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FULL PRODUCTS SECTION */}
      <section style={{
        background: "white",
        padding: "40px 24px",
        borderRadius: "8px",
        margin: "0 24px 40px 24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
      }}>
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "8px", color: "#1f2937", fontWeight: "600" }}>
            {selectedCategory ? selectedCategory : "Todos los Productos"}
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#6b7280", margin: 0 }}>
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "12px"
          }}>
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={addProduct} />
            ))}
          </div>
        ) : (
          <p style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#9ca3af",
            fontSize: "1rem"
          }}>
            No hay productos disponibles en esta categoría.
          </p>
        )}
      </section>
    </div>
  );
}
