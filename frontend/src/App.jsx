import { useState, useEffect, useRef } from "react"

const API = "http://localhost:8000"

// Lightweight markdown renderer — no deps, covers LLM output patterns
function renderMarkdown(text) {
  if (!text) return []
  const lines = text.split("\n")
  const elements = []
  let i = 0
  let key = 0

  // Inline formatting: **bold**, *italic*, `code`, and plain text
  function parseInline(str) {
    const parts = []
    // Split on **bold**, *italic*, `code`
    const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g
    let last = 0, m
    while ((m = re.exec(str)) !== null) {
      if (m.index > last) parts.push(str.slice(last, m.index))
      if (m[2] !== undefined) parts.push(<strong key={key++}>{m[2]}</strong>)
      else if (m[3] !== undefined) parts.push(<em key={key++}>{m[3]}</em>)
      else if (m[4] !== undefined) parts.push(<code key={key++} className="nx-inline-code">{m[4]}</code>)
      last = m.index + m[0].length
    }
    if (last < str.length) parts.push(str.slice(last))
    return parts
  }

  while (i < lines.length) {
    const line = lines[i]

    // Fenced code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim()
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(
        <div key={key++} className="nx-code-block">
          {lang && <span className="nx-code-lang">{lang}</span>}
          <pre><code>{codeLines.join("\n")}</code></pre>
        </div>
      )
      i++
      continue
    }

    // Headings
    const h3 = line.match(/^### (.+)/)
    const h2 = line.match(/^## (.+)/)
    const h1 = line.match(/^# (.+)/)
    if (h3) { elements.push(<h3 key={key++} className="nx-md-h3">{parseInline(h3[1])}</h3>); i++; continue }
    if (h2) { elements.push(<h2 key={key++} className="nx-md-h2">{parseInline(h2[1])}</h2>); i++; continue }
    if (h1) { elements.push(<h1 key={key++} className="nx-md-h1">{parseInline(h1[1])}</h1>); i++; continue }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) { elements.push(<hr key={key++} className="nx-md-hr" />); i++; continue }

    // Unordered list — collect consecutive items
    if (/^[\-\*] /.test(line)) {
      const items = []
      while (i < lines.length && /^[\-\*] /.test(lines[i])) {
        items.push(<li key={key++}>{parseInline(lines[i].slice(2))}</li>)
        i++
      }
      elements.push(<ul key={key++} className="nx-md-ul">{items}</ul>)
      continue
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      const items = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(<li key={key++}>{parseInline(lines[i].replace(/^\d+\. /, ""))}</li>)
        i++
      }
      elements.push(<ol key={key++} className="nx-md-ol">{items}</ol>)
      continue
    }

    // Blank line
    if (line.trim() === "") { elements.push(<br key={key++} />); i++; continue }

    // Paragraph
    elements.push(<p key={key++} className="nx-md-p">{parseInline(line)}</p>)
    i++
  }
  return elements
}

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
  const [theme, setTheme]             = useState("dark")
  // T13 — Notes
  const [notesOpen, setNotesOpen]     = useState(false)
  const [notes, setNotes]             = useState([])
  const [noteText, setNoteText]       = useState("")
  const [noteSaving, setNoteSaving]   = useState(false)
  const [noteToast, setNoteToast]     = useState(false)
  // T14 — Settings modal
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editPrompt, setEditPrompt]   = useState("")
  const [editEmail, setEditEmail]     = useState("")
  const [editGIndex, setEditGIndex]   = useState(0)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsToast, setSettingsToast]   = useState(false)

  const nameRef = useRef(null)

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    if (stored === "light" || stored === "dark") setTheme(stored)
    bootstrap()
  }, [])

  useEffect(() => {
    if (active) {
      fetchHistory(active.id)
      fetchNotes(active.id)
    }
  }, [active])

  useEffect(() => {
    if (creating) nameRef.current?.focus()
  }, [creating])

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light")
    localStorage.setItem("theme", theme)
  }, [theme])

  // Populate settings form when modal opens
  useEffect(() => {
    if (settingsOpen && active) {
      setEditPrompt(active.prompt || "You are a helpful expert assistant.")
      setEditEmail(active.g_email || "")
      setEditGIndex(active.g_index ?? 0)
    }
  }, [settingsOpen, active])

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

  async function fetchNotes(id) {
    try {
      const r = await fetch(`${API}/projects/${id}/notes`)
      if (r.ok) setNotes(await r.json())
    } catch { setNotes([]) }
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
    setNotes([])
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

  async function clearHistory() {
    if (!active) return
    try {
      await fetch(`${API}/projects/${active.id}/history`, { method: "DELETE" })
    } catch (e) {
      console.warn("Failed to clear history", e)
    }
    setHistory([])
    setResults(null)
  }

  // T13 — save note
  async function saveNote() {
    if (!noteText.trim() || !active) return
    setNoteSaving(true)
    try {
      await fetch(`${API}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: active.id, content: noteText.trim() }),
      })
      setNoteText("")
      await fetchNotes(active.id)
      setNoteToast(true)
      setTimeout(() => setNoteToast(false), 2000)
    } finally {
      setNoteSaving(false)
    }
  }

  // T13 — delete note
  async function deleteNote(noteId) {
    if (!active) return
    try {
      await fetch(`${API}/projects/${active.id}/notes/${noteId}`, { method: "DELETE" })
      setNotes(prev => prev.filter(n => n.id !== noteId))
    } catch (e) {
      console.warn("Failed to delete note", e)
    }
  }

  // T14 — save project settings
  async function saveSettings() {
    if (!active) return
    setSettingsSaving(true)
    try {
      const r = await fetch(`${API}/projects/${active.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: editPrompt,
          g_email: editEmail,
          g_index: Number(editGIndex),
        }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      // Update local state
      const updated = {
        ...active,
        prompt: editPrompt,
        g_email: editEmail,
        g_index: Number(editGIndex),
      }
      setActive(updated)
      setProjects(prev => prev.map(p => p.id === active.id ? updated : p))
      setSettingsToast(true)
      setTimeout(() => {
        setSettingsToast(false)
        setSettingsOpen(false)
      }, 1200)
    } finally {
      setSettingsSaving(false)
    }
  }

  function toggleTheme() {
    setTheme(prev => (prev === "dark" ? "light" : "dark"))
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
          <div className="nx-header-start">
            <h1 className="nx-title">{active?.name ?? "—"}</h1>
            {active && (
              <button
                className="nx-settings-btn"
                onClick={() => setSettingsOpen(true)}
                title="Project settings"
              >
                Settings
              </button>
            )}
          </div>
          <div className="nx-header-actions">
            <button className="nx-theme-btn" onClick={toggleTheme}>
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <div className="nx-model-row">
              {models.map(m => (
                <label key={m} className={`nx-pill ${selected.includes(m) ? "on" : ""}`}>
                  <input type="checkbox" checked={selected.includes(m)} onChange={() => toggleModel(m)} />
                  {MODEL_LABEL[m] ?? m}
                </label>
              ))}
            </div>
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
                  <div className="nx-md-body">{renderMarkdown(text)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── T13: Notes Panel ── */}
        {active && (
          <div className="nx-notes-section">
            <div className="nx-notes-header">
              <button className="nx-hist-toggle" onClick={() => setNotesOpen(o => !o)}>
                {notesOpen ? "▾" : "▸"} Notes
                {notes.length > 0 && <span className="nx-notes-badge">{notes.length}</span>}
              </button>
              {noteToast && <span className="nx-toast">Note saved</span>}
            </div>
            {notesOpen && (
              <div className="nx-notes-body">
                <div className="nx-note-input-wrap">
                  <textarea
                    className="nx-note-textarea"
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    placeholder="Add a project note — injected as context on next query"
                    rows={3}
                    onKeyDown={e => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveNote()
                    }}
                  />
                  <button
                    className="nx-note-save"
                    onClick={saveNote}
                    disabled={noteSaving || !noteText.trim()}
                  >
                    {noteSaving ? "Saving…" : "Save note"}
                  </button>
                </div>
                {notes.length > 0 && (
                  <div className="nx-note-list">
                    {notes.map(n => (
                      <div key={n.id} className="nx-note-item">
                        <span className="nx-note-content">{n.content}</span>
                        <button
                          className="nx-note-del"
                          onClick={() => deleteNote(n.id)}
                          title="Delete note"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
                {notes.length === 0 && (
                  <p className="nx-notes-empty">No notes yet — notes are silently injected as context when relevant.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── History ── */}
        {history.length > 0 && (
          <div className="nx-hist-section">
            <div className="nx-hist-row">
              <button className="nx-hist-toggle" onClick={() => setHistOpen(o => !o)}>
                {histOpen ? "▾" : "▸"} History ({history.length})
              </button>
              <button className="nx-clear-history" onClick={clearHistory}>
                Clear history
              </button>
            </div>
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

      {/* ── T14: Settings Modal ── */}
      {settingsOpen && (
        <div className="nx-modal-backdrop" onClick={() => setSettingsOpen(false)}>
          <div className="nx-modal" onClick={e => e.stopPropagation()}>
            <div className="nx-modal-head">
              <span className="nx-modal-title">Project settings — {active?.name}</span>
              <button className="nx-modal-close" onClick={() => setSettingsOpen(false)}>✕</button>
            </div>

            <div className="nx-modal-body">
              <label className="nx-modal-label">System prompt</label>
              <textarea
                className="nx-modal-textarea"
                value={editPrompt}
                onChange={e => setEditPrompt(e.target.value)}
                rows={6}
                placeholder="You are a helpful expert assistant."
              />

              <label className="nx-modal-label">Google account email</label>
              <input
                className="nx-field"
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                placeholder="your@gmail.com"
              />

              <label className="nx-modal-label">Google account index</label>
              <input
                className="nx-field nx-field-sm"
                type="number"
                min={0}
                max={9}
                value={editGIndex}
                onChange={e => setEditGIndex(e.target.value)}
              />
              <p className="nx-modal-hint">
                Index 0 = first Chrome Google account (/u/0/), 1 = second, etc.
              </p>
            </div>

            <div className="nx-modal-foot">
              {settingsToast && <span className="nx-toast">Saved</span>}
              <button
                className="nx-modal-cancel"
                onClick={() => setSettingsOpen(false)}
              >
                Cancel
              </button>
              <button
                className="nx-modal-save"
                onClick={saveSettings}
                disabled={settingsSaving}
              >
                {settingsSaving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}