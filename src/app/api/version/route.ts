import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  let dbTest = "unknown";
  try {
    const leads = await db.lead.findMany({ take: 1, select: { name: true } });
    dbTest = "connected: " + (leads[0]?.name || "empty");
  } catch (e: any) {
    dbTest = "error: " + e?.message;
  }
  return NextResponse.json({
    version: "v3-turso-cloud",
    time: new Date().toISOString(),
    dbTest,
    hasDbUrl: !!process.env.DATABASE_URL
  });
}
