"use client";

import Link from "next/link";
import { useState } from "react";
import { Controller, useForm, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PageShell } from "@/components/app/page-shell";
import { WizardProgress } from "@/components/app/wizard-progress";
import { FieldShell } from "@/components/app/field-shell";
import { PinInput } from "@/components/app/pin-input";
import {
  AppButton,
  AppCard,
  AppCardBody,
  AppInput,
  AppSelect,
} from "@/components/app/primitives";
import { SwingFields } from "@/components/app/swing-fields";
import { useLanguage } from "@/components/providers/language-provider";
import { AREAS, CAMPUSES } from "@/lib/constants";
import { fetchJson } from "@/lib/api";
import { openUserSwingsMailto } from "@/lib/mailto";
import { createEmptySwingItems } from "@/lib/swings";
import { enterFlowSchema } from "@/lib/validation";
import type { SaveSwingsResponse } from "@/lib/types";
import { z } from "zod";

type EnterFormInput = z.input<typeof enterFlowSchema>;
type EnterFormValues = z.output<typeof enterFlowSchema>;

const nameStepSchema = z.object({
  firstName: z.string().trim().min(1, "Required"),
  lastName: z.string().trim().min(1, "Required"),
});

const campusStepSchema = z.object({
  campus: z.string().trim().min(1, "Required"),
});

const areaStepSchema = z.object({
  area: z.string().trim().min(1, "Required"),
});

const emailStepSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

const pinStepSchema = z
  .object({
    pin: z.string().regex(/^\d{4}$/, "Enter a 4-digit PIN."),
    confirmPin: z.string().regex(/^\d{4}$/, "Confirm your 4-digit PIN."),
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

export function EnterFlow() {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState("");
  const [emailState, setEmailState] = useState<"idle" | "opened">("idle");
  const [expandedWins, setExpandedWins] = useState([false, false, false, false, false]);
  const [savedData, setSavedData] = useState<SaveSwingsResponse | null>(null);

  const form = useForm<EnterFormInput, unknown, EnterFormValues>({
    resolver: zodResolver(enterFlowSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      campus: "",
      area: "",
      email: "",
      pin: "",
      confirmPin: "",
      swings: createEmptySwingItems(),
    } as DefaultValues<EnterFormInput>,
  });

  const {
    control,
    register,
    handleSubmit,
    getValues,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = form;
  const swings = watch("swings");

  function applyStepErrors(
    issues: Array<{ path: PropertyKey[]; message: string }>,
    fields: Array<keyof EnterFormInput>,
  ) {
    clearErrors(fields);

    issues.forEach((issue) => {
      const field = issue.path[0];
      if (typeof field === "string" && fields.includes(field as keyof EnterFormInput)) {
        setError(field as keyof EnterFormInput, {
          type: "manual",
          message: issue.message,
        });
      }
    });
  }

  function goNext() {
    setServerError("");

    if (step === 0) {
      const result = nameStepSchema.safeParse({
        firstName: getValues("firstName"),
        lastName: getValues("lastName"),
      });
      if (!result.success) {
        applyStepErrors(result.error.issues, ["firstName", "lastName"]);
        return;
      }
      clearErrors(["firstName", "lastName"]);
    }

    if (step === 1) {
      const result = campusStepSchema.safeParse({ campus: getValues("campus") });
      if (!result.success) {
        applyStepErrors(result.error.issues, ["campus"]);
        return;
      }
      clearErrors(["campus"]);
    }

    if (step === 2) {
      const result = areaStepSchema.safeParse({ area: getValues("area") });
      if (!result.success) {
        applyStepErrors(result.error.issues, ["area"]);
        return;
      }
      clearErrors(["area"]);
    }

    if (step === 3) {
      const result = emailStepSchema.safeParse({ email: getValues("email") });
      if (!result.success) {
        applyStepErrors(result.error.issues, ["email"]);
        return;
      }
      clearErrors(["email"]);
    }

    if (step === 4) {
      const result = pinStepSchema.safeParse({
        pin: getValues("pin"),
        confirmPin: getValues("confirmPin"),
      });
      if (!result.success) {
        applyStepErrors(result.error.issues, ["pin", "confirmPin"]);
        return;
      }
      clearErrors(["pin", "confirmPin"]);
    }

    setStep((current) => current + 1);
  }

  async function onSubmit(input: EnterFormValues) {
    setServerError("");

    try {
      const response = await fetchJson<SaveSwingsResponse>("/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      setSavedData(response);
      setStep(6);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : t("common.somethingWrong"));
    }
  }

  function handleEmailSend() {
    if (!savedData) {
      return;
    }

    setServerError("");
    openUserSwingsMailto({ to: savedData.email, data: savedData, language });
    setEmailState("opened");
  }

  function toggleWins(index: number) {
    const currentWins = getValues(`swings.${index}.wins`) ?? [];

    setExpandedWins((current) =>
      current.map((value, itemIndex) => (itemIndex === index ? !value : value)),
    );

    if (!expandedWins[index] && currentWins.length === 0) {
      setValue(`swings.${index}.wins`, [""], { shouldDirty: true });
    }
  }

  function addWin(index: number) {
    const currentWins = getValues(`swings.${index}.wins`) ?? [];
    if (currentWins.length >= 2) {
      return;
    }

    setValue(`swings.${index}.wins`, [...currentWins, ""], { shouldDirty: true });
    setExpandedWins((current) =>
      current.map((value, itemIndex) => (itemIndex === index ? true : value)),
    );
  }

  function removeWin(index: number, winIndex: number) {
    const currentWins = getValues(`swings.${index}.wins`) ?? [];
    const nextWins = currentWins.filter((_, currentIndex) => currentIndex !== winIndex);

    setValue(`swings.${index}.wins`, nextWins, { shouldDirty: true });

    if (nextWins.length === 0) {
      setExpandedWins((current) =>
        current.map((value, itemIndex) => (itemIndex === index ? false : value)),
      );
    }
  }

  return (
    <PageShell showHomeLink className="justify-start">
      <div className="w-full max-w-2xl">
        <WizardProgress total={7} current={step} />

        <AppCard>
          <AppCardBody>
            {step === 0 ? (
              <div className="space-y-5">
                <h1 className="font-h1 text-fp-slate">{t("enter.steps.name")}</h1>
                <FieldShell
                  label={t("enter.firstName")}
                  error={errors.firstName?.message}
                >
                  <AppInput
                    {...register("firstName")}
                  />
                </FieldShell>
                <FieldShell
                  label={t("enter.lastName")}
                  error={errors.lastName?.message}
                >
                  <AppInput
                    {...register("lastName")}
                  />
                </FieldShell>
                <AppButton
                  type="button"
                  onClick={goNext}
                  fullWidth
                >
                  {t("common.next")}
                </AppButton>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-5">
                <h1 className="font-h1 text-fp-slate">{t("enter.steps.campus")}</h1>
                <FieldShell
                  label={t("enter.campus")}
                  error={errors.campus?.message}
                >
                  <Controller
                    control={control}
                    name="campus"
                    render={({ field }) => (
                      <AppSelect
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(event.target.value)}
                      >
                        <option value="" disabled>
                          {t("enter.campus")}
                        </option>
                          {CAMPUSES.map((campus) => (
                          <option key={campus} value={campus}>
                              {campus}
                          </option>
                          ))}
                      </AppSelect>
                    )}
                  />
                </FieldShell>
                <AppButton
                  type="button"
                  onClick={goNext}
                  fullWidth
                >
                  {t("common.next")}
                </AppButton>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-5">
                <h1 className="font-h1 text-fp-slate">{t("enter.steps.area")}</h1>
                <FieldShell label={t("enter.area")} error={errors.area?.message}>
                  <Controller
                    control={control}
                    name="area"
                    render={({ field }) => (
                      <AppSelect
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(event.target.value)}
                      >
                        <option value="" disabled>
                          {t("enter.area")}
                        </option>
                          {AREAS.map((area) => (
                          <option key={area} value={area}>
                              {area}
                          </option>
                          ))}
                      </AppSelect>
                    )}
                  />
                </FieldShell>
                <AppButton
                  type="button"
                  onClick={goNext}
                  fullWidth
                >
                  {t("common.next")}
                </AppButton>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-5">
                <h1 className="font-h1 text-fp-slate">{t("enter.steps.email")}</h1>
                <FieldShell
                  label={t("enter.email")}
                  hint={t("enter.emailHelp")}
                  error={errors.email?.message}
                >
                  <AppInput
                    {...register("email")}
                    type="email"
                    inputMode="email"
                  />
                </FieldShell>
                <AppButton
                  type="button"
                  onClick={goNext}
                  fullWidth
                >
                  {t("common.next")}
                </AppButton>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-5">
                <h1 className="font-h1 text-fp-slate">{t("enter.steps.pin")}</h1>
                <Controller
                  control={control}
                  name="pin"
                  render={({ field }) => (
                    <PinInput
                      label={t("enter.pin")}
                      helper={t("enter.pinHelp")}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={errors.pin?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="confirmPin"
                  render={({ field }) => (
                    <PinInput
                      label={t("enter.confirmPin")}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={errors.confirmPin?.message}
                    />
                  )}
                />
                <AppButton
                  type="button"
                  onClick={goNext}
                  fullWidth
                >
                  {t("common.next")}
                </AppButton>
              </div>
            ) : null}

            {step === 5 ? (
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <SwingFields
                  register={register}
                  errors={errors}
                  swings={swings}
                  expandedWins={expandedWins}
                  onToggleWins={toggleWins}
                  onAddWin={addWin}
                  onRemoveWin={removeWin}
                  title={t("enter.swingsTitle")}
                  subtitle={t("enter.swingsSubtitle")}
                  addWinsLabel={t("enter.weeklyWins")}
                  addAnotherWinsLabel={t("enter.weeklyWinsAddAnother")}
                  hideWinsLabel={t("enter.weeklyWinsHide")}
                  weeklyWinLabel={t("enter.weeklyWinsLabel")}
                  removeLabel={t("common.remove")}
                />
                {serverError ? (
                  <p className="font-small text-fp-error">{serverError}</p>
                ) : null}
                <AppButton
                  type="submit"
                  disabled={isSubmitting}
                  fullWidth
                >
                  {isSubmitting ? t("common.saving") : t("enter.save")}
                </AppButton>
              </form>
            ) : null}

            {step === 6 && savedData ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="font-h1 text-fp-slate">{t("enter.successTitle")}</h1>
                  <p className="font-small text-fp-slate/65">
                    {savedData.firstName} {savedData.lastName}
                  </p>
                </div>

                <div className="rounded-xl border border-fp-line bg-fp-cream/65 p-4">
                  <ol className="space-y-3">
                    {savedData.swings.map((swing, index) => (
                      <li key={index} className="font-body text-fp-slate">
                        {index + 1}. {swing.category}
                      </li>
                    ))}
                  </ol>
                </div>

                {serverError ? (
                  <p className="font-small text-fp-error">{serverError}</p>
                ) : null}

                {emailState === "opened" ? (
                  <p className="font-small text-fp-success">
                    {t("common.emailClientOpened")}
                  </p>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <AppButton
                    type="button"
                    onClick={handleEmailSend}
                  >
                    {t("enter.emailMe")}
                  </AppButton>
                  <Link
                    href="/"
                    className="tap-target inline-flex h-12 items-center justify-center rounded-pill border border-fp-teal bg-white text-base font-semibold text-fp-teal no-underline shadow-fp hover:bg-fp-lt-blue/20 hover:text-fp-slate"
                  >
                    {t("enter.backHome")}
                  </Link>
                </div>
              </div>
            ) : null}

            {serverError && step < 5 ? (
              <p className="font-small mt-4 text-fp-error">{serverError}</p>
            ) : null}
          </AppCardBody>
        </AppCard>
      </div>
    </PageShell>
  );
}
