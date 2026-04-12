import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { GENERIC_ERROR_MESSAGE } from "@/lib/constants";

export class AppError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}

export function createErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    const message = error.issues[0]?.message ?? "Invalid request.";

    return NextResponse.json({ error: message }, { status: 400 });
  }

  console.error(error);

  return NextResponse.json({ error: GENERIC_ERROR_MESSAGE }, { status: 500 });
}
