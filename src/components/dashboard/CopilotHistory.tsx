import { History, Plus, Trash2, X } from "lucide-react";
import { GlassCard } from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";
import { relativeTime, type CopilotHistoryEntry } from "@/lib/copilot-history";

export function CopilotHistory({
  entries,
  activeId,
  onSelect,
  onNew,
  onRemove,
  onClear,
  confirmingClear,
  className,
}: {
  entries: CopilotHistoryEntry[];
  activeId: string | null;
  onSelect: (entry: CopilotHistoryEntry) => void;
  onNew: () => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  confirmingClear: boolean;
  className?: string;
}) {
  return (
    <GlassCard tint="var(--flare-blue)" className={cn("flex flex-col p-5", className)}>
      <div className="flex items-center gap-2">
        <History className="size-4 text-flare-blue" />
        <h2 className="text-base font-semibold">History</h2>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {entries.length}
        </span>
      </div>

      <button
        onClick={onNew}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-foreground/5"
      >
        <Plus className="size-4" />
        New Analysis
      </button>

      <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5 lg:max-h-[420px]">
        {entries.length === 0 && (
          <p className="py-8 text-center text-xs text-muted-foreground">
            No past runs yet. Your scenario analyses will appear here.
          </p>
        )}
        {entries.map((e) => (
          <div
            key={e.id}
            className={cn(
              "group relative rounded-xl border px-3 py-2.5 transition-colors",
              activeId === e.id
                ? "border-spectrum/60 bg-foreground/10"
                : "border-border hover:bg-foreground/5",
            )}
          >
            <button onClick={() => onSelect(e)} className="block w-full pr-5 text-left">
              <p className="line-clamp-2 text-xs leading-relaxed text-foreground">{e.query}</p>
              <p className="mt-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>{relativeTime(e.created_at)}</span>
                <span className={e.live ? "text-flare-blue" : "text-flare-amber"}>
                  {e.live ? "live" : "mock"}
                </span>
              </p>
            </button>
            <button
              onClick={() => onRemove(e.id)}
              aria-label="Delete this run"
              className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-flare-red group-hover:opacity-100 focus:opacity-100"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
      </div>

      {entries.length > 0 && (
        <button
          onClick={onClear}
          className={cn(
            "mt-4 flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors",
            confirmingClear
              ? "border-flare-red/60 bg-flare-red/10 text-flare-red"
              : "border-border text-muted-foreground hover:bg-foreground/5",
          )}
        >
          <Trash2 className="size-3.5" />
          {confirmingClear ? "Tap again to confirm" : "Clear history"}
        </button>
      )}
    </GlassCard>
  );
}
