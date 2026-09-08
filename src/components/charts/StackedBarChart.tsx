"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type StackSegment = {
  key: string;
  label: string;
  value: number;
  color: string;
};

export type StackRow = {
  key: string;
  label: string;
  segments: StackSegment[];
};

export type LegendItem = { key: string; label: string; color: string };

export default function StackedBarChart({
  rows,
  legend,
  emptyLabel = "No data yet.",
  segmentHrefPrefix,
}: {
  rows: StackRow[];
  legend: LegendItem[];
  emptyLabel?: string;
  /** When provided, clicking a segment navigates to
   * `${segmentHrefPrefix}${seg.key}` — e.g. drill into the pipeline
   * filtered to that stage. */
  segmentHrefPrefix?: string;
}) {
  const router = useRouter();
  const [hover, setHover] = useState<string | null>(null);
  const [grown, setGrown] = useState(false);
  const maxTotal = Math.max(
    1,
    ...rows.map((r) => r.segments.reduce((s, seg) => s + seg.value, 0))
  );

  useEffect(() => {
    const t = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(t);
  }, []);

  if (rows.length === 0) {
    return <p className="text-sm text-stone-400">{emptyLabel}</p>;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5">
        {legend.map((l) => (
          <div
            key={l.key}
            className="flex items-center gap-1.5 text-xs text-stone-600"
          >
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: l.color }}
            />
            {l.label}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {rows.map((row, ri) => {
          const visible = row.segments.filter((seg) => seg.value > 0);
          const total = visible.reduce((s, seg) => s + seg.value, 0);
          const rowWidthPct = total > 0 ? Math.max((total / maxTotal) * 100, 4) : 0;

          return (
            <div
              key={row.key}
              className="grid grid-cols-[minmax(72px,130px)_1fr_auto] items-center gap-3"
            >
              <span className="truncate text-sm text-stone-600">
                {row.label}
              </span>
              <div
                className="relative flex h-5 transition-all duration-700 ease-out"
                style={{
                  width: grown ? `${rowWidthPct}%` : "0%",
                  transitionDelay: `${ri * 70}ms`,
                  minWidth: total > 0 ? "8px" : 0,
                }}
              >
                {visible.map((seg, si) => {
                  const widthPct = (seg.value / total) * 100;
                  const hoverKey = `${row.key}:${seg.key}`;
                  const isHovered = hover === hoverKey;
                  const href = segmentHrefPrefix
                    ? `${segmentHrefPrefix}${encodeURIComponent(seg.key)}`
                    : undefined;
                  return (
                    <div
                      key={seg.key}
                      className={`relative h-full transition-all duration-150 ${
                        si === 0 ? "rounded-l-sm" : ""
                      } ${si === visible.length - 1 ? "rounded-r-sm" : ""} ${
                        href ? "cursor-pointer" : ""
                      }`}
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: seg.color,
                        marginLeft: si === 0 ? 0 : "2px",
                        opacity: hover && !isHovered ? 0.55 : 1,
                        filter: isHovered ? "brightness(1.08)" : undefined,
                      }}
                      onMouseEnter={() => setHover(hoverKey)}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(hoverKey)}
                      onBlur={() => setHover(null)}
                      onClick={href ? () => router.push(href) : undefined}
                      role={href ? "link" : undefined}
                      tabIndex={0}
                    >
                      {isHovered && (
                        <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-stone-900 px-2 py-1 text-xs font-medium text-white shadow-md">
                          <span className="text-stone-300">{seg.label}:</span>{" "}
                          {seg.value}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <span className="w-8 text-right text-sm font-medium tabular-nums text-stone-900">
                {total}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
