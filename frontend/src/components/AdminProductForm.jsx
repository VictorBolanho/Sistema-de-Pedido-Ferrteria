import { useState } from "react";
import { post } from "../services/api";

export default function AdminProductForm({ onProductAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "herramientas",
    price: "",
    stock: "",
    imageUrl: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const categories = ["herramientas", "accesorios", "ceramicas", "pegantes"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image_url: formData.imageUrl.trim() || null
      };

      const product = await post("/products", payload, token);
      setMessage(`✅ Producto "${product.name}" creado exitosamente`);
      
      setFormData({
        name: "",
        sku: "",
        category: "herramientas",
        price: "",
        stock: "",
        imageUrl: ""
      });

      if (onProductAdded) {
        onProductAdded(product);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "white",
      padding: "20px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      marginBottom: "20px"
    }}>
      <h3 style={{ marginBottom: "15px", color: "#0f172a" }}>Crear Nuevo Producto</h3>
      
      {message && (
        <div style={{
          padding: "12px",
          marginBottom: "15px",
          borderRadius: "4px",
          background: message.includes("✅") ? "#d1fae5" : "#fee2e2",
          color: message.includes("✅") ? "#065f46" : "#991b1b",
          fontSize: "0.9rem"
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem", fontWeight: "500" }}>
              Nombre del Producto *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Taladro Percutor 20V"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "0.9rem"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem", fontWeight: "500" }}>
              SKU *
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
              placeholder="TOOL-DRILL-001"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "0.9rem"
              }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem", fontWeight: "500" }}>
              Categoría *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "0.9rem"
              }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem", fontWeight: "500" }}>
              Precio ($) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              placeholder="89.99"
              step="0.01"
              min="0"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "0.9rem"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem", fontWeight: "500" }}>
              Stock *
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              placeholder="50"
              min="0"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "0.9rem"
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem", fontWeight: "500" }}>
            URL de Imagen
          </label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "0.9rem"
            }}
          />
          <small style={{ color: "#6b7280", marginTop: "4px", display: "block" }}>
            Opcional. Usa URLs públicas (ej: Unsplash, Pexels)
          </small>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px",
            background: loading ? "#d1d5db" : "#f97316",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "500",
            fontSize: "0.95rem"
          }}
        >
          {loading ? "Creando..." : "Crear Producto"}
        </button>
      </form>
    </div>
  );
}
