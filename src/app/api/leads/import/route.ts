import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db } from "@/lib/db";
import { parseLeadRow, ParsedLeadRow } from "@/lib/leadImport";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let parsedRows: ParsedLeadRow[] = [];
    let skipDuplicates = false;
    let fileName = "spreadsheet";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      skipDuplicates = formData.get("skipDuplicates") === "true";

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file uploaded. Please select an Excel (.xlsx, .xls) or CSV (.csv) file." },
          { status: 400 }
        );
      }

      fileName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (buffer.length === 0) {
        return NextResponse.json(
          { success: false, error: "The uploaded file is empty." },
          { status: 400 }
        );
      }

      let workbook: XLSX.WorkBook;
      try {
        workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
      } catch (parseErr: any) {
        return NextResponse.json(
          { success: false, error: `Failed to parse file: ${parseErr.message || "Invalid spreadsheet format"}` },
          { status: 400 }
        );
      }

      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        return NextResponse.json(
          { success: false, error: "The workbook contains no sheets." },
          { status: 400 }
        );
      }

      const sheet = workbook.Sheets[sheetName];
      const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { raw: false });

      if (rawJson.length === 0) {
        return NextResponse.json(
          { success: false, error: "The selected sheet contains no rows of data." },
          { status: 400 }
        );
      }

      parsedRows = rawJson.map((row, idx) => parseLeadRow(row, idx + 1));
    } else if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => null);
      if (!body || !Array.isArray(body.leads)) {
        return NextResponse.json(
          { success: false, error: "Invalid JSON format. Expected { leads: [...] }" },
          { status: 400 }
        );
      }
      skipDuplicates = Boolean(body.skipDuplicates);
      parsedRows = body.leads.map((row: any, idx: number) => parseLeadRow(row, idx + 1));
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported Content-Type. Use multipart/form-data or application/json." },
        { status: 400 }
      );
    }

    const validRows = parsedRows.filter((r) => r.isValid);
    const invalidRows = parsedRows.filter((r) => !r.isValid);

    if (validRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid lead records found in the uploaded file.",
          details: invalidRows.map((r) => `Row ${r.rawRowIndex}: ${r.validationError}`),
        },
        { status: 400 }
      );
    }

    // Set up duplicate checking if requested
    let existingEmails = new Set<string>();
    let existingPhones = new Set<string>();
    let existingNames = new Set<string>();

    if (skipDuplicates) {
      const existingLeads = await db.lead.findMany({
        select: { name: true, email: true, phone: true },
      });
      existingLeads.forEach((l) => {
        if (l.name) existingNames.add(l.name.trim().toLowerCase());
        if (l.email) existingEmails.add(l.email.trim().toLowerCase());
        if (l.phone) {
          const digits = l.phone.replace(/[^0-9]/g, "");
          if (digits) existingPhones.add(digits);
        }
      });
    }

    const seenInBatchEmails = new Set<string>();
    const seenInBatchPhones = new Set<string>();
    const seenInBatchNames = new Set<string>();

    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: { row: number; reason: string }[] = [];

    // Collect invalid rows as initial errors
    invalidRows.forEach((r) => {
      errors.push({
        row: r.rawRowIndex || 0,
        reason: r.validationError || "Invalid row data",
      });
    });

    for (const leadData of validRows) {
      const rowIdx = leadData.rawRowIndex || 0;
      const cleanName = leadData.name.trim().toLowerCase();
      const cleanEmail = leadData.email ? leadData.email.trim().toLowerCase() : null;
      const phoneDigits = leadData.phone ? leadData.phone.replace(/[^0-9]/g, "") : null;

      if (skipDuplicates) {
        let isDuplicate = false;
        if (cleanEmail && (existingEmails.has(cleanEmail) || seenInBatchEmails.has(cleanEmail))) {
          isDuplicate = true;
        } else if (phoneDigits && (existingPhones.has(phoneDigits) || seenInBatchPhones.has(phoneDigits))) {
          isDuplicate = true;
        } else if (existingNames.has(cleanName) || seenInBatchNames.has(cleanName)) {
          isDuplicate = true;
        }

        if (isDuplicate) {
          // If existing lead exists, enrich any missing company/industry/web fields
          try {
            const existingMatch = await db.lead.findFirst({
              where: {
                OR: [
                  cleanEmail ? { email: cleanEmail } : undefined,
                  leadData.phone ? { phone: leadData.phone } : undefined,
                  { name: leadData.name },
                ].filter(Boolean) as any,
              },
            });

            if (existingMatch) {
              await db.lead.update({
                where: { id: existingMatch.id },
                data: {
                  companyName: existingMatch.companyName || leadData.companyName,
                  industry: existingMatch.industry || leadData.industry,
                  primaryDomain: existingMatch.primaryDomain || leadData.primaryDomain,
                  websiteUrl: existingMatch.websiteUrl || leadData.websiteUrl,
                  instagramUrl: existingMatch.instagramUrl || leadData.instagramUrl,
                  facebookUrl: existingMatch.facebookUrl || leadData.facebookUrl,
                },
              });
              updatedCount++;
            }
          } catch (updateErr) {
            console.warn("Could not enrich existing lead:", updateErr);
          }

          skippedCount++;
          continue;
        }
      }

      try {
        const createdLead = await db.lead.create({
          data: {
            name: leadData.name,
            phone: leadData.phone,
            email: cleanEmail,
            source: leadData.source,
            campaign: leadData.campaign,
            interest: leadData.interest,
            estimatedValue: leadData.estimatedValue,
            owner: leadData.owner,
            priority: leadData.priority,
            stage: leadData.stage,
            lostReason: leadData.lostReason,
            companyName: leadData.companyName,
            industry: leadData.industry,
            primaryDomain: leadData.primaryDomain,
            websiteUrl: leadData.websiteUrl,
            instagramUrl: leadData.instagramUrl,
            facebookUrl: leadData.facebookUrl,
            nextFollowUp: leadData.nextFollowUp,
            createdAt: leadData.createdAt,
          },
        });

        // Track in current batch
        seenInBatchNames.add(cleanName);
        if (cleanEmail) seenInBatchEmails.add(cleanEmail);
        if (phoneDigits) seenInBatchPhones.add(phoneDigits);

        // Record initial activity
        try {
          await db.activity.create({
            data: {
              leadId: createdLead.id,
              note: `Lead imported from ${fileName}`,
              stageTo: createdLead.stage,
              createdAt: createdLead.createdAt,
            },
          });
        } catch (actErr) {
          console.warn("Could not log import activity for lead:", createdLead.id, actErr);
        }

        importedCount++;
      } catch (insertErr: any) {
        console.error(`Error inserting row ${rowIdx}:`, insertErr);
        errors.push({
          row: rowIdx,
          reason: insertErr.message || "Database insert failed",
        });
      }
    }

    const message = importedCount > 0
      ? `Successfully imported ${importedCount} leads${updatedCount > 0 ? ` and enriched ${updatedCount} existing leads` : ""}.`
      : updatedCount > 0
      ? `Enriched ${updatedCount} existing leads with company, industry, and link details.`
      : `All ${skippedCount} duplicate leads were already up to date.`;

    return NextResponse.json({
      success: true,
      message,
      totalRows: parsedRows.length,
      importedCount,
      updatedCount,
      skippedCount,
      failedCount: errors.length,
      errors: errors.slice(0, 20),
    });
  } catch (error: any) {
    console.error("[API POST /api/leads/import] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred during import." },
      { status: 500 }
    );
  }
}
