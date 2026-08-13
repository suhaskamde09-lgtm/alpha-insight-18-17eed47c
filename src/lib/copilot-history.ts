/** localStorage-backed history of AI Scenario Copilot runs. */
export interface CopilotHistoryEntry {
  id: string;
  query: string;
  markdown: string;
  model: string;
  latency_ms: number;
  live: boolean;
  created_at: number;
}

const KEY = "copilot_history_v1";
const MAX_ENTRIES = 50;

export function readHistory(): CopilotHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is CopilotHistoryEntry =>
        !!e &&
        typeof e === "object" &&
        typeof (e as CopilotHistoryEntry).id === "string" &&
        typeof (e as CopilotHistoryEntry).query === "string" &&
        typeof (e as CopilotHistoryEntry).markdown === "string",
    );
  } catch {
    return [];
  }
}

function write(entries: CopilotHistoryEntry[]): CopilotHistoryEntry[] {
  if (typeof window === "undefined") return entries;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    /* quota or private mode — history is best-effort */
  }
  return entries;
}

export function appendHistory(
  entry: Omit<CopilotHistoryEntry, "id" | "created_at">,
): CopilotHistoryEntry[] {
  const full: CopilotHistoryEntry = {
    ...entry,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    created_at: Date.now(),
  };
  return write([full, ...readHistory()].slice(0, MAX_ENTRIES));
}

export function removeHistory(id: string): CopilotHistoryEntry[] {
  return write(readHistory().filter((e) => e.id !== id));
}

export function clearHistory(): CopilotHistoryEntry[] {
  return write([]);
}

export function relativeTime(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d ago` : new Date(ts).toLocaleDateString();
}
