import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { addNote, deleteLead, updateLead } from "@/lib/actions";
import LeadForm from "@/components/LeadForm";
import StageSelect from "@/components/StageSelect";
import { SOURCE_LABELS, STAGE_LABELS } from "@/lib/constants";
import { formatClickableUrl } from "@/lib/leadImport";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await db.lead.findUnique({
    where: { id },
    include: { activities: { orderBy: { createdAt: "desc" } } },
  });

  if (!lead) notFound();

  const updateWithId = updateLead.bind(null, id);
  const addNoteWithId = addNote.bind(null, id);
  const deleteWithId = deleteLead.bind(null, id);

  const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9+]/g, "") : null;
  const whatsappDigits = lead.phone ? lead.phone.replace(/[^0-9]/g, "") : null;
  const hasLinks = Boolean(
    lead.websiteUrl ||
    lead.primaryDomain ||
    lead.instagramUrl ||
    lead.facebookUrl ||
    lead.phone ||
    lead.email
  );

  return (
    <div className="grid animate-fade-in grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="animate-fade-in-up">
          <Link
            href="/pipeline"
            className="inline-flex items-center gap-1 text-sm text-stone-500 transition-colors hover:text-indigo-700"
          >
            &larr; Back to pipeline
          </Link>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                {lead.name}
              </h1>
              {lead.industry && (
                <span className="rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                  {lead.industry}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-48">
                <StageSelect leadId={lead.id} currentStage={lead.stage} />
              </div>
              <form action={deleteWithId}>
                <button
                  type="submit"
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors duration-150 hover:bg-red-50"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>

          <div className="mt-1.5 flex items-center gap-2 text-sm text-stone-500 flex-wrap">
            {lead.companyName && (
              <span className="font-semibold text-stone-700">
                🏢 {lead.companyName}
              </span>
            )}
            {lead.companyName && <span>•</span>}
            <span>{SOURCE_LABELS[lead.source]}</span>
            <span>•</span>
            <span>Stage: <span className="font-medium text-stone-700">{STAGE_LABELS[lead.stage]}</span></span>
            {lead.lostReason ? ` (${lead.lostReason})` : ""}
          </div>
        </div>

        {/* Lead Details Form */}
        <div className="animate-fade-in-up rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-900/5">
          <h2 className="mb-4 text-base font-semibold text-stone-800">
            Lead Details
          </h2>
          <LeadForm
            action={updateWithId}
            submitLabel="Save Changes"
            defaultValues={{
              name: lead.name,
              phone: lead.phone,
              email: lead.email,
              source: lead.source,
              campaign: lead.campaign,
              interest: lead.interest,
              estimatedValue: lead.estimatedValue,
              owner: lead.owner,
              priority: lead.priority,
              nextFollowUp: lead.nextFollowUp,
              companyName: lead.companyName,
              industry: lead.industry,
              primaryDomain: lead.primaryDomain,
              websiteUrl: lead.websiteUrl,
              instagramUrl: lead.instagramUrl,
              facebookUrl: lead.facebookUrl,
            }}
          />
        </div>
      </div>

      {/* Sidebar Area */}
      <div className="space-y-4">
        {/* Quick Links & Web Presence Card */}
        {hasLinks && (
          <div className="animate-fade-in-up rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-900/5">
            <h2 className="mb-3 text-sm font-semibold text-stone-800 flex items-center justify-between">
              <span>Web & Social Presence</span>
              <span className="text-xs font-normal text-stone-400">Direct Links</span>
            </h2>
            <div className="space-y-2.5 text-xs">
              {lead.websiteUrl && (
                <a
                  href={formatClickableUrl(lead.websiteUrl) || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 transition-colors hover:bg-stone-100/80 group"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-base">🌐</span>
                    <div className="truncate">
                      <div className="font-semibold text-stone-800">Website</div>
                      <div className="text-stone-500 truncate">{lead.websiteUrl}</div>
                    </div>
                  </div>
                  <span className="text-indigo-600 font-semibold shrink-0 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                </a>
              )}

              {lead.primaryDomain && !lead.websiteUrl && (
                <a
                  href={formatClickableUrl(lead.primaryDomain) || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 transition-colors hover:bg-stone-100/80 group"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-base">🔗</span>
                    <div className="truncate">
                      <div className="font-semibold text-stone-800">Domain</div>
                      <div className="text-stone-500 truncate">{lead.primaryDomain}</div>
                    </div>
                  </div>
                  <span className="text-indigo-600 font-semibold shrink-0 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                </a>
              )}

              {lead.instagramUrl && (
                <a
                  href={formatClickableUrl(lead.instagramUrl) || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-pink-200 bg-pink-50/50 p-2.5 transition-colors hover:bg-pink-100/60 group"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-base">📸</span>
                    <div className="truncate">
                      <div className="font-semibold text-pink-900">Instagram / Social</div>
                      <div className="text-pink-700 truncate">{lead.instagramUrl}</div>
                    </div>
                  </div>
                  <span className="text-pink-600 font-semibold shrink-0 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                </a>
              )}

              {lead.facebookUrl && (
                <a
                  href={formatClickableUrl(lead.facebookUrl) || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-2.5 transition-colors hover:bg-blue-100/60 group"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-base">📘</span>
                    <div className="truncate">
                      <div className="font-semibold text-blue-900">Facebook Page</div>
                      <div className="text-blue-700 truncate">{lead.facebookUrl}</div>
                    </div>
                  </div>
                  <span className="text-blue-600 font-semibold shrink-0 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                </a>
              )}

              {lead.phone && (
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="flex-1 rounded-lg border border-stone-200 bg-white py-2 px-2.5 text-center font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    📞 Call
                  </a>
                  {whatsappDigits && (
                    <a
                      href={`https://wa.me/${whatsappDigits}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-lg border border-emerald-300 bg-emerald-50 py-2 px-2.5 text-center font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                    >
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Note Card */}
        <div
          className="animate-fade-in-up rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-900/5"
          style={{ animationDelay: "60ms" }}
        >
          <h2 className="mb-3 text-sm font-semibold text-stone-700">
            Add Note
          </h2>
          <form action={addNoteWithId} className="space-y-2">
            <textarea
              name="note"
              required
              rows={3}
              placeholder="Call notes, next steps, etc."
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition-all duration-150 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
            <button
              type="submit"
              className="rounded-lg bg-indigo-700 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm shadow-indigo-700/20 transition-all duration-150 hover:-translate-y-0.5 hover:bg-indigo-800 hover:shadow-md"
            >
              Add Note
            </button>
          </form>
        </div>

        {/* Activity Timeline Card */}
        <div
          className="animate-fade-in-up rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-900/5"
          style={{ animationDelay: "120ms" }}
        >
          <h2 className="mb-3 text-sm font-semibold text-stone-700">
            Activity Timeline
          </h2>
          <ul className="space-y-3">
            {lead.activities.map((a, i) => (
              <li
                key={a.id}
                className="animate-fade-in-up border-l-2 border-indigo-100 pl-3 text-sm"
                style={{ animationDelay: `${120 + i * 40}ms` }}
              >
                <div className="text-stone-800">{a.note}</div>
                <div className="text-xs text-stone-400">
                  {new Date(a.createdAt).toLocaleString()}
                </div>
              </li>
            ))}
            {lead.activities.length === 0 && (
              <li className="text-sm text-stone-400">No activity yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}