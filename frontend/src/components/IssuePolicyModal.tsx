import { useForm } from "react-hook-form";
import { issuePolicy } from "../api/agent";

interface PolicyFormValues {
  premiumAmount: number;
  premiumFrequency: string;
  policyTerm: string;
  startDate: string;
}

export default function IssuePolicyModal({
  customerId,
  customerName,
  customerNominee,
  customerHasPan,
  onClose,
  onIssued,
}: {
  customerId: string;
  customerName: string;
  customerNominee: string;
  customerHasPan: boolean;
  onClose: () => void;
  onIssued: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PolicyFormValues>();

  const premium = Number(watch("premiumAmount")) || 0;
  const panRequired = premium > 50000;

  const onSubmit = async (values: PolicyFormValues) => {
    try {
      await issuePolicy({
        customerId,
        ...values,
        premiumAmount: Number(values.premiumAmount),
        policyTerm: Number(values.policyTerm),
        panProvided: customerHasPan,
        policyholderName: customerName,
        nomineeName: customerNominee,
      });
      onIssued();
      onClose();
    } catch (err: any) {
      const field = err?.response?.data?.field as
        | keyof PolicyFormValues
        | undefined;
      const message = err?.response?.data?.message || "Couldn't issue policy.";
      if (
        field &&
        field !== "server" &&
        field !== "agent" &&
        field !== "customerId"
      ) {
        setError(field, { message });
      } else {
        alert(message);
      }
    }
  };

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
          <h2 className="font-serif text-lg">Issue policy</h2>
          <button onClick={onClose} className="text-sky text-sm">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="text-sm text-navy/70 block mb-1">
              Premium amount
            </label>
            <input
              type="number"
              {...register("premiumAmount", {
                required: "Premium is required",
                min: { value: 5000, message: "Minimum premium is ₹5,000" },
              })}
              className="w-full border border-navy/20 rounded-md px-3 py-2 text-sm"
            />
            {errors.premiumAmount && (
              <p className="text-xs text-red mt-1">
                {errors.premiumAmount.message}
              </p>
            )}
          </div>

          {panRequired && !customerHasPan && (
            <div className="bg-maroon/10 border border-maroon/30 text-maroon text-xs rounded-md px-3 py-2">
              PAN is required for premiums above ₹50,000. This customer has no
              PAN on file — add it on their profile before issuing.
            </div>
          )}

          <div>
            <label className="text-sm text-navy/70 block mb-1">
              Premium frequency
            </label>
            <select
              {...register("premiumFrequency", {
                required: "Frequency is required",
              })}
              className="w-full border border-navy/20 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Select frequency</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Half-Yearly">Half-Yearly</option>
              <option value="Yearly">Yearly</option>
            </select>
            {errors.premiumFrequency && (
              <p className="text-xs text-red mt-1">
                {errors.premiumFrequency.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-navy/70 block mb-1">
              Policy term (years)
            </label>
            <select
              {...register("policyTerm", { required: "Term is required" })}
              className="w-full border border-navy/20 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Select term</option>
              {[10, 15, 20, 25, 30].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.policyTerm && (
              <p className="text-xs text-red mt-1">
                {errors.policyTerm.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-navy/70 block mb-1">
              Start date
            </label>
            <input
              type="date"
              {...register("startDate", { required: "Start date is required" })}
              className="w-full border border-navy/20 rounded-md px-3 py-2 text-sm"
            />
            {errors.startDate && (
              <p className="text-xs text-red mt-1">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || (panRequired && !customerHasPan)}
            className="w-full bg-red text-white text-sm font-medium rounded-md py-2.5 disabled:opacity-60"
          >
            {isSubmitting ? "Issuing..." : "Issue policy"}
          </button>
        </form>
      </div>
    </div>
  );
}
