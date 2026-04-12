import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin-auth";
import { searchStaffWithCurrentSwings } from "@/lib/data/staff-swings";
import { sendAdminReportEmail } from "@/lib/email";
import { createErrorResponse } from "@/lib/errors";
import { buildReportLabel } from "@/lib/report-label";
import { toSearchResultPerson } from "@/lib/swings";

const schema = z.object({
  type: z.enum(["campus", "area", "individual"]),
  value: z.string().trim().min(1),
  email: z.string().trim().email(),
  language: z.enum(["en", "es"]).default("en"),
});

export async function POST(request: NextRequest) {
  try {
    requireAdminSession();

    const body = await request.json();
    const input = schema.parse(body);
    const results = await searchStaffWithCurrentSwings(input.type, input.value);
    const people = results.map((entry) => toSearchResultPerson(entry));
    const label = buildReportLabel(input.type, input.value);

    await sendAdminReportEmail({
      people,
      email: input.email,
      label,
      language: input.language,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return createErrorResponse(error);
  }
}
