import { z } from "zod";

import { AREAS, CAMPUSES, MAX_WEEKLY_WINS, SWING_COUNT } from "@/lib/constants";
import type { Area, Campus } from "@/lib/types";

const trimmedRequired = (minMessage: string) =>
  z
    .string()
    .trim()
    .min(1, minMessage)
    .max(120, minMessage);

const weeklyWinSchema = z.string().trim().max(140);
const requiredCampusSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .refine((value): value is Campus => CAMPUSES.includes(value as Campus), "Required")
  .transform((value) => value as Campus);
const requiredAreaSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .refine((value): value is Area => AREAS.includes(value as Area), "Required")
  .transform((value) => value as Area);

export const swingItemSchema = z.object({
  category: trimmedRequired("Required"),
  wins: z.array(weeklyWinSchema).max(MAX_WEEKLY_WINS),
});

export const enterFlowSchema = z
  .object({
    firstName: trimmedRequired("Required"),
    lastName: trimmedRequired("Required"),
    campus: requiredCampusSchema,
    area: requiredAreaSchema,
    email: z.string().trim().email("Enter a valid email address."),
    pin: z
      .string()
      .regex(/^\d{4}$/, "Enter a 4-digit PIN."),
    confirmPin: z
      .string()
      .regex(/^\d{4}$/, "Confirm your 4-digit PIN."),
    swings: z
      .array(swingItemSchema)
      .length(SWING_COUNT, "All 5 swings are required."),
  })
  .superRefine((value, ctx) => {
    if (value.pin !== value.confirmPin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPin"],
        message: "PINs do not match.",
      });
    }
  });

export const verifySchema = z.object({
  lastName: trimmedRequired("Required"),
  pin: z
    .string()
    .regex(/^\d{4}$/, "Enter your 4-digit PIN."),
});

export const editModeSchema = z.object({
  mode: z.enum(["update", "version"]),
});

export const swingsOnlySchema = z.object({
  swings: z
    .array(swingItemSchema)
    .length(SWING_COUNT, "All 5 swings are required."),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1, "Enter the admin password."),
});

export const adminSearchSchema = z.object({
  type: z.enum(["campus", "area", "individual"]),
  value: z.string().trim().min(1, "Required"),
});

export const emailInputSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});
