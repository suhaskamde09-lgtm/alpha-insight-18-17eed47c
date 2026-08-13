# Chat History Sidebar for the AI Scenario Copilot

Add a persistent history panel to the Copilot page so past scenario runs can be revisited without re-running the analysis.

## What gets built

1. **History storage (localStorage)**
   - Every completed run is saved: prompt, full markdown report, model, latency, whether it was live or mock, and a timestamp.
   - Newest first, capped at 50 entries so storage stays small.
   - Survives reloads; nothing is sent to a backend.

2. **History sidebar on `/copilot`, docked right**
   - The main navigation drawer stays on the left; every secondary panel like this one sits on the right edge so the layout stays balanced and readable.
   - A scrollable column listing past runs: truncated prompt, relative time ("2h ago"), and a small live/mock tag.
   - Clicking an entry restores that run's full report into the response panel (read-only recall, no re-fetch) and highlights it as active.
   - Empty state when there is no history yet.
   - On mobile the panel collapses into a "History" toggle above the input instead of a third column.

3. **New Analysis**
   - Button at the top of the sidebar: clears the input, the current result, and the active selection, returning the page to its empty prompt state.

4. **Clear history**
   - Button at the bottom of the sidebar with a confirm step, wiping all stored runs and resetting the view.
   - Optional per-item delete on hover (small x) so single runs can be removed.

## Layout

Left = main app navigation (unchanged). Right = contextual panels.

```text
+------+----------------+-------------------+------------------+
| Main | Scenario Input | Copilot Response  | History (right)  |
| Nav  | (presets, run) | (markdown report) | [+ New Analysis] |
| left |                |                   | - prompt 1  live |
|      |                |                   | - prompt 2  mock |
|      |                |                   | [Clear history]  |
+------+----------------+-------------------+------------------+
```
Grid becomes 12 columns on large screens (input 3 / response 6 / history 3, history last in DOM order so it renders on the right), stacking on smaller widths.

Same rule applied elsewhere: any secondary/contextual panel on the other pages (for example filter or detail panels) is placed on the right side rather than beside the left nav, so the left edge only ever holds the main sidebar.

## Technical notes

- New `src/lib/copilot-history.ts`: typed entry shape, read/append/remove/clear helpers, safe JSON parsing, SSR guard (`typeof window`).
- New `src/components/dashboard/CopilotHistory.tsx`: presentational sidebar built from existing `GlassCard` / `StatusPill` primitives and the current design tokens.
- `src/routes/copilot.tsx`: hydrate history in `useEffect` (avoids hydration mismatch), append after each `api.scenario` call, and add `activeId` state for selection.
- No API, backend, or data-shape changes; existing error strip, mock fallback, and error boundary stay as-is.
