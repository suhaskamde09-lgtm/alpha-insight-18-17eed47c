/**
 * Modular API client for the Python risk-engine backend
 * (FastAPI + CockroachDB vector memory + Gemini embeddings + Groq LLM).
 *
 * Every call degrades gracefully to mock data so the UI renders
 * beautifully before the backend is connected.
 */
import {
  mockAnalysis,
  mockHealth,
  mockScenario,
  mockSignals,
} from "@/lib/mock-data";

export interface StockMetrics {
  ticker: string;
  pe_ratio: number;
  ps_ratio: number;
  debt_to_equity: number;
  summary: string;
}

export interface HistoricalMatch {
  id: string;
  event_name: string;
  period_year: number;
  summary_text: string;
  distance: number;
  metric_ratios: Record<string, number>;
}

export type Severity = "Low" | "Medium" | "High" | "Critical";

export interface AnalyzeResponse {
  metrics: StockMetrics;
  matched_memory: HistoricalMatch;
  risk_score_100: number;
  severity: Severity;
  rationale: string;
  strategic_actions: string[];
}

export interface ScenarioResponse {
  query: string;
  markdown: string;
  model: string;
  latency_ms: number;
}

export interface MarketSignal {
  id: string;
  asset_ticker: string;
  risk_probability: number;
  severity: Severity;
  pe_ratio: number;
  ps_ratio: number;
  vector_distance: number;
  source_url: string;
  created_at: string;
}

export interface HealthResponse {
  services: {
    name: "CockroachDB" | "Gemini API" | "Groq LLM" | "yfinance";
    status: "online" | "degraded" | "offline";
    latency_ms: number;
    detail: string;
  }[];
  checked_at: string;
}

const BASE_URL_KEY = "risk_api_base_url";
export const DEFAULT_BASE_URL = "http://localhost:8000";

export function getBaseUrl(): string {
  if (typeof window === "undefined") return DEFAULT_BASE_URL;
  return window.localStorage.getItem(BASE_URL_KEY) ?? DEFAULT_BASE_URL;
}

export function setBaseUrl(url: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BASE_URL_KEY, url.replace(/\/$/, ""));
}

export interface ApiResult<T> {
  data: T;
  source: "live" | "mock";
  error?: string;
}

async function request<T>(
  path: string,
  init: RequestInit,
  fallback: T,
): Promise<ApiResult<T>> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${getBaseUrl()}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return { data: (await res.json()) as T, source: "live" };
  } catch (err) {
    return {
      data: fallback,
      source: "mock",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export const api = {
  analyze: (ticker: string) =>
    request<AnalyzeResponse>(
      "/api/analyze",
      { method: "POST", body: JSON.stringify({ ticker }) },
      mockAnalysis(ticker),
    ),

  scenario: (query: string) =>
    request<ScenarioResponse>(
      "/api/scenario",
      { method: "POST", body: JSON.stringify({ query }) },
      mockScenario(query),
    ),

  signals: () =>
    request<MarketSignal[]>("/api/signals", { method: "GET" }, mockSignals),

  health: () =>
    request<HealthResponse>("/api/health", { method: "GET" }, mockHealth()),
};
