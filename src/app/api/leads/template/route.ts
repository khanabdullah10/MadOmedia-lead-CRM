import { NextRequest } from "next/server";
import * as XLSX from "xlsx";

const SAMPLE_DATA = [
  {
    "Name": "Settl.",
    "Company Name": "thesettl.com",
    "Industry": "Hospitality",
    "Phone": "+91 80458 83450",
    "Email": "contact@thesettl.com",
    "Primary Domain": "thesettl.com",
    "Website Url": "https://www.thesettl.com",
    "Instagram URL": "https://instagram.com/settl_living",
    "Facebook Url": "https://facebook.com/settl.living",
    "Source": "Instagram",
    "Campaign": "Founder Outreach",
    "Interest": "Brand Growth & Performance",
    "Estimated Value": "25000",
    "Owner": "Rahil",
    "Priority": "High",
    "Stage": "New",
    "Lost Reason": "",
    "Next Follow Up": "2026-09-20",
    "Created At": "2026-09-10"
  },
  {
    "Name": "Sarah Jenkins",
    "Company Name": "Jenkins Digital",
    "Industry": "Technology",
    "Phone": "+91 98765 43210",
    "Email": "sarah.jenkins@example.com",
    "Primary Domain": "jenkinsdigital.com",
    "Website Url": "https://www.jenkinsdigital.com",
    "Instagram URL": "https://instagram.com/jenkinsdig",
    "Facebook Url": "https://facebook.com/jenkinsdigital",
    "Source": "Google Ads",
    "Campaign": "Q3 Lead Gen",
    "Interest": "Social Media Marketing",
    "Estimated Value": "15000",
    "Owner": "Aman",
    "Priority": "Medium",
    "Stage": "Contacted",
    "Lost Reason": "",
    "Next Follow Up": "2026-09-18",
    "Created At": "2026-09-08"
  }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") || "xlsx").toLowerCase();

  const worksheet = XLSX.utils.json_to_sheet(SAMPLE_DATA);
  
  // Set clean column widths for readability
  worksheet["!cols"] = [
    { wch: 18 }, // Name
    { wch: 20 }, // Company Name
    { wch: 16 }, // Industry
    { wch: 18 }, // Phone
    { wch: 28 }, // Email
    { wch: 20 }, // Primary Domain
    { wch: 28 }, // Website Url
    { wch: 28 }, // Instagram URL
    { wch: 28 }, // Facebook Url
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
