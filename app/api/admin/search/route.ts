import { NextRequest, NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-auth";
import { searchStaffWithCurrentSwings } from "@/lib/data/staff-swings";
import { createErrorResponse } from "@/lib/errors";
import { toSearchResultPerson } from "@/lib/swings";
import { adminSearchSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    requireAdminSession();

    const body = await request.json();
    const input = adminSearchSchema.parse(body);
    const results = await searchStaffWithCurrentSwings(input.type, input.value);

    return NextResponse.json(results.map((entry) => toSearchResultPerson(entry)));
  } catch (error) {
    return createErrorResponse(error);
  }
}
