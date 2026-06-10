# Graph Report - D:\Aaradhya\Nexus  (2026-06-10)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 9 nodes · 9 edges · 2 communities
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fc896c17`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]

## God Nodes (most connected - your core abstractions)
1. `Nexus AI Workflow Hub` - 6 edges
2. `Aaradhya Dev Tamrakar` - 4 edges
3. `PrakopNet` - 2 edges
4. `Fuse AI Fellowship` - 1 edges
5. `FastAPI Backend` - 1 edges
6. `React Frontend` - 1 edges
7. `PostgreSQL` - 1 edges
8. `ChromaDB` - 1 edges
9. `Kathmandu Engineering College` - 1 edges

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

## Communities (2 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.40
Nodes (5): Nexus AI Workflow Hub, FastAPI Backend, React Frontend, ChromaDB, PostgreSQL

### Community 1 - "Community 1"
Cohesion: 0.50
Nodes (4): Aaradhya Dev Tamrakar, Fuse AI Fellowship, Kathmandu Engineering College, PrakopNet

## Knowledge Gaps
- **6 isolated node(s):** `Fuse AI Fellowship`, `FastAPI Backend`, `React Frontend`, `PostgreSQL`, `ChromaDB` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Nexus AI Workflow Hub` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.786) - this node is a cross-community bridge._
- **Why does `Aaradhya Dev Tamrakar` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.464) - this node is a cross-community bridge._
- **What connects `Fuse AI Fellowship`, `FastAPI Backend`, `React Frontend` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._