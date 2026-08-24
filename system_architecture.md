# System Architecture

## Core Flow Diagram
[Next.js Frontend] 
   │
   ├── (Auth) ──────────────► [Firebase Auth / GitHub OAuth]
   │
   ├── (API Requests) ──────► [FastAPI Backend]
                                  │
                                  ├── (Fetch Public/Private Repos) ──► [GitHub REST API]
                                  │
                                  ├── (Analyze Code Signals) ───────► [Gemini Free API]
                                  │
                                  └── (Store Profile & Sprints) ────► [Supabase Postgres]

## Architecture Components
1. **Frontend (Next.js App Router):** Manages user state, repository selection, sprint UI board, and badge card rendering.
2. **Backend Services (FastAPI):**
   - `github_service.py`: Fetches user repositories, directory trees, `package.json`/`requirements.txt`/`go.mod`, test directories, and READMEs using GitHub OAuth tokens.
   - `gemini_service.py`: Formats repository metadata, injects goal-lane rubrics, calls Gemini Free API (`google-genai`), and validates JSON output schemas.
   - `sprint_service.py`: Stores sprint progress, validates evidence submission (PR links), and issues completion badges.
3. **Database (Supabase PostgreSQL):** Stores user profiles, scanned repository summaries, assigned sprint roadmaps, and verified badge hashes.