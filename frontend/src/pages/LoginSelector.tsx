import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";

type Panel = "split" | "admin" | "agent";
type FormValues = { email: string; password: string };

export default function LoginSelector({ initial = "split" as Panel }) {
  const [panel, setPanel] = useState<Panel>(initial);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const adminForm = useForm<FormValues>();
  const agentForm = useForm<FormValues>();

  const submit = async (role: "admin" | "agent", values: FormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.post("/auth/login", { ...values, role });
      login(res.data.user);
      navigate(role === "admin" ? "/admin/dashboard" : "/agent/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Invalid credentials. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isAdminOpen = panel === "admin";
  const isAgentOpen = panel === "agent";

  return (
    <div className="relative w-full min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Admin panel */}
      <div
        onClick={() => !isAdminOpen && setPanel("admin")}
        className={`bg-navy text-white flex flex-col items-center justify-center transition-all duration-500 ease-in-out cursor-pointer
          ${isAdminOpen ? "md:w-[78%] h-[70vh] md:h-screen" : isAgentOpen ? "md:w-[22%] h-[15vh] md:h-screen" : "md:w-1/2 h-1/2 md:h-screen"}`}
      >
        {!isAdminOpen ? (
          <div className="text-center px-4">
            <p className="text-lg font-large">Login As Admin</p>
          </div>
        ) : (
          <form
            onSubmit={adminForm.handleSubmit((v) => submit("admin", v))}
            className="w-[85%] max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="font-serif text-2xl mb-1">Admin portal</h1>
            <p className="text-sm text-sky mb-6">
              Sign in to manage agent accounts
            </p>

            <label className="text-sm block mb-1">Email</label>
            <input
              {...adminForm.register("email", {
                required: "Email is required",
              })}
              type="email"
              placeholder="admin@company.com"
              className="w-full mb-1 bg-white/10 border border-white/20 rounded-md px-3 py-2 text-sm placeholder:text-sky/60 text-white"
            />
            {adminForm.formState.errors.email && (
              <p className="text-xs text-red mb-2">
                {adminForm.formState.errors.email.message}
              </p>
            )}

            <label className="text-sm block mb-1 mt-3">Password</label>
            <PasswordInput
              {...adminForm.register("password", {
                required: "Password is required",
              })}
              className="w-full mb-1 bg-white/10 border border-white/20 rounded-md px-3 py-2 text-sm text-white"
            />

            {adminForm.formState.errors.password && (
              <p className="text-xs text-red mb-2">
                {adminForm.formState.errors.password.message}
              </p>
            )}

            {error && panel === "admin" && (
              <p className="text-xs text-red mt-2 mb-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 bg-red text-white font-medium rounded-md py-2 disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        )}
      </div>

      <div
        onClick={() => !isAgentOpen && setPanel("agent")}
        className={`bg-white text-navy flex flex-col items-center justify-center transition-all duration-500 ease-in-out cursor-pointer border-t md:border-t-0 md:border-l border-navy/10
          ${isAgentOpen ? "md:w-[78%] h-[70vh] md:h-screen" : isAdminOpen ? "md:w-[22%] h-[15vh] md:h-screen" : "md:w-1/2 h-1/2 md:h-screen"}`}
      >
        {!isAgentOpen ? (
          <div className="text-center px-4">
            <p className="text-lg font-medium">Login as agent</p>
          </div>
        ) : (
          <form
            onSubmit={agentForm.handleSubmit((v) => submit("agent", v))}
            className="w-[85%] max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="font-serif text-2xl mb-1">Agent portal</h1>
            <p className="text-sm text-maroon mb-6">
              Sign in to manage your customers
            </p>

            <label className="text-sm block mb-1">Email</label>
            <input
              {...agentForm.register("email", {
                required: "Email is required",
              })}
              type="email"
              placeholder="agent@company.com"
              className="w-full mb-1 border border-navy/20 rounded-md px-3 py-2 text-sm"
            />
            {agentForm.formState.errors.email && (
              <p className="text-xs text-red mb-2">
                {agentForm.formState.errors.email.message}
              </p>
            )}

            <label className="text-sm block mb-1 mt-3">Password</label>
            <PasswordInput
              {...agentForm.register("password", {
                required: "Password is required",
              })}
              className="w-full mb-1 border border-navy/20 rounded-md px-3 py-2 text-sm"
            />
            {agentForm.formState.errors.password && (
              <p className="text-xs text-red mb-2">
                {agentForm.formState.errors.password.message}
              </p>
            )}

            {error && panel === "agent" && (
              <p className="text-xs text-red mt-2 mb-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 bg-red text-white font-medium rounded-md py-2 disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
