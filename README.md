# Production Workbench — Standalone Web App V1

This is the first migration of **Production Sequence Monitor / Unified Workbench V8.1.14** away from Google Apps Script hosting.

## What works now

- Runs as a normal standalone web server, not `script.google.com`.
- Reuses the existing `Index.html` UI almost unchanged.
- Includes a compatibility bridge for existing `google.script.run` calls, so the front-end does not need an immediate rewrite.
- Monitor / Production / Change History can render through the standalone API.
- Routing personal work state, start/complete actions, routing detail persistence, phase DONE persistence, and local Component DONE state have standalone JSON storage.
- Routing / Mail / Component / Chat page navigation remains available.
- Demo data is included so the migrated shell is testable immediately.

## What is intentionally not live yet

The old Apps Script backend uses Apps Script-only services such as `SpreadsheetApp`, `GmailApp`, `PropertiesService`, `CacheService`, `DriveApp`, and `Session`. Those cannot run unchanged in Node.js.

V1 therefore isolates these remaining adapters:

1. Google Sheets live source adapter (Planner / Engineer / Production / FTZ / Mail Tasks / Chat / Component sheet)
2. Gmail OAuth adapter (search, original email viewer, reply, attachments)
3. Persistent database adapter (replace local JSON with PostgreSQL/Supabase)
4. Optional Google Workspace login
5. Vault remains browser-side because it is an internal-company URL.

## Run

Requires Node.js 18+ on the **server/development computer**. End-user company PCs only need a browser.

```bash
npm start
```

Open:

```text
http://localhost:8787/
```

Routing page:

```text
http://localhost:8787/?page=routing
```

Component page:

```text
http://localhost:8787/?page=component
```

Health check:

```text
http://localhost:8787/health
```

## Architecture

```text
Browser (existing Index UI)
        |
        | google.script.run compatibility bridge
        v
Node.js standalone API
        |
        +-- local JSON store (V1)
        +-- Google Sheets adapter (next)
        +-- Gmail API adapter (next)
        +-- PostgreSQL/Supabase (next)
        +-- Vault links open in company browser
```

## Migration source

The exact uploaded source is preserved under `source/` so no old business logic is lost while adapters are migrated one by one.

## Browser-only cloud deployment

A `render.yaml` file is included. See `DEPLOY_BROWSER_ONLY.md` for the no-install GitHub + Render workflow.

The current JSON persistence is temporary demo storage. Cloud restarts/redeploys may reset it; production persistence should use PostgreSQL/Supabase.
