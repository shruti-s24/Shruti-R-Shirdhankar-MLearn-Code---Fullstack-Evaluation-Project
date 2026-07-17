import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { searchCustomers } from "../../api/agent";
import { useAuth } from "../../context/AuthContext";

interface CustomerResult {
  _id: string;
  name: string;
  mobile: string;
  email: string;
  pan: string;
}

export default function AgentDashboard() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const runSearch = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await searchCustomers(q);
      setResults(res.data.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Couldn't load customers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runSearch(""); // load all of this agent's customers on mount
  }, [runSearch]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-navy text-white px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl">Agent dashboard</h1>
          <p className="text-sm text-sky mt-1">
            Search before creating a new customer
          </p>
        </div>

        <button
          onClick={async () => {
            await logout();
            navigate("/agent/login");
          }}
          className="text-sm border border-white/20 rounded-md px-4 py-2 text-white hover:bg-white/10"
        >
          Log out
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <form
          onSubmit={onSubmit}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <input
            type="text"
            placeholder="Search by name, mobile, PAN, or Aadhaar"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border border-navy/20 rounded-md px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-navy text-white text-sm font-medium rounded-md px-5 py-2 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                runSearch("");
              }}
              className="text-sm border border-navy/20 rounded-md px-4 py-2 text-navy"
            >
              Clear
            </button>
          )}
        </form>

        {error && <p className="text-red text-sm mb-4">{error}</p>}

        <div className="border border-navy/10 rounded-lg overflow-hidden mb-4">
          {loading ? (
            <p className="text-navy/50 text-sm text-center py-8">
              Loading customers...
            </p>
          ) : results.length === 0 ? (
            <p className="text-navy/50 text-sm text-center py-8">
              {query
                ? `No customers found for "${query}".`
                : "No customers yet."}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy/10 text-left text-navy/60">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Mobile</th>
                  <th className="px-4 py-3 font-medium">PAN</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map((c) => (
                  <tr
                    key={c._id}
                    className="border-b border-navy/5 last:border-0"
                  >
                    <td className="px-4 py-3 text-navy">{c.name}</td>
                    <td className="px-4 py-3 text-navy/70">{c.mobile}</td>
                    <td className="px-4 py-3 text-navy/70">{c.pan}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/agent/customers/${c._id}`)}
                        className="text-xs border border-navy/20 rounded-md px-3 py-1.5 text-navy"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-navy/60 mb-3">
            {query
              ? "Not the customer you're looking for?"
              : "Don't see who you need?"}
          </p>
          <button
            onClick={() =>
              navigate("/agent/customers/new", { state: { query } })
            }
            className="bg-red text-white text-sm font-medium rounded-md px-5 py-2"
          >
            Create new customer
          </button>
        </div>
      </main>
    </div>
  );
}
