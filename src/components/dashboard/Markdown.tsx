/** Minimal, dependency-free markdown renderer for copilot responses. */
export function Markdown({ content }: { content?: string | null }) {
  if (typeof content !== "string" || !content.trim()) {
    return (
      <p className="my-2 text-sm text-muted-foreground">
        No readable content was returned for this response.
      </p>
    );
  }
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let table: string[] = [];

  const inline = (t: string) =>
    t
      .split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
      .filter(Boolean)
      .map((part, i) => {
        if (part.startsWith("**"))
          return (
            <strong key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        if (part.startsWith("`"))
          return (
            <code key={i} className="rounded bg-foreground/10 px-1 py-0.5 font-mono text-xs">
              {part.slice(1, -1)}
            </code>
          );
        if (part.startsWith("*"))
          return (
            <em key={i} className="text-flare-amber not-italic">
              {part.slice(1, -1)}
            </em>
          );
        return <span key={i}>{part}</span>;
      });

  const flushList = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`l${blocks.length}`} className="my-3 space-y-2">
        {list.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-spectrum" />
            <span>{inline(item)}</span>
          </li>
        ))}
      </ul>,
    );
    list = [];
  };

  const flushTable = () => {
    if (!table.length) return;
    const rows = table
      .filter((r) => !/^\|[\s|:-]+\|$/.test(r.trim()))
      .map((r) =>
        r
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim()),
      );
    const [head, ...body] = rows;
    blocks.push(
      <div key={`t${blocks.length}`} className="my-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-foreground/5">
            <tr>
              {head?.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {body.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} className="px-4 py-2.5">
                    {inline(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    table = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    if (line.trim().startsWith("|")) {
      flushList();
      table.push(line.trim());
      return;
    }
    flushTable();

    if (/^[-*]\s+/.test(line.trim())) {
      list.push(line.trim().replace(/^[-*]\s+/, ""));
      return;
    }
    if (/^\d+\.\s+/.test(line.trim())) {
      list.push(line.trim().replace(/^\d+\.\s+/, ""));
      return;
    }
    flushList();

    if (line.startsWith("## ")) {
      blocks.push(
        <h3 key={idx} className="mt-6 mb-1 text-sm font-bold uppercase tracking-wide text-spectrum">
          {line.slice(3)}
        </h3>,
      );
    } else if (line.startsWith("# ")) {
      blocks.push(
        <h2 key={idx} className="mt-5 text-lg font-bold">
          {line.slice(2)}
        </h2>,
      );
    } else if (line.startsWith("> ")) {
      blocks.push(
        <blockquote
          key={idx}
          className="my-4 rounded-r-xl border-l-2 border-flare-violet bg-foreground/5 px-4 py-3 text-xs text-muted-foreground"
        >
          {inline(line.slice(2))}
        </blockquote>,
      );
    } else if (line.trim()) {
      blocks.push(
        <p key={idx} className="my-2 text-sm leading-relaxed text-muted-foreground">
          {inline(line)}
        </p>,
      );
    }
  });

  flushList();
  flushTable();

  return <div>{blocks}</div>;
}
