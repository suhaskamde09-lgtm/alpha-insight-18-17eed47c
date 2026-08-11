import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Bot,
  ChevronLeft,
  Gauge,
  Menu,
  ScrollText,
  Settings2,
  Radar,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home Summary", icon: Gauge, tint: "var(--flare-orange)" },
  { to: "/copilot", label: "AI Scenario Copilot", icon: Bot, tint: "var(--flare-violet)" },
  { to: "/analyser", label: "Asset Risk Analyser", icon: Radar, tint: "var(--flare-pink)" },
  { to: "/logs", label: "Signal Audit Logs", icon: ScrollText, tint: "var(--flare-amber)" },
  { to: "/system", label: "System Health & API", icon: Settings2, tint: "var(--flare-blue)" },
] as const;

function NavList({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-1 flex-col gap-1.5 px-3">
      {NAV.map(({ to, label, icon: Icon, tint }, i) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5",
            )}
            style={
              active
                ? {
                    background: `linear-gradient(100deg, color-mix(in oklab, ${tint} 26%, transparent), transparent)`,
                    boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${tint} 35%, transparent)`,
                  }
                : undefined
            }
          >
            <span
              className="grid size-8 shrink-0 place-items-center rounded-lg transition-transform group-hover:scale-105"
              style={{
                background: `color-mix(in oklab, ${tint} 18%, transparent)`,
                color: tint,
              }}
            >
              <Icon className="size-4" />
            </span>
            {!collapsed && (
              <span className="truncate">
                <span className="mr-1.5 font-mono text-[10px] opacity-50">
                  0{i + 1}
                </span>
                {label}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-3 px-5 py-6">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-spectrum text-background shadow-[var(--glow-primary)]">
        <Activity className="size-5" />
      </span>
      {!collapsed && (
        <div className="leading-tight">
          <p className="font-display text-sm font-bold tracking-tight">
            CRASH<span className="text-spectrum">MEMORY</span>
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            risk intelligence
          </p>
        </div>
      )}
    </div>
  );
}

export function DashboardShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-sidebar/70 backdrop-blur-xl transition-[width] duration-300 lg:flex",
          collapsed ? "w-[84px]" : "w-[268px]",
        )}
      >
        <Brand collapsed={collapsed} />
        <NavList collapsed={collapsed} />
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="m-3 flex items-center justify-center gap-2 rounded-xl border border-border py-2 text-xs text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <ChevronLeft
            className={cn("size-4 transition-transform", collapsed && "rotate-180")}
          />
          {!collapsed && "Collapse"}
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[280px] flex-col border-r border-border bg-sidebar animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between pr-3">
              <Brand collapsed={false} />
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-foreground/5"
                aria-label="Close navigation"
              >
                <X className="size-4" />
              </button>
            </div>
            <NavList collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div
        className={cn(
          "transition-[padding] duration-300",
          collapsed ? "lg:pl-[84px]" : "lg:pl-[268px]",
        )}
      >
        <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
          <div className="flex items-center gap-4 px-4 py-4 sm:px-8">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-border p-2 text-muted-foreground lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-4" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-bold sm:text-2xl">{title}</h1>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">
                {subtitle}
              </p>
            </div>
            {actions}
          </div>
          <div className="h-px w-full bg-heat opacity-60" />
        </header>
        <main className="px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
