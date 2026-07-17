import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { fetchAgents, createAgentApi, disableAgentApi } from "../../api/admin";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";
import AgentDetailModal from "../../components/AgentDetailModal";

interface Agent {
  _id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  createdAt: string;
}

interface CreateAgentForm {
  name: string;
  email: string;
  password: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [viewingAgentId, setViewingAgentId] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [search, setSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Agent | null>(null);
  const [disabling, setDisabling] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateAgentForm>();

  const loadAgents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAgents({
        page,
        limit: 10,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search || undefined,
      });
      setAgents(res.data.agents);
      setTotalPages(res.data.pagination.totalPages || 1);
    } catch {
      setApiError("Couldn't load agents. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  // Client-side fallback filter, in case backend hasn't been patched with ?search yet
  const visibleAgents = agents.filter((a) =>
    search
      ? a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  const onCreateAgent = async (values: CreateAgentForm) => {
    try {
      await createAgentApi(values);
      reset();
      setShowCreateForm(false);
      setPage(1);
      loadAgents();
    } catch (err: any) {
      const field = err?.response?.data?.field as
        | keyof CreateAgentForm
        | undefined;
      const message =
        err?.response?.data?.message || "Something went wrong. Try again.";
      if (field) {
        setError(field, { message });
      } else {
        setApiError(message);
      }
    }
  };

  const confirmDisable = async () => {
    if (!confirmTarget) return;
    setDisabling(true);
    try {
      await disableAgentApi(confirmTarget._id);
      setConfirmTarget(null);
      loadAgents();
    } catch {
      setApiError("Couldn't disable this agent. Try again.");
    } finally {
      setDisabling(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-navy text-white px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl">Admin dashboard</h1>
          <p className="text-sm text-sky mt-1">Manage agent accounts</p>
        </div>
        <button
          onClick={async () => {
            await logout();
            navigate("/admin/login");
          }}
          className="text-sm border border-white/20 rounded-md px-4 py-2 text-white hover:bg-white/10"
        >
          Log out
        </button>
      </header>
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        {apiError && (
          <div className="bg-red/10 border border-red/30 text-red text-sm rounded-md px-4 py-3 mb-6">
            {apiError}
          </div>
        )}

        {/* Controls row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-64 border border-navy/20 rounded-md px-3 py-2 text-sm"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="border border-navy/20 rounded-md px-3 py-2 text-sm text-navy"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button
            onClick={() => setShowCreateForm((v) => !v)}
            className="bg-red text-white text-sm font-medium rounded-md px-4 py-2 whitespace-nowrap"
          >
            {showCreateForm ? "Close" : "Create agent"}
          </button>
        </div>

        {/* Create agent form */}
        {showCreateForm && (
          <form
            onSubmit={handleSubmit(onCreateAgent)}
            className="border border-navy/10 rounded-lg p-5 mb-8 bg-navy/[0.02]"
          >
            <h2 className="font-serif text-lg text-navy mb-4">Create agent</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-navy/70 block mb-1">Name</label>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="w-full border border-navy/20 rounded-md px-3 py-2 text-sm"
                />
                {errors.name && (
                  <p className="text-xs text-red mt-1">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-navy/70 block mb-1">Email</label>
                <input
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  className="w-full border border-navy/20 rounded-md px-3 py-2 text-sm"
                />
                {errors.email && (
                  <p className="text-xs text-red mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-navy/70 block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Minimum 6 characters" },
                  })}
                  className="w-full border border-navy/20 rounded-md px-3 py-2 text-sm"
                />
                {errors.password && (
                  <p className="text-xs text-red mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 bg-navy text-white text-sm font-medium rounded-md px-4 py-2 disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Create agent"}
            </button>
          </form>
        )}

        {/* Table */}
        <div className="border border-navy/10 rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-navy/10 text-left text-navy/60">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-navy/50"
                  >
                    Loading agents...
                  </td>
                </tr>
              ) : visibleAgents.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-navy/50"
                  >
                    No agents match your filters.
                  </td>
                </tr>
              ) : (
                visibleAgents.map((agent) => (
                  <tr
                    key={agent._id}
                    className="border-b border-navy/5 last:border-0"
                  >
                    <td className="px-4 py-3 text-navy">{agent.name}</td>
                    <td className="px-4 py-3 text-navy/70">{agent.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          agent.status === "active"
                            ? "bg-sky/20 text-navy"
                            : "bg-maroon/10 text-maroon"
                        }`}
                      >
                        {agent.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-navy/60">
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setViewingAgentId(agent._id)}
                          className="text-xs border border-navy/20 rounded-md px-3 py-1.5 text-navy"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setConfirmTarget(agent)}
                          disabled={agent.status === "inactive"}
                          className="text-xs border border-red/30 text-red rounded-md px-3 py-1.5 disabled:opacity-40"
                        >
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-5 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 border border-navy/20 rounded-md text-navy disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-navy/60">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 border border-navy/20 rounded-md text-navy disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </main>

      <ConfirmDialog
        open={!!confirmTarget}
        title="Deactivate agent"
        message={`This marks ${confirmTarget?.name} as inactive. They'll lose access, and their records stay intact.`}
        confirmLabel="Deactivate"
        loading={disabling}
        onConfirm={confirmDisable}
        onCancel={() => setConfirmTarget(null)}
      />
      {viewingAgentId && (
        <AgentDetailModal
          agentId={viewingAgentId}
          onClose={() => setViewingAgentId(null)}
        />
      )}
    </div>
  );
}
