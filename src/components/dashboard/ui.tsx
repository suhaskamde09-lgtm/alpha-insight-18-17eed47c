import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Severity } from "@/services/api";

export function GlassCard({
  className,
  children,
  tint,
}: {
  className?: string;
  children: ReactNode;
  tint?: string;
}) {
  return (
    <div
      className={cn("glass relative overflow-hidden rounded-2xl", className)}
      style={
        tint
          ? {
              backgroundImage: `radial-gradient(60% 100% at 0% 0%, color-mix(in oklab, ${tint} 16%, transparent), transparent 70%)`,
            }
          : undefined
      }
    >
      {tint && (
        <span
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${tint}, transparent)`,
          }}
        />
      )}
      {children}
    </div>
  );
}

const SEVERITY_TINT: Record<Severity, string> = {
  Low: "var(--flare-blue)",
  Medium: "var(--flare-amber)",
  High: "var(--flare-orange)",
  Critical: "var(--flare-red)",
};

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  const tint = SEVERITY_TINT[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
        className,
      )}
      style={{
        color: tint,
        background: `color-mix(in oklab, ${tint} 15%, transparent)`,
        boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${tint} 40%, transparent)`,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ background: tint }} />
      {severity}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tint,
  children,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  tint: string;
  children?: ReactNode;
}) {
  return (
    <GlassCard tint={tint} className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        {icon && (
          <span
            className="grid size-8 place-items-center rounded-lg"
            style={{
              color: tint,
              background: `color-mix(in oklab, ${tint} 16%, transparent)`,
            }}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {children}
    </GlassCard>
  );
}

export function RiskMeter({ score, size = 168 }: { score: number; size?: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const r = size / 2 - 12;
  const circ = Math.PI * r; // half circle
  const offset = circ * (1 - clamped / 100);
  const tint =
    clamped >= 80
      ? "var(--flare-red)"
      : clamped >= 60
        ? "var(--flare-orange)"
        : clamped >= 35
          ? "var(--flare-amber)"
          : "var(--flare-blue)";

  return (
    <div className="relative" style={{ width: size, height: size / 2 + 16 }}>
      <svg width={size} height={size / 2 + 16} viewBox={`0 0 ${size} ${size / 2 + 16}`}>
        <defs>
          <linearGradient id="riskMeterGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--flare-blue)" />
            <stop offset="35%" stopColor="var(--flare-violet)" />
            <stop offset="60%" stopColor="var(--flare-pink)" />
            <stop offset="80%" stopColor="var(--flare-amber)" />
            <stop offset="100%" stopColor="var(--flare-red)" />
          </linearGradient>
        </defs>
        <path
          d={`M 12 ${size / 2} A ${r} ${r} 0 0 1 ${size - 12} ${size / 2}`}
          fill="none"
          stroke="color-mix(in oklab, currentColor 12%, transparent)"
          strokeWidth={12}
          strokeLinecap="round"
          className="text-foreground"
        />
        <path
          d={`M 12 ${size / 2} A ${r} ${r} 0 0 1 ${size - 12} ${size / 2}`}
          fill="none"
          stroke="url(#riskMeterGrad)"
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <p className="font-display text-3xl font-bold" style={{ color: tint }}>
          {Math.round(clamped)}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          risk / 100
        </p>
      </div>
    </div>
  );
}

export function StatusPill({
  live,
  label,
}: {
  live: boolean;
  label?: string;
}) {
  const tint = live ? "var(--flare-blue)" : "var(--flare-amber)";
  return (
    <span
      className="inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
      style={{
        color: tint,
        background: `color-mix(in oklab, ${tint} 14%, transparent)`,
        boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${tint} 35%, transparent)`,
      }}
    >
      <span className="relative flex size-2">
        <span
          className="absolute inline-flex size-full animate-ping rounded-full opacity-60"
          style={{ background: tint }}
        />
        <span
          className="relative inline-flex size-2 rounded-full"
          style={{ background: tint }}
        />
      </span>
      {label ?? (live ? "Live feed" : "Mock data")}
    </span>
  );
}
