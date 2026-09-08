"use client";

import { useState } from "react";
import { PRIORITIES, PRIORITY_LABELS, SOURCES, SOURCE_LABELS } from "@/lib/constants";
import type { Priority, Source } from "@/generated/prisma/enums";

type Defaults = {
  name?: string;
  phone?: string | null;
  email?: string | null;
  source?: Source;
  campaign?: string | null;
  interest?: string | null;
  estimatedValue?: number | null;
  owner?: string | null;
  priority?: Priority;
  nextFollowUp?: Date | null;
};

export default function LeadForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: Defaults;
  submitLabel: string;
}) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const d = defaultValues ?? {};
  const followUpValue = d.nextFollowUp
    ? new Date(d.nextFollowUp).toISOString().slice(0, 10)
    : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      await action(formData);
    } catch (err: any) {
      if (
        err?.message === "NEXT_REDIRECT" ||
        err?.digest?.startsWith("NEXT_REDIRECT")
      ) {
        // Next.js redirection in progress
        return;
      }
      console.error("Form submit error:", err);
      setError(err?.message || "Failed to save lead. Please check details and try again.");
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 animate-fade-in">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-stone-700">Name *</label>
        <input
          name="name"
          required
          defaultValue={d.name}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700">Phone</label>
          <input
            name="phone"
            defaultValue={d.phone ?? ""}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700">Email</label>
          <input
            name="email"
            type="email"
            defaultValue={d.email ?? ""}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700">Source *</label>
          <select
            name="source"
            defaultValue={d.source ?? "OTHER"}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          >
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {SOURCE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700">Campaign / Ad / Post</label>
          <input
            name="campaign"
            defaultValue={d.campaign ?? ""}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Interest / Product</label>
        <input
          name="interest"
          defaultValue={d.interest ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700">Estimated Value ($)</label>
          <input
            name="estimatedValue"
            type="number"
            step="0.01"
            defaultValue={d.estimatedValue ?? ""}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700">Owner</label>
          <input
            name="owner"
            defaultValue={d.owner ?? ""}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700">Priority</label>
          <select
            name="priority"
            defaultValue={d.priority ?? "MEDIUM"}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700">Next Follow-up</label>
          <input
            name="nextFollowUp"
            type="date"
            defaultValue={followUpValue}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-700/20 transition-all duration-150 hover:-translate-y-0.5 hover:bg-indigo-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
      >
        {isPending && (
          <svg
            className="h-4 w-4 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {isPending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
