import { Priority, Source, Stage } from "@/generated/prisma/enums";

export interface ParsedLeadRow {
  name: string;
  phone: string | null;
  email: string | null;
  source: Source;
  campaign: string | null;
  interest: string | null;
  estimatedValue: number | null;
  owner: string | null;
  priority: Priority;
  stage: Stage;
  lostReason: string | null;
  nextFollowUp: Date | null;
  createdAt: Date;
  isValid: boolean;
  validationError?: string;
  rawRowIndex?: number;
}

/**
 * Normalizes any string or date value into a valid Date object or null.
 * Handles Date objects, numeric Excel timestamps, ISO strings, YYYY-MM-DD, and DD/MM/YYYY.
 */
export function parseDate(val: any): Date | null {
  if (val === undefined || val === null || val === "") return null;

  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }

  // If numeric (Excel serial date number)
  if (typeof val === "number" && !isNaN(val)) {
    // Excel epoch starts at 1900-01-01 (serial 1), with 25569 days between 1900 and 1970
    const epochMs = (val - 25569) * 86400 * 1000;
    const d = new Date(epochMs);
    return isNaN(d.getTime()) ? null : d;
  }

  const str = String(val).trim();
  if (!str) return null;

  // 1. Matches YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    const date = new Date(Date.UTC(y, m, d, 12, 0, 0));
    if (!isNaN(date.getTime())) return date;
  }

  // 2. Matches M/D/YY or M/D/YYYY or D/M/YYYY
  const slashParts = str.split(/[/.-]/);
  if (slashParts.length === 3) {
    let p1 = parseInt(slashParts[0], 10);
    let p2 = parseInt(slashParts[1], 10);
    let p3 = parseInt(slashParts[2], 10);

    // Expand 2-digit year (e.g., 26 -> 2026)
    if (p3 < 100) p3 += 2000;

    // Check if M/D/YYYY (where p1 is month, p2 is day)
    if (p1 > 0 && p1 <= 12 && p2 > 0 && p2 <= 31 && p3 >= 1970) {
      const d = new Date(Date.UTC(p3, p1 - 1, p2, 12, 0, 0));
      if (!isNaN(d.getTime())) return d;
    }

    // Check if D/M/YYYY (where p1 is day > 12)
    if (p1 > 12 && p1 <= 31 && p2 > 0 && p2 <= 12 && p3 >= 1970) {
      const d = new Date(Date.UTC(p3, p2 - 1, p1, 12, 0, 0));
      if (!isNaN(d.getTime())) return d;
    }
  }

  // 3. Fallback to standard ISO / full datetime parse
  const standardDate = new Date(str);
  if (!isNaN(standardDate.getTime())) {
    return standardDate;
  }

  return null;
}

/**
 * Normalizes currency and numeric strings into a clean float or null.
 */
export function parseEstimatedValue(val: any): number | null {
  if (val === undefined || val === null || val === "") return null;
  if (typeof val === "number") return isNaN(val) ? null : val;

  const str = String(val).replace(/[^0-9.-]/g, "");
  if (!str) return null;
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/**
 * Maps arbitrary source string to a valid CRM Source enum.
 */
export function normalizeSource(val: any): Source {
  if (!val) return "OTHER";
  const str = String(val).trim().toLowerCase().replace(/[\s_-]+/g, "");

  if (str.includes("google")) return "GOOGLE_ADS";
  if (str.includes("facebook") || str.includes("fb")) return "FACEBOOK";
  if (str.includes("linkedin")) return "LINKEDIN";
  if (str.includes("instagram") || str.includes("insta")) return "INSTAGRAM";
  if (str.includes("referral") || str.includes("ref")) return "REFERRAL";

  return "OTHER";
}

/**
 * Maps arbitrary stage string to a valid CRM Stage enum.
 */
export function normalizeStage(val: any): Stage {
  if (!val) return "NEW";
  const str = String(val).trim().toLowerCase().replace(/[\s_-]+/g, "");

  if (str.includes("proposal")) return "PROPOSAL_SENT";
  if (str.includes("contact")) return "CONTACTED";
  if (str.includes("qualif")) return "QUALIFIED";
  if (str.includes("negot")) return "NEGOTIATION";
  if (str.includes("won")) return "WON";
  if (str.includes("lost")) return "LOST";

  return "NEW";
}

/**
 * Maps priority string to LOW | MEDIUM | HIGH.
 */
export function normalizePriority(val: any): Priority {
  if (!val) return "MEDIUM";
  const str = String(val).trim().toUpperCase();
  if (str === "HIGH") return "HIGH";
  if (str === "LOW") return "LOW";
  return "MEDIUM";
}

/**
 * Finds a value from an object using multiple possible key variations (case-insensitive, ignores spaces).
 */
function getMatchingFieldValue(row: Record<string, any>, aliases: string[]): any {
  const rowKeys = Object.keys(row);
  for (const alias of aliases) {
    const cleanAlias = alias.toLowerCase().replace(/[\s_-]+/g, "");
    for (const key of rowKeys) {
      const cleanKey = key.toLowerCase().replace(/[\s_-]+/g, "");
      if (cleanKey === cleanAlias) {
        return row[key];
      }
    }
  }
  return undefined;
}

/**
 * Converts a raw spreadsheet row into a validated, normalized Lead object.
 */
export function parseLeadRow(rawRow: Record<string, any>, rowIndex?: number): ParsedLeadRow {
  const nameRaw = getMatchingFieldValue(rawRow, ["Name", "Lead Name", "Full Name", "Contact Name"]);
  const phoneRaw = getMatchingFieldValue(rawRow, ["Phone", "Phone Number", "Mobile", "Contact", "Cell"]);
  const emailRaw = getMatchingFieldValue(rawRow, ["Email", "Email Address", "Mail"]);
  const sourceRaw = getMatchingFieldValue(rawRow, ["Source", "Lead Source", "Channel"]);
  const campaignRaw = getMatchingFieldValue(rawRow, ["Campaign", "Utm Campaign", "Campaign Name"]);
  const interestRaw = getMatchingFieldValue(rawRow, ["Interest", "Product", "Service", "Requirement"]);
  const valueRaw = getMatchingFieldValue(rawRow, ["Estimated Value", "Value", "Deal Value", "Amount", "Budget"]);
  const ownerRaw = getMatchingFieldValue(rawRow, ["Owner", "Lead Owner", "Assigned To", "Rep", "Agent"]);
  const priorityRaw = getMatchingFieldValue(rawRow, ["Priority", "Lead Priority", "Urgency"]);
  const stageRaw = getMatchingFieldValue(rawRow, ["Stage", "Status", "Pipeline Stage"]);
  const lostReasonRaw = getMatchingFieldValue(rawRow, ["Lost Reason", "Reason Lost", "Drop Reason"]);
  const nextFollowUpRaw = getMatchingFieldValue(rawRow, ["Next Follow Up", "Follow Up Date", "Follow Up", "Next Step Date"]);
  const createdAtRaw = getMatchingFieldValue(rawRow, ["Created At", "Created Date", "Date Added", "Import Date", "Timestamp"]);

  const name = nameRaw !== undefined && nameRaw !== null ? String(nameRaw).trim() : "";

  if (!name) {
    return {
      name: "",
      phone: null,
      email: null,
      source: "OTHER",
      campaign: null,
      interest: null,
      estimatedValue: null,
      owner: null,
      priority: "MEDIUM",
      stage: "NEW",
      lostReason: null,
      nextFollowUp: null,
      createdAt: new Date(),
      isValid: false,
      validationError: "Row missing required 'Name' field",
      rawRowIndex: rowIndex,
    };
  }

  const phone = phoneRaw !== undefined && phoneRaw !== null ? String(phoneRaw).trim() : null;
  const email = emailRaw !== undefined && emailRaw !== null ? String(emailRaw).trim().toLowerCase() : null;
  const campaign = campaignRaw !== undefined && campaignRaw !== null ? String(campaignRaw).trim() : null;
  const interest = interestRaw !== undefined && interestRaw !== null ? String(interestRaw).trim() : null;
  const owner = ownerRaw !== undefined && ownerRaw !== null ? String(ownerRaw).trim() : null;
  const lostReason = lostReasonRaw !== undefined && lostReasonRaw !== null ? String(lostReasonRaw).trim() : null;

  const source = normalizeSource(sourceRaw);
  const stage = normalizeStage(stageRaw);
  const priority = normalizePriority(priorityRaw);
  const estimatedValue = parseEstimatedValue(valueRaw);
  const nextFollowUp = parseDate(nextFollowUpRaw);

  const parsedCreatedAt = parseDate(createdAtRaw);
  const createdAt = parsedCreatedAt || new Date();

  return {
    name,
    phone: phone || null,
    email: email || null,
    source,
    campaign: campaign || null,
    interest: interest || null,
    estimatedValue,
    owner: owner || null,
    priority,
    stage,
    lostReason: stage === "LOST" ? lostReason : (lostReason || null),
    nextFollowUp,
    createdAt,
    isValid: true,
    rawRowIndex: rowIndex,
  };
}
