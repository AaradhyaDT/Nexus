import { useState } from "react";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleQuery() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.detail || "Query failed");
      }
      setResults(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header>
        <h1>Nexus AI Workflow Hub</h1>
        <p>Ask the same prompt to Claude and Gemini in parallel.</p>
      </header>

      <main>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          placeholder="Enter your project prompt here..."
        />

        <button onClick={handleQuery} disabled={loading || !prompt.trim()}>
          {loading ? "Querying..." : "Ask both models"}
        </button>

        {error && <div className="error">{error}</div>}

        {results && (
          <div className="results-grid">
            <section>
              <h2>Claude</h2>
              <pre>{results.claude}</pre>
            </section>
            <section>
              <h2>Gemini</h2>
              <pre>{results.gemini}</pre>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
