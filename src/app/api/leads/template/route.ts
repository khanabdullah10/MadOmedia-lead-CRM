import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

const SAMPLE_DATA = [
  {
    "Name": "Sarah Jenkins",
    "Phone": "+91 98765 43210",
    "Email": "sarah.jenkins@example.com",
    "Source": "Google Ads",
    "Campaign": "Q3 Lead Gen",
    "Interest": "Social Media Marketing",
    "Estimated Value": "15000",
    "Owner": "Aman",
    "Priority": "High",
    "Stage": "New",
    "Lost Reason": "",
    "Next Follow Up": "2026-09-20",
    "Created At": "2026-09-10"
  },
  {
    "Name": "Rohit Verma",
    "Phone": "+91 91234 56789",
    "Email": "rohit.verma@example.com",
    "Source": "LinkedIn",
    "Campaign": "Founder Outreach",
    "Interest": "Branding & Web Design",
    "Estimated Value": "25000",
    "Owner": "Rahul Mehta",
    "Priority": "Medium",
    "Stage": "Contacted",
    "Lost Reason": "",
    "Next Follow Up": "2026-09-18",
    "Created At": "2026-09-08"
  },
  {
    "Name": "Priya Sharma",
    "Phone": "+91 99887 76655",
    "Email": "priya.sharma@example.com",
    "Source": "Instagram",
    "Campaign": "Reel Promotion",
    "Interest": "Performance Marketing",
    "Estimated Value": "18000",
    "Owner": "Dana Cruz",
    "Priority": "Low",
    "Stage": "Qualified",
    "Lost Reason": "",
    "Next Follow Up": "2026-09-22",
    "Created At": "2026-09-05"
  }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") || "xlsx").toLowerCase();

  const worksheet = XLSX.utils.json_to_sheet(SAMPLE_DATA);
  
  // Set clean column widths for readability
  worksheet["!cols"] = [
    { wch: 18 }, // Name
    { wch: 18 }, // Phone
    { wch: 28 }, // Email
    { wch: 14 }, // Source
    { wch: 20 }, // Campaign
    { wch: 25 }, // Interest
    { wch: 16 }, // Estimated Value
    { wch: 16 }, // Owner
    { wch: 12 }, // Priority
    { wch: 16 }, // Stage
    { wch: 16 }, // Lost Reason
    { wch: 16 }, // Next Follow Up
    { wch: 14 }, // Created At
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Leads Template");

  if (format === "csv") {
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="madomedia_lead_import_template.csv"',
      },
    });
  }

  // Default to .xlsx
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="madomedia_lead_import_template.xlsx"',
    },
  });
}
