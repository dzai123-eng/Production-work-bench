# Migration status

| Area | V1 status | Target |
|---|---|---|
| Existing UI | Preserved | Keep current UX, then clean CSS/JS |
| Web hosting | Migrated | Node/Cloud Run/company server |
| `google.script.run` | Migrated through compatibility bridge | Later replace with explicit API client |
| Settings | Local JSON | Database / per-user settings |
| Monitor rendering | Working with standalone API + demo data | Live Google Sheets data |
| Production view | Working with standalone API + demo data | Live Google Sheets data |
| Change History | API shape preserved | PostgreSQL history |
| Routing work log | Local persistence works | Database |
| Routing Gmail | Stubbed | Gmail API OAuth |
| Original email viewer | Stubbed | Gmail API OAuth |
| Reply / attachments | Disabled | Gmail API OAuth |
| Component DONE | Local persistence works | Database + Google Sheet tab creation |
| Chat | Stubbed | Google Sheet/API adapter |
| Vault | Browser-side links retained conceptually | Keep internal browser access |

## Recommended next implementation order

1. Port Google Sheets reads and the four parsers (Planner, Engineer, FTZ, Production).
2. Move history snapshot/change log to PostgreSQL/Supabase.
3. Add Google Workspace OAuth and Gmail API.
4. Port Routing OCR / original-email image handling.
5. Port Component Allocation sheet creation/opening.
6. Remove the compatibility bridge gradually and split the 7,000+ line front-end into modules.
