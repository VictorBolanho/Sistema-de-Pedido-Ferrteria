import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ROLES, getRoleLabel } from "../utils/rbac";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { quantity } = useCart();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="brand-link">
          <span className="brand-logo">
            <span className="brand-logo-icon" aria-hidden="true" />
            <span className="brand-logo-text">Andimat</span>
          </span>
        </Link>

        {user?.role === ROLES.CLIENT ? (
          <>
            <Link to="/catalog" className="navbar-item">Catalogo</Link>
            <Link to="/cart" className="navbar-item">Carrito ({quantity})</Link>
            <Link to="/orders" className="navbar-item">Pedidos</Link>
          </>
        ) : null}

        {user?.role === ROLES.ADVISOR ? (
          <>
            <Link to="/advisor" className="navbar-item">Panel</Link>
            <Link to="/orders" className="navbar-item">Pedidos</Link>
          </>
        ) : null}

        {user?.role === ROLES.ADMIN ? (
          <>
            <Link to="/admin" className="navbar-item">Dashboard</Link>
            <Link to="/admin/access-requests" className="navbar-item">Solicitudes</Link>
          </>
        ) : null}
      </div>
      <div className="navbar-right">
        <span>
          {user?.email} ({getRoleLabel(user?.role)})
        </span>
        <button type="button" onClick={handleLogout}>
          Salir
        </button>
      </div>
    </nav>
  );
}
