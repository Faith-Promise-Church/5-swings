import { NextRequest, NextResponse } from "next/server";

import { verifyStaff } from "@/lib/data/staff-swings";
import { createErrorResponse } from "@/lib/errors";
import { verifySchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = verifySchema.parse(body);
    const staff = await verifyStaff(input.lastName, input.pin);

    return NextResponse.json({
      staffId: staff.id,
      firstName: staff.first_name,
      lastName: staff.last_name,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
