import { useState } from "react";
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

const App = () => {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const baseUrl = apiClient.defaults.baseURL;

  const pingBackend = async () => {
    setLoading(true);
    setStatus("");
    try {
      const response = await apiClient.get("/health");
      setStatus(JSON.stringify(response.data, null, 2));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setStatus(error.message);
      } else {
        setStatus("Unexpected error while contacting the API.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <section className="w-full max-w-xl rounded-xl bg-white p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-slate-900">Haruve Frontend</h1>
        <p className="mt-4 text-sm text-slate-600">
          Ready-to-use Vite + React + Tailwind environment configured to talk to the Rails API.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          API base URL:{" "}
          <code className="rounded bg-slate-100 px-2 py-1 font-mono">{baseUrl}</code>
        </p>
        <button
          type="button"
          onClick={pingBackend}
          disabled={loading}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {loading ? "Checking..." : "Call /health endpoint"}
        </button>
        <pre className="mt-6 max-h-48 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-emerald-200">
          {status || "Result will appear here after hitting the API."}
        </pre>
      </section>
    </main>
  );
};

export default App;
