"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type BarDatum = {
  key: string;
  label: string;
  value: number;
  color?: string;
};

export default function BarChart({
  data,
  color = "#2a78d6",
  emptyLabel = "No data yet.",
  hrefPrefix,
}: {
  data: BarDatum[];
  color?: string;
  emptyLabel?: string;
  /** When provided, each row becomes clickable, navigating to
   * `${hrefPrefix}${d.key}` — turns a read-only breakdown into a drill-down
   * into the filtered pipeline. */
  hrefPrefix?: string;
}) {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const [grown, setGrown] = useState(false);
  const max = Math.max(1, ...data.map((d) => d.value));

  useEffect(() => {
    const t = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(t);
  }, []);

  if (data.length === 0) {
    return <p className="text-sm text-stone-400">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-2.5">
      {data.map((d, i) => {
        const pct = d.value > 0 ? Math.max((d.value / max) * 100, 3) : 0;
        const isHovered = hovered === d.key;
        const href = hrefPrefix
          ? `${hrefPrefix}${encodeURIComponent(d.key)}`
          : undefined;
        return (
          <div
            key={d.key}
            className={`group -mx-1.5 grid grid-cols-[minmax(72px,130px)_1fr_auto] items-center gap-3 rounded-lg px-1.5 py-0.5 transition-colors duration-150 ${
              href ? "cursor-pointer hover:bg-stone-50" : ""
            }`}
            onMouseEnter={() => setHovered(d.key)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(d.key)}
            onBlur={() => setHovered(null)}
            onClick={href ? () => router.push(href) : undefined}
            role={href ? "link" : undefined}
            tabIndex={0}
          >
            <span
              className={`truncate text-sm text-stone-600 ${href ? "group-hover:text-indigo-700" : ""}`}
            >
              {d.label}
            </span>
            <div className="h-5 rounded-full bg-stone-100">
              <div
                className="h-5 rounded-r-sm transition-all duration-700 ease-out"
                style={{
                  width: grown ? `${pct}%` : "0%",
                  transitionDelay: `${i * 60}ms`,
                  backgroundColor: d.color ?? color,
                  opacity: isHovered ? 1 : 0.85,
                }}
              />
            </div>
            <span className="w-8 text-right text-sm font-medium tabular-nums text-stone-900">
              {d.value.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
