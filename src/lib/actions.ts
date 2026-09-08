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

function parseEstimatedValue(raw: string | null): number | null {
  if (!raw) return null;
  const clean = raw.replace(/[^0-9.-]/g, "");
  if (!clean) return null;
  const num = Number(clean);
  return isNaN(num) ? null : num;
}

function parseDate(raw: string | null): Date | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  // Support DD/MM/YYYY or DD-MM-YYYY (e.g. 22/09/2026)
  const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
}

export async function createLead(formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("Name is required");

  const estimatedValue = parseEstimatedValue(str(formData, "estimatedValue"));
  const nextFollowUp = parseDate(str(formData, "nextFollowUp"));

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
      estimatedValue,
      nextFollowUp,
    },
  });

  try {
    await db.activity.create({
      data: {
        leadId: lead.id,
        note: "Lead created",
        stageTo: "NEW",
      },
    });
  } catch (actErr) {
    console.warn("Failed to create initial lead activity:", actErr);
  }

  revalidatePath("/");
  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
  redirect(`/leads/${lead.id}`);
}

export async function updateLead(id: string, formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("Name is required");

  const estimatedValue = parseEstimatedValue(str(formData, "estimatedValue"));
  const nextFollowUp = parseDate(str(formData, "nextFollowUp"));

  const existing = await db.lead.findUnique({ where: { id } });
  if (!existing) {
    throw new Error(
      "Lead record not found in the database. In serverless environments, SQLite resets across instances. Use Turso or a persistent server."
    );
  }

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
      estimatedValue,
      nextFollowUp,
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
