import { NextRequest, NextResponse } from "next/server";

import { setAdminSessionCookie } from "@/lib/admin-auth";
import { AppError, createErrorResponse } from "@/lib/errors";
import { adminLoginSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = adminLoginSchema.parse(body);

    if (!process.env.ADMIN_PASSWORD || input.password !== process.env.ADMIN_PASSWORD) {
      throw new AppError("That password was incorrect.", 401);
    }

    setAdminSessionCookie();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return createErrorResponse(error);
  }
}
