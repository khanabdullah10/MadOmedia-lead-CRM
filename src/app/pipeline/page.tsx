import Link from "next/link";
import { db } from "@/lib/db";
import {
  FUNNEL_STAGES,
  PRIORITY_LABELS,
  SOURCE_LABELS,
  SOURCES,
  STAGE_CHART_COLORS,
  STAGE_LABELS,
  STAGES,
} from "@/lib/constants";
import { Source, Stage } from "@/generated/prisma/enums";
import StageSelect from "@/components/StageSelect";
import JourneyStepper from "@/components/JourneyStepper";
import { CheckIcon, XIcon } from "@/components/icons";
import { formatClickableUrl } from "@/lib/leadImport";

function maxFunnelIndex(
  activities: { stageTo: Stage | null }[],
  currentStage: Stage
): number {
  const indices = activities
    .map((a) => (a.stageTo ? FUNNEL_STAGES.indexOf(a.stageTo) : -1))
    .filter((i) => i >= 0);
  const currentIdx = FUNNEL_STAGES.indexOf(currentStage);
  if (currentIdx >= 0) indices.push(currentIdx);
  return indices.length > 0 ? Math.max(...indices) : 0;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// A curated set of soft, jewel-toned pairs for owner avatars — decorative
// identity, not data encoding, so a fixed hash-to-slot pick is enough.
const AVATAR_STYLES = [
  "bg-indigo-50 text-indigo-700",
  "bg-rose-50 text-rose-700",
  "bg-emerald-50 text-emerald-700",
  "bg-amber-50 text-amber-700",
  "bg-teal-50 text-teal-700",
  "bg-fuchsia-50 text-fuchsia-700",
  "bg-orange-50 text-orange-700",
  "bg-violet-50 text-violet-700",
];

function avatarStyle(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_STYLES[hash % AVATAR_STYLES.length];
}

function formatCompactValue(v: number): string {
  if (v >= 1000) {
    const k = v / 1000;
    return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return `$${v.toLocaleString()}`;
}

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const view = sp.view === "table" ? "table" : "kanban";
  const sourceFilter =
    typeof sp.source === "string" && SOURCES.includes(sp.source as Source)
      ? (sp.source as Source)
      : undefined;
  const stageFilter =
    typeof sp.stage === "string" && STAGES.includes(sp.stage as Stage)
      ? (sp.stage as Stage)
      : undefined;

  const leads = await db.lead.findMany({
    where: {
      ...(sourceFilter ? { source: sourceFilter } : {}),
      ...(stageFilter ? { stage: stageFilter } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: { activities: { select: { stageTo: true } } },
  });

  const byStage = STAGES.reduce<Record<Stage, typeof leads>>((acc, stage) => {
    acc[stage] = leads.filter((l) => l.stage === stage);
    return acc;
  }, {} as Record<Stage, typeof leads>);

  const buildLink = (
    overrides: Partial<{ view: string; source: string; stage: string }>
  ) => {
    const merged = {
      view,
      source: sourceFilter ?? "",
      stage: stageFilter ?? "",
      ...overrides,
    };
    const params = new URLSearchParams();
    if (merged.view === "table") params.set("view", "table");
    if (merged.source) params.set("source", merged.source);
    if (merged.stage) params.set("stage", merged.stage);
    return `/pipeline?${params.toString()}`;
  };

  const viewLink = (v: "kanban" | "table") => buildLink({ view: v });
  const sourceLink = (source: Source | "") => buildLink({ source });
  const stageLink = (stage: Stage | "") => buildLink({ stage });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-sm">
          <Link
            href={viewLink("kanban")}
            className={`rounded-lg px-3.5 py-1.5 font-medium transition-all duration-150 ${
              view === "kanban"
                ? "bg-indigo-700 text-white shadow-sm shadow-indigo-700/20"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
            }`}
          >
            Pipeline
          </Link>
          <Link
            href={viewLink("table")}
            className={`rounded-lg px-3.5 py-1.5 font-medium transition-all duration-150 ${
              view === "table"
                ? "bg-indigo-700 text-white shadow-sm shadow-indigo-700/20"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
            }`}
          >
            Table
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <Link
            href={sourceLink("")}
            className={`rounded-full px-3 py-1 transition-all duration-150 ${
              !sourceFilter
                ? "bg-stone-800 text-white"
                : "text-stone-500 ring-1 ring-inset ring-stone-300 hover:bg-stone-100"
            }`}
          >
            All sources
          </Link>
          {SOURCES.map((s) => (
            <Link
              key={s}
              href={sourceLink(s)}
              className={`rounded-full px-3 py-1 transition-all duration-150 ${
                sourceFilter === s
                  ? "bg-stone-800 text-white"
                  : "text-stone-500 ring-1 ring-inset ring-stone-300 hover:bg-stone-100"
              }`}
            >
              {SOURCE_LABELS[s]}
            </Link>
          ))}
        </div>
      </div>

      <div className="-mt-1 flex flex-wrap items-center gap-1.5 text-sm">
        <span className="mr-1 text-xs font-medium text-stone-400">
          Lifecycle
        </span>
        <Link
          href={stageLink("")}
          className={`rounded-full px-3 py-1 transition-all duration-150 ${
            !stageFilter
              ? "bg-indigo-700 text-white shadow-sm shadow-indigo-700/20"
              : "text-stone-500 ring-1 ring-inset ring-stone-300 hover:bg-stone-100"
          }`}
        >
          All stages
        </Link>
        {STAGES.map((stage) => (
          <Link
            key={stage}
            href={stageLink(stage)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition-all duration-150 ${
              stageFilter === stage
                ? "bg-indigo-700 text-white shadow-sm shadow-indigo-700/20"
                : "text-stone-500 ring-1 ring-inset ring-stone-300 hover:bg-stone-100"
            }`}
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{
                backgroundColor:
                  stageFilter === stage ? "#fff" : STAGE_CHART_COLORS[stage],
              }}
            />
            {STAGE_LABELS[stage]}
          </Link>
        ))}
      </div>

      {leads.length === 0 && (sourceFilter || stageFilter) && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-14 text-center text-stone-500 animate-fade-in-up">
          <p className="text-base">No leads match these filters.</p>
          <Link
            href={buildLink({ source: "", stage: "" })}
            className="mt-3 inline-block rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-all duration-150 hover:-translate-y-0.5 hover:border-stone-400"
          >
            Clear filters
          </Link>
        </div>
      )}

      {leads.length === 0 && !sourceFilter && !stageFilter && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-14 text-center text-stone-500 animate-fade-in-up">
          <p className="text-base">No leads yet.</p>
          <Link
            href="/leads/new"
            className="mt-3 inline-block rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-700/20 transition-all duration-150 hover:bg-indigo-800 hover:-translate-y-0.5"
          >
            Add your first lead
          </Link>
        </div>
      )}

      {leads.length > 0 && view === "kanban" && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {STAGES.map((stage, colIdx) => (
            <div
              key={stage}
              className="flex flex-col gap-2 animate-fade-in-up"
              style={{ animationDelay: `${colIdx * 40}ms` }}
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: STAGE_CHART_COLORS[stage] }}
                  />
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                    {STAGE_LABELS[stage]}
                  </h2>
                  {stage === "WON" && (
                    <CheckIcon className="h-3 w-3 text-emerald-600" />
                  )}
                  {stage === "LOST" && (
                    <XIcon className="h-3 w-3 text-red-400" />
                  )}
                </div>
                <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold text-stone-500">
                  {byStage[stage].length}
                </span>
              </div>
              <div className="flex min-h-16 flex-col gap-2.5">
                {byStage[stage].map((lead, i) => {
                  const color = STAGE_CHART_COLORS[stage];
                  return (
                    <div
                      key={lead.id}
                      className={`group animate-fade-in-up rounded-xl p-3 shadow-[0_1px_2px_rgba(28,25,23,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-14px_var(--card-glow)] ${
                        stage === "LOST" ? "opacity-80 hover:opacity-100" : ""
                      }`}
                      style={
                        {
                          background: `linear-gradient(150deg, ${color}17 0%, #ffffff 65%)`,
                          borderTop: `1px solid ${color}2e`,
                          borderRight: `1px solid ${color}2e`,
                          borderBottom: `1px solid ${color}2e`,
                          borderLeft: `3px solid ${color}`,
                          animationDelay: `${colIdx * 40 + i * 30}ms`,
                          "--card-glow": `${color}4d`,
                        } as React.CSSProperties
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="truncate text-[13px] font-semibold tracking-tight text-stone-900 transition-colors group-hover:text-indigo-700"
                        >
                          {lead.name}
                        </Link>
                        {lead.estimatedValue != null && (
                          <span className="shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10.5px] font-semibold text-amber-700">
                            {formatCompactValue(lead.estimatedValue)}
                          </span>
                        )}
                      </div>

                      {(lead.companyName || lead.industry) && (
                        <div className="mt-1 flex items-center gap-1.5 text-[10.5px] text-stone-600 truncate">
                          {lead.companyName && (
                            <span className="truncate font-medium">🏢 {lead.companyName}</span>
                          )}
                          {lead.industry && (
                            <span className="shrink-0 rounded bg-amber-50 px-1.5 py-0.2 text-[9px] font-semibold text-amber-800 uppercase tracking-wide">
                              {lead.industry}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-1.5 flex items-center justify-between gap-1.5 text-[11px] text-stone-500">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="truncate">
                            {SOURCE_LABELS[lead.source]}
                          </span>
                          {lead.owner && (
                            <>
                              <span aria-hidden className="text-stone-300">
                                ·
                              </span>
                              <span
                                title={lead.owner}
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8.5px] font-bold ${avatarStyle(lead.owner)}`}
                              >
                                {initials(lead.owner)}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Quick Action Links */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {lead.websiteUrl && (
                            <a
                              href={formatClickableUrl(lead.websiteUrl) || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open Website"
                              className="text-stone-400 hover:text-indigo-600 transition-colors text-xs"
                            >
                              🌐
                            </a>
                          )}
                          {lead.instagramUrl && (
                            <a
                              href={formatClickableUrl(lead.instagramUrl) || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open Instagram Profile"
                              className="text-stone-400 hover:text-pink-600 transition-colors text-xs"
                            >
                              📸
                            </a>
                          )}
                          {lead.facebookUrl && (
                            <a
                              href={formatClickableUrl(lead.facebookUrl) || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open Facebook Page"
                              className="text-stone-400 hover:text-blue-600 transition-colors text-xs"
                            >
                              📘
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="mt-3">
                        <JourneyStepper
                          currentStage={stage}
                          maxIndex={maxFunnelIndex(lead.activities, stage)}
                        />
                      </div>

                      <div className="mt-2.5 flex justify-end">
                        <StageSelect
                          leadId={lead.id}
                          currentStage={stage}
                          variant="compact"
                          color={color}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {leads.length > 0 && view === "table" && (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm animate-fade-in-up">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-stone-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Company / Industry</th>
                <th className="px-4 py-2.5 font-medium">Source</th>
                <th className="px-4 py-2.5 font-medium">Stage</th>
                <th className="px-4 py-2.5 font-medium">Priority</th>
                <th className="px-4 py-2.5 font-medium">Links</th>
                <th className="px-4 py-2.5 font-medium">Owner</th>
                <th className="px-4 py-2.5 font-medium">Value</th>
                <th className="px-4 py-2.5 font-medium">Next Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-t border-stone-100 transition-colors hover:bg-stone-50"
                >
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="font-medium text-stone-900 hover:text-indigo-700"
                    >
                      {lead.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-stone-600">
                    <div>{lead.companyName ?? "—"}</div>
                    {lead.industry && (
                      <span className="inline-block rounded bg-amber-50 px-1.5 py-0.2 text-[10px] font-semibold text-amber-800 uppercase tracking-wide">
                        {lead.industry}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-stone-600">
                    {SOURCE_LABELS[lead.source]}
                  </td>
                  <td className="px-4 py-2.5 text-stone-600">
                    {STAGE_LABELS[lead.stage]}
                  </td>
                  <td className="px-4 py-2.5 text-stone-600">
                    {PRIORITY_LABELS[lead.priority]}
                  </td>
                  <td className="px-4 py-2.5 text-stone-600">
                    <div className="flex items-center gap-2">
                      {lead.websiteUrl && (
                        <a
                          href={formatClickableUrl(lead.websiteUrl) || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open Website"
                          className="text-stone-400 hover:text-indigo-600 transition-colors text-xs"
                        >
                          🌐
                        </a>
                      )}
                      {lead.primaryDomain && !lead.websiteUrl && (
                        <a
                          href={formatClickableUrl(lead.primaryDomain) || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open Domain"
                          className="text-stone-400 hover:text-indigo-600 transition-colors text-xs"
                        >
                          🔗
                        </a>
                      )}
                      {lead.instagramUrl && (
                        <a
                          href={formatClickableUrl(lead.instagramUrl) || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open Instagram Profile"
                          className="text-stone-400 hover:text-pink-600 transition-colors text-xs"
                        >
                          📸
                        </a>
                      )}
                      {lead.facebookUrl && (
                        <a
                          href={formatClickableUrl(lead.facebookUrl) || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open Facebook Page"
                          className="text-stone-400 hover:text-blue-600 transition-colors text-xs"
                        >
                          📘
                        </a>
                      )}
                      {!lead.websiteUrl && !lead.primaryDomain && !lead.instagramUrl && !lead.facebookUrl && (
                        <span className="text-stone-300">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-stone-600">
                    {lead.owner ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-stone-600">
                    {lead.estimatedValue != null
                      ? `$${lead.estimatedValue.toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-stone-600">
                    {lead.nextFollowUp
                      ? new Date(lead.nextFollowUp).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
