"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SOURCE_LABELS, STAGE_LABELS } from "@/lib/constants";
import type { LeadModel } from "@/generated/prisma/models";

export default function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LeadModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/leads/search?q=${encodeURIComponent(trimmed)}`
        );
        const data = await res.json();
        setResults(data.leads ?? []);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search leads by name, phone, email, campaign…"
          className="w-full rounded-2xl border border-stone-200 bg-white py-3.5 pl-12 pr-4 text-base text-stone-900 shadow-sm shadow-stone-900/5 outline-none transition-all duration-200 placeholder:text-stone-400 focus:border-indigo-400 focus:shadow-md focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      {showDropdown && (
        <div className="absolute z-20 mt-2 w-full animate-fade-in-up overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg shadow-stone-900/10">
          {loading && (
            <div className="px-4 py-3 text-sm text-stone-400">Searching…</div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-stone-400">
              No leads match “{query.trim()}”.
            </div>
          )}
          {!loading &&
            results.map((lead, i) => (
              <button
                key={lead.id}
                onClick={() => router.push(`/leads/${lead.id}`)}
                className="flex w-full animate-fade-in items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-100 hover:bg-indigo-50"
                style={{ animationDelay: `${i * 25}ms` }}
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-stone-900">
                    {lead.name}
                  </div>
                  <div className="truncate text-xs text-stone-500">
                    {SOURCE_LABELS[lead.source]}
                    {lead.phone ? ` · ${lead.phone}` : ""}
                    {lead.email ? ` · ${lead.email}` : ""}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
                  {STAGE_LABELS[lead.stage]}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
