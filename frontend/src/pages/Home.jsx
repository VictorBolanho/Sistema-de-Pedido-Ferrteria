import { useModal } from "../context/ModalContext";

export default function Home() {
  const { openLoginModal } = useModal();

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* HERO SECTION */}
      <section style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "white",
        padding: "100px 24px",
        textAlign: "center",
        minHeight: "600px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <h1 style={{
          fontSize: "3.5rem",
          fontWeight: "700",
          marginBottom: "20px",
          lineHeight: 1.2
        }}>
          Soluciones para ferreterías y distribuidores
        </h1>
        <p style={{
          fontSize: "1.3rem",
          marginBottom: "40px",
          opacity: 0.9,
          maxWidth: "700px"
        }}>
          Realiza pedidos de forma rápida y eficiente con Andimat
        </p>
        <div style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <button
            onClick={openLoginModal}
            style={{
              background: "#f97316",
              color: "white",
              border: "none",
              padding: "14px 40px",
              fontSize: "1rem",
              fontWeight: "600",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#ea580c";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#f97316";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Solicitar acceso
          </button>
          <button
            onClick={openLoginModal}
            style={{
              background: "white",
              color: "#0f172a",
              border: "none",
              padding: "14px 40px",
              fontSize: "1rem",
              fontWeight: "600",
              borderRadius: "8px",
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-block",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => {
              e.style.background = "#f0f0f0";
              e.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.style.background = "white";
              e.style.transform = "translateY(0)";
            }}
          >
            Ingresar
          </button>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section style={{
        padding: "80px 24px",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <h2 style={{
          fontSize: "2rem",
          fontWeight: "700",
          color: "#0f172a",
          textAlign: "center",
          marginBottom: "50px"
        }}>
          ¿Por qué elegir Andimat?
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "40px"
        }}>
          {/* Benefit 1 */}
          <div style={{
            background: "white",
            padding: "40px 30px",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            textAlign: "center",
            transition: "transform 0.3s, box-shadow 0.3s"
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
            }}
          >
            <div style={{
              fontSize: "3rem",
              marginBottom: "20px"
            }}>
              🛒
            </div>
            <h3 style={{
              fontSize: "1.3rem",
              fontWeight: "600",
              color: "#0f172a",
              marginBottom: "15px"
            }}>
              Pedidos en línea
            </h3>
            <p style={{
              fontSize: "0.95rem",
              color: "#6b7280",
              lineHeight: 1.6
            }}>
              Accede a nuestro catálogo completo de productos disponibles y realiza tus pedidos cuando lo necesites, desde cualquier lugar.
            </p>
          </div>

          {/* Benefit 2 */}
          <div style={{
            background: "white",
            padding: "40px 30px",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            textAlign: "center",
            transition: "transform 0.3s, box-shadow 0.3s"
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
            }}
          >
            <div style={{
              fontSize: "3rem",
              marginBottom: "20px"
            }}>
              👥
            </div>
            <h3 style={{
              fontSize: "1.3rem",
              fontWeight: "600",
              color: "#0f172a",
              marginBottom: "15px"
            }}>
              Asesores especializados
            </h3>
            <p style={{
              fontSize: "0.95rem",
              color: "#6b7280",
              lineHeight: 1.6
            }}>
              Cuenta con un asesor comercial dedicado que te guiará en tus compras y te brindará asesoramiento personalizado.
            </p>
          </div>

          {/* Benefit 3 */}
          <div style={{
            background: "white",
            padding: "40px 30px",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            textAlign: "center",
            transition: "transform 0.3s, box-shadow 0.3s"
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
            }}
          >
            <div style={{
              fontSize: "3rem",
              marginBottom: "20px"
            }}>
              ⚙️
            </div>
            <h3 style={{
              fontSize: "1.3rem",
              fontWeight: "600",
              color: "#0f172a",
              marginBottom: "15px"
            }}>
              Gestión eficiente
            </h3>
            <p style={{
              fontSize: "0.95rem",
              color: "#6b7280",
              lineHeight: 1.6
            }}>
              Controla tus pedidos, historial de compras y comisiones en un solo lugar. Acceso rápido a toda tu información.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section style={{
        background: "white",
        padding: "80px 24px",
        borderTop: "1px solid #e5e7eb"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{
            fontSize: "2rem",
            fontWeight: "700",
            color: "#0f172a",
            textAlign: "center",
            marginBottom: "60px"
          }}>
            ¿Cómo funciona?
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "30px",
            maxWidth: "900px",
            margin: "0 auto"
          }}>
            {/* Step 1 */}
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "60px",
                height: "60px",
                background: "#f97316",
                color: "white",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: "700",
                margin: "0 auto 20px"
              }}>
                1
              </div>
              <h3 style={{
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#0f172a",
                marginBottom: "10px"
              }}>
                Solicita acceso
              </h3>
              <p style={{
                fontSize: "0.9rem",
                color: "#6b7280",
                lineHeight: 1.6
              }}>
                Completa el formulario para solicitar acceso a la plataforma Andimat.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "60px",
                height: "60px",
                background: "#f97316",
                color: "white",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: "700",
                margin: "0 auto 20px"
              }}>
                2
              </div>
              <h3 style={{
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#0f172a",
                marginBottom: "10px"
              }}>
                Tu asesor te habilita
              </h3>
              <p style={{
                fontSize: "0.9rem",
                color: "#6b7280",
                lineHeight: 1.6
              }}>
                Un asesor de Andimat revisará tu solicitud y te activará las credenciales en la plataforma.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "60px",
                height: "60px",
                background: "#f97316",
                color: "white",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: "700",
                margin: "0 auto 20px"
              }}>
                3
              </div>
              <h3 style={{
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#0f172a",
                marginBottom: "10px"
              }}>
                Realiza tus pedidos
              </h3>
              <p style={{
                fontSize: "0.9rem",
                color: "#6b7280",
                lineHeight: 1.6
              }}>
                Accede a tu catálogo personalizado y comienza a realizar tus pedidos de inmediato.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{
        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
        color: "white",
        padding: "80px 24px",
        textAlign: "center"
      }}>
        <h2 style={{
          fontSize: "2.2rem",
          fontWeight: "700",
          marginBottom: "20px"
        }}>
          ¿Listo para comenzar?
        </h2>
        <p style={{
          fontSize: "1.1rem",
          marginBottom: "40px",
          opacity: 0.95,
          maxWidth: "600px",
          margin: "0 auto 40px"
        }}>
          Solicita tu acceso hoy y únete a nuestros clientes satisfechos.
        </p>
        <button
          onClick={openLoginModal}
          style={{
            background: "white",
            color: "#f97316",
            border: "none",
            padding: "14px 50px",
            fontSize: "1rem",
            fontWeight: "600",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
        >
          Solicitar acceso ahora
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: "#0f172a",
        color: "white",
        padding: "40px 24px",
        textAlign: "center",
        borderTop: "1px solid #1e293b"
      }}>
        <p style={{ margin: 0, opacity: 0.8 }}>
          © 2026 Andimat. Todos los derechos reservados.
        </p>
        <p style={{ margin: "10px 0 0 0", fontSize: "0.9rem", opacity: 0.6 }}>
          Sistema inteligente de gestión de pedidos para ferreterías y distribuidores
        </p>
      </footer>
    </div>
  );
}
