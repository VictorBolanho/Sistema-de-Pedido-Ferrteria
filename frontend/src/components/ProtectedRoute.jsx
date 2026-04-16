import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { canAccessRole, getDefaultRouteByRole } from "../utils/rbac";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="page">Cargando sesion...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !canAccessRole(user?.role, allowedRoles)
  ) {
    return <Navigate to={getDefaultRouteByRole(user?.role)} replace />;
  }

  return children;
}
