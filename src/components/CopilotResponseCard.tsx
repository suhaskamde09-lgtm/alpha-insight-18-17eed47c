import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Markdown } from "@/components/dashboard/Markdown";
import type { ScenarioResponse } from "@/services/api";
import { cn } from "@/lib/utils";

// 🧠 Context-Aware Graph Generator
export function getSmartChartData(promptText: string = "") {
  const query = promptText.toLowerCase();

  // Preset 1: Fed Rates / AI Capex (Slow compound buildup)
  if (query.includes("fed") || query.includes("rate") || query.includes("capex")) {
    return [
      { month: "Jan", risk: 38 }, { month: "Feb", risk: 42 },
      { month: "Mar", risk: 51 }, { month: "Apr", risk: 63 },
      { month: "May", risk: 72 }, { month: "Jun", risk: 80 },
      { month: "Jul", risk: 86 }, { month: "Aug", risk: 89 },
      { month: "Sep", risk: 91 }, { month: "Oct", risk: 88 },
      { month: "Nov", risk: 82 }, { month: "Dec", risk: 75 },
    ];
  }

  // Preset 2: Geopolitical / Taiwan Strait (Immediate spike & high volatility)
  if (query.includes("taiwan") || query.includes("escalation") || query.includes("strait")) {
    return [
      { month: "Jan", risk: 22 }, { month: "Feb", risk: 28 },
      { month: "Mar", risk: 35 }, { month: "Apr", risk: 94 }, // Sudden shock
      { month: "May", risk: 88 }, { month: "Jun", risk: 79 },
      { month: "Jul", risk: 71 }, { month: "Aug", risk: 65 },
      { month: "Sep", risk: 58 }, { month: "Oct", risk: 52 },
      { month: "Nov", risk: 46 }, { month: "Dec", risk: 41 },
    ];
  }

  // Preset 3: Regional Banking Stress (V-Shape Crisis & Recovery)
  if (query.includes("bank") || query.includes("funding") || query.includes("regional")) {
    return [
      { month: "Jan", risk: 30 }, { month: "Feb", risk: 45 },
      { month: "Mar", risk: 82 }, { month: "Apr", risk: 88 }, // Liquidity freeze
      { month: "May", risk: 64 }, { month: "Jun", risk: 48 },
      { month: "Jul", risk: 39 }, { month: "Aug", risk: 42 },
      { month: "Sep", risk: 55 }, { month: "Oct", risk: 61 },
      { month: "Nov", risk: 49 }, { month: "Dec", risk: 35 },
    ];
  }

  // Fallback for ANY custom query: Seeded Hash Generator
  const seed = query.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) || 42;
  const base = (seed % 35) + 35; // Base between 35 and 70

  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, i) => {
    const wave = Math.sin(i + seed) * 18;
    const value = Math.min(95, Math.max(15, Math.round(base + wave + i * 1.5)));
    return { month, risk: value };
  });
}

interface ScenarioProbability {
  timeframe: string;
  probability: number;
}

interface ScenarioAnalysis {
  riskCurve: Array<{
    month: string;
    risk: number;
  }>;
  speculativeHype: number;
  fundamentalValue: number;
  scenarios: ScenarioProbability[];
}

// Default mock data with 12-month risk curve
const DEFAULT_ANALYSIS: ScenarioAnalysis = {
  riskCurve: [
    { month: "Jan", risk: 35 },
    { month: "Feb", risk: 38 },
    { month: "Mar", risk: 42 },
    { month: "Apr", risk: 45 },
    { month: "May", risk: 48 },
    { month: "Jun", risk: 52 },
    { month: "Jul", risk: 55 },
    { month: "Aug", risk: 58 },
    { month: "Sep", risk: 60 },
    { month: "Oct", risk: 62 },
    { month: "Nov", risk: 64 },
    { month: "Dec", risk: 65 },
  ],
  speculativeHype: 72,
  fundamentalValue: 28,
  scenarios: [
    { timeframe: "1-3 months", probability: 18 },
    { timeframe: "3-6 months", probability: 35 },
    { timeframe: "6-12 months", probability: 47 },
  ],
};

export interface CopilotResponseCardProps {
  data?: ScenarioResponse;
}

export function CopilotResponseCard({ data }: CopilotResponseCardProps) {
  // Generate context-aware chart data based on query
  const riskCurve = data?.query ? getSmartChartData(data.query) : DEFAULT_ANALYSIS.riskCurve;
  
  const analysis = {
    riskCurve,
    speculativeHype: DEFAULT_ANALYSIS.speculativeHype,
    fundamentalValue: DEFAULT_ANALYSIS.fundamentalValue,
    scenarios: DEFAULT_ANALYSIS.scenarios,
  };

  return (
    <div className="space-y-5">
      {/* Markdown content */}
      {data?.markdown && (
        <div className="rounded-xl border border-border bg-foreground/5 p-4">
          <Markdown content={data.markdown} />
        </div>
      )}

      {/* 12-Month Projected Risk Curve */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">
          12-Month Projected Risk Curve
        </h3>
        <div
          className="glass relative overflow-hidden rounded-2xl p-5"
          style={{
            backgroundImage: `radial-gradient(60% 100% at 0% 0%, color-mix(in oklab, var(--flare-orange) 12%, transparent), transparent 70%)`,
          }}
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analysis.riskCurve}>
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--flare-orange)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--flare-orange)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={{ stroke: "var(--border)" }}
                axisLine={{ stroke: "var(--border)" }}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={{ stroke: "var(--border)" }}
                axisLine={{ stroke: "var(--border)" }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.75rem",
                  color: "var(--foreground)",
                }}
                labelStyle={{ color: "var(--foreground)" }}
              />
              <Area
                type="monotone"
                dataKey="risk"
                stroke="var(--flare-orange)"
                fill="url(#riskGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
          <span
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--flare-orange), transparent)",
            }}
          />
        </div>
      </div>

      {/* Speculative Hype vs Fundamental Value */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">
          Valuation Analysis
        </h3>
        <div className="space-y-2.5">
          {/* Speculative Hype */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">
                Speculative Hype %
              </span>
              <span className="font-mono text-xs font-semibold text-flare-pink">
                {analysis.speculativeHype}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-foreground/10">
              <div
                className="h-full bg-gradient-to-r transition-all duration-500"
                style={{
                  width: `${analysis.speculativeHype}%`,
                  background:
                    "linear-gradient(90deg, var(--flare-pink), var(--flare-orange))",
                }}
              />
            </div>
          </div>

          {/* Fundamental Value */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">
                Fundamental Value %
              </span>
              <span className="font-mono text-xs font-semibold text-flare-blue">
                {analysis.fundamentalValue}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-foreground/10">
              <div
                className="h-full bg-gradient-to-r transition-all duration-500"
                style={{
                  width: `${analysis.fundamentalValue}%`,
                  background:
                    "linear-gradient(90deg, var(--flare-blue), var(--flare-violet))",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Probabilities */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">
          Scenario Probabilities
        </h3>
        <div className="space-y-2.5">
          {analysis.scenarios.map((scenario, idx) => {
            const colors: Array<{ bar: string; badge: string }> = [
              { bar: "var(--flare-blue)", badge: "color-mix(in oklab, var(--flare-blue) 15%, transparent)" },
              {
                bar: "var(--flare-amber)",
                badge: "color-mix(in oklab, var(--flare-amber) 15%, transparent)",
              },
              {
                bar: "var(--flare-orange)",
                badge: "color-mix(in oklab, var(--flare-orange) 15%, transparent)",
              },
            ];
            const color = colors[idx % colors.length]!;

            return (
              <div key={scenario.timeframe} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider"
                    style={{
                      color: color.bar,
                      background: color.badge,
                      boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color.bar} 40%, transparent)`,
                    }}
                  >
                    {scenario.timeframe}
                  </span>
                  <span className="font-mono text-xs font-semibold">
                    {scenario.probability}%
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-foreground/10">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${scenario.probability}%`,
                      background: `linear-gradient(90deg, ${color.bar}dd, ${color.bar}66)`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
