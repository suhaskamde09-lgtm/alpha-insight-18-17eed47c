import type {
  AnalyzeResponse,
  HealthResponse,
  MarketSignal,
  ScenarioResponse,
  Severity,
} from "@/services/api";

export const TRACKED_TICKERS = ["NVDA", "TSLA", "COIN", "PLTR"] as const;

export function severityFromScore(score: number): Severity {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 35) return "Medium";
  return "Low";
}

/** Deterministic pseudo-random so SSR and client render identically. */
function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export interface TrendPoint {
  date: string;
  NVDA: number;
  TSLA: number;
  COIN: number;
  PLTR: number;
}

export const riskTrend: TrendPoint[] = (() => {
  const rand = seeded(42);
  const base: Record<string, number> = { NVDA: 58, TSLA: 64, COIN: 71, PLTR: 49 };
  const out: TrendPoint[] = [];
  const start = Date.UTC(2026, 6, 13);
  for (let i = 0; i < 30; i++) {
    const point: Record<string, number | string> = {
      date: new Date(start + i * 86400000).toISOString().slice(5, 10),
    };
    for (const t of TRACKED_TICKERS) {
      const drift = (rand() - 0.44) * 6;
      base[t] = Math.min(96, Math.max(18, base[t] + drift));
      point[t] = Math.round(base[t] * 10) / 10;
    }
    out.push(point as unknown as TrendPoint);
  }
  return out;
})();

export interface AlertItem {
  id: string;
  ticker: string;
  severity: Severity;
  message: string;
  matched: string;
  time: string;
}

export const mockAlerts: AlertItem[] = [
  {
    id: "a1",
    ticker: "COIN",
    severity: "Critical",
    message: "P/S ratio expansion mirrors speculative peak conditions.",
    matched: "2021 Tech & SPAC Over-valuation Peak",
    time: "12 min ago",
  },
  {
    id: "a2",
    ticker: "NVDA",
    severity: "High",
    message: "Trailing P/E above 100x with retail-driven momentum flow.",
    matched: "1999 Dot-Com Tech Bubble (Cisco Example)",
    time: "48 min ago",
  },
  {
    id: "a3",
    ticker: "TSLA",
    severity: "Medium",
    message: "Debt-to-equity drift detected against 5y baseline.",
    matched: "2021 Tech & SPAC Over-valuation Peak",
    time: "3 h ago",
  },
  {
    id: "a4",
    ticker: "SOFI",
    severity: "High",
    message: "Leverage profile approaching pre-crisis banking envelope.",
    matched: "2008 Lehman Brothers Financial Crisis",
    time: "6 h ago",
  },
  {
    id: "a5",
    ticker: "PLTR",
    severity: "Low",
    message: "Vector distance widened — divergence from crash memory.",
    matched: "2021 Tech & SPAC Over-valuation Peak",
    time: "9 h ago",
  },
];

export const HISTORICAL_MEMORY = [
  {
    id: "mem-1999",
    event_name: "1999 Dot-Com Tech Bubble (Cisco Example)",
    period_year: 1999,
    metric_ratios: { pe_ratio: 130, ps_ratio: 38, debt_to_equity: 0.15 },
    summary_text:
      "Extreme tech valuations driven by speculative infrastructure spending, inflated P/E ratios exceeding 100x, and high retail sentiment without underlying profit justification.",
  },
  {
    id: "mem-2008",
    event_name: "2008 Lehman Brothers Financial Crisis",
    period_year: 2008,
    metric_ratios: { pe_ratio: 12, ps_ratio: 1.4, debt_to_equity: 31 },
    summary_text:
      "High leverage across financial balance sheets, excessive exposure to subprime mortgage-backed assets, and sudden liquidity freeze across interbank lending.",
  },
  {
    id: "mem-2021",
    event_name: "2021 Tech & SPAC Over-valuation Peak",
    period_year: 2021,
    metric_ratios: { pe_ratio: 95, ps_ratio: 25, debt_to_equity: 0.42 },
    summary_text:
      "Unprecedented monetary stimulus creating speculative growth equity bubbles, zero-revenue SPAC listings, and hyper-inflated price-to-sales ratios across SaaS and EV startups.",
  },
];

export function mockAnalysis(tickerRaw: string): AnalyzeResponse {
  const ticker = (tickerRaw || "NVDA").toUpperCase();
  const rand = seeded(
    ticker.split("").reduce((a, c) => a + c.charCodeAt(0), 7) * 13,
  );
  const pe = Math.round((28 + rand() * 90) * 10) / 10;
  const ps = Math.round((3 + rand() * 26) * 10) / 10;
  const de = Math.round((0.1 + rand() * 1.8) * 100) / 100;
  const memory = HISTORICAL_MEMORY[Math.floor(rand() * HISTORICAL_MEMORY.length)];
  const score = Math.min(
    98,
    Math.round(pe * 0.45 + ps * 1.1 + de * 6 + rand() * 8),
  );

  return {
    metrics: {
      ticker,
      pe_ratio: pe,
      ps_ratio: ps,
      debt_to_equity: de,
      summary: `${ticker} operates in a high-beta growth segment. Valuation multiples are being benchmarked against the vector memory of prior systemic drawdowns stored in CockroachDB.`,
    },
    matched_memory: {
      id: memory.id,
      event_name: memory.event_name,
      period_year: memory.period_year,
      summary_text: memory.summary_text,
      distance: Math.round((0.12 + rand() * 0.42) * 1000) / 1000,
      metric_ratios: memory.metric_ratios,
    },
    risk_score_100: score,
    severity: severityFromScore(score),
    rationale: `Embedding similarity places ${ticker} closest to the ${memory.event_name} regime. Multiple expansion is outpacing earnings delivery, and the price-to-sales profile sits in the upper decile of the comparison window.`,
    strategic_actions: [
      "Trim concentrated exposure into strength and stage re-entry levels.",
      "Hedge downside with 3–6 month protective puts near the 20% drawdown strike.",
      "Monitor liquidity and rate-sensitivity factors weekly against the matched regime.",
    ],
  };
}

export function mockScenario(query: string): ScenarioResponse {
  return {
    query,
    model: "groq/llama-3.3-70b-versatile (mock)",
    latency_ms: 842,
    markdown: `## Scenario Probabilities

| Outcome | Probability | Horizon |
| --- | --- | --- |
| Contained volatility, no regime change | 46% | 3 months |
| Sector-wide multiple compression | 34% | 6 months |
| Systemic liquidity stress event | 20% | 12 months |

## Impact Analysis

- **Equities:** High-multiple tech carries the largest downside convexity; vector memory places the current setup nearest the *2021 Tech & SPAC Over-valuation Peak*.
- **Credit:** Spread widening of 80–140bps is plausible if funding markets tighten, echoing early-2008 interbank behaviour.
- **FX & Commodities:** Dollar strength suppresses commodity beta; energy remains the primary geopolitical transmission channel.

## Strategic Actions

1. Reduce beta in unprofitable growth names trading above 60x earnings.
2. Rotate into cash-generative quality with debt-to-equity below 0.6.
3. Maintain 8–12% dry powder to deploy into forced-liquidation windows.
4. Re-run this scenario weekly and track vector distance drift against crash memory.

> Generated from mock data — connect the backend in **System Health & API Config** for live Groq inference.`,
  };
}

export const mockSignals: MarketSignal[] = [
  ["NVDA", 0.88, 118.4, 34.2, 0.142, "2026-08-11T09:14:00Z"],
  ["COIN", 0.81, 96.1, 21.7, 0.188, "2026-08-11T07:02:00Z"],
  ["TSLA", 0.64, 71.3, 9.8, 0.264, "2026-08-10T18:41:00Z"],
  ["PLTR", 0.58, 188.6, 42.1, 0.211, "2026-08-10T15:20:00Z"],
  ["SOFI", 0.72, 24.9, 3.4, 0.301, "2026-08-10T11:05:00Z"],
  ["AMD", 0.49, 46.2, 8.1, 0.352, "2026-08-09T20:33:00Z"],
  ["MSTR", 0.93, 142.7, 58.3, 0.108, "2026-08-09T13:12:00Z"],
  ["SNOW", 0.61, 88.0, 14.9, 0.246, "2026-08-08T16:48:00Z"],
  ["RIVN", 0.77, 12.1, 4.6, 0.198, "2026-08-08T09:27:00Z"],
  ["AAPL", 0.28, 33.4, 8.9, 0.472, "2026-08-07T14:03:00Z"],
].map(([ticker, prob, pe, ps, dist, created], i) => ({
  id: `sig-${i + 1}`,
  asset_ticker: ticker as string,
  risk_probability: prob as number,
  severity: severityFromScore((prob as number) * 100),
  pe_ratio: pe as number,
  ps_ratio: ps as number,
  vector_distance: dist as number,
  source_url: `https://finance.yahoo.com/quote/${ticker}`,
  created_at: created as string,
}));

export function mockHealth(): HealthResponse {
  return {
    checked_at: new Date().toISOString(),
    services: [
      {
        name: "CockroachDB",
        status: "offline",
        latency_ms: 0,
        detail: "Vector memory cluster — historical_memory, market_signals",
      },
      {
        name: "Gemini API",
        status: "offline",
        latency_ms: 0,
        detail: "gemini-embedding-001 · 768-dim embeddings",
      },
      {
        name: "Groq LLM",
        status: "offline",
        latency_ms: 0,
        detail: "Scenario reasoning & risk narrative generation",
      },
      {
        name: "yfinance",
        status: "offline",
        latency_ms: 0,
        detail: "Real-time fundamentals: P/E, P/S, debt-to-equity",
      },
    ],
  };
}
