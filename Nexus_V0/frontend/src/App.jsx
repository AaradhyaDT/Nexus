import { useState, useEffect, useRef } from "react"

const API = "http://localhost:8000"

const GOOGLE = [
  { label: "Gmail",    url: i => `https://mail.google.com/mail/u/${i}/` },
  { label: "Drive",    url: i => `https://drive.google.com/drive/u/${i}/` },
  { label: "Calendar", url: i => `https://calendar.google.com/calendar/u/${i}/` },
]

const MODEL_LABEL = {
  groq:   "Groq · Llama 3.3 70B",
  gemini: "Gemini 2.5 Flash",
}

export default function App() {
  const [projects, setProjects]       = useState([])
  const [active, setActive]           = useState(null)
  const [models, setModels]           = useState([])
  const [selected, setSelected]       = useState(["groq", "gemini"])
  const [prompt, setPrompt]           = useState("")
  const [results, setResults]         = useState(null)
  const [loading, setLoading]         = useState(false)
  const [history, setHistory]         = useState([])
  const [histOpen, setHistOpen]       = useState(false)
  const [creating, setCreating]       = useState(false)
  const [newName, setNewName]         = useState("")
  const [newEmail, setNewEmail]       = useState("")
  const [error, setError]             = useState("")
  const nameRef = useRef(null)

  useEffect(() => { bootstrap() }, [])
  useEffect(() => { if (active) fetchHistory(active.id) }, [active])
  useEffect(() => { if (creating) nameRef.current?.focus() }, [creating])

  async function bootstrap() {
    const [pRes, mRes] = await Promise.all([
      fetch(`${API}/projects`),
      fetch(`${API}/models`),
    ])
    const ps = await pRes.json()
    const ms = await mRes.json()
    setProjects(ps)
    setModels(ms.map(m => m.id))
    if (ps.length > 0) setActive(ps[0])
  }

  async function fetchHistory(id) {
    const r = await fetch(`${API}/projects/${id}/messages`)
    setHistory(await r.json())
  }

  async function createProject() {
    if (!newName.trim()) return
    const r = await fetch(`${API}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), g_email: newEmail.trim() }),
    })
    const p = await r.json()
    setProjects(prev => [...prev, p])
    setActive(p)
    setHistory([])
    setNewName("")
    setNewEmail("")
    setCreating(false)
  }

  function toggleModel(m) {
    setSelected(prev => {
      if (prev.includes(m)) return prev.length === 1 ? prev : prev.filter(x => x !== m)
      return [...prev, m]
    })
  }

  async function send() {
    if (!prompt.trim() || !active || loading) return
    setLoading(true)
    setError("")
    setResults(null)
    try {
      const r = await fetch(`${API}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, project_id: active.id, models: selected }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      setResults(await r.json())
      fetchHistory(active.id)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send()
  }

  function loadHistory(item) {
    setPrompt(item.prompt)
    setResults(item.responses)
    setHistOpen(false)
  }

  const resultEntries = results ? Object.entries(results) : []

  return (
    <div className="nx-shell">

      {/* ── Sidebar ── */}
      <aside className="nx-sidebar">
        <div className="nx-sidebar-head">
          <span className="nx-wordmark">NEXUS</span>
          <button className="nx-icon-btn" onClick={() => setCreating(c => !c)} title="New project">＋</button>
        </div>

        {creating && (
          <div className="nx-create-form">
            <input
              ref={nameRef}
              className="nx-field"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") createProject()
                if (e.key === "Escape") setCreating(false)
              }}
              placeholder="Project name"
            />
            <input
              className="nx-field"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="Google email (optional)"
            />
            <button className="nx-create-btn" onClick={createProject}>Create</button>
          </div>
        )}

        <nav className="nx-nav">
          {projects.map(p => (
            <button
              key={p.id}
              className={`nx-proj ${active?.id === p.id ? "active" : ""}`}
              onClick={() => { setActive(p); setResults(null) }}
            >
              <span className="nx-proj-name">{p.name}</span>
              {p.g_email && <span className="nx-proj-email">{p.g_email}</span>}
            </button>
          ))}
        </nav>

        {active && (
          <div className="nx-glinks">
            <span className="nx-caption">Account {active.g_index}</span>
            {GOOGLE.map(s => (
              <a key={s.label} href={s.url(active.g_index)} target="_blank" rel="noreferrer" className="nx-glink">
                {s.label} ↗
              </a>
            ))}
          </div>
        )}
      </aside>

      {/* ── Main ── */}
      <main className="nx-main">

        <header className="nx-header">
          <h1 className="nx-title">{active?.name ?? "—"}</h1>
          <div className="nx-model-row">
            {models.map(m => (
              <label key={m} className={`nx-pill ${selected.includes(m) ? "on" : ""}`}>
                <input type="checkbox" checked={selected.includes(m)} onChange={() => toggleModel(m)} />
                {MODEL_LABEL[m] ?? m}
              </label>
            ))}
          </div>
        </header>

        <div className="nx-prompt-wrap">
          <textarea
            className="nx-textarea"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything — Ctrl + Enter to send"
            rows={4}
          />
          <div className="nx-prompt-foot">
            <span className="nx-hint">Ctrl + Enter</span>
            <button
              className="nx-send"
              onClick={send}
              disabled={loading || !prompt.trim() || !active}
            >
              {loading
                ? <span className="nx-dots"><span /><span /><span /></span>
                : "Send"
              }
            </button>
          </div>
        </div>

        {error && <div className="nx-error">{error}</div>}

        {resultEntries.length > 0 && (
          <div className="nx-results" style={{ "--cols": resultEntries.length }}>
            {resultEntries.map(([model, text]) => (
              <div key={model} className="nx-col">
                <div className="nx-col-head">
                  <span className="nx-col-label">{MODEL_LABEL[model] ?? model}</span>
                </div>
                <div className="nx-col-body">
                  <pre className="nx-output">{text}</pre>
                </div>
              </div>
            ))}
          </div>
        )}

        {history.length > 0 && (
          <div className="nx-hist-section">
            <button className="nx-hist-toggle" onClick={() => setHistOpen(o => !o)}>
              {histOpen ? "▾" : "▸"} History ({history.length})
            </button>
            {histOpen && (
              <div className="nx-hist-list">
                {history.map(item => (
                  <button key={item.id} className="nx-hist-item" onClick={() => loadHistory(item)}>
                    <span className="nx-hist-prompt">
                      {item.prompt.slice(0, 90)}{item.prompt.length > 90 ? "…" : ""}
                    </span>
                    <span className="nx-hist-meta">
                      {item.models_used?.join(" · ")} · {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}
