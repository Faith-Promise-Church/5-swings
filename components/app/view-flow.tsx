"use client";

import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { FieldShell } from "@/components/app/field-shell";
import { PageShell } from "@/components/app/page-shell";
import { PinInput } from "@/components/app/pin-input";
import { AppButton, AppCard, AppCardBody, AppInput } from "@/components/app/primitives";
import { SwingsDisplay } from "@/components/app/swings-display";
import { WizardProgress } from "@/components/app/wizard-progress";
import { useLanguage } from "@/components/providers/language-provider";
import { fetchJson } from "@/lib/api";
import { openUserSwingsMailto } from "@/lib/mailto";
import { verifySchema } from "@/lib/validation";
import type { SaveSwingsResponse, VerifyResponse } from "@/lib/types";

type VerifyValues = z.infer<typeof verifySchema>;

type HistoryEntry = {
  id: string;
  createdAt: string;
  isCurrent: boolean;
  swings: SaveSwingsResponse["swings"];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function ViewFlow() {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState("");
  const [viewData, setViewData] = useState<SaveSwingsResponse | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [emailState, setEmailState] = useState<"idle" | "opened">("idle");

  const form = useForm<VerifyValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      lastName: "",
      pin: "",
    },
  });

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

      setViewData(current);
      setStep(1);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : t("common.somethingWrong"));
    }
  }

  async function loadHistory() {
    if (!viewData) {
      return;
    }

    setServerError("");

    try {
      const response = await fetchJson<HistoryEntry[]>(
        `/api/swings/${viewData.staffId}/history`,
      );

      setHistory(response);
      setStep(2);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : t("common.somethingWrong"));
    }
  }

  function handleEmailSend() {
    if (!viewData) {
      return;
    }

    setServerError("");
    openUserSwingsMailto({ to: viewData.email, data: viewData, language });
    setEmailState("opened");
  }

  return (
    <PageShell showHomeLink className="justify-start">
      <div className="w-full max-w-3xl">
        <WizardProgress total={3} current={step} />

        <AppCard>
          <AppCardBody>
            {step === 0 ? (
              <form className="space-y-5" onSubmit={form.handleSubmit(handleVerify)}>
                <h1 className="font-h1 text-fp-slate">{t("view.verifyTitle")}</h1>
                <FieldShell
                  label={t("edit.lastName")}
                  error={form.formState.errors.lastName?.message}
                >
                  <AppInput
                    {...form.register("lastName")}
                  />
                </FieldShell>
                <Controller
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <PinInput
                      label={t("edit.pin")}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={form.formState.errors.pin?.message}
                    />
                  )}
                />
                {serverError ? (
                  <p className="font-small text-fp-error">{serverError}</p>
                ) : null}
                <AppButton
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  fullWidth
                >
                  {t("common.continue")}
                </AppButton>
              </form>
            ) : null}

            {step === 1 && viewData ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="font-h1 text-fp-slate">{t("view.displayTitle")}</h1>
                </div>

                <SwingsDisplay
                  person={viewData}
                  labels={{
                    name: t("swingCard.name"),
                    campus: t("swingCard.campus"),
                    area: t("swingCard.area"),
                    weeklyWins: t("swingCard.weeklyWins"),
                  }}
                />

                {serverError ? (
                  <p className="font-small text-fp-error">{serverError}</p>
                ) : null}

                {emailState === "opened" ? (
                  <p className="font-small text-fp-success">
                    {t("common.emailClientOpened")}
                  </p>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-3">
                  <AppButton
                    type="button"
                    onClick={handleEmailSend}
                  >
                    {t("view.emailMe")}
                  </AppButton>
                  <AppButton
                    type="button"
                    onClick={loadHistory}
                    variant="outline"
                  >
                    {t("view.historyButton")}
                  </AppButton>
                  <Link
                    href="/"
                    className="tap-target inline-flex h-12 items-center justify-center rounded-pill border border-fp-teal bg-white px-6 text-base font-semibold text-fp-teal shadow-fp transition-all duration-200 ease-out hover:bg-fp-lt-blue/20 hover:text-fp-slate"
                  >
                    {t("view.backHome")}
                  </Link>
                </div>
              </div>
            ) : null}

            {step === 2 && viewData ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="font-h1 text-fp-slate">{t("view.historyTitle")}</h1>
                  <p className="font-small text-fp-slate/65">
                    {viewData.firstName} {viewData.lastName}
                  </p>
                </div>

                {history.length ? (
                  <div className="space-y-3">
                    {history.map((entry) => (
                      <details
                        key={entry.id}
                        className="rounded-xl border border-fp-line bg-fp-cream/40 px-4"
                      >
                        <summary className="cursor-pointer list-none py-4">
                          <div className="space-y-1">
                            <p className="text-base font-semibold text-fp-slate">
                              {formatDate(entry.createdAt)}
                            </p>
                            <p className="font-small text-fp-slate/65">
                              {entry.isCurrent ? t("view.displayTitle") : t("view.historyTitle")}
                            </p>
                          </div>
                        </summary>
                        <div className="pb-4">
                          <ol className="space-y-3">
                            {entry.swings.map((swing, index) => (
                              <li key={index} className="space-y-2 text-fp-slate">
                                <p className="font-body font-semibold">
                                  {index + 1}. {swing.category}
                                </p>
                                {swing.wins.length ? (
                                  <ul className="space-y-1 pl-5 text-sm text-fp-slate/75">
                                    {swing.wins.map((win) => (
                                      <li key={win}>• {win}</li>
                                    ))}
                                  </ul>
                                ) : null}
                              </li>
                            ))}
                          </ol>
                        </div>
                      </details>
                    ))}
                  </div>
                ) : (
                  <p className="font-small text-fp-slate/65">{t("view.emptyHistory")}</p>
                )}

                {serverError ? (
                  <p className="font-small text-fp-error">{serverError}</p>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <AppButton
                    type="button"
                    onClick={() => setStep(1)}
                  >
                    {t("view.backToCurrent")}
                  </AppButton>
                  <Link
                    href="/"
                    className="tap-target inline-flex h-12 items-center justify-center rounded-pill border border-fp-teal bg-white px-6 text-base font-semibold text-fp-teal shadow-fp transition-all duration-200 ease-out hover:bg-fp-lt-blue/20 hover:text-fp-slate"
                  >
                    {t("view.backHome")}
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
