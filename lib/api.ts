"use client";

import { GENERIC_ERROR_MESSAGE } from "@/lib/constants";

export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.error ?? GENERIC_ERROR_MESSAGE);
  }

  return data as T;
}
