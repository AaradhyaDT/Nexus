# Graph Report - Nexus  (2026-06-13)

## Corpus Check
- 14 files · ~9,228 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 253 nodes · 269 edges · 19 communities (18 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d65cf458`
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
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]

## God Nodes (most connected - your core abstractions)
1. `Claude Session — Nexus AI Workflow Hub` - 12 edges
2. `Nexus — Master Task Plan v2` - 12 edges
3. `Claude Session — Nexus AI Workflow Hub` - 12 edges
4. `get_db()` - 11 edges
5. `Task Sequence` - 11 edges
6. `Task Sequence` - 11 edges
7. `Nexus Complete Task Plan` - 10 edges
8. `Tasks` - 9 edges
9. `Phase 1 — Local Backbone & MVP (Days 1–2)` - 9 edges
10. `Tasks` - 9 edges

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
- 1-file cycle: `backend/main.py -> backend/main.py`

## Communities (19 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.25
Nodes (9): Aaradhya Dev Tamrakar, Fuse AI Fellowship, Kathmandu Engineering College, Nexus AI Workflow Hub, PrakopNet, FastAPI Backend, React Frontend, ChromaDB (+1 more)

### Community 1 - "Community 1"
Cohesion: 0.17
Nodes (25): AsyncClient, add_note(), call_gemini(), call_groq(), create_project(), delete_history(), delete_note(), fts_context() (+17 more)

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
Cohesion: 0.11
Nodes (18): API Routes, Day 3 Preview, DB Schema, Done State (end of Day 2), Files Changed, Nexus Day 2 — Complete Task Plan, Scope, T10 — `style.css` — Layout (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (20): Architecture, Completed, Current Status, Deferred / v2, Files of Record, Included, Local architecture, Model routing (+12 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (20): 8-Week Nightly Build Tracker, Architecture (Locked), Completion Legend, Deferred / Out of Scope, Files of Record, Nexus — Master Task Plan v2, Phase 2 — Validation (Day 3 — Current), Phase 4 — v1.0 Features (Days 7–10) (+12 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (18): API Routes, Day 3 Preview, DB Schema, Done State (end of Day 2), Files Changed, Nexus Day 2 — Complete Task Plan, Scope, T10 — `style.css` — Layout (+10 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (16): Architecture Decision, Backend skeleton (`backend/main.py`), Claude Session — Nexus AI Workflow Hub, Context Links, Day 1 done state, Day 1 Implementation (Tonight — Done ✅ / In Progress), Frontend skeleton (`frontend/src/App.jsx`), MVP Scope (8 weeks, nightly sessions) (+8 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (15): Day 2 →, Done State, Files, Goal, Known Issues Resolved, Nexus Day 1 — Task Plan, T1 — Repo scaffold ✅, T2 — Backend skeleton ✅ (+7 more)

### Community 14 - "Community 14"
Cohesion: 0.17
Nodes (11): Current Code & Database State, 🚀 Future Plan (8-Week MVP Roadmap), Instructions for Next Development Session:, Key Architectural Decisions, Nexus v2 — Workspace State & MVP Blueprint, Phase 1: Local Backbone (Weeks 1-2), Phase 2: Front-End Foundation & Direct Routing (Weeks 3-4), Phase 3: Context Infusion & Keyword Indexing (Weeks 5-6) (+3 more)

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (9): Phase 1 — Local Backbone & MVP (Days 1–2), T1 · Repo scaffold ✅, T2 · Backend skeleton ✅, T3 · SQLite DB init ✅, T4 · Model adapters ✅, T5 · Key rotation ✅, T6 · `/query` route ✅, T7 · Route completeness ✅ (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.25
Nodes (7): Completed, In progress / To verify, Next actions, Nexus Task Progress, Notes, Progress, Summary

### Community 17 - "Community 17"
Cohesion: 0.29
Nodes (7): Phase 3 — v0.5 Features (Days 4–6), T13 · Project notes UI ⬜, T14 · Project system prompt editor ⬜, T15 · Cost / token tracker ⬜, T16 · In-project message search ⬜, T17 · Export project history as Markdown ⬜, T18 · Toast / success notifications ⬜

## Knowledge Gaps
- **173 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+168 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Nexus — Master Task Plan v2` connect `Community 10` to `Community 17`, `Community 15`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `Phase 1 — Local Backbone & MVP (Days 1–2)` connect `Community 15` to `Community 10`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `Phase 3 — v0.5 Features (Days 4–6)` connect `Community 17` to `Community 10`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _173 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._