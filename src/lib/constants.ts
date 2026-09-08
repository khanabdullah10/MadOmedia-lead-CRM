import { Priority, Source, Stage } from "@/generated/prisma/enums";

export const STAGES: Stage[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
];

// The ordered, non-terminal funnel a lead travels through before it
// branches off into the Won/Lost outcome. Used to draw journey progress.
export const FUNNEL_STAGES: Stage[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
];

export const STAGE_LABELS: Record<Stage, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  PROPOSAL_SENT: "Proposal Sent",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};

export const SOURCES: Source[] = [
  "INSTAGRAM",
  "FACEBOOK",
  "LINKEDIN",
  "GOOGLE_ADS",
  "REFERRAL",
  "OTHER",
];

export const SOURCE_LABELS: Record<Source, string> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  LINKEDIN: "LinkedIn",
  GOOGLE_ADS: "Google Ads",
  REFERRAL: "Referral",
  OTHER: "Other",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH"];

// Validated chart colors (see dataviz skill: references/palette.md).
// Stage progression uses a single-hue ordinal ramp (light -> dark = further
// along the funnel); Won/Lost are terminal outcomes and use the fixed status
// palette (good/critical) instead, since they encode outcome, not sequence.
export const STAGE_CHART_COLORS: Record<Stage, string> = {
  NEW: "#6da7ec",
  CONTACTED: "#3987e5",
  QUALIFIED: "#256abf",
  PROPOSAL_SENT: "#184f95",
  NEGOTIATION: "#0d366b",
  WON: "#0ca30c",
  LOST: "#d03b3b",
};

// Single categorical hue for nominal breakdowns (by owner, by source) where
// bars are one series split by dimension, not distinct series.
export const CHART_NOMINAL_COLOR = "#2a78d6";
