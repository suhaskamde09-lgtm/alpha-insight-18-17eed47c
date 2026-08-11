import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, FileJson, RefreshCw, Search } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GlassCard, SeverityBadge, StatusPill } from "@/components/dashboard/ui";
import { api, type MarketSignal, type Severity } from "@/services/api";
import { mockSignals } from "@/lib/mock-data";

export const Route = createFileRoute("/logs")({
  head: () => ({
    meta: [
      { title: "Signal Audit Logs — CrashMemory" },
      {
        name: "description",
        content:
          "Searchable audit trail of stored market risk signals: ticker, risk score, severity, valuation ratios and vector distance.",
      },
      { property: "og:title", content: "Signal Audit Logs — CrashMemory" },
      {
        property: "og:description",
        content:
          "Searchable audit trail of stored market risk signals with valuation ratios and vector distance.",
      },
    ],
  }),
  component: Logs,
});

const FILTERS: (Severity | "All")[] = ["All", "Low", "Medium", "High", "Critical"];

function Logs() {
  const [rows, setRows] = useState<MarketSignal[]>(mockSignals);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [severity, setSeverity] = useState<Severity | "All">("All");

  async function refresh() {
    setLoading(true);
    const res = await api.signals();
    setRows(res.data);
    setLive(res.source === "live");
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (severity === "All" || r.severity === severity) &&
          r.asset_ticker.toLowerCase().includes(q.toLowerCase()),
      ),
    [rows, q, severity],
  );

  function download(name: string, content: string, type: string) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const header =
      "ticker,risk_score,severity,pe_ratio,ps_ratio,vector_distance,created_at";
    const body = filtered
      .map((r) =>
        [
          r.asset_ticker,
          Math.round(r.risk_probability * 100),
          r.severity,
          r.pe_ratio,
          r.ps_ratio,
          r.vector_distance,
          r.created_at,
        ].join(","),
      )
      .join("\n");
    download("signal_audit_logs.csv", `${header}\n${body}`, "text/csv");
  }

  return (
    <DashboardShell
      title="Signal Audit Logs"
      subtitle="Every risk signal persisted to the market_signals table in CockroachDB."
      actions={<StatusPill live={live} label={live ? "Live table" : "Mock table"} />}
    >
      <GlassCard tint="var(--flare-amber)" className="p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search ticker…"
              className="w-full rounded-xl border border-input bg-background/40 py-2.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/60"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setSeverity(f)}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  severity === f
                    ? "bg-spectrum text-background"
                    : "border border-border text-muted-foreground hover:bg-foreground/5"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => void refresh()}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={exportCsv}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <Download className="size-3.5" /> CSV
            </button>
            <button
              onClick={() =>
                download(
                  "signal_audit_logs.json",
                  JSON.stringify(filtered, null, 2),
                  "application/json",
                )
              }
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <FileJson className="size-3.5" /> JSON
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-foreground/5">
              <tr>
                {[
                  "Ticker",
                  "Risk Score",
                  "Severity",
                  "P/E",
                  "P/S",
                  "Vector Distance",
                  "Timestamp",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => {
                const score = Math.round(r.risk_probability * 100);
                return (
                  <tr key={r.id} className="transition-colors hover:bg-foreground/[0.04]">
                    <td className="px-4 py-3 font-mono font-semibold">{r.asset_ticker}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-24 overflow-hidden rounded-full bg-foreground/10">
                          <span
                            className="block h-full bg-heat"
                            style={{ width: `${score}%` }}
                          />
                        </span>
                        <span className="font-mono text-xs">{score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={r.severity} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{r.pe_ratio.toFixed(1)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.ps_ratio.toFixed(1)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-flare-violet">
                      {r.vector_distance.toFixed(3)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {new Date(r.created_at).toISOString().replace("T", " ").slice(0, 16)}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    No signals match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">
          {filtered.length} of {rows.length} records
        </p>
      </GlassCard>
    </DashboardShell>
  );
}
