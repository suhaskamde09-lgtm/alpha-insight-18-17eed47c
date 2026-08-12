import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Bot, RotateCcw, Sparkles, Zap } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GlassCard, StatusPill } from "@/components/dashboard/ui";
import { api, type ScenarioResponse } from "@/services/api";
import { Markdown } from "@/components/dashboard/Markdown";

export const Route = createFileRoute("/copilot")({
  head: () => ({
    meta: [
      { title: "AI Scenario Copilot — CrashMemory" },
      {
        name: "description",
        content:
          "Run macro and geopolitical scenario analysis through the Groq-powered risk copilot with probabilities, impact analysis and strategic actions.",
      },
      { property: "og:title", content: "AI Scenario Copilot — CrashMemory" },
      {
        property: "og:description",
        content:
          "Macro and geopolitical scenario reasoning with probabilities, impact analysis and strategic actions.",
      },
    ],
  }),
  component: Copilot,
  errorComponent: CopilotError,
});

function CopilotError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <DashboardShell
      title="AI Scenario Copilot"
      subtitle="Something went wrong while rendering the copilot response."
    >
      <GlassCard tint="var(--flare-red)" className="p-6">
        <div className="flex items-center gap-2 text-flare-red">
          <AlertTriangle className="size-4" />
          <h2 className="text-base font-semibold">Copilot render error</h2>
        </div>
        <p className="mt-3 font-mono text-xs text-muted-foreground">{error.message}</p>
        <button
          onClick={reset}
          className="mt-5 flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-foreground/5"
        >
          <RotateCcw className="size-4" />
          Try again
        </button>
      </GlassCard>
    </DashboardShell>
  );
}

const PRESETS = [
  "Fed holds rates above 5% through 2027 while AI capex decelerates",
  "Escalation in the Taiwan Strait disrupts advanced semiconductor supply",
  "Regional bank funding stress reappears amid commercial real estate defaults",
];

function Copilot() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScenarioResponse | null>(null);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!query.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);
    const res = await api.scenario(query.trim());
    setLive(res.source === "live");
    setError(res.error ?? null);
    setResult(res.data);
    setLoading(false);
  }

  return (
    <DashboardShell
      title="AI Scenario Copilot"
      subtitle="Stress-test macro and geopolitical narratives against historical crash memory."
      actions={<StatusPill live={live} label={live ? "Groq live" : "Mock inference"} />}
    >
      <div className="grid gap-4 lg:grid-cols-5">
        <GlassCard tint="var(--flare-violet)" className="p-5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-flare-violet" />
            <h2 className="text-base font-semibold">Scenario Input</h2>
          </div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={7}
            placeholder="Describe a macro or geopolitical scenario — e.g. 'Oil spikes to $140 while the dollar strengthens 8% over two quarters.'"
            className="mt-4 w-full resize-none rounded-xl border border-input bg-background/40 p-4 text-sm leading-relaxed outline-none transition-shadow placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring/60"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setQuery(p)}
                className="rounded-full border border-border px-3 py-1.5 text-left text-[11px] text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                {p.slice(0, 42)}…
              </button>
            ))}
          </div>
          <button
            onClick={run}
            disabled={loading || !query.trim()}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-spectrum px-4 py-3 text-sm font-semibold text-background shadow-[var(--glow-primary)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Zap className="size-4" />
            {loading ? "Running analysis…" : "Run Scenario Analysis"}
          </button>
        </GlassCard>

        <GlassCard tint="var(--flare-pink)" className="p-5 lg:col-span-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-flare-pink" />
              <h2 className="text-base font-semibold">Copilot Response</h2>
            </div>
            {result && (
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {result.model} · {result.latency_ms}ms
              </span>
            )}
          </div>

          {loading && <SkeletonResponse />}

          {!loading && !result && (
            <div className="grid min-h-[320px] place-items-center text-center">
              <div>
                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-spectrum opacity-80">
                  <Bot className="size-6 text-background" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Enter a scenario to generate probabilities, impact analysis
                  <br className="hidden sm:block" /> and strategic actions.
                </p>
              </div>
            </div>
          )}

          {!loading && result && (
            <div className="mt-4">
              <Markdown content={result.markdown} />
            </div>
          )}
        </GlassCard>
      </div>
    </DashboardShell>
  );
}

function SkeletonResponse() {
  return (
    <div className="mt-5 space-y-3">
      {[90, 70, 100, 82, 60, 95, 74].map((w, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded-md bg-foreground/10"
          style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }}
        />
      ))}
      <div className="h-28 animate-pulse rounded-xl bg-foreground/10" />
    </div>
  );
}
