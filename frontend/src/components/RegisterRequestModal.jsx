import { useState } from "react";
import { postFormData } from "../services/api";

export default function RegisterRequestModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    companyName: "",
    taxId: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [files, setFiles] = useState({
    rutFile: null,
    chamberFile: null,
    idFile: null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleFileChange(event) {
    const { name, files: fileList } = event.target;
    if (fileList && fileList.length > 0) {
      setFiles((prev) => ({
        ...prev,
        [name]: fileList[0],
      }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      // Validate required fields
      if (!formData.companyName || !formData.taxId || !formData.contactName || !formData.email || !formData.phone || !formData.address) {
        throw new Error("Todos los campos obligatorios deben ser completados");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("El correo electrónico no es válido");
      }

      // Create FormData for multipart submission
      const submitData = new FormData();
      submitData.append("company_name", formData.companyName);
      submitData.append("tax_id", formData.taxId);
      submitData.append("contact_name", formData.contactName);
      submitData.append("email", formData.email);
      submitData.append("phone", formData.phone);
      submitData.append("address", formData.address);

      if (files.rutFile) {
        submitData.append("rut_file", files.rutFile);
      }
      if (files.chamberFile) {
        submitData.append("chamber_file", files.chamberFile);
      }
      if (files.idFile) {
        submitData.append("id_file", files.idFile);
      }

      await postFormData("/access-requests", submitData);

      setSuccess("¡Solicitud de acceso enviada exitosamente! Nos pondremos en contacto pronto.");
      setFormData({
        companyName: "",
        taxId: "",
        contactName: "",
        email: "",
        phone: "",
        address: "",
      });
      setFiles({
        rutFile: null,
        chamberFile: null,
        idFile: null,
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "No se pudo enviar la solicitud");
    } finally {
      setSubmitting(false);
    }
  }

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        overflow: "auto",
        paddingY: "20px",
      }}
      onClick={handleOverlayClick}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "40px",
          maxWidth: "500px",
          width: "90%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          position: "relative",
          margin: "20px 0",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
            color: "#6b7280",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#000")}
          onMouseLeave={(e) => (e.target.style.color = "#6b7280")}
        >
          ✕
        </button>

        {/* Title */}
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "#0f172a",
            marginBottom: "8px",
            paddingRight: "30px",
          }}
        >
          Solicitar Acceso
        </h2>

        <p
          style={{
            fontSize: "0.9rem",
            color: "#6b7280",
            marginBottom: "24px",
          }}
        >
          Complete el formulario para solicitar acceso a nuestra plataforma
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Company Name */}
          <div>
            <label
              htmlFor="company-name"
              style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              Nombre de la Empresa *
            </label>
            <input
              id="company-name"
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d0d5dd",
                borderRadius: "6px",
                fontSize: "0.95rem",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#f97316")}
              onBlur={(e) => (e.target.style.borderColor = "#d0d5dd")}
            />
          </div>

          {/* Tax ID */}
          <div>
            <label
              htmlFor="tax-id"
              style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              RUT / NIT *
            </label>
            <input
              id="tax-id"
              type="text"
              name="taxId"
              value={formData.taxId}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d0d5dd",
                borderRadius: "6px",
                fontSize: "0.95rem",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#f97316")}
              onBlur={(e) => (e.target.style.borderColor = "#d0d5dd")}
            />
          </div>

          {/* Contact Name */}
          <div>
            <label
              htmlFor="contact-name"
              style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              Nombre del Contacto *
            </label>
            <input
              id="contact-name"
              type="text"
              name="contactName"
              value={formData.contactName}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d0d5dd",
                borderRadius: "6px",
                fontSize: "0.95rem",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#f97316")}
              onBlur={(e) => (e.target.style.borderColor = "#d0d5dd")}
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="register-email"
              style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              Correo Electrónico *
            </label>
            <input
              id="register-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d0d5dd",
                borderRadius: "6px",
                fontSize: "0.95rem",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#f97316")}
              onBlur={(e) => (e.target.style.borderColor = "#d0d5dd")}
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              Teléfono *
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d0d5dd",
                borderRadius: "6px",
                fontSize: "0.95rem",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#f97316")}
              onBlur={(e) => (e.target.style.borderColor = "#d0d5dd")}
            />
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="address"
              style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              Dirección *
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              rows="3"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d0d5dd",
                borderRadius: "6px",
                fontSize: "0.95rem",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
                resize: "vertical",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#f97316")}
              onBlur={(e) => (e.target.style.borderColor = "#d0d5dd")}
            />
          </div>

          {/* File Uploads Section */}
          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              paddingTop: "16px",
              marginTop: "8px",
            }}
          >
            <p
              style={{
                fontSize: "0.9rem",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "12px",
              }}
            >
              Documentos (Opcionales)
            </p>

            {/* RUT File */}
            <div style={{ marginBottom: "12px" }}>
              <label
                htmlFor="rut-file"
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  color: "#6b7280",
                  marginBottom: "6px",
                }}
              >
                RUT / Cédula
              </label>
              <input
                id="rut-file"
                type="file"
                name="rutFile"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                style={{
                  width: "100%",
                  padding: "8px 0",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              />
              {files.rutFile && (
                <p style={{ fontSize: "0.8rem", color: "#10b981", marginTop: "4px" }}>
                  ✓ {files.rutFile.name}
                </p>
              )}
            </div>

            {/* Chamber File */}
            <div style={{ marginBottom: "12px" }}>
              <label
                htmlFor="chamber-file"
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  color: "#6b7280",
                  marginBottom: "6px",
                }}
              >
                Cámara de Comercio
              </label>
              <input
                id="chamber-file"
                type="file"
                name="chamberFile"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                style={{
                  width: "100%",
                  padding: "8px 0",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              />
              {files.chamberFile && (
                <p style={{ fontSize: "0.8rem", color: "#10b981", marginTop: "4px" }}>
                  ✓ {files.chamberFile.name}
                </p>
              )}
            </div>

            {/* ID File */}
            <div>
              <label
                htmlFor="id-file"
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  color: "#6b7280",
                  marginBottom: "6px",
                }}
              >
                Identificación
              </label>
              <input
                id="id-file"
                type="file"
                name="idFile"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                style={{
                  width: "100%",
                  padding: "8px 0",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              />
              {files.idFile && (
                <p style={{ fontSize: "0.8rem", color: "#10b981", marginTop: "4px" }}>
                  ✓ {files.idFile.name}
                </p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: "#fee2e2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                padding: "10px 12px",
                borderRadius: "6px",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div
              style={{
                background: "#dcfce7",
                border: "1px solid #bbf7d0",
                color: "#166534",
                padding: "10px 12px",
                borderRadius: "6px",
                fontSize: "0.9rem",
              }}
            >
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: "#f97316",
              color: "white",
              border: "none",
              padding: "10px 16px",
              fontSize: "0.95rem",
              fontWeight: "600",
              borderRadius: "6px",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
              transition: "all 0.2s",
              marginTop: "16px",
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.target.style.background = "#ea580c";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#f97316";
            }}
          >
            {submitting ? "Enviando..." : "Solicitar Acceso"}
          </button>
        </form>
      </div>
    </div>
  );
}
