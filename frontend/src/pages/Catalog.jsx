import { useEffect, useRef, useState } from "react";
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
        setProducts(Array.isArray(response) ? response : []);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los productos");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [token]);

  const normalizeCategory = (value) => String(value || "").trim();
  const normalizePromotion = (product) => {
    const hasPromoFlag = product.promotion === true || product.discount === true;
    const hasDiscountValue = typeof product.discount === "number" && product.discount > 0;
    const fallbackPromo =
      (Number.isFinite(Number(product.price)) && Number(product.price) <= 10000) ||
      (Number.isFinite(Number(product.stock)) && Number(product.stock) >= 50);

    return hasPromoFlag || hasDiscountValue || fallbackPromo;
  };

  const activeProducts = products.filter((p) => p.active !== false);

  // Extract unique categories from active products
  const categories = [...new Set(activeProducts.map((p) => normalizeCategory(p.category)).filter(Boolean))].sort();
  
  const promotionProducts = activeProducts.filter(normalizePromotion);

  const featuredProducts = (() => {
    const byFlag = activeProducts.filter(
      (p) => p.is_featured === true || p.featured === true
    );
    return (byFlag.length > 0 ? byFlag : activeProducts).slice(0, 5);
  })();

  const sliderRef = useRef(null);

  useEffect(() => {
    if (!featuredProducts.length || !sliderRef.current) {
      return undefined;
    }

    const interval = setInterval(() => {
      const container = sliderRef.current;
      if (!container) {
        return;
      }

      const children = Array.from(container.children);
      if (!children.length) {
        return;
      }

      const currentIndex = children.findIndex(
        (child) => child.getBoundingClientRect().left >= container.getBoundingClientRect().left - 1
      );
      const nextIndex = (currentIndex + 1) % children.length;
      children[nextIndex]?.scrollIntoView({ behavior: "smooth", inline: "start" });
    }, 4200);

    return () => clearInterval(interval);
  }, [featuredProducts]);
  
  // Filter products based on selected category
  const filteredProducts = selectedCategory 
    ? activeProducts.filter((p) => normalizeCategory(p.category) === selectedCategory)
    : activeProducts;

  if (loading) {
    return (
      <div className="page-column" style={{ textAlign: "center", padding: "40px" }}>
        <p role="status" style={{ fontSize: "18px", color: "#666" }}>
          Cargando catálogo...
        </p>
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
          {promotionProducts.length > 0
            ? "Estas son nuestras ofertas y promociones del mes"
            : "Explora los mejores precios y productos destacados"}
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
          <h2 style={{ fontSize: "1.8rem", marginBottom: "20px", color: "#1f2937", fontWeight: "600" }}>
            Productos Destacados
          </h2>
          <div
            ref={sliderRef}
            style={{
              display: "flex",
              gap: "16px",
              overflowX: "auto",
              paddingBottom: "10px",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  flex: "0 0 280px",
                  minWidth: "280px",
                  scrollSnapAlign: "start",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: "white",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                }}
              >
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
