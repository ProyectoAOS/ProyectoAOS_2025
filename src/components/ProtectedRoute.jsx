import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Verificar si hay un usuario autenticado en localStorage o sessionStorage
  const user = localStorage.getItem("user") || sessionStorage.getItem("user");

  if (!user) {
    // Si no hay usuario, redirigir al login
    return <Navigate to="/" replace />;
  }

  // Si hay usuario, mostrar el contenido
  return children;
};

export default ProtectedRoute;
