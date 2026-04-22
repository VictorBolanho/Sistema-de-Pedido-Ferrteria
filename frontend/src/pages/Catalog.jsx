import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/products.service";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const categoryMeta = {
  valdosas: {
    title: "Valdosas y porcelanatos",
    description: "Pisos y paredes con presencia comercial fuerte para vivienda, local y remodelacion.",
  },
  pegantes: {
    title: "Pegantes y sellantes",
    description: "Adhesivos, boquillas y siliconas de alta rotacion para cerrar la venta completa.",
  },
  banos: {
    title: "Linea de banos",
    description: "Sanitarios, griferias y cabinas para proyectos residenciales y reposicion.",
  },
  cocinas: {
    title: "Cocina y griferia",
    description: "Referencias funcionales para remodelacion, constructoras y hogar.",
  },
  acabados: {
    title: "Acabados y obra blanca",
    description: "Complementos de alta salida para pedidos mas completos y rentables.",
  },
};

function getPromoMessage(product) {
  const unitsSold = Number(product.unitsSold || 0);
  if (unitsSold > 0) {
    return `Top en pedidos: ${unitsSold.toLocaleString("es-CO")} unidades vendidas`;
  }

  if (Number(product.stock || 0) <= 12) {
    return "Ultimas unidades disponibles para despacho";
  }

  return "Referencia destacada para impulsar tu pedido";
}

function isFeaturedProduct(product) {
  const unitsSold = Number(product.unitsSold || 0);
  const stock = Number(product.stock || 0);
  return unitsSold > 0 || stock <= 12;
}

export default function Catalog() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { addProduct, quantity } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOffers, setShowOffers] = useState(false);

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

  const activeProducts = useMemo(
    () => products.filter((product) => product.active !== false),
    [products]
  );

  const categories = useMemo(
    () => [...new Set(activeProducts.map((product) => String(product.category || "").trim()).filter(Boolean))],
    [activeProducts]
  );

  const bestSellers = useMemo(() => {
    return [...activeProducts]
      .sort((a, b) => {
        const soldDiff = Number(b.unitsSold || 0) - Number(a.unitsSold || 0);
        if (soldDiff !== 0) {
          return soldDiff;
        }
        return Number(b.price || 0) - Number(a.price || 0);
      })
      .slice(0, 8);
  }, [activeProducts]);

  const featuredProducts = useMemo(
    () =>
      [...activeProducts]
        .filter(isFeaturedProduct)
        .sort((a, b) => {
          const soldDiff = Number(b.unitsSold || 0) - Number(a.unitsSold || 0);
          if (soldDiff !== 0) {
            return soldDiff;
          }
          return Number(b.stock || 0) - Number(a.stock || 0);
        })
        .slice(0, 12),
    [activeProducts]
  );

  const promotedProducts = featuredProducts.length > 0 ? featuredProducts : bestSellers;

  const featuredCollections = useMemo(
    () =>
      categories.slice(0, 5).map((category) => ({
        key: category,
        ...categoryMeta[category],
      })),
    [categories]
  );

  const normalizedSearch = String(searchQuery || "").trim().toLowerCase();
  const filteredProducts = activeProducts.filter((product) => {
    const matchesCategory = selectedCategory === "all" ? true : product.category === selectedCategory;
    const matchesSearch = normalizedSearch
      ? String(product.name || "").toLowerCase().includes(normalizedSearch)
      : true;
    const matchesOffers = showOffers ? isFeaturedProduct(product) : true;

    return matchesCategory && matchesSearch && matchesOffers;
  });

  if (loading) {
    return (
      <div className="page-column" style={{ textAlign: "center", padding: "40px" }}>
        <p role="status" style={{ fontSize: "18px", color: "#666" }}>
          Cargando catalogo...
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
    <div className="page-column catalog-page-shell" style={{ paddingTop: 0 }}>
      <section className="catalog-hero">
        <div className="catalog-hero-glow" />
        <div className="catalog-container catalog-hero-inner">
          <div className="catalog-hero-copy">
            <div className="catalog-chip catalog-chip-light">
              Venta ferretera digital para mercado colombiano
            </div>
            <h1>
              Compra valdosas, pegantes y linea para banos con una vitrina que vende mejor y se siente mas profesional.
            </h1>
            <p>
              Explora referencias que si tienen sentido para obra, remodelacion y reposicion. Revisa los mas pedidos, entra al detalle y arma tu pedido sin salir del portal.
            </p>
            <div className="catalog-hero-actions">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setShowOffers(true);
                }}
              >
                Ver destacados
              </button>
              <button
                type="button"
                className="catalog-cart-pill"
                onClick={() => navigate("/cart")}
              >
                {quantity} productos en carrito
              </button>
            </div>
          </div>

          <div className="catalog-hero-highlight">
            {bestSellers.length > 0 ? (
              <Swiper
                modules={[Autoplay]}
                slidesPerView={1}
                loop={bestSellers.length > 1}
                autoplay={{
                  delay: 4500,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                className="catalog-highlight-slider"
              >
                {bestSellers.slice(0, 5).map((product) => (
                  <SwiperSlide key={product.id}>
                    <div className="catalog-highlight-card">
                      <span>Más vendido</span>
                      <strong>{product.name || "Referencia destacada"}</strong>
                      <p>
                        {product.unitsSold
                          ? `${Number(product.unitsSold || 0).toLocaleString("es-CO")} unidades vendidas`
                          : "Referencia destacada para impulsar tu pedido."}
                      </p>
                      <p className="catalog-highlight-secondary">
                        {getPromoMessage(product)}
                      </p>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="catalog-highlight-card">
                <span>Más vendido</span>
                <strong>Catalago activo</strong>
                <p>Explora el catálogo y encuentra referencias destacadas para tu próximo pedido.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="catalog-toolbar-shell">
        <div className="catalog-container">
          <div className="catalog-toolbar">
            <div>
              <h2>Encuentra lo que necesitas</h2>
              <p>Busca por referencia, filtra por categoria o revisa los productos con mejor salida.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowOffers((current) => !current)}
              style={{
                marginTop: 0,
                background: showOffers
                  ? "linear-gradient(135deg, #16a34a 0%, #15803d 100%)"
                  : "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              }}
            >
              {showOffers ? "Mostrando destacados" : "Activar destacados"}
            </button>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Busca por nombre, linea o tipo de producto"
              className="catalog-search-input"
            />
          </div>
        </div>
      </section>

      {bestSellers.length > 0 ? (
        <section className="catalog-section">
          <div className="catalog-container">
            <div className="panel-card catalog-panel">
              <div className="panel-header">
                <div>
                  <h2>Promociones y productos destacados</h2>
                  <p className="panel-subtitle">
                    Este carrusel se mueve con los productos que mejor se venden dentro del portal.
                  </p>
                </div>
              </div>

              <Swiper
                modules={[Autoplay]}
                spaceBetween={18}
                slidesPerView={1.1}
                autoplay={{ delay: 3200, disableOnInteraction: false }}
                breakpoints={{
                  768: { slidesPerView: 2.1 },
                  1100: { slidesPerView: 3.1 },
                }}
              >
                {promotedProducts.map((product) => (
                  <SwiperSlide key={product.id}>
                    <article
                      className="catalog-promo-slide"
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/catalog/${product.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          navigate(`/catalog/${product.id}`);
                        }
                      }}
                    >
                      <img src={product.imageUrl} alt={product.name} />
                      <div className="catalog-promo-overlay">
                        <span className="catalog-chip catalog-chip-sale">Destacado</span>
                        <h3>{product.name}</h3>
                        <p>{getPromoMessage(product)}</p>
                        <strong>${Number(product.price).toLocaleString("es-CO")}</strong>
                      </div>
                    </article>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      ) : null}

      {featuredCollections.length > 0 ? (
        <section className="catalog-section">
          <div className="catalog-container">
            <div className="panel-card catalog-panel">
              <div className="panel-header">
                <div>
                  <h2>Categorías</h2>
                  <p className="panel-subtitle">
                    Selecciona una categoría y descubre los productos más relevantes por línea.
                  </p>
                </div>
              </div>

              <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={18}
                slidesPerView={1.05}
                allowTouchMove={false}
                breakpoints={{
                  768: { slidesPerView: 2.1 },
                  1100: { slidesPerView: 3.1 },
                }}
                className="catalog-category-slider"
              >
                {featuredCollections.map((collection) => (
                  <SwiperSlide key={collection.key}>
                    <article className="catalog-category-card">
                      <div className="catalog-category-head">
                        <span className="catalog-category-badge">{collection.key.toUpperCase()}</span>
                        <p className="catalog-category-type">Categoría</p>
                      </div>
                      <div>
                        <h3>{collection.title || collection.key}</h3>
                        <p className="panel-subtitle">
                          {collection.description || "Coleccion de productos destacados."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCategory((current) =>
                            current === collection.key ? "all" : collection.key
                          )
                        }
                        className={selectedCategory === collection.key ? "catalog-category-button active" : "catalog-category-button"}
                      >
                        {selectedCategory === collection.key ? "Ver todo" : "Ver categoría"}
                      </button>
                    </article>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      ) : null}

      <section className="catalog-section" style={{ paddingBottom: 42 }}>
        <div className="catalog-container">
          <div className="panel-card catalog-panel">
            <div className="panel-header">
              <div>
                <h2>{selectedCategory === "all" ? "Catalogo completo" : categoryMeta[selectedCategory]?.title || selectedCategory}</h2>
                <p className="panel-subtitle">
                  {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""} disponibles para tu compra.
                </p>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="catalog-product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={addProduct} />
                ))}
              </div>
            ) : (
              <p style={{ textAlign: "center", padding: "30px 20px", color: "#9ca3af" }}>
                No encontramos productos para esta busqueda. Prueba con otra categoria o palabra clave.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
