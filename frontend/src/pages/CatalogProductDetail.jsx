import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getProductById, getProducts } from "../services/products.service";

const detailCopy = {
  valdosas: {
    title: "Ideal para pisos y paredes con alta rotacion",
    description:
      "Una referencia pensada para remodelaciones residenciales, constructoras y acabados comerciales donde importa la presentacion y la durabilidad.",
  },
  pegantes: {
    title: "Apoyo tecnico para una instalacion segura",
    description:
      "Producto clave para pegado, sellado o remate final, recomendado para obras nuevas y mantenimiento en mercado ferretero colombiano.",
  },
  banos: {
    title: "Linea de bano para proyectos y reposicion",
    description:
      "Pensado para ventas de remodelacion con buena salida en vivienda, constructoras y reposicion de espacios sanitarios.",
  },
  cocinas: {
    title: "Funcion y presentacion para cocina",
    description:
      "Una opcion con imagen comercial fuerte para proyectos de cocina, remodelacion y reposicion residencial.",
  },
  acabados: {
    title: "Complemento de obra con alta utilidad",
    description:
      "Una referencia que cierra proyectos, mejora acabados y facilita ventas cruzadas con otras lineas del catalogo.",
  },
};

function getRecommendedUsage(product) {
  const category = String(product.category || "").toLowerCase();
  const unitsSold = Number(product.unitsSold || 0);

  return [
    unitsSold > 0
      ? `${unitsSold.toLocaleString("es-CO")} unidades vendidas en el portal`
      : "Nueva referencia disponible para pedidos",
    `Stock actual de ${Number(product.stock || 0).toLocaleString("es-CO")} unidades`,
    category === "valdosas"
      ? "Recomendada para obra nueva, remodelacion y reposicion"
      : category === "pegantes"
        ? "Excelente para venta cruzada con pisos, porcelanatos y sanitarios"
        : category === "banos"
          ? "Buena salida en remodelacion de viviendas y proyectos institucionales"
          : "Aporta valor en pedidos complementarios y paquetes de obra",
  ];
}

export default function CatalogProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { addProduct, items } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProductDetail() {
      setLoading(true);
      setError("");

      try {
        const [productData, allProducts] = await Promise.all([
          getProductById(id, token),
          getProducts(token),
        ]);

        setProduct(productData);
        setRelatedProducts(
          (Array.isArray(allProducts) ? allProducts : [])
            .filter(
              (candidate) =>
                candidate.id !== productData.id &&
                candidate.active !== false &&
                candidate.category === productData.category
            )
            .slice(0, 3)
        );
      } catch (err) {
        setError(err.message || "No se pudo cargar el detalle del producto.");
      } finally {
        setLoading(false);
      }
    }

    loadProductDetail();
  }, [id, token]);

  const cartQuantity = useMemo(() => {
    const cartItem = items.find((item) => item.product.id === id);
    return cartItem?.quantity ?? 0;
  }, [id, items]);

  if (loading) {
    return (
      <div className="page-column">
        <div className="content-layout">
          <div className="panel-card">
            <p style={{ margin: 0 }}>Cargando detalle del producto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-column">
        <div className="content-layout">
          <div className="panel-card">
            <p className="error">{error || "Producto no encontrado."}</p>
            <button type="button" onClick={() => navigate("/catalog")}>
              Volver al catalogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const copy = detailCopy[product.category] || {
    title: "Producto listo para tu proximo pedido",
    description:
      "Referencia disponible dentro del portal para compras directas, reposicion y venta de proyectos.",
  };

  const usagePoints = getRecommendedUsage(product);

  return (
    <div className="page-column" style={{ paddingTop: 18 }}>
      <div className="content-layout">
        <div className="catalog-detail-shell">
          <div className="catalog-detail-breadcrumb">
            <Link to="/catalog">Catalogo</Link>
            <span>/</span>
            <span>{product.name}</span>
          </div>

          <section className="catalog-detail-hero">
            <div className="catalog-detail-media">
              <img src={product.imageUrl} alt={product.name} />
            </div>
            <div className="catalog-detail-copy">
              <div className="catalog-detail-tags">
                <span className="catalog-chip catalog-chip-dark">
                  {String(product.category || "general").toUpperCase()}
                </span>
                {Number(product.unitsSold || 0) > 0 ? (
                  <span className="catalog-chip catalog-chip-sale">
                    {Number(product.unitsSold).toLocaleString("es-CO")} vendidas
                  </span>
                ) : null}
              </div>
              <h1>{product.name}</h1>
              <p className="catalog-detail-lead">{copy.description}</p>
              <div className="catalog-detail-price-row">
                <strong>${Number(product.price).toLocaleString("es-CO")}</strong>
                <span>Precio unitario en pesos colombianos</span>
              </div>
              <div className="catalog-detail-summary">
                <div>
                  <span>SKU</span>
                  <strong>{product.sku}</strong>
                </div>
                <div>
                  <span>Stock</span>
                  <strong>{Number(product.stock).toLocaleString("es-CO")} und</strong>
                </div>
                <div>
                  <span>Pedidos</span>
                  <strong>{Number(product.ordersCount || 0).toLocaleString("es-CO")}</strong>
                </div>
              </div>
              <div className="catalog-detail-actions">
                <button type="button" onClick={() => addProduct(product)}>
                  {cartQuantity > 0 ? `Agregar otra unidad (${cartQuantity} en carrito)` : "Agregar al carrito"}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => navigate("/cart")}
                >
                  Ir al carrito
                </button>
              </div>
            </div>
          </section>

          <section className="catalog-detail-grid">
            <article className="panel-card">
              <h2>{copy.title}</h2>
              <p className="panel-subtitle">
                Este producto encaja bien en pedidos donde el cliente busca rapidez, disponibilidad y referencias que ya tienen salida comercial.
              </p>
              <div className="mini-list" style={{ marginTop: 18 }}>
                {usagePoints.map((point) => (
                  <div key={point} className="mini-item">
                    <strong>{point}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel-card">
              <h2>Ventajas para tu compra</h2>
              <div className="mini-list" style={{ marginTop: 18 }}>
                <div className="mini-item">
                  <strong>Compra desde portal con trazabilidad completa del pedido</strong>
                </div>
                <div className="mini-item">
                  <strong>Visualizacion clara de categoria, stock y precio real</strong>
                </div>
                <div className="mini-item">
                  <strong>Ideal para combinar con otras referencias relacionadas</strong>
                </div>
              </div>
            </article>
          </section>

          {relatedProducts.length > 0 ? (
            <section className="panel-card">
              <div className="panel-header">
                <div>
                  <h2>Tambien te puede interesar</h2>
                  <p className="panel-subtitle">
                    Productos de la misma linea para completar tu pedido.
                  </p>
                </div>
              </div>
              <div className="catalog-related-grid">
                {relatedProducts.map((related) => (
                  <button
                    key={related.id}
                    type="button"
                    className="catalog-related-card"
                    onClick={() => navigate(`/catalog/${related.id}`)}
                  >
                    <img src={related.imageUrl} alt={related.name} />
                    <strong>{related.name}</strong>
                    <span>${Number(related.price).toLocaleString("es-CO")}</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
