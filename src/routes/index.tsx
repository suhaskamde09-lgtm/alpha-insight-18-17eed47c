import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Database, Layers, ShieldAlert } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  GlassCard,
  RiskMeter,
  SeverityBadge,
  StatCard,
  StatusPill,
} from "@/components/dashboard/ui";
import { mockAlerts, riskTrend, TRACKED_TICKERS } from "@/lib/mock-data";
import { api } from "@/services/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home Summary — CrashMemory Risk Intelligence" },
      {
        name: "description",
        content:
          "Institutional-grade market risk dashboard: live risk gauge, 30-day ticker risk trends and high-severity alert feed backed by vector crash memory.",
      },
      { property: "og:title", content: "Home Summary — CrashMemory Risk Intelligence" },
      {
        property: "og:description",
        content:
          "Live market risk gauge, 30-day risk trends and high-severity alerts powered by historical crash vector memory.",
      },
    ],
  }),
  component: HomeSummary,
});

const SERIES = [
  { key: "NVDA", color: "var(--flare-orange)" },
  { key: "TSLA", color: "var(--flare-pink)" },
  { key: "COIN", color: "var(--flare-violet)" },
  { key: "PLTR", color: "var(--flare-blue)" },
] as const;

function HomeSummary() {
  const [live, setLive] = useState(false);

  useEffect(() => {
    api.health().then((r) => setLive(r.source === "live"));
  }, []);

  const latest = riskTrend[riskTrend.length - 1]!;
  const overall = Math.round(
    TRACKED_TICKERS.reduce((a, t) => a + (latest[t] ?? 0), 0) / TRACKED_TICKERS.length,
  );

  return (
    <DashboardShell
      title="Home Summary"
      subtitle="Systemic risk posture across monitored assets, benchmarked against historical crash memory."
      actions={<StatusPill live={live} />}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard tint="var(--flare-orange)" className="flex flex-col items-center p-5">
          <p className="self-start font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Overall market risk
          </p>
          <div className="mt-2">
            <RiskMeter score={overall} />
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Weighted composite of {TRACKED_TICKERS.length} tracked tickers
          </p>
        </GlassCard>

        <StatCard
          label="Total monitored assets"
          value="24"
          hint="4 primary tickers · 20 watchlist instruments"
          tint="var(--flare-violet)"
          icon={<Layers className="size-4" />}
        >
          <div className="mt-5 flex flex-wrap gap-2">
            {TRACKED_TICKERS.map((t) => (
              <span
                key={t}
                className="rounded-lg border border-border px-2.5 py-1 font-mono text-xs text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </StatCard>

        <StatCard
          label="CockroachDB vector memory"
          value={live ? "Synced" : "Cached"}
          hint="3 crash regimes · 768-dim Gemini embeddings"
          tint="var(--flare-blue)"
          icon={<Database className="size-4" />}
        >
          <div className="mt-5 space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>historical_memory</span>
              <span className="font-mono text-foreground">3 rows</span>
            </div>
            <div className="flex justify-between">
              <span>market_signals</span>
              <span className="font-mono text-foreground">10 rows</span>
            </div>
            <div className="flex justify-between">
              <span>index type</span>
              <span className="font-mono text-foreground">cosine &lt;=&gt;</span>
            </div>
          </div>
        </StatCard>
      </div>

      <GlassCard className="mt-4 p-5" tint="var(--flare-pink)">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">30-Day Risk Trend</h2>
            <p className="text-xs text-muted-foreground">
              Rolling model risk score per ticker (0–100)
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            source · risk engine
          </span>
        </div>
        <div className="mt-6 h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={riskTrend} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                {SERIES.map((s) => (
                  <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 6"
                stroke="currentColor"
                className="text-foreground/10"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                minTickGap={24}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--muted-foreground)" }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              {SERIES.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={2}
                  fill={`url(#g-${s.key})`}
                  activeDot={{ r: 4 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard className="mt-4 p-5" tint="var(--flare-red)">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-4 text-flare-red" />
          <h2 className="text-base font-semibold">High-Severity Alert Feed</h2>
        </div>
        <ul className="mt-4 divide-y divide-border">
          {mockAlerts.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-start gap-3 py-3.5 transition-colors hover:bg-foreground/[0.03]"
            >
              <span className="w-14 shrink-0 font-mono text-sm font-semibold">
                {a.ticker}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm">{a.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Matched memory · {a.matched}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <SeverityBadge severity={a.severity} />
                <span className="w-20 text-right font-mono text-[11px] text-muted-foreground">
                  {a.time}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </GlassCard>
    </DashboardShell>
  );
}
