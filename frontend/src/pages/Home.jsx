import { useModal } from "../context/ModalContext";

const featureCards = [
  {
    title: "Portafolio ferretero confiable",
    text: "Productos de alta rotacion, referencias para obra, remodelacion y mantenimiento con una vitrina digital clara y actualizada.",
  },
  {
    title: "Atencion comercial cercana",
    text: "Cada cliente cuenta con un vendedor asignado para acompanamiento, seguimiento y comisiones alineadas a la gestion comercial.",
  },
  {
    title: "Pedidos con trazabilidad",
    text: "El cliente consulta estados, el vendedor revisa sus cuentas y el administrador controla aprobaciones e inventario desde un solo portal.",
  },
];

const stats = [
  { value: "24/7", label: "Recepcion digital de solicitudes" },
  { value: "1 portal", label: "Operacion comercial centralizada" },
  { value: "100%", label: "Visibilidad del ciclo del pedido" },
];

export default function Home() {
  const { openLoginModal, openRegisterModal } = useModal();

  return (
    <div style={{ minHeight: "100vh", background: "#fff7ed" }}>
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at top left, rgba(251,191,36,0.28), transparent 28%), linear-gradient(135deg, #111827 0%, #1f2937 38%, #7c2d12 100%)",
          color: "white",
          padding: "96px 24px 88px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0.25))",
          }}
        />

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            position: "relative",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "40px",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                padding: "8px 14px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.14)",
                marginBottom: "20px",
                fontWeight: "700",
                letterSpacing: "0.02em",
              }}
            >
              Plataforma comercial Andimat
            </div>
            <h1
              style={{
                fontSize: "clamp(2.5rem, 6vw, 4.6rem)",
                lineHeight: 1.02,
                margin: "0 0 22px 0",
                maxWidth: "760px",
              }}
            >
              Tu ferreteria conectada a un portal de pedidos moderno, agil y visual.
            </h1>
            <p
              style={{
                fontSize: "1.14rem",
                lineHeight: 1.8,
                color: "rgba(255,255,255,0.86)",
                maxWidth: "680px",
                marginBottom: "30px",
              }}
            >
              Registra tu negocio, solicita acceso y empieza a comprar con seguimiento de pedidos,
              inventario visible y acompanamiento de un asesor comercial dedicado.
            </p>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <button
                onClick={openRegisterModal}
                style={{
                  background: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
                  color: "white",
                  border: "none",
                  padding: "14px 24px",
                  borderRadius: "999px",
                  fontWeight: "800",
                  cursor: "pointer",
                  boxShadow: "0 18px 34px rgba(249,115,22,0.35)",
                }}
              >
                Solicitar registro
              </button>
              <button
                onClick={openLoginModal}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.18)",
                  padding: "14px 24px",
                  borderRadius: "999px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Ingresar al portal
              </button>
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "28px",
              padding: "24px",
              boxShadow: "0 24px 60px rgba(15,23,42,0.28)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "22px",
                padding: "22px",
                color: "#0f172a",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>Panel comercial</p>
                  <h3 style={{ margin: "4px 0 0 0", fontSize: "1.25rem" }}>Resumen de pedidos</h3>
                </div>
                <div
                  style={{
                    background: "#fed7aa",
                    color: "#9a3412",
                    padding: "8px 12px",
                    borderRadius: "999px",
                    fontWeight: "700",
                    fontSize: "0.84rem",
                  }}
                >
                  En linea
                </div>
              </div>

              <div style={{ display: "grid", gap: "12px" }}>
                {[
                  ["Cliente activo", "Ferreteria Central SAS"],
                  ["Pedido aprobado", "Obra gris y herramientas"],
                  ["Vendedor asignado", "Carlos Lopez"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      background: "#fff7ed",
                      border: "1px solid #fdba74",
                      borderRadius: "16px",
                      padding: "14px 16px",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#9a3412" }}>{label}</p>
                    <p style={{ margin: "6px 0 0 0", fontWeight: "700" }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "32px 24px", marginTop: "-28px" }}>
        <div
          style={{
            maxWidth: "1120px",
            margin: "0 auto",
            background: "white",
            borderRadius: "28px",
            boxShadow: "0 22px 55px rgba(15,23,42,0.08)",
            padding: "22px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
          }}
        >
          {stats.map((item) => (
            <div key={item.label} style={{ padding: "12px 14px" }}>
              <p style={{ margin: 0, fontSize: "1.8rem", fontWeight: "800", color: "#ea580c" }}>{item.value}</p>
              <p style={{ margin: "8px 0 0 0", color: "#475569" }}>{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "80px 24px 32px" }}>
        <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
          <div style={{ maxWidth: "700px", marginBottom: "36px" }}>
            <p style={{ color: "#ea580c", fontWeight: "800", marginBottom: "10px" }}>Por que elegir Andimat</p>
            <h2 style={{ fontSize: "2.4rem", lineHeight: 1.1, color: "#111827", margin: "0 0 16px 0" }}>
              Una experiencia pensada para distribuidores, ferreterias y negocios que necesitan respuesta rapida.
            </h2>
            <p style={{ color: "#64748b", lineHeight: 1.7, margin: 0 }}>
              Combinamos un catalogo digital claro, operacion comercial ordenada y herramientas visuales
              para que tu equipo compre mejor y tome decisiones con mas confianza.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "22px",
            }}
          >
            {featureCards.map((card, index) => (
              <div
                key={card.title}
                style={{
                  background: index === 1 ? "#fff7ed" : "white",
                  borderRadius: "24px",
                  padding: "28px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 18px 40px rgba(15,23,42,0.05)",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #fdba74 0%, #f97316 100%)",
                    marginBottom: "18px",
                  }}
                />
                <h3 style={{ marginTop: 0, color: "#111827" }}>{card.title}</h3>
                <p style={{ marginBottom: 0, color: "#64748b", lineHeight: 1.7 }}>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "42px 24px 90px" }}>
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          <div
            style={{
              background: "#111827",
              color: "white",
              borderRadius: "28px",
              padding: "30px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -40,
                right: -20,
                width: 140,
                height: 140,
                borderRadius: "999px",
                background: "rgba(249,115,22,0.24)",
              }}
            />
            <h3 style={{ marginTop: 0, fontSize: "1.65rem" }}>Nuevos clientes bienvenidos</h3>
            <p style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}>
              Si tu negocio quiere comprar por portal, registra tus datos y nuestro equipo validara tu solicitud
              para habilitar el acceso comercial.
            </p>
            <div
              style={{
                marginTop: "10px",
                display: "inline-flex",
                padding: "12px 16px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontWeight: "700",
              }}
            >
              Registro comercial guiado por Andimat
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)",
              borderRadius: "28px",
              padding: "30px",
              border: "1px solid #fdba74",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#111827", fontSize: "1.65rem" }}>Operacion comercial visible</h3>
            <p style={{ color: "#64748b", lineHeight: 1.7 }}>
              El cliente conoce el estado del pedido, el vendedor hace seguimiento a su cartera y el administrador
              mantiene control de inventario y aprobaciones.
            </p>
            <button
              onClick={openLoginModal}
              style={{
                marginTop: "8px",
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                color: "white",
                border: "none",
                borderRadius: "999px",
                padding: "12px 18px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              Ya tengo acceso
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
