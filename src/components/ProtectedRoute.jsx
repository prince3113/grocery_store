import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");

  if (!token) {
    // Redirect to login if no token
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // Redirect role-inappropriate users to their default landing pages
    return <Navigate to={role === "admin" ? "/" : "/shop"} replace />;
  }

  return children;
}

export default ProtectedRoute;