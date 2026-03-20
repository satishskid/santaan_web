---
name: "qmd"
description: "Runs QMD to index and search local markdown/docs with hybrid keyword+semantic search. Invoke when you need to find or retrieve internal docs/notes fast."
---

# QMD (Query Markdown Documents)

Use QMD to build an on-device index over markdown (and similar) documents, then search with keywords or natural language.

## When to Invoke

- When you need to find a procedure, decision, or snippet inside many markdown docs/notes.
- When you need a fast “search + fetch” workflow for internal knowledge bases.
- When a user asks “do we have docs/notes about X?” or “where is X documented?”.

## Prerequisites

- QMD CLI installed:
  - `qmd --version` should work.

## One-Time Setup (per machine)

1. Create collections for the folders you want indexed:
   - `qmd collection add <absolute-or-relative-path> --name <collection-name>`

2. Add short human context to collections (improves relevance):
   - `qmd context add qmd://<collection-name> "What this collection contains and how to interpret it"`

3. Generate embeddings for semantic search:
   - `qmd embed`

## Daily Usage

- Fast keyword search (BM25):
  - `qmd search "your keywords"`

- Semantic search:
  - `qmd vsearch "natural language question"`

- Best quality hybrid search + reranking:
  - `qmd query "what you are trying to find"`

- Get the full content of a specific result:
  - `qmd get "path/from/result.md" --full`

## Agent-Friendly Output

- Structured results:
  - `qmd query "…" --json -n 10`

- List all matching files above a threshold:
  - `qmd query "…" --all --files --min-score 0.4`

## Example (Index this repo’s docs)

- Add a collection:
  - `qmd collection add ./docs --name santaan-docs`

- Add context:
  - `qmd context add qmd://santaan-docs "Santaan operating manuals and internal SOPs for web + CRM + growth"`

- Embed and query:
  - `qmd embed`
  - `qmd query "how do we deploy to production and set domains?" --json -n 10`

## Optional: MCP Server

If your client supports MCP, you can run QMD’s MCP server:

- Stdio transport:
  - `qmd mcp`

- HTTP transport (long-lived server):
  - `qmd mcp --http`

