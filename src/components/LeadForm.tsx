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
  const d = defaultValues ?? {};
  const followUpValue = d.nextFollowUp
    ? new Date(d.nextFollowUp).toISOString().slice(0, 10)
    : "";

  return (
    <form action={action} className="space-y-4">
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
        className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-700/20 transition-all duration-150 hover:-translate-y-0.5 hover:bg-indigo-800 hover:shadow-md"
      >
        {submitLabel}
      </button>
    </form>
  );
}
