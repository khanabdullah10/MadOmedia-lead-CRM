import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { addNote, deleteLead, updateLead } from "@/lib/actions";
import LeadForm from "@/components/LeadForm";
import StageSelect from "@/components/StageSelect";
import { SOURCE_LABELS, STAGE_LABELS } from "@/lib/constants";

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

  return (
    <div className="grid animate-fade-in grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="animate-fade-in-up">
          <Link
            href="/pipeline"
            className="inline-flex items-center gap-1 text-sm text-stone-500 transition-colors hover:text-indigo-700"
          >
            ← Back to pipeline
          </Link>
          <div className="mt-2 flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
              {lead.name}
            </h1>
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
          <div className="mt-1 text-sm text-stone-500">
            {SOURCE_LABELS[lead.source]} · Stage: {STAGE_LABELS[lead.stage]}
            {lead.lostReason ? ` (${lead.lostReason})` : ""}
          </div>
        </div>

        <div className="animate-fade-in-up rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-900/5">
          <h2 className="mb-4 text-sm font-semibold text-stone-700">
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
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
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
