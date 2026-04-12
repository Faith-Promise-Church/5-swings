import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getStaffWithCurrentSwings } from "@/lib/data/staff-swings";
import { sendUserSwingsEmail } from "@/lib/email";
import { createErrorResponse } from "@/lib/errors";

const schema = z.object({
  staffId: z.string().uuid(),
  language: z.enum(["en", "es"]).default("en"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = schema.parse(body);
    const data = await getStaffWithCurrentSwings(input.staffId);

    await sendUserSwingsEmail({
      data,
      language: input.language,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return createErrorResponse(error);
  }
}
