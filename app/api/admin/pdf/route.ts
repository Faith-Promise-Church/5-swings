import { renderToBuffer } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";
import { createElement } from "react";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin-auth";
import { searchStaffWithCurrentSwings } from "@/lib/data/staff-swings";
import { createErrorResponse } from "@/lib/errors";
import { ReportPdf } from "@/lib/pdf";
import { buildReportLabel } from "@/lib/report-label";
import { toSearchResultPerson } from "@/lib/swings";

const schema = z.object({
  type: z.enum(["campus", "area", "individual"]),
  value: z.string().trim().min(1),
  language: z.enum(["en", "es"]).default("en"),
});

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    requireAdminSession();

    const body = await request.json();
    const input = schema.parse(body);
    const results = await searchStaffWithCurrentSwings(input.type, input.value);
    const people = results.map((entry) => toSearchResultPerson(entry));
    const label = buildReportLabel(input.type, input.value);
    const buffer = await renderToBuffer(
      createElement(ReportPdf, {
        people,
        language: input.language,
        title: `5 Swings Report - ${label}`,
      }),
    );

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="5-swings-${label
          .toLowerCase()
          .replace(/\s+/g, "-")}.pdf"`,
      },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
