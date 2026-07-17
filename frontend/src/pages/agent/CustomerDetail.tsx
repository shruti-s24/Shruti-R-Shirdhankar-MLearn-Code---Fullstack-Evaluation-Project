import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  fetchCustomerById,
  updateCustomer,
  fetchPoliciesForCustomer,
} from "../../api/agent";
import IssuePolicyModal from "../../components/IssuePolicyModal";

interface Customer {
  _id: string;
  name: string;
  dob: string;
  mobile: string;
  email: string;
  pan: string;
  aadhaar: string;
  nomineeName: string;
  nomineeRelation: string;
}

interface Policy {
  _id: string;
  premiumAmount: number;
  premiumFrequency: string;
  policyTerm: number;
  startDate: string;
}

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<Customer>();

  const loadAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [custRes, polRes] = await Promise.all([
        fetchCustomerById(id),
        fetchPoliciesForCustomer(id),
      ]);
      setCustomer(custRes.data.data);
      reset(custRes.data.data);
      setPolicies(polRes.data.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Couldn't load this customer.");
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onSaveEdit = async (values: Customer) => {
    if (!id) return;
    try {
      const res = await updateCustomer(id, values);
      setCustomer(res.data.data);
      setEditing(false);
    } catch (err: any) {
      const field = err?.response?.data?.field as keyof Customer | undefined;
      const message = err?.response?.data?.message || "Couldn't save changes.";
      if (
        field &&
        (field as string) !== "server" &&
        (field as string) !== "agentId"
      ) {
        setFieldError(field, { message });
      } else {
        alert(message);
      }
    }
  };

  if (loading)
    return <div className="p-8 text-navy/50 text-sm">Loading...</div>;
  if (error || !customer)
    return <div className="p-8 text-red text-sm">{error || "Not found."}</div>;

  const hasPan = !!customer.pan;

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-navy text-white px-6 py-5 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-sky text-sm">
          Back
        </button>
        <h1 className="font-serif text-2xl">{customer.name}</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-serif text-lg text-navy">Profile</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing((v) => !v)}
              className="text-xs border border-navy/20 rounded-md px-3 py-1.5 text-navy"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
            <button
              onClick={() => setShowIssueModal(true)}
              className="text-xs bg-red text-white rounded-md px-3 py-1.5"
            >
              Issue policy
            </button>
          </div>
        </div>

        {!editing ? (
          <div className="border border-navy/10 rounded-lg p-5 mb-8 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-navy/50">Mobile</p>
              <p className="text-navy">{customer.mobile}</p>
            </div>
            <div>
              <p className="text-navy/50">Email</p>
              <p className="text-navy">{customer.email}</p>
            </div>
            <div>
              <p className="text-navy/50">PAN</p>
              <p className="text-navy">{customer.pan || "—"}</p>
            </div>
            <div>
              <p className="text-navy/50">Aadhaar</p>
              <p className="text-navy">{customer.aadhaar}</p>
            </div>
            <div>
              <p className="text-navy/50">Nominee</p>
              <p className="text-navy">{customer.nomineeName}</p>
            </div>
            <div>
              <p className="text-navy/50">Relation</p>
              <p className="text-navy">{customer.nomineeRelation}</p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSaveEdit)}
            className="border border-navy/10 rounded-lg p-5 mb-8 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-navy/70 block mb-1">
                  Mobile
                </label>
                <input
                  {...register("mobile", { required: "Mobile is required" })}
                  className="w-full border border-navy/20 rounded-md px-3 py-2 text-sm"
                />
                {errors.mobile && (
                  <p className="text-xs text-red mt-1">
                    {errors.mobile.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-navy/70 block mb-1">Email</label>
                <input
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
                <label className="text-sm text-navy/70 block mb-1">PAN</label>
                <input
                  {...register("pan")}
                  className="w-full border border-navy/20 rounded-md px-3 py-2 text-sm uppercase"
                />
                {errors.pan && (
                  <p className="text-xs text-red mt-1">{errors.pan.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-navy/70 block mb-1">
                  Nominee name
                </label>
                <input
                  {...register("nomineeName", {
                    required: "Nominee is required",
                  })}
                  className="w-full border border-navy/20 rounded-md px-3 py-2 text-sm"
                />
                {errors.nomineeName && (
                  <p className="text-xs text-red mt-1">
                    {errors.nomineeName.message}
                  </p>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-navy text-white text-sm font-medium rounded-md px-4 py-2 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </form>
        )}

        <h2 className="font-serif text-lg text-navy mb-4">Policies</h2>
        <div className="border border-navy/10 rounded-lg overflow-x-auto">
          {policies.length === 0 ? (
            <p className="text-navy/50 text-sm text-center py-8">
              No policies issued yet.
            </p>
          ) : (
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-navy/10 text-left text-navy/60">
                  <th className="px-4 py-3 font-medium">Premium</th>
                  <th className="px-4 py-3 font-medium">Frequency</th>
                  <th className="px-4 py-3 font-medium">Term</th>
                  <th className="px-4 py-3 font-medium">Start date</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p) => (
                  <tr
                    key={p._id}
                    className="border-b border-navy/5 last:border-0"
                  >
                    <td className="px-4 py-3 text-navy">
                      ₹{p.premiumAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-navy/70">
                      {p.premiumFrequency}
                    </td>
                    <td className="px-4 py-3 text-navy/70">
                      {p.policyTerm} years
                    </td>
                    <td className="px-4 py-3 text-navy/70">
                      {new Date(p.startDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {showIssueModal && (
        <IssuePolicyModal
          customerId={customer._id}
          customerName={customer.name}
          customerNominee={customer.nomineeName}
          customerHasPan={hasPan}
          onClose={() => setShowIssueModal(false)}
          onIssued={loadAll}
        />
      )}
    </div>
  );
}
