export default function Forbidden() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-2 px-4 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">
        403 — Access Denied
      </h1>
      <p className="text-gray-600">
        You don't have permission to view this page.
      </p>
    </div>
  );
}
