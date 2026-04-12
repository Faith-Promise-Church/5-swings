import { NextRequest, NextResponse } from "next/server";

import { getSwingsHistory } from "@/lib/data/staff-swings";
import { createErrorResponse } from "@/lib/errors";
import { recordToSwingItems } from "@/lib/swings";

export async function GET(
  _request: NextRequest,
  { params }: { params: { staffId: string } },
) {
  try {
    const history = await getSwingsHistory(params.staffId);

    return NextResponse.json(
      history.map((entry) => ({
        id: entry.id,
        createdAt: entry.created_at,
        isCurrent: entry.is_current,
        swings: recordToSwingItems(entry).map((item) => ({
          category: item.category,
          wins: item.wins.filter(Boolean),
        })),
      })),
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
