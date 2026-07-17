import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createCustomer } from "../../api/agent";

interface CustomerFormValues {
  name: string;
  dob: string;
  mobile: string;
  email: string;
  pan: string;
  aadhaar: string;
  nomineeName: string;
  nomineeRelation: string;
}

export default function CustomerCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillQuery = (location.state as any)?.query || "";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    defaultValues: { name: prefillQuery },
  });

  const onSubmit = async (values: CustomerFormValues) => {
    try {
      const res = await createCustomer(values);
      navigate(`/agent/customers/${res.data.data._id}`);
    } catch (err: any) {
      const field = err?.response?.data?.field as
        | keyof CustomerFormValues
        | undefined;
      const message = err?.response?.data?.message || "Something went wrong.";
      if (field && field !== "server") {
        setError(field, { message });
      } else {
        alert(message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-navy text-white px-6 py-5 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-sky text-sm">
          Back
        </button>
        <h1 className="font-serif text-2xl">New customer</h1>
      </header>

      <main className="max-w-xl mx-auto px-4 md:px-6 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm text-navy/70 block mb-1">Full name</label>
            <input
              {...register("name", { required: "Name is required" })}
              className="w-full border border-navy/20 rounded-md px-3 py-2 text-sm"
            />
            {errors.name && (
              <p className="text-xs text-red mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-navy/70 block mb-1">
              Date of birth
            </label>
            <input
              type="date"
              {...register("dob", { required: "Date of birth is required" })}
              className="w-full border border-navy/20 rounded-md px-3 py-2 text-sm"
            />
            {errors.dob && (
              <p className="text-xs text-red mt-1">{errors.dob.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-navy/70 block mb-1">Mobile</label>
              <input
                {...register("mobile", { required: "Mobile is required" })}
                placeholder="10 digit number"
                className="w-full border border-navy/20 rounded-md px-3 py-2 text-sm"
              />
              {errors.mobile && (
                <p className="text-xs text-red mt-1">{errors.mobile.message}</p>
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
                <p className="text-xs text-red mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-navy/70 block mb-1">PAN</label>
              <input
                {...register("pan")}
                placeholder="Required if premium > 50,000"
                className="w-full border border-navy/20 rounded-md px-3 py-2 text-sm uppercase"
              />
              {errors.pan && (
                <p className="text-xs text-red mt-1">{errors.pan.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-navy/70 block mb-1">Aadhaar</label>
              <input
                {...register("aadhaar", { required: "Aadhaar is required" })}
                placeholder="12 digit number"
                className="w-full border border-navy/20 rounded-md px-3 py-2 text-sm"
              />
              {errors.aadhaar && (
                <p className="text-xs text-red mt-1">
                  {errors.aadhaar.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="text-sm text-navy/70 block mb-1">
                Nominee relation
              </label>
              <input
                {...register("nomineeRelation", {
                  required: "Relation is required",
                })}
                className="w-full border border-navy/20 rounded-md px-3 py-2 text-sm"
              />
              {errors.nomineeRelation && (
                <p className="text-xs text-red mt-1">
                  {errors.nomineeRelation.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red text-white text-sm font-medium rounded-md py-2.5 disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Create customer"}
          </button>
        </form>
      </main>
    </div>
  );
}
