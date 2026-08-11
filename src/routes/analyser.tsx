import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GitCompareArrows, Percent, Scale, Search, TrendingUp } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  GlassCard,
  RiskMeter,
  SeverityBadge,
  StatCard,
  StatusPill,
} from "@/components/dashboard/ui";
import { api, type AnalyzeResponse } from "@/services/api";

export const Route = createFileRoute("/analyser")({
  head: () => ({
    meta: [
      { title: "Asset Risk Analyser — CrashMemory" },
      {
        name: "description",
        content:
          "Analyse any ticker's P/E, P/S and debt-to-equity against vector-matched historical crash profiles with a 0-100 risk score.",
      },
      { property: "og:title", content: "Asset Risk Analyser — CrashMemory" },
      {
        property: "og:description",
        content:
          "Ticker fundamentals matched against historical crash regimes with a 0-100 risk score.",
      },
    ],
  }),
  component: Analyser;
});

const SUGGESTIONS = ["NVDA", "TSLA", "COIN", "PLTR", "MSTR"];

function Analyser() {
  const [ticker, setTicker] = useState("NVDA");
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState(false);
  const [data, setData] = useState<AnalyzeResponse | null>(null);

  async function analyze(t = ticker) {
    if (!t.trim() || loading) return;
    setLoading(true);
    const res = await api.analyze(t.trim().toUpperCase());
    setLive(res.source === "live");
    setData(res.data);
    setLoading(false);
  }

  return (
    <DashboardShell
      title="Asset Risk Analyser"
      subtitle="Fundamentals from yfinance, embedded with Gemini and matched against CockroachDB crash memory."
      actions={<StatusPill live={live} label={live ? "Live yfinance" : "Mock data"} />}
    >
      <GlassCard tint="var(--flare-pink)" className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && analyze()}
              placeholder="Enter ticker — NVDA, TSLA…"
              className="w-full rounded-xl border border-input bg-background/40 py-3 pl-11 pr-4 font-mono text-sm outline-none focus:ring-2 focus:ring-ring/60"
            />
          </div>
          <button
            onClick={() => analyze()}
            disabled={loading}
            className="rounded-xl bg-spectrum px-6 py-3 text-sm font-semibold text-background shadow-[var(--glow-primary)] transition-all hover:brightness-110 disabled:opacity-40"
          >
            {loading ? "Analyzing…" : "Analyze Asset"}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setTicker(s);
                analyze(s);
              }}
              className="rounded-lg border border-border px-3 py-1 font-mono text-xs text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      </GlassCard>

      {!data && !loading && (
        <GlassCard className="mt-4 grid min-h-[280px] place-items-center p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Run an analysis to compare live fundamentals against 1999, 2008 and 2021
            crash regimes.
          </p>
        </GlassCard>
      )}

      {loading && (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass h-36 animate-pulse rounded-2xl" />
          ))}
        </div>
      )}

      {data && !loading && (
        <>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="P/E Ratio"
              value={data.metrics.pe_ratio.toFixed(1)}
              hint="Trailing twelve months"
              tint="var(--flare-orange)"
              icon={<TrendingUp className="size-4" />}
            />
            <StatCard
              label="P/S Ratio"
              value={data.metrics.ps_ratio.toFixed(1)}
              hint="Price to sales (TTM)"
              tint="var(--flare-amber)"
              icon={<Percent className="size-4" />}
            />
            <StatCard
              label="Debt / Equity"
              value={data.metrics.debt_to_equity.toFixed(2)}
              hint="Balance-sheet leverage"
              tint="var(--flare-blue)"
              icon={<Scale className="size-4" />}
            />
            <GlassCard tint="var(--flare-red)" className="flex flex-col items-center p-5">
              <div className="flex w-full items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Risk score
                </p>
                <SeverityBadge severity={data.severity} />
              </div>
              <RiskMeter score={data.risk_score_100} size={150} />
            </GlassCard>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-5">
            <GlassCard tint="var(--flare-violet)" className="p-5 lg:col-span-3">
              <div className="flex items-center gap-2">
                <GitCompareArrows className="size-4 text-flare-violet" />
                <h2 className="text-base font-semibold">
                  Vector Memory Match Comparison
                </h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border p-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Target asset
                  </p>
                  <p className="mt-1 font-display text-xl font-bold">
                    {data.metrics.ticker}
                  </p>
                  <Rows
                    rows={[
                      ["P/E", data.metrics.pe_ratio.toFixed(1)],
                      ["P/S", data.metrics.ps_ratio.toFixed(1)],
                      ["D/E", data.metrics.debt_to_equity.toFixed(2)],
                    ]}
                  />
                </div>
                <div
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: "color-mix(in oklab, var(--flare-red) 40%, transparent)",
                    background: "color-mix(in oklab, var(--flare-red) 8%, transparent)",
                  }}
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Matched crash memory · {data.matched_memory.period_year}
                  </p>
                  <p className="mt-1 font-display text-sm font-bold leading-tight">
                    {data.matched_memory.event_name}
                  </p>
                  <Rows
                    rows={[
                      ["P/E", String(data.matched_memory.metric_ratios["pe_ratio"] ?? "—")],
                      ["P/S", String(data.matched_memory.metric_ratios["ps_ratio"] ?? "—")],
                      [
                        "D/E",
                        String(data.matched_memory.metric_ratios["debt_to_equity"] ?? "—"),
                      ],
                    ]}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-foreground/5 px-4 py-3">
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Cosine vector distance
                </span>
                <span className="font-mono text-sm font-semibold text-flare-pink">
                  {data.matched_memory.distance.toFixed(3)}
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {data.matched_memory.summary_text}
              </p>
            </GlassCard>

            <GlassCard tint="var(--flare-amber)" className="p-5 lg:col-span-2">
              <h2 className="text-base font-semibold">Rationale & Strategic Actions</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {data.rationale}
              </p>
              <ul className="mt-4 space-y-3">
                {data.strategic_actions.map((a, i) => (
                  <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="grid size-5 shrink-0 place-items-center rounded-md bg-spectrum font-mono text-[10px] font-bold text-background">
                      {i + 1}
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
                {data.metrics.summary}
              </p>
            </GlassCard>
          </div>
        </>
      )}
    </DashboardShell>
  );
}

function Rows({ rows }: { rows: [string, string][] }) {
  return (
    <div className="mt-3 space-y-2">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between text-sm">
          <span className="text-muted-foreground">{k}</span>
          <span className="font-mono font-semibold">{v}</span>
        </div>
      ))}
    </div>
  );
}
