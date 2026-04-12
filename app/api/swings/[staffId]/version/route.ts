import { NextRequest, NextResponse } from "next/server";

import { createNewSwingVersion } from "@/lib/data/staff-swings";
import { createErrorResponse } from "@/lib/errors";
import { toSaveResponse } from "@/lib/swings";
import { swingsOnlySchema } from "@/lib/validation";

export async function POST(
  request: NextRequest,
  { params }: { params: { staffId: string } },
) {
  try {
    const body = await request.json();
    const input = swingsOnlySchema.parse(body);
    const data = await createNewSwingVersion(params.staffId, input.swings);

    return NextResponse.json(toSaveResponse(data), { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
