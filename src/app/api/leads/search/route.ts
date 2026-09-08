import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return Response.json({ leads: [] });
  }

  const leads = await db.lead.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
        { campaign: { contains: q } },
        { interest: { contains: q } },
        { owner: { contains: q } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });

  return Response.json({ leads });
}
