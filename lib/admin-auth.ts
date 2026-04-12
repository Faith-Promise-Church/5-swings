import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import {
  ADMIN_COOKIE_MAX_AGE,
  ADMIN_COOKIE_NAME,
  GENERIC_ERROR_MESSAGE,
} from "@/lib/constants";
import { AppError } from "@/lib/errors";

function getSecret() {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new AppError(GENERIC_ERROR_MESSAGE, 500);
  }

  return password;
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function createAdminSessionValue() {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Date.now() + ADMIN_COOKIE_MAX_AGE * 1000,
    }),
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function hasValidAdminSession(value?: string | null) {
  try {
    if (!value) {
      return false;
    }

    const [payload, signature] = value.split(".");

    if (!payload || !signature) {
      return false;
    }

    const expected = sign(payload);

    if (!safeEqual(signature, expected)) {
      return false;
    }

    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));

    return typeof decoded.exp === "number" && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

export function requireAdminSession() {
  const session = cookies().get(ADMIN_COOKIE_NAME)?.value;

  if (!hasValidAdminSession(session)) {
    throw new AppError("Unauthorized", 401);
  }
}

export function setAdminSessionCookie() {
  cookies().set(ADMIN_COOKIE_NAME, createAdminSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
}

export function clearAdminSessionCookie() {
  cookies().set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
