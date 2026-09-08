import { createLead } from "@/lib/actions";
import LeadForm from "@/components/LeadForm";

export default function NewLeadPage() {
  return (
    <div className="max-w-2xl animate-fade-in-up">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-stone-900">
        Add Lead
      </h1>
      <p className="mb-5 text-sm text-stone-500">
        Log a new lead you picked up from Instagram, Facebook, LinkedIn,
        Google Ads, or elsewhere.
      </p>
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-900/5">
        <LeadForm action={createLead} submitLabel="Add Lead" />
      </div>
    </div>
  );
}
