import { NextRequest, NextResponse } from "next/server";

import { createStaffAndSwings } from "@/lib/data/staff-swings";
import { createErrorResponse } from "@/lib/errors";
import { toSaveResponse } from "@/lib/swings";
import { enterFlowSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = enterFlowSchema.parse(body);
    const data = await createStaffAndSwings({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      campus: input.campus,
      area: input.area,
      pin: input.pin,
      swings: input.swings,
    });

    return NextResponse.json(toSaveResponse(data), { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
