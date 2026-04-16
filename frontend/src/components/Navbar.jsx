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
        {user?.role === ROLES.CLIENT ? (
          <>
            <Link to="/catalog">Catalogo</Link>
            <Link to="/cart">Carrito ({quantity})</Link>
            <Link to="/orders">Pedidos</Link>
          </>
        ) : null}

        {user?.role === ROLES.ADVISOR ? (
          <>
            <Link to="/advisor#clientes">Mis Clientes</Link>
            <Link to="/orders">Pedidos</Link>
            <Link to="/advisor#comisiones">Comisiones</Link>
          </>
        ) : null}

        {user?.role === ROLES.ADMIN ? (
          <>
            <Link to="/admin#pedidos">Pedidos</Link>
            <Link to="/admin#productos">Productos</Link>
            <Link to="/admin#clientes">Clientes</Link>
            <Link to="/admin#promociones">Promociones</Link>
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
