"use client";

import { useMemo, useState } from "react";

/**
 * Wraps a server-rendered table and adds a client-side filter input.
 * Hides each <tr data-search="..."> whose data-search attribute does not
 * include the query (case-insensitive). Empty state row stays visible if all
 * rows are hidden.
 */
export function SearchTable({
  placeholder = "Buscar…",
  totalCount,
  children,
}: {
  placeholder?: string;
  totalCount: number;
  children: React.ReactNode;
}) {
  const [q, setQ] = useState("");
  const trimmed = q.trim().toLowerCase();

  // Inject the query into the wrapped table via inline style + script-free
  // approach: render a <style> tag that hides rows not matching.
  // Simpler: pass the query down via context-less attribute selector trick.
  // We use a dynamic stylesheet that targets [data-search]:not([data-search*="X"])
  const styleEl = useMemo(() => {
    if (!trimmed) return null;
    // Escape characters that have meaning in CSS attribute selectors
    const safe = trimmed.replace(/["\\]/g, "\\$&");
    return (
      <style>{`
        [data-searchable-table] tr[data-search]:not([data-search*="${safe}"]) {
          display: none;
        }
      `}</style>
    );
  }, [trimmed]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          >
            <circle cx="9" cy="9" r="6" />
            <path d="M14 14l4 4" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-zinc-200 text-sm outline-none focus:border-brand-red-500 focus:ring-4 focus:ring-brand-red-100 transition"
          />
        </div>
        {trimmed ? (
          <span className="text-xs text-zinc-500">
            Filtrando {totalCount} resultado{totalCount === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>
      {styleEl}
      <div data-searchable-table>{children}</div>
    </div>
  );
}
