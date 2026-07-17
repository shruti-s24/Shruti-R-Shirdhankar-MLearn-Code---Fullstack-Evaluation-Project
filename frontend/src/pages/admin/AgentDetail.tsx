import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAgentById } from "../../api/admin";

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

export default function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<AgentDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchAgentById(id)
      .then((res) => setData(res.data))
      .catch(() => setError("Couldn't load this agent."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return <div className="p-8 text-navy/50 text-sm">Loading...</div>;
  if (error || !data)
    return (
      <div className="p-8 text-red text-sm">{error || "Agent not found."}</div>
    );

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-navy text-white px-6 py-5 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-sky text-sm">
          Back
        </button>
        <h1 className="font-serif text-2xl">{data.agent.name}</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        <div className="border border-navy/10 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-navy font-medium">{data.agent.email}</p>
              <p className="text-navy/50 text-sm mt-1">
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border border-navy/10 rounded-lg p-5">
            <p className="text-sm text-navy/60">Customers</p>
            <p className="font-serif text-3xl text-navy mt-1">
              {data.summary.customerCount}
            </p>
          </div>
          <div className="border border-navy/10 rounded-lg p-5">
            <p className="text-sm text-navy/60">Policies</p>
            <p className="font-serif text-3xl text-navy mt-1">
              {data.summary.policyCount}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
