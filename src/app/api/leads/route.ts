import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Priority, Source } from "@/generated/prisma/enums";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(Math.max(1, parseInt(limitParam, 10) || 50), 100) : 50;

    const leads = await db.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    return NextResponse.json({ success: true, count: leads.length, leads });
  } catch (err: any) {
    console.error("[API GET /api/leads] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const {
      name,
      phone,
      email,
      source,
      campaign,
      interest,
      estimatedValue,
      owner,
      priority,
      nextFollowUp,
      companyName,
      industry,
      primaryDomain,
      websiteUrl,
      instagramUrl,
      facebookUrl,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Field 'name' is required" },
        { status: 400 }
      );
    }

    // Safe parsing
    let parsedEstimatedValue: number | null = null;
    if (estimatedValue !== undefined && estimatedValue !== null && estimatedValue !== "") {
      const num = typeof estimatedValue === "number" ? estimatedValue : Number(String(estimatedValue).replace(/[^0-9.-]/g, ""));
      if (!isNaN(num)) parsedEstimatedValue = num;
    }

    let parsedNextFollowUp: Date | null = null;
    if (nextFollowUp) {
      const d = new Date(nextFollowUp);
      if (!isNaN(d.getTime())) parsedNextFollowUp = d;
    }

    const validSources: Source[] = [
      "INSTAGRAM",
      "FACEBOOK",
      "LINKEDIN",
      "GOOGLE_ADS",
      "REFERRAL",
      "OTHER",
    ];
    const cleanSource: Source = validSources.includes(source) ? source : "OTHER";

    const validPriorities: Priority[] = ["LOW", "MEDIUM", "HIGH"];
    const cleanPriority: Priority = validPriorities.includes(priority) ? priority : "MEDIUM";

    const lead = await db.lead.create({
      data: {
        name: name.trim(),
        phone: phone ? String(phone).trim() : null,
        email: email ? String(email).trim() : null,
        source: cleanSource,
        campaign: campaign ? String(campaign).trim() : null,
        interest: interest ? String(interest).trim() : null,
        owner: owner ? String(owner).trim() : null,
        priority: cleanPriority,
        companyName: companyName ? String(companyName).trim() : null,
        industry: industry ? String(industry).trim() : null,
        primaryDomain: primaryDomain ? String(primaryDomain).trim() : null,
        websiteUrl: websiteUrl ? String(websiteUrl).trim() : null,
        instagramUrl: instagramUrl ? String(instagramUrl).trim() : null,
        facebookUrl: facebookUrl ? String(facebookUrl).trim() : null,
        estimatedValue: parsedEstimatedValue,
        nextFollowUp: parsedNextFollowUp,
      },
    });

    try {
      await db.activity.create({
        data: {
          leadId: lead.id,
          note: "Lead created via API",
          stageTo: "NEW",
        },
      });
    } catch (actErr) {
      console.warn("Could not create lead activity:", actErr);
    }

    return NextResponse.json(
      { success: true, message: "Lead created successfully", lead },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[API POST /api/leads] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to create lead" },
      { status: 500 }
    );
  }
}
