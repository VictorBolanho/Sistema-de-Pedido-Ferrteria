import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page-column">
      <div className="card">
        <h1>Panel</h1>
        <p>Sesion iniciada como: {user?.email}</p>
        <p>Rol: {user?.role}</p>
      </div>
    </div>
  );
}
