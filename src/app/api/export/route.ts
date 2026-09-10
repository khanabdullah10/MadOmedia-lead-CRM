import { db } from "@/lib/db";
import { SOURCE_LABELS, STAGE_LABELS } from "@/lib/constants";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" } });

  const header = [
    "Name",
    "Company Name",
    "Industry",
    "Phone",
    "Email",
    "Primary Domain",
    "Website Url",
    "Instagram URL",
    "Facebook Url",
    "Source",
    "Campaign",
    "Interest",
    "Estimated Value",
    "Owner",
    "Priority",
    "Stage",
    "Lost Reason",
    "Next Follow Up",
    "Created At",
  ];

  const rows = leads.map((lead) =>
    [
      lead.name,
      lead.companyName ?? "",
      lead.industry ?? "",
      lead.phone ?? "",
      lead.email ?? "",
      lead.primaryDomain ?? "",
      lead.websiteUrl ?? "",
      lead.instagramUrl ?? "",
      lead.facebookUrl ?? "",
      SOURCE_LABELS[lead.source],
      lead.campaign ?? "",
      lead.interest ?? "",
      lead.estimatedValue?.toString() ?? "",
      lead.owner ?? "",
      lead.priority,
      STAGE_LABELS[lead.stage],
      lead.lostReason ?? "",
      lead.nextFollowUp?.toISOString().slice(0, 10) ?? "",
      lead.createdAt.toISOString().slice(0, 10),
    ]
      .map((v) => csvEscape(String(v)))
      .join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="leads-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
