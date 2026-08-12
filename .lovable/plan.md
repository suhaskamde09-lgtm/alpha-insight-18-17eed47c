# Fix: AI Copilot crashes when connected to the real backend

## What's happening

The Copilot page assumes the backend answer looks exactly like the mock answer.

- `src/services/api.ts` only falls back to mock data when the network request **fails**. If your FastAPI service responds successfully but with different field names (e.g. `response`, `answer`, `content` instead of `markdown`), the app happily accepts it.
- `src/components/dashboard/Markdown.tsx` then runs `content.split("\n")` on a value that is `undefined`, which throws during render and takes the whole page down (no error boundary on the route, so it blanks out).

This is the most likely cause given the code, but it is not yet confirmed against your live response — step 1 below verifies it before the fix lands.

## Plan

1. **Confirm the real payload.** Log/inspect the actual JSON returned by `POST /api/scenario` from your backend and compare it to the expected `{ query, markdown, model, latency_ms }` shape.
2. **Make the renderer crash-proof.** `Markdown` returns null (or a small "no content" note) when `content` is missing or not a string.
3. **Normalize the API response.** In `api.ts`, add a small normalizer for the scenario call: accept common alternative keys (`markdown` / `response` / `answer` / `content` / `text`, and a plain string body), coerce `model`/`latency_ms` to safe defaults, and treat a response missing all text fields as an error so the graceful mock fallback kicks in with a visible message.
4. **Surface errors instead of hiding them.** Copilot shows an inline error strip when `ApiResult.error` is set, so a failed or malformed backend call is visible rather than silently mocked.
5. **Add a route-level error boundary** on `/copilot` so any future render error shows a retry card instead of a blank app.

## Technical notes

- Files touched: `src/services/api.ts`, `src/components/dashboard/Markdown.tsx`, `src/routes/copilot.tsx`.
- No backend or business-logic changes; purely defensive client handling and presentation.
- If your backend streams the answer instead of returning JSON, tell me and I will switch the Copilot to a streaming reader instead.
