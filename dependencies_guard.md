# Approved Dependencies Guard

## Backend (Python 3.11+)
- `fastapi` & `uvicorn` (Core web API)
- `pydantic` & `pydantic-settings` (Data validation & settings)
- `httpx` (Async HTTP calls to GitHub API)
- `google-genai` (Official Google Gemini SDK)
- `supabase` (Database client for Supabase Postgres)
- `python-jose` or `pyjwt` (JWT handling for Auth validation)

## Frontend (Node.js 20+)
- `next` (React framework)
- `tailwindcss` & `lucide-react` (Styling & Icons)
- `@radix-ui/*` or `shadcn/ui` components (Modular UI)
- `@supabase/supabase-js` (Auth & DB client)
- `axios` or native `fetch` (API requests)

## Strict Rules
- DO NOT add extra third-party SDKs without explicit approval.
- DO NOT add paid scraping services; use native GitHub REST API.