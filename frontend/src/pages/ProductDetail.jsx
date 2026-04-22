import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getProductById,
  updateProductFull,
  uploadProductImage,
  deleteProduct,
} from "../services/products.service";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: "",
    active: true,
  });
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError("");
      setMessage("");

      try {
        const productData = await getProductById(id, token);
        setProduct(productData);
        setFormData({
          name: productData.name || "",
          sku: productData.sku || "",
          price: String(productData.price ?? ""),
          stock: String(productData.stock ?? ""),
          category: productData.category || "",
          imageUrl: productData.imageUrl || "",
          active: productData.active === true,
        });
        setPreviewUrl(productData.imageUrl || "");
      } catch (err) {
        setError(err.message || "No se pudo cargar el producto.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id, token]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));

    if (name === "imageUrl") {
      setPreviewUrl(value);
    }
  };

  const handleUploadFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    setError("");
    setMessage("");
    setUploading(true);

    try {
      const formDataPayload = new FormData();
      formDataPayload.append("image", file);

      const url = await uploadProductImage(formDataPayload, token);
      setFormData((prev) => ({ ...prev, imageUrl: url }));
      setPreviewUrl(url);
      setMessage("Imagen subida correctamente.");
    } catch (err) {
      setError(err.message || "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const name = formData.name.trim();
    const sku = formData.sku.trim();
    const category = formData.category.trim();
    const price = Number(formData.price);
    const stock = Number(formData.stock);

    if (!name || !sku || !category) {
      setError("Nombre, SKU y categoría son obligatorios.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError("El precio debe ser un número válido mayor o igual a 0.");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setError("El stock debe ser un número entero mayor o igual a 0.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name,
        sku,
        price,
        stock,
        category,
        image_url: formData.imageUrl.trim() || null,
        active: Boolean(formData.active),
      };

      const updated = await updateProductFull(id, payload, token);
      setProduct(updated);
      setFormData({
        name: updated.name || "",
        sku: updated.sku || "",
        price: String(updated.price ?? ""),
        stock: String(updated.stock ?? ""),
        category: updated.category || "",
        imageUrl: updated.imageUrl || "",
        active: updated.active === true,
      });
      setPreviewUrl(updated.imageUrl || "");
      setMessage("Producto actualizado correctamente.");
    } catch (err) {
      setError(err.message || "No se pudo actualizar el producto.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const updated = await updateProductFull(
        id,
        { active: !formData.active },
        token
      );
      setProduct(updated);
      setFormData((prev) => ({ ...prev, active: updated.active === true }));
      setMessage(updated.active ? "Producto activado." : "Producto desactivado.");
    } catch (err) {
      setError(err.message || "No se pudo cambiar el estado del producto.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setError("");
    setMessage("");
    setSaving(true);

    try {
      await deleteProduct(id, token);
      navigate("/products");
    } catch (err) {
      setError(err.message || "No se pudo eliminar el producto.");
    } finally {
      setSaving(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return <div className="page-column">Cargando producto...</div>;
  }

  if (!product) {
    return (
      <div className="page-column">
        <p className="error">No se encontró el producto.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            background: "#2563eb",
            color: "white",
            border: "none",
            cursor: "pointer",
            marginTop: "16px",
          }}
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="page-column">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1>Detalle del Producto</h1>
          <p style={{ color: "#6b7280" }}>Edita los campos y guarda los cambios desde esta pantalla.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            background: "#f97316",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Volver a productos
        </button>
      </div>

      {message ? (
        <div style={{ marginBottom: "16px", padding: "14px", borderRadius: "8px", background: "#d1fae5", color: "#065f46" }}>
          {message}
        </div>
      ) : null}
      {error ? (
        <div style={{ marginBottom: "16px", padding: "14px", borderRadius: "8px", background: "#fee2e2", color: "#991b1b" }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: "grid", gap: "24px" }}>
        <div style={{ display: "grid", gap: "24px", gridTemplateColumns: "1fr 320px" }}>
          <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
            <h2 style={{ marginTop: 0 }}>Información del producto</h2>
            <form onSubmit={handleSave} style={{ display: "grid", gap: "18px" }}>
              <div style={{ display: "grid", gap: "12px" }}>
                <label style={{ fontWeight: 600 }}>Nombre</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                />
              </div>
              <div style={{ display: "grid", gap: "12px" }}>
                <label style={{ fontWeight: 600 }}>SKU</label>
                <input
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                />
              </div>
              <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ display: "grid", gap: "12px" }}>
                  <label style={{ fontWeight: 600 }}>Precio</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                  />
                </div>
                <div style={{ display: "grid", gap: "12px" }}>
                  <label style={{ fontWeight: 600 }}>Stock</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gap: "12px" }}>
                <label style={{ fontWeight: 600 }}>Categoría</label>
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                />
              </div>
              <div style={{ display: "grid", gap: "12px" }}>
                <label style={{ fontWeight: 600 }}>URL de imagen</label>
                <input
                  name="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/product.jpg"
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                />
              </div>
              <div style={{ display: "grid", gap: "12px" }}>
                <label style={{ fontWeight: 600 }}>Subir imagen desde el computador</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadFile}
                  disabled={uploading}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                />
              </div>
              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "10px", fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                  />
                  Activo
                </label>
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "12px 18px",
                    borderRadius: "8px",
                    background: "#16a34a",
                    color: "white",
                    border: "none",
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
                <button
                  type="button"
                  onClick={handleToggleActive}
                  disabled={saving}
                  style={{
                    padding: "12px 18px",
                    borderRadius: "8px",
                    background: formData.active ? "#ef4444" : "#15803d",
                    color: "white",
                    border: "none",
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  {formData.active ? "Desactivar producto" : "Activar producto"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  disabled={saving}
                  style={{
                    padding: "12px 18px",
                    borderRadius: "8px",
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  Eliminar producto
                </button>
              </div>
              {confirmDelete ? (
                <div style={{ marginTop: "14px", padding: "16px", borderRadius: "12px", background: "#fef2f2", border: "1px solid #fecaca" }}>
                  <p style={{ margin: 0, color: "#991b1b" }}>¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.</p>
                  <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={saving}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        background: "#b91c1c",
                        color: "white",
                        border: "none",
                        cursor: saving ? "not-allowed" : "pointer",
                      }}
                    >
                      {saving ? "Eliminando..." : "Confirmar eliminación"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      disabled={saving}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        background: "#e5e7eb",
                        color: "#111827",
                        border: "none",
                        cursor: saving ? "not-allowed" : "pointer",
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : null}
            </form>
          </div>

          <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
            <h2 style={{ marginTop: 0 }}>Preview</h2>
            <div style={{ borderRadius: "12px", overflow: "hidden", background: "#f8fafc", minHeight: "260px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={formData.name}
                  style={{ width: "100%", objectFit: "contain", maxHeight: "300px" }}
                  onError={(event) => {
                    event.target.src = "";
                  }}
                />
              ) : (
                <div style={{ color: "#6b7280", textAlign: "center", padding: "24px" }}>
                  Agrega la URL de una imagen para ver la vista previa.
                </div>
              )}
            </div>
            <div style={{ marginTop: "20px" }}>
              <p style={{ margin: 0, fontWeight: 600 }}>SKU</p>
              <p style={{ margin: 0, color: "#374151" }}>{product.sku}</p>
            </div>
            <div style={{ marginTop: "18px" }}>
              <p style={{ margin: 0, fontWeight: 600 }}>Creado</p>
              <p style={{ margin: 0, color: "#374151" }}>{new Date(product.createdAt).toLocaleString()}</p>
            </div>
            <div style={{ marginTop: "18px" }}>
              <p style={{ margin: 0, fontWeight: 600 }}>Estado</p>
              <p style={{ margin: 0, color: product.active ? "#166534" : "#991b1b" }}>
                {product.active ? "Activo" : "Inactivo"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
