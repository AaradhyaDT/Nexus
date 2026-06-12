# Graph Report - Nexus  (2026-06-12)

## Corpus Check
- 9 files · ~4,220 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 115 nodes · 128 edges · 10 communities (9 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `62a6a766`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]

## God Nodes (most connected - your core abstractions)
1. `Claude Session — Nexus AI Workflow Hub` - 12 edges
2. `Task Sequence` - 11 edges
3. `Tasks` - 9 edges
4. `Nexus Day 2 — Complete Task Plan` - 8 edges
5. `Nexus` - 8 edges
6. `get_db()` - 7 edges
7. `Nexus Day 1 — Task Plan` - 7 edges
8. `Nexus AI Workflow Hub` - 6 edges
9. `fts_context()` - 5 edges
10. `handle_query()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Nexus AI Workflow Hub` --references--> `FastAPI Backend`  [EXTRACTED]
  AARADHYA_MASTER_v89.md → Claude_Nexus_Session.md
- `Nexus AI Workflow Hub` --references--> `React Frontend`  [EXTRACTED]
  AARADHYA_MASTER_v89.md → Claude_Nexus_Session.md
- `Nexus AI Workflow Hub` --shares_data_with--> `ChromaDB`  [EXTRACTED]
  AARADHYA_MASTER_v89.md → README.md
- `Nexus AI Workflow Hub` --shares_data_with--> `PostgreSQL`  [EXTRACTED]
  AARADHYA_MASTER_v89.md → README.md

## Import Cycles
- None detected.

## Communities (10 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.25
Nodes (9): Aaradhya Dev Tamrakar, Fuse AI Fellowship, Kathmandu Engineering College, Nexus AI Workflow Hub, PrakopNet, FastAPI Backend, React Frontend, ChromaDB (+1 more)

### Community 1 - "Community 1"
Cohesion: 0.20
Nodes (19): AsyncClient, add_note(), call_gemini(), call_groq(), create_project(), fts_context(), get_db(), get_messages() (+11 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (16): Architecture Decision, Backend skeleton (`backend/main.py`), Claude Session — Nexus AI Workflow Hub, Context Links, Day 1 done state, Day 1 Implementation (Tonight — Done ✅ / In Progress), Frontend skeleton (`frontend/src/App.jsx`), MVP Scope (8 weeks, nightly sessions) (+8 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (15): Day 2 →, Done State, Files, Goal, Known Issues Resolved, Nexus Day 1 — Task Plan, T1 — Repo scaffold ✅, T2 — Backend skeleton ✅ (+7 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (14): dependencies, react, react-dom, devDependencies, vite, @vitejs/plugin-react, name, private (+6 more)

### Community 5 - "Community 5"
Cohesion: 0.17
Nodes (11): API, Architecture, Backend, .env format, Features (v0.2), Frontend, Google Account Routing, Nexus (+3 more)

### Community 6 - "Community 6"
Cohesion: 0.18
Nodes (11): T10 — `style.css` — Layout, T1 — `requirements.txt`, T2 — `.env.example`, T3 — `main.py` — Model Adapters, T4 — `main.py` — DB Init, T5 — `main.py` — Routes, T6 — `App.jsx` — State, T7 — `App.jsx` — Project Sidebar (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (7): API Routes, Day 3 Preview, DB Schema, Done State (end of Day 2), Files Changed, Nexus Day 2 — Complete Task Plan, Scope

## Knowledge Gaps
- **71 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+66 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Task Sequence` connect `Community 6` to `Community 7`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `Nexus Day 2 — Complete Task Plan` connect `Community 7` to `Community 6`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _71 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._