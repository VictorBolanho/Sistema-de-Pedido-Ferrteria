import { useState, useRef } from "react";
import Papa from "papaparse";
import { useAuth } from "../context/AuthContext";
import { post } from "../services/api";

export default function AdminBulkUpload({ onProductsAdded }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);
  const { token } = useAuth();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage("");
    setResults(null);

    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          await uploadProducts(results.data);
        },
        error: (error) => {
          setMessage(`❌ Error al parsear CSV: ${error.message}`);
          setLoading(false);
        }
      });
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      setLoading(false);
    }
  };

  const uploadProducts = async (csvData) => {
    try {
      if (!token) {
        throw new Error("Debes iniciar sesión para cargar productos.");
      }

      // Normalize CSV data to API format
      const products = csvData.map((row) => ({
        name: row.name?.trim(),
        sku: row.sku?.trim().toUpperCase(),
        category: row.category?.trim().toLowerCase(),
        price: parseFloat(row.price),
        stock: parseInt(row.stock),
        image_url: row.image_url?.trim() || null
      })).filter((p) => p.name && p.sku && p.category && p.price && p.stock);

      if (products.length === 0) {
        throw new Error("No hay productos válidos en el CSV");
      }

      const created = await post("/products/bulk", { products }, token);
      setResults({
        total: products.length,
        created: created.length,
        skipped: products.length - created.length
      });
      setMessage(`✅ ${created.length} producto(s) creado(s) exitosamente`);

      if (onProductsAdded) {
        onProductsAdded(created);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
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
      <h3 style={{ marginBottom: "15px", color: "#0f172a" }}>Carga Masiva de Productos</h3>

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

      {results && (
        <div style={{
          padding: "12px",
          marginBottom: "15px",
          borderRadius: "4px",
          background: "#eff6ff",
          color: "#0c4a6e",
          fontSize: "0.9rem"
        }}>
          <strong>Resultados:</strong>
          <ul style={{ margin: "8px 0 0 20px" }}>
            <li>Total en CSV: {results.total}</li>
            <li>Creados: {results.created}</li>
            <li>Omitidos (SKU duplicado): {results.skipped}</li>
          </ul>
        </div>
      )}

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "10px", fontSize: "0.9rem", fontWeight: "500" }}>
          Selecciona tu archivo CSV
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={loading}
          style={{
            display: "block",
            padding: "8px",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        />
        <small style={{ color: "#6b7280", marginTop: "8px", display: "block" }}>
          Formato esperado: name, sku, category, price, stock, image_url (opcional)
        </small>
      </div>

      {/* CSV Template */}
      <div style={{
        padding: "12px",
        background: "#f9fafb",
        borderRadius: "4px",
        marginTop: "15px",
        fontSize: "0.85rem"
      }}>
        <strong>Ejemplo de CSV:</strong>
        <pre style={{
          background: "#ffffff",
          padding: "10px",
          borderRadius: "4px",
          overflow: "auto",
          marginTop: "8px",
          border: "1px solid #e5e7eb"
        }}>
{`name,sku,category,price,stock,image_url
Taladro Percutor 18V,TOOL-DRILL-001,herramientas,89.99,15,https://example.com/drill.jpg
Sierra Circular 7.25",TOOL-SAW-001,herramientas,65.50,22,https://example.com/saw.jpg
Baldosa Cerámica 30x30,CER-TILE-001,ceramicas,3.50,500,https://example.com/tile.jpg`}
        </pre>
      </div>

      <a
        href="data:text/csv,name,sku,category,price,stock,image_url%0ATaladro%20Percutor%2018V,TOOL-DRILL-001,herramientas,89.99,15,https://example.com/drill.jpg%0ASierra%20Circular%207.25,TOOL-SAW-001,herramientas,65.50,22,https://example.com/saw.jpg"
        download="template.csv"
        style={{
          display: "inline-block",
          marginTop: "12px",
          padding: "8px 16px",
          background: "#e5e7eb",
          color: "#1f2937",
          textDecoration: "none",
          borderRadius: "4px",
          fontSize: "0.9rem",
          fontWeight: "500"
        }}
      >
        📥 Descargar Plantilla CSV
      </a>
    </div>
  );
}
