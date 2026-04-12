"use client";

import Link from "next/link";
import { useState } from "react";
import { Controller, useForm, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { FieldShell } from "@/components/app/field-shell";
import { PageShell } from "@/components/app/page-shell";
import { PinInput } from "@/components/app/pin-input";
import {
  AppButton,
  AppCard,
  AppCardBody,
  AppInput,
} from "@/components/app/primitives";
import { SwingFields } from "@/components/app/swing-fields";
import { WizardProgress } from "@/components/app/wizard-progress";
import { useLanguage } from "@/components/providers/language-provider";
import { fetchJson } from "@/lib/api";
import { openUserSwingsMailto } from "@/lib/mailto";
import { createEmptySwingItems } from "@/lib/swings";
import { editModeSchema, swingsOnlySchema, verifySchema } from "@/lib/validation";
import type { SaveSwingsResponse, VerifyResponse } from "@/lib/types";

type VerifyValues = z.infer<typeof verifySchema>;
type EditModeValues = z.infer<typeof editModeSchema>;
type SwingsOnlyValues = z.infer<typeof swingsOnlySchema>;

function withTwoWinSlots(data: SaveSwingsResponse["swings"]) {
  return data.map((swing) => ({
    category: swing.category,
    wins: swing.wins,
  }));
}

export function EditFlow() {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState("");
  const [verified, setVerified] = useState<VerifyResponse | null>(null);
  const [currentData, setCurrentData] = useState<SaveSwingsResponse | null>(null);
  const [savedData, setSavedData] = useState<SaveSwingsResponse | null>(null);
  const [emailState, setEmailState] = useState<"idle" | "opened">("idle");
  const [expandedWins, setExpandedWins] = useState([false, false, false, false, false]);

  const verifyForm = useForm<VerifyValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      lastName: "",
      pin: "",
    },
  });

  const modeForm = useForm<EditModeValues>({
    resolver: zodResolver(editModeSchema),
    defaultValues: {
      mode: "update",
    },
  });

  const swingsForm = useForm<SwingsOnlyValues>({
    resolver: zodResolver(swingsOnlySchema),
    defaultValues: {
      swings: createEmptySwingItems(),
    } as DefaultValues<SwingsOnlyValues>,
  });
  const swings = swingsForm.watch("swings");

  async function handleVerify(values: VerifyValues) {
    setServerError("");

    try {
      const verification = await fetchJson<VerifyResponse>("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const current = await fetchJson<SaveSwingsResponse>(
        `/api/swings/${verification.staffId}`,
      );

      setVerified(verification);
      setCurrentData(current);
      swingsForm.reset({
        swings: withTwoWinSlots(current.swings),
      });
      setExpandedWins(
        current.swings.map((swing) => swing.wins.length > 0) as boolean[],
      );
      setStep(1);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : t("common.somethingWrong"));
    }
  }

  async function handleSave(values: SwingsOnlyValues) {
    if (!verified) {
      return;
    }

    setServerError("");

    try {
      const mode = modeForm.getValues("mode");
      const endpoint =
        mode === "update"
          ? `/api/swings/${verified.staffId}`
          : `/api/swings/${verified.staffId}/version`;
      const method = mode === "update" ? "PUT" : "POST";
      const response = await fetchJson<SaveSwingsResponse>(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      setSavedData(response);
      setCurrentData(response);
      setStep(3);
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
    const currentWins = swingsForm.getValues(`swings.${index}.wins`) ?? [];

    setExpandedWins((current) =>
      current.map((value, itemIndex) => (itemIndex === index ? !value : value)),
    );

    if (!expandedWins[index] && currentWins.length === 0) {
      swingsForm.setValue(`swings.${index}.wins`, [""], { shouldDirty: true });
    }
  }

  function addWin(index: number) {
    const currentWins = swingsForm.getValues(`swings.${index}.wins`) ?? [];
    if (currentWins.length >= 2) {
      return;
    }

    swingsForm.setValue(`swings.${index}.wins`, [...currentWins, ""], { shouldDirty: true });
    setExpandedWins((current) =>
      current.map((value, itemIndex) => (itemIndex === index ? true : value)),
    );
  }

  function removeWin(index: number, winIndex: number) {
    const currentWins = swingsForm.getValues(`swings.${index}.wins`) ?? [];
    const nextWins = currentWins.filter((_, currentIndex) => currentIndex !== winIndex);

    swingsForm.setValue(`swings.${index}.wins`, nextWins, { shouldDirty: true });

    if (nextWins.length === 0) {
      setExpandedWins((current) =>
        current.map((value, itemIndex) => (itemIndex === index ? false : value)),
      );
    }
  }

  return (
    <PageShell showHomeLink className="justify-start">
      <div className="w-full max-w-2xl">
        <WizardProgress total={4} current={step} />

        <AppCard>
          <AppCardBody>
            {step === 0 ? (
              <form
                className="space-y-5"
                onSubmit={verifyForm.handleSubmit(handleVerify)}
              >
                <h1 className="font-h1 text-fp-slate">{t("edit.verifyTitle")}</h1>
                <FieldShell
                  label={t("edit.lastName")}
                  error={verifyForm.formState.errors.lastName?.message}
                >
                  <AppInput
                    {...verifyForm.register("lastName")}
                  />
                </FieldShell>
                <Controller
                  control={verifyForm.control}
                  name="pin"
                  render={({ field }) => (
                    <PinInput
                      label={t("edit.pin")}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={verifyForm.formState.errors.pin?.message}
                    />
                  )}
                />
                {serverError ? (
                  <p className="font-small text-fp-error">{serverError}</p>
                ) : null}
                <AppButton
                  type="submit"
                  disabled={verifyForm.formState.isSubmitting}
                  fullWidth
                >
                  {t("common.continue")}
                </AppButton>
              </form>
            ) : null}

            {step === 1 ? (
              <form
                className="space-y-5"
                onSubmit={modeForm.handleSubmit(() => setStep(2))}
              >
                <div className="space-y-2">
                  <h1 className="font-h1 text-fp-slate">{t("edit.modeTitle")}</h1>
                  {currentData ? (
                    <p className="font-small text-fp-slate/65">
                      {currentData.firstName} {currentData.lastName}
                    </p>
                  ) : null}
                </div>

                <Controller
                  control={modeForm.control}
                  name="mode"
                  render={({ field }) => (
                    <div className="space-y-4">
                      {(["update", "version"] as const).map((mode) => {
                        const isActive = field.value === mode;
                        const title =
                          mode === "update" ? t("edit.updateMode") : t("edit.versionMode");
                        const help =
                          mode === "update"
                            ? t("edit.updateModeHelp")
                            : t("edit.versionModeHelp");

                        return (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => field.onChange(mode)}
                            className={`w-full rounded-xl border p-4 text-left shadow-fp transition-all ${
                              isActive
                                ? "border-fp-teal bg-fp-lt-blue/20"
                                : "border-fp-line bg-fp-cream/45 hover:border-fp-teal/60"
                            }`}
                          >
                            <p className="text-base font-semibold text-fp-slate">{title}</p>
                            <p className="font-small mt-1 text-fp-slate/72">{help}</p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                />

                <AppButton
                  type="submit"
                  fullWidth
                >
                  {t("common.continue")}
                </AppButton>
              </form>
            ) : null}

            {step === 2 ? (
              <form
                className="space-y-6"
                onSubmit={swingsForm.handleSubmit(handleSave)}
              >
                <SwingFields
                  register={swingsForm.register}
                  errors={swingsForm.formState.errors}
                  swings={swings}
                  expandedWins={expandedWins}
                  onToggleWins={toggleWins}
                  onAddWin={addWin}
                  onRemoveWin={removeWin}
                  title={t("edit.editTitle")}
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
                  disabled={swingsForm.formState.isSubmitting}
                  fullWidth
                >
                  {modeForm.watch("mode") === "update"
                    ? t("edit.saveUpdate")
                    : t("edit.saveVersion")}
                </AppButton>
              </form>
            ) : null}

            {step === 3 && savedData ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="font-h1 text-fp-slate">{t("edit.successTitle")}</h1>
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
          </AppCardBody>
        </AppCard>
      </div>
    </PageShell>
  );
}
