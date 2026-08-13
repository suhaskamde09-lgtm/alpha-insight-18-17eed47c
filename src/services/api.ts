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
export const DEFAULT_BASE_URL = "https://turbo-capybara-96644j94xvp7277px-8000.app.github.dev/";

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
  normalize?: (raw: unknown) => T,
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
    const text = await res.text();
    let raw: unknown = text;
    try {
      raw = JSON.parse(text) as unknown;
    } catch {
      /* keep raw text — some backends return a plain string body */
    }
    return { data: normalize ? normalize(raw) : (raw as T), source: "live" };
  } catch (err) {
    return {
      data: fallback,
      source: "mock",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

const TEXT_KEYS = ["markdown", "response", "answer", "content", "text", "output", "result"];

/** Backends differ on field names — pull the first usable markdown/text field. */
function normalizeScenario(query: string) {
  return (raw: unknown): ScenarioResponse => {
    // Handle plain string responses directly
    if (typeof raw === "string" && raw.trim()) {
      return { query, markdown: raw, model: "backend", latency_ms: 0 };
    }

    // Ensure we have an object to work with
    if (!raw || typeof raw !== "object") {
      console.warn("Scenario response was not an object", raw);
      throw new Error("Scenario response was empty or not an object");
    }

    const obj = raw as Record<string, unknown>;

    // Check for nested data wrapper (common in some backends)
    const nested =
      obj["data"] && typeof obj["data"] === "object"
        ? (obj["data"] as Record<string, unknown>)
        : undefined;

    // Find the first available text field
    let markdown: string | undefined;
    for (const key of TEXT_KEYS) {
      const value = obj[key] ?? nested?.[key];
      if (typeof value === "string" && value.trim()) {
        markdown = value;
        break;
      }
    }

    // If no standard text field found, try any string value as fallback
    if (!markdown) {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string" && value.trim() && key !== "model" && key !== "query") {
          markdown = value;
          break;
        }
      }
      // Also check nested object
      if (!markdown && nested) {
        for (const [key, value] of Object.entries(nested)) {
          if (typeof value === "string" && value.trim() && key !== "model" && key !== "query") {
            markdown = value;
            break;
          }
        }
      }
    }

    if (!markdown) {
      const keys = Object.keys(obj).join(", ") || "none";
      console.error("Could not find text field in scenario response", { obj, keys });
      throw new Error(
        `Scenario response had no text field (got keys: ${keys})`,
      );
    }

    const model = obj["model"] ?? nested?.["model"];
    const latency = obj["latency_ms"] ?? nested?.["latency_ms"];
    const echoedQuery = obj["query"] ?? nested?.["query"];

    return {
      query: typeof echoedQuery === "string" ? echoedQuery : query,
      markdown,
      model: typeof model === "string" ? model : "backend",
      latency_ms: typeof latency === "number" ? latency : 0,
    };
  };
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
      normalizeScenario(query),
    ),

  signals: () =>
    request<MarketSignal[]>("/api/signals", { method: "GET" }, mockSignals),

  health: () =>
    request<HealthResponse>("/api/health", { method: "GET" }, mockHealth()),
};
