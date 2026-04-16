import { Outlet } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Navbar from "./Navbar";

export default function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <div>
        <Navbar />
        <main className="content-layout">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}

