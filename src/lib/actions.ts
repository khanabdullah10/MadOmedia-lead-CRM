"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Priority, Source, Stage } from "@/generated/prisma/enums";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string" || v.trim() === "") return null;
  return v.trim();
}

export async function createLead(formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("Name is required");

  const estimatedValueRaw = str(formData, "estimatedValue");
  const nextFollowUpRaw = str(formData, "nextFollowUp");

  const lead = await db.lead.create({
    data: {
      name,
      phone: str(formData, "phone"),
      email: str(formData, "email"),
      source: (str(formData, "source") as Source) ?? "OTHER",
      campaign: str(formData, "campaign"),
      interest: str(formData, "interest"),
      owner: str(formData, "owner"),
      priority: (str(formData, "priority") as Priority) ?? "MEDIUM",
      estimatedValue: estimatedValueRaw ? Number(estimatedValueRaw) : null,
      nextFollowUp: nextFollowUpRaw ? new Date(nextFollowUpRaw) : null,
      activities: {
        create: { note: "Lead created", stageTo: "NEW" },
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
  redirect(`/leads/${lead.id}`);
}

export async function updateLead(id: string, formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("Name is required");

  const estimatedValueRaw = str(formData, "estimatedValue");
  const nextFollowUpRaw = str(formData, "nextFollowUp");

  await db.lead.update({
    where: { id },
    data: {
      name,
      phone: str(formData, "phone"),
      email: str(formData, "email"),
      source: (str(formData, "source") as Source) ?? "OTHER",
      campaign: str(formData, "campaign"),
      interest: str(formData, "interest"),
      owner: str(formData, "owner"),
      priority: (str(formData, "priority") as Priority) ?? "MEDIUM",
      estimatedValue: estimatedValueRaw ? Number(estimatedValueRaw) : null,
      nextFollowUp: nextFollowUpRaw ? new Date(nextFollowUpRaw) : null,
    },
  });

  revalidatePath("/");
  revalidatePath("/pipeline");
  revalidatePath(`/leads/${id}`);
  revalidatePath("/dashboard");
}

export async function changeStage(id: string, formData: FormData) {
  const stageTo = str(formData, "stage") as Stage | null;
  if (!stageTo) throw new Error("Stage is required");

  const lostReason = str(formData, "lostReason");

  const lead = await db.lead.findUniqueOrThrow({ where: { id } });

  await db.lead.update({
    where: { id },
    data: {
      stage: stageTo,
      lostReason: stageTo === "LOST" ? lostReason : null,
      activities: {
        create: {
          note:
            stageTo === "LOST" && lostReason
              ? `Stage changed to Lost (${lostReason})`
              : `Stage changed to ${stageTo}`,
          stageFrom: lead.stage,
          stageTo,
        },
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/pipeline");
  revalidatePath(`/leads/${id}`);
  revalidatePath("/dashboard");
}

export async function addNote(id: string, formData: FormData) {
  const note = str(formData, "note");
  if (!note) return;

  await db.activity.create({
    data: { leadId: id, note },
  });

  revalidatePath(`/leads/${id}`);
  revalidatePath("/");
  revalidatePath("/pipeline");
}

export async function deleteLead(id: string) {
  await db.lead.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
  redirect("/pipeline");
}
