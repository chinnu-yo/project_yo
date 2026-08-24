# Antigravity Agent Instructions & Operating Rules

## Primary Guidelines
1. **Strict Cost Safety:** NEVER write code that introduces paid API dependencies. Use `google-genai` SDK with free-tier model identifiers (e.g., `gemini-2.5-flash` or `gemini-1.5-flash`).
2. **Deterministic Output:** Always enforce strict Pydantic models on FastAPI endpoints and structured JSON outputs from Gemini calls.
3. **No Phantom Code:** Implement complete, working endpoints. Do not leave placeholder comments like `# TODO: implement GitHub fetching`.
4. **Modularity:** Keep backend routes cleanly separated inside `app/api/v1/` and logic in `app/services/`.
5. **Context Check:** Re-read `system_architecture.md` and `api_contracts.md` before writing new database models or endpoints.