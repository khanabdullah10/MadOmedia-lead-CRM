import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";
import type { Priority, Source, Stage } from "../src/generated/prisma/enums";

const adapter = new PrismaLibSql({ url: `file:${process.cwd()}/dev.db` });
const db = new PrismaClient({ adapter });

const FUNNEL: Stage[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
];

const STAGE_LABELS: Record<Stage, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  PROPOSAL_SENT: "Proposal Sent",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};

const FIRST_NAMES = [
  "Aisha", "Rohan", "Meera", "Kabir", "Priya", "Arjun", "Sana", "Vikram",
  "Neha", "Farhan", "Divya", "Aditya", "Zara", "Karan", "Anjali", "Rahul",
  "Fatima", "Nikhil", "Simran", "Yusuf", "Pooja", "Aman", "Ritika", "Imran",
  "Kavya", "Sameer", "Tanya", "Omar", "Lakshmi", "Dev", "Nadia", "Vivek",
  "Alisha", "Zaid", "Riya", "Manav", "Elena", "Owen", "Grace", "Noah",
  "Layla", "Marcus", "Sofia", "Ivan", "Mia", "Leo", "Ana", "Theo", "Ines",
  "Jamal",
];
const LAST_NAMES = [
  "Sharma", "Khan", "Iyer", "Gupta", "Patel", "Mehta", "Reddy", "Nair",
  "Chopra", "Malhotra", "Bose", "Rao", "Verma", "Kapoor", "Joshi", "Singh",
  "Ansari", "Pillai", "Das", "Bhatt", "Cruz", "Baptiste", "Okafor", "Lin",
  "Osei", "Webb", "Cohen", "Rossi", "Nakamura", "Silva",
];

const SOURCES: Source[] = [
  "INSTAGRAM", "FACEBOOK", "LINKEDIN", "GOOGLE_ADS", "REFERRAL", "OTHER",
];

const CAMPAIGNS: Record<Source, string[]> = {
  INSTAGRAM: ["Reel Ad - Launch", "Story Swipe-up", "Influencer Collab"],
  FACEBOOK: ["Lookalike Audience", "Carousel Ad", "Event Promo"],
  LINKEDIN: ["Sponsored InMail", "Thought Leadership Post", "Lead Gen Form"],
  GOOGLE_ADS: ["Search - Brand Terms", "Display Retargeting", "Performance Max"],
  REFERRAL: ["Client Referral", "Partner Referral", "Word of Mouth"],
  OTHER: ["Walk-in", "Trade Show", "Cold Outreach"],
};

const INTERESTS = [
  "Product demo", "Pricing inquiry", "Enterprise plan", "Free consultation",
  "Bulk order", "Annual subscription", "Custom quote", "Onboarding help",
  "Renewal upsell", "Partnership inquiry",
];

const OWNERS = ["Zoya", "Aman", "Priya Anand", "Rahul Mehta", "Dana Cruz"];

const LOST_REASONS = [
  "Went with a competitor", "No budget", "Not responsive",
  "Bad timing", "Price too high",
];

const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPriority(): Priority {
  const r = Math.random();
  if (r < 0.2) return "HIGH";
  if (r < 0.7) return "MEDIUM";
  return "LOW";
}

function daysAgo(d: number): Date {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000);
}

function daysFromNow(d: number): Date {
  return new Date(Date.now() + d * 24 * 60 * 60 * 1000);
}

// A 50-lead distribution across all 7 stages, weighted toward the top of
// the funnel like a real pipeline.
const STAGE_PLAN: Stage[] = [
  ...Array(10).fill("NEW"),
  ...Array(8).fill("CONTACTED"),
  ...Array(7).fill("QUALIFIED"),
  ...Array(6).fill("PROPOSAL_SENT"),
  ...Array(5).fill("NEGOTIATION"),
  ...Array(8).fill("WON"),
  ...Array(6).fill("LOST"),
] as Stage[];

function buildActivities(
  targetStage: Stage,
  createdAt: Date
): { note: string; stageFrom: Stage | null; stageTo: Stage; createdAt: Date }[] {
  const activities: {
    note: string;
    stageFrom: Stage | null;
    stageTo: Stage;
    createdAt: Date;
  }[] = [];

  activities.push({
    note: "Lead created",
    stageFrom: null,
    stageTo: "NEW",
    createdAt,
  });

  let cursor = createdAt;
  let prev: Stage = "NEW";

  const step = () => {
    cursor = new Date(cursor.getTime() + (1 + Math.random() * 4) * 86400000);
    return cursor;
  };

  if (targetStage === "WON" || targetStage === "LOST") {
    // Walk through a random prefix of the funnel before branching off.
    const depth =
      targetStage === "WON"
        ? FUNNEL.length - 1 // usually goes the whole way for a win
        : Math.floor(Math.random() * (FUNNEL.length - 1)) + 1;
    for (let i = 1; i <= depth; i++) {
      const stage = FUNNEL[i];
      activities.push({
        note: `Stage changed to ${STAGE_LABELS[stage]}`,
        stageFrom: prev,
        stageTo: stage,
        createdAt: step(),
      });
      prev = stage;
    }
    activities.push({
      note:
        targetStage === "LOST"
          ? `Stage changed to Lost (${pick(LOST_REASONS)})`
          : "Stage changed to Won",
      stageFrom: prev,
      stageTo: targetStage,
      createdAt: step(),
    });
  } else {
    const targetIdx = FUNNEL.indexOf(targetStage);
    for (let i = 1; i <= targetIdx; i++) {
      const stage = FUNNEL[i];
      activities.push({
        note: `Stage changed to ${STAGE_LABELS[stage]}`,
        stageFrom: prev,
        stageTo: stage,
        createdAt: step(),
      });
      prev = stage;
    }
  }

  return activities;
}

async function main() {
  const usedNames = new Set<string>();

  for (let i = 0; i < STAGE_PLAN.length; i++) {
    const targetStage = STAGE_PLAN[i];

    let name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    while (usedNames.has(name)) {
      name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    }
    usedNames.add(name);

    const source = pick(SOURCES);
    const createdAt = daysAgo(3 + Math.floor(Math.random() * 55));
    const activities = buildActivities(targetStage, createdAt);
    const updatedAt = activities[activities.length - 1].createdAt;

    const isOpen = targetStage !== "WON" && targetStage !== "LOST";
    const nextFollowUp = isOpen
      ? Math.random() < 0.3
        ? daysAgo(1 + Math.floor(Math.random() * 10)) // overdue
        : daysFromNow(1 + Math.floor(Math.random() * 14))
      : null;

    const lostReasonActivity = activities.find(
      (a) => a.stageTo === "LOST"
    );
    const lostReason =
      targetStage === "LOST"
        ? lostReasonActivity?.note.match(/\((.*)\)/)?.[1] ?? pick(LOST_REASONS)
        : null;

    await db.lead.create({
      data: {
        name,
        phone: Math.random() < 0.7 ? `+1${Math.floor(2000000000 + Math.random() * 799999999)}` : null,
        email:
          Math.random() < 0.6
            ? `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`
            : null,
        source,
        campaign: pick(CAMPAIGNS[source]),
        interest: pick(INTERESTS),
        estimatedValue:
          Math.random() < 0.85
            ? Math.round((200 + Math.random() * 7800) / 50) * 50
            : null,
        owner: pick(OWNERS),
        priority: weightedPriority(),
        stage: targetStage,
        lostReason,
        nextFollowUp,
        createdAt,
        updatedAt,
        activities: { create: activities },
      },
    });

    console.log(`Created: ${name} — ${source} — ${STAGE_LABELS[targetStage]}`);
  }

  console.log(`\nDone. Seeded ${STAGE_PLAN.length} leads.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
