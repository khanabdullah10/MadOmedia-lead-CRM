"use client";

import { useState } from "react";
import { PRIORITIES, PRIORITY_LABELS, SOURCES, SOURCE_LABELS } from "@/lib/constants";
import { formatClickableUrl } from "@/lib/leadImport";
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
  companyName?: string | null;
  industry?: string | null;
  primaryDomain?: string | null;
  websiteUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
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
  const [success, setSuccess] = useState<string | null>(null);

  const d = defaultValues ?? {};
  const followUpValue = d.nextFollowUp
    ? new Date(d.nextFollowUp).toISOString().slice(0, 10)
    : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      await action(formData);
      setIsPending(false);
      setSuccess("Changes saved successfully!");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      if (
        err?.message === "NEXT_REDIRECT" ||
        err?.digest?.startsWith("NEXT_REDIRECT")
      ) {
        return;
      }
      console.error("Form submit error:", err);
      setError(err?.message || "Failed to save lead. Please check details and try again.");
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 animate-fade-in">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700 animate-fade-in">
          ✓ {success}
        </div>
      )}

      {/* 1. Identity & Business Details */}
      <div className="space-y-3 border-b border-stone-100 pb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Contact & Company Info
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-stone-700">Lead / Contact Name *</label>
          <input
            name="name"
            required
            defaultValue={d.name}
            placeholder="e.g. Settl. or John Doe"
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-stone-700">Company Name</label>
            <input
              name="companyName"
              defaultValue={d.companyName ?? ""}
              placeholder="e.g. thesettl.com or Great Events Inc."
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Industry / Sector</label>
            <input
              name="industry"
              defaultValue={d.industry ?? ""}
              placeholder="e.g. Hospitality, Real Estate, SaaS"
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-stone-700">Phone</label>
            <input
              name="phone"
              defaultValue={d.phone ?? ""}
              placeholder="+91 80458 83450"
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Email</label>
            <input
              name="email"
              type="email"
              defaultValue={d.email ?? ""}
              placeholder="contact@company.com"
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
        </div>
      </div>

      {/* 2. Web & Social Media Links */}
      <div className="space-y-3 border-b border-stone-100 pb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Web & Social Media Links
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-stone-700">Website URL</label>
              {d.websiteUrl && (
                <a
                  href={formatClickableUrl(d.websiteUrl) || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Visit Site &rarr;
                </a>
              )}
            </div>
            <div className="relative mt-1">
              <input
                name="websiteUrl"
                defaultValue={d.websiteUrl ?? ""}
                placeholder="https://www.example.com"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 pr-9 text-sm text-stone-900 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400">
                🌐
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-stone-700">Primary Domain</label>
              {d.primaryDomain && (
                <a
                  href={formatClickableUrl(d.primaryDomain) || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Open Domain &rarr;
                </a>
              )}
            </div>
            <div className="relative mt-1">
              <input
                name="primaryDomain"
                defaultValue={d.primaryDomain ?? ""}
                placeholder="example.com"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 pr-9 text-sm text-stone-900 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400">
                🔗
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-stone-700">Instagram / Social URL</label>
              {d.instagramUrl && (
                <a
                  href={formatClickableUrl(d.instagramUrl) || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-pink-600 hover:text-pink-800"
                >
                  View Profile &rarr;
                </a>
              )}
            </div>
            <div className="relative mt-1">
              <input
                name="instagramUrl"
                defaultValue={d.instagramUrl ?? ""}
                placeholder="https://instagram.com/profile or twitter link"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 pr-9 text-sm text-stone-900 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400">
                📸
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-stone-700">Facebook URL</label>
              {d.facebookUrl && (
                <a
                  href={formatClickableUrl(d.facebookUrl) || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  View Page &rarr;
                </a>
              )}
            </div>
            <div className="relative mt-1">
              <input
                name="facebookUrl"
                defaultValue={d.facebookUrl ?? ""}
                placeholder="https://facebook.com/page"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 pr-9 text-sm text-stone-900 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400">
                📘
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Pipeline & CRM Details */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Pipeline & CRM Fields
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-700/20 transition-all duration-150 hover:-translate-y-0.5 hover:bg-indigo-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
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
