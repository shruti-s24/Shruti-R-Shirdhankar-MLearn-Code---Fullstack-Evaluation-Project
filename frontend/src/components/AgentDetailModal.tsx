import { useEffect, useState } from "react";
import { fetchAgentById } from "../api/admin";

interface AgentDetailData {
  agent: {
    _id: string;
    name: string;
    email: string;
    status: string;
    createdAt: string;
  };
  summary: { customerCount: number; policyCount: number };
}

export default function AgentDetailModal({
  agentId,
  onClose,
}: {
  agentId: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<AgentDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchAgentById(agentId)
      .then((res) => setData(res.data))
      .catch(() => setError("Couldn't load this agent."))
      .finally(() => setLoading(false));
  }, [agentId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-navy/30 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-navy text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="font-serif text-lg">Agent details</h2>
          <button
            onClick={onClose}
            className="text-sky text-sm"
            aria-label="Close"
          >
            Close
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-navy/50 text-sm py-6 text-center">Loading...</p>
          ) : error || !data ? (
            <p className="text-red text-sm py-6 text-center">
              {error || "Agent not found."}
            </p>
          ) : (
            <>
              <div className="flex justify-between items-start mb-5">
                <div>
                  <p className="text-navy font-medium">{data.agent.name}</p>
                  <p className="text-navy/70 text-sm mt-0.5">
                    {data.agent.email}
                  </p>
                  <p className="text-navy/50 text-xs mt-1">
                    Joined {new Date(data.agent.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    data.agent.status === "active"
                      ? "bg-sky/20 text-navy"
                      : "bg-maroon/10 text-maroon"
                  }`}
                >
                  {data.agent.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="border border-navy/10 rounded-lg p-4">
                  <p className="text-xs text-navy/60">Customers</p>
                  <p className="font-serif text-2xl text-navy mt-1">
                    {data.summary.customerCount}
                  </p>
                </div>
                <div className="border border-navy/10 rounded-lg p-4">
                  <p className="text-xs text-navy/60">Policies</p>
                  <p className="font-serif text-2xl text-navy mt-1">
                    {data.summary.policyCount}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
