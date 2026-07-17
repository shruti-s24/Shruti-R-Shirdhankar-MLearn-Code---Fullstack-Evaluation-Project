import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Role = "admin" | "agent";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: Role;
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    const loginPath =
      requiredRole === "admin" ? "/admin/login" : "/agent/login";
    return <Navigate to={loginPath} replace />;
  }

  if (user.role !== requiredRole) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}
