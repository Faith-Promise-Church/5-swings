import { NextRequest, NextResponse } from "next/server";

import {
  getStaffWithCurrentSwings,
  updateCurrentSwings,
} from "@/lib/data/staff-swings";
import { createErrorResponse } from "@/lib/errors";
import { toSaveResponse } from "@/lib/swings";
import { swingsOnlySchema } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: { staffId: string } },
) {
  try {
    const data = await getStaffWithCurrentSwings(params.staffId);

    return NextResponse.json(toSaveResponse(data));
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { staffId: string } },
) {
  try {
    const body = await request.json();
    const input = swingsOnlySchema.parse(body);
    const data = await updateCurrentSwings(params.staffId, input.swings);

    return NextResponse.json(toSaveResponse(data));
  } catch (error) {
    return createErrorResponse(error);
  }
}
