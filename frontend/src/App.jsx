import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Catalog from "./pages/Catalog";
import CatalogProductDetail from "./pages/CatalogProductDetail";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";
import Advisor from "./pages/Advisor";
import ProductDetail from "./pages/ProductDetail";
import PublicLayout from "./components/PublicLayout";
import ProtectedLayout from "./components/ProtectedLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { ROLES, getDefaultRouteByRole } from "./utils/rbac";

export default function App() {
  const { isAuthenticated, user } = useAuth();
  const homePath = getDefaultRouteByRole(user?.role);

  return (
    <Routes>
      {/* Public Layout Routes */}
      <Route element={<PublicLayout />}>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to={homePath} replace /> : <Home />}
        />
      </Route>

      {/* Login Route */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={homePath} replace /> : <Login />}
      />

      {/* Protected Layout Routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Navigate to={homePath} replace />} />
        <Route
          path="/catalog"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CLIENT]}>
              <Catalog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/catalog/:id"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CLIENT]}>
              <CatalogProductDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CLIENT]}>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.CLIENT, ROLES.ADVISOR, ROLES.ADMIN]}
            >
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <ProductDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/access-requests"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <Admin initialSection="accessRequests" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/advisor"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADVISOR]}>
              <Advisor />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch all - redirect to home or login */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? homePath : "/"} replace />}
      />
    </Routes>
  );
}
