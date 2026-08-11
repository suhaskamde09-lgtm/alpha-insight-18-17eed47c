import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bot, Brain, Database, LineChart, PlugZap, Save } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GlassCard, StatusPill } from "@/components/dashboard/ui";
import {
  api,
  DEFAULT_BASE_URL,
  getBaseUrl,
  setBaseUrl,
  type HealthResponse,
} from "@/services/api";

export const Route = createFileRoute("/system")({
  head: () => ({
    meta: [
      { title: "System Health & API Config — CrashMemory" },
      {
        name: "description",
        content:
          "Monitor CockroachDB, Gemini, Groq and yfinance connectivity and configure the risk engine backend base URL.",
      },
      { property: "og:title", content: "System Health & API Config — CrashMemory" },
      {
        property: "og:description",
        content:
          "Service connectivity indicators and backend base URL configuration for the risk engine.",
      },
    ],
  }),
  component: System,
});

const ICONS = {
  CockroachDB: Database,
  "Gemini API": Brain,
  "Groq LLM": Bot,
  yfinance: LineChart,
} as const;

const TINTS = {
  CockroachDB: "var(--flare-violet)",
  "Gemini API": "var(--flare-blue)",
  "Groq LLM": "var(--flare-pink)",
  yfinance: "var(--flare-amber)",
} as const;

function System() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [live, setLive] = useState(false);
  const [url, setUrl] = useState(DEFAULT_BASE_URL);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setUrl(getBaseUrl());
    void check();
  }, []);

  async function check() {
    setTesting(true);
    const res = await api.health();
    setHealth(res.data);
    setLive(res.source === "live");
    setMessage(
      res.source === "live"
        ? "Connection successful — live telemetry received."
        : `Backend unreachable (${res.error ?? "no response"}). Showing fallback state.`,
    );
    setTesting(false);
  }

  return (
    <DashboardShell
      title="System Health & API Config"
      subtitle="Connectivity across the risk engine stack and backend endpoint configuration."
      actions={<StatusPill live={live} label={live ? "All systems live" : "Offline mode"} />}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(health?.services ?? []).map((s) => {
          const Icon = ICONS[s.name];
          const tint = TINTS[s.name];
          const online = s.status === "online";
          const statusTint = online
            ? "var(--flare-blue)"
            : s.status === "degraded"
              ? "var(--flare-amber)"
              : "var(--flare-red)";
          return (
            <GlassCard key={s.name} tint={tint} className="p-5">
              <div className="flex items-start justify-between">
                <span
                  className="grid size-10 place-items-center rounded-xl"
                  style={{
                    color: tint,
                    background: `color-mix(in oklab, ${tint} 16%, transparent)`,
                  }}
                >
                  <Icon className="size-5" />
                </span>
                <span
                  className="rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider"
                  style={{
                    color: statusTint,
                    background: `color-mix(in oklab, ${statusTint} 14%, transparent)`,
                    boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${statusTint} 38%, transparent)`,
                  }}
                >
                  {s.status}
                </span>
              </div>
              <p className="mt-4 font-display text-base font-bold">{s.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {s.detail}
              </p>
              <p className="mt-3 font-mono text-[11px] text-muted-foreground">
                latency · {s.latency_ms}ms
              </p>
            </GlassCard>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <GlassCard tint="var(--flare-orange)" className="p-5">
          <div className="flex items-center gap-2">
            <PlugZap className="size-4 text-flare-orange" />
            <h2 className="text-base font-semibold">Backend Configuration</h2>
          </div>
          <label className="mt-4 block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            API base URL
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://localhost:8000"
            className="mt-2 w-full rounded-xl border border-input bg-background/40 px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-ring/60"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setBaseUrl(url);
                void check();
              }}
              className="flex items-center gap-2 rounded-xl bg-spectrum px-5 py-2.5 text-sm font-semibold text-background shadow-[var(--glow-primary)] transition-all hover:brightness-110"
            >
              <Save className="size-4" /> Save & Test Connection
            </button>
            <button
              onClick={() => void check()}
              disabled={testing}
              className="rounded-xl border border-border px-5 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground disabled:opacity-50"
            >
              {testing ? "Testing…" : "Re-run health check"}
            </button>
          </div>
          {message && (
            <p
              className="mt-4 rounded-xl px-4 py-3 text-xs"
              style={{
                color: live ? "var(--flare-blue)" : "var(--flare-amber)",
                background: `color-mix(in oklab, ${live ? "var(--flare-blue)" : "var(--flare-amber)"} 12%, transparent)`,
              }}
            >
              {message}
            </p>
          )}
        </GlassCard>

        <GlassCard tint="var(--flare-blue)" className="p-5">
          <h2 className="text-base font-semibold">Expected Endpoints</h2>
          <ul className="mt-4 space-y-3">
            {[
              ["POST", "/api/analyze", '{ "ticker": "NVDA" }'],
              ["POST", "/api/scenario", '{ "query": "..." }'],
              ["GET", "/api/signals", "market_signals history"],
              ["GET", "/api/health", "service status map"],
            ].map(([method, path, note]) => (
              <li
                key={path}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border px-4 py-3"
              >
                <span
                  className="rounded-md px-2 py-0.5 font-mono text-[10px] font-bold"
                  style={{
                    color: method === "POST" ? "var(--flare-pink)" : "var(--flare-blue)",
                    background: `color-mix(in oklab, ${method === "POST" ? "var(--flare-pink)" : "var(--flare-blue)"} 15%, transparent)`,
                  }}
                >
                  {method}
                </span>
                <span className="font-mono text-sm">{path}</span>
                <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                  {note}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            The dashboard falls back to deterministic mock data whenever the backend is
            unreachable, so every view stays fully rendered during development.
          </p>
        </GlassCard>
      </div>
    </DashboardShell>
  );
}
