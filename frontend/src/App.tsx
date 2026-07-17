import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AdminLogin from "./pages/admin/AdminLogin";
import AgentLogin from "./pages/agent/AgentLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AgentDetail from "./pages/admin/AgentDetail";
import Forbidden from "./pages/Forbidden";
import AgentDashboard from "./pages/agent/AgentDashboard";
import CustomerCreate from "./pages/agent/CustomerCreate";
import CustomerDetail from "./pages/agent/CustomerDetail";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/agent/login" element={<AgentLogin />} />
          <Route path="/forbidden" element={<Forbidden />} />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/agents/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <AgentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/dashboard"
            element={
              <ProtectedRoute requiredRole="agent">
                <AgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/customers/new"
            element={
              <ProtectedRoute requiredRole="agent">
                <CustomerCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/customers/:id"
            element={
              <ProtectedRoute requiredRole="agent">
                <CustomerDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
