"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { PageShell } from "@/components/app/page-shell";
import { FieldShell } from "@/components/app/field-shell";
import { AppButton, AppCard, AppCardBody, AppInput, AppSelect } from "@/components/app/primitives";
import { SwingsDisplay } from "@/components/app/swings-display";
import { useLanguage } from "@/components/providers/language-provider";
import { AREAS, CAMPUSES } from "@/lib/constants";
import { fetchJson } from "@/lib/api";
import { openAdminReportMailto } from "@/lib/mailto";
import { adminLoginSchema, emailInputSchema } from "@/lib/validation";
import type { SearchResultPerson, SearchType } from "@/lib/types";

type AdminScreenProps = {
  initialAuthenticated: boolean;
};

const selectValueSchema = z.object({
  value: z.string().trim().min(1, "Required"),
});

export function AdminScreen({ initialAuthenticated }: AdminScreenProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [activeTab, setActiveTab] = useState<SearchType>("campus");
  const [serverError, setServerError] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultPerson[]>([]);
  const [currentSearch, setCurrentSearch] = useState<{
    type: SearchType;
    value: string;
  } | null>(null);
  const [searching, setSearching] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState("");
  const [pdfSuccess, setPdfSuccess] = useState("");

  const loginForm = useForm<z.infer<typeof adminLoginSchema>>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      password: "",
    },
  });

  const campusForm = useForm<z.infer<typeof selectValueSchema>>({
    resolver: zodResolver(selectValueSchema),
    defaultValues: {
      value: "",
    },
  });
  const areaForm = useForm<z.infer<typeof selectValueSchema>>({
    resolver: zodResolver(selectValueSchema),
    defaultValues: {
      value: "",
    },
  });
  const individualForm = useForm<z.infer<typeof selectValueSchema>>({
    resolver: zodResolver(selectValueSchema),
    defaultValues: {
      value: "",
    },
  });
  const emailForm = useForm<z.infer<typeof emailInputSchema>>({
    resolver: zodResolver(emailInputSchema),
    defaultValues: {
      email: "",
    },
  });

  async function handleLogin(values: z.infer<typeof adminLoginSchema>) {
    setServerError("");

    try {
      await fetchJson("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      setAuthenticated(true);
      router.refresh();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : t("common.somethingWrong"));
    }
  }

  async function runSearch(type: SearchType, value: string) {
    setServerError("");
    setEmailSuccess("");
    setPdfSuccess("");
    setSearching(true);

    try {
      const results = await fetchJson<SearchResultPerson[]>("/api/admin/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          value,
        }),
      });

      setCurrentSearch({ type, value });
      setSearchResults(results);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : t("admin.searchError"));
    } finally {
      setSearching(false);
    }
  }

  async function handlePdf() {
    if (!currentSearch) {
      return;
    }

    setPdfLoading(true);
    setServerError("");
    setPdfSuccess("");

    try {
      const response = await fetch("/api/admin/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...currentSearch,
          language,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error ?? t("admin.pdfError"));
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `5-swings-${currentSearch.value.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setPdfSuccess(t("admin.pdfSuccess"));
    } catch (error) {
      setServerError(error instanceof Error ? error.message : t("admin.pdfError"));
    } finally {
      setPdfLoading(false);
    }
  }

  function handleEmail(values: z.infer<typeof emailInputSchema>) {
    if (!currentSearch) {
      return;
    }

    setServerError("");
    openAdminReportMailto({
      to: values.email,
      people: searchResults,
      type: currentSearch.type,
      value: currentSearch.value,
      language,
    });
    setEmailSuccess(t("common.emailClientOpened"));
    setEmailOpen(false);
    emailForm.reset();
  }

  async function handleLogout() {
    await fetchJson("/api/admin/logout", {
      method: "POST",
    });
    setAuthenticated(false);
    setCurrentSearch(null);
    setSearchResults([]);
    setPdfSuccess("");
    router.refresh();
  }

  if (!authenticated) {
    return (
      <PageShell showHomeLink className="justify-start">
        <div className="w-full max-w-xl">
          <AppCard>
            <AppCardBody>
              <form className="space-y-5" onSubmit={loginForm.handleSubmit(handleLogin)}>
                <h1 className="font-h1 text-fp-slate">{t("admin.loginTitle")}</h1>
                <FieldShell
                  label={t("admin.password")}
                  error={loginForm.formState.errors.password?.message}
                >
                  <AppInput
                    {...loginForm.register("password")}
                    type="password"
                  />
                </FieldShell>
                {serverError ? (
                  <p className="font-small text-fp-error">{serverError}</p>
                ) : null}
                <AppButton
                  type="submit"
                  disabled={loginForm.formState.isSubmitting}
                  fullWidth
                >
                  {t("admin.login")}
                </AppButton>
              </form>
            </AppCardBody>
          </AppCard>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      showHomeLink
      rightSlot={
        <AppButton
          type="button"
          variant="outline"
          onClick={handleLogout}
          className="px-4"
        >
          {t("common.logout")}
        </AppButton>
      }
      className="justify-start"
    >
      <div className="w-full max-w-5xl space-y-6">
        <AppCard>
          <AppCardBody>
            <div className="space-y-5">
              <div className="grid h-auto w-full grid-cols-3 rounded-xl bg-fp-cream p-1">
                {(["campus", "area", "individual"] as SearchType[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={[
                      "tap-target rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ease-out",
                      activeTab === tab
                        ? "bg-white text-fp-slate shadow-fp"
                        : "text-fp-slate/65 hover:bg-white/60 hover:text-fp-slate",
                    ].join(" ")}
                  >
                    {t(`admin.tabs.${tab}` as const)}
                  </button>
                ))}
              </div>

              {activeTab === "campus" ? (
                <form
                  className="grid gap-4 md:grid-cols-[1fr_auto]"
                  onSubmit={campusForm.handleSubmit((values) => runSearch("campus", values.value))}
                >
                  <FieldShell
                    label={t("admin.tabs.campus")}
                    error={campusForm.formState.errors.value?.message}
                  >
                    <Controller
                      control={campusForm.control}
                      name="value"
                      render={({ field }) => (
                        <AppSelect value={field.value} onChange={(event) => field.onChange(event.target.value)}>
                          <option value="">{t("admin.searchCampus")}</option>
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
                    type="submit"
                    disabled={searching}
                    className="md:self-end"
                  >
                    {t("common.search")}
                  </AppButton>
                </form>
              ) : null}

              {activeTab === "area" ? (
                <form
                  className="grid gap-4 md:grid-cols-[1fr_auto]"
                  onSubmit={areaForm.handleSubmit((values) => runSearch("area", values.value))}
                >
                  <FieldShell
                    label={t("admin.tabs.area")}
                    error={areaForm.formState.errors.value?.message}
                  >
                    <Controller
                      control={areaForm.control}
                      name="value"
                      render={({ field }) => (
                        <AppSelect value={field.value} onChange={(event) => field.onChange(event.target.value)}>
                          <option value="">{t("admin.searchArea")}</option>
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
                    type="submit"
                    disabled={searching}
                    className="md:self-end"
                  >
                    {t("common.search")}
                  </AppButton>
                </form>
              ) : null}

              {activeTab === "individual" ? (
                <form
                  className="grid gap-4 md:grid-cols-[1fr_auto]"
                  onSubmit={individualForm.handleSubmit((values) =>
                    runSearch("individual", values.value),
                  )}
                >
                  <FieldShell
                    label={t("admin.searchIndividual")}
                    error={individualForm.formState.errors.value?.message}
                  >
                    <AppInput
                      {...individualForm.register("value")}
                      placeholder={t("admin.searchIndividualPlaceholder")}
                    />
                  </FieldShell>
                  <AppButton
                    type="submit"
                    disabled={searching}
                    className="md:self-end"
                  >
                    {t("common.search")}
                  </AppButton>
                </form>
              ) : null}
            </div>
          </AppCardBody>
        </AppCard>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-small text-fp-slate/72">
            {currentSearch ? `${currentSearch.type}: ${currentSearch.value}` : ""}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <AppButton
              type="button"
              onClick={handlePdf}
              disabled={!currentSearch || !searchResults.length || pdfLoading}
            >
              {pdfLoading ? t("common.loading") : t("admin.generatePdf")}
            </AppButton>
            <AppButton
              type="button"
              variant="outline"
              onClick={() => setEmailOpen(true)}
              disabled={!currentSearch || !searchResults.length}
            >
              {t("admin.emailResults")}
            </AppButton>
          </div>
        </div>

        {serverError ? <p className="font-small text-fp-error">{serverError}</p> : null}
        {pdfSuccess ? <p className="font-small text-fp-success">{pdfSuccess}</p> : null}
        {emailSuccess ? <p className="font-small text-fp-success">{emailSuccess}</p> : null}

        {currentSearch && !searchResults.length && !searching ? (
          <AppCard>
            <AppCardBody className="text-fp-slate/72">
              {t("admin.empty")}
            </AppCardBody>
          </AppCard>
        ) : null}

        <div className="grid gap-4">
          {searchResults.map((person) => (
            <SwingsDisplay
              key={person.swingsId}
              person={person}
              labels={{
                name: t("swingCard.name"),
                campus: t("swingCard.campus"),
                area: t("swingCard.area"),
                weeklyWins: t("swingCard.weeklyWins"),
              }}
            />
          ))}
        </div>
      </div>

      {emailOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-fp-slate/35 px-4"
          onClick={() => setEmailOpen(false)}
        >
          <AppCard className="w-full max-w-lg" onClick={(event) => event.stopPropagation()}>
            <AppCardBody>
              <div className="space-y-2">
                <h2 className="font-h1 text-fp-slate">{t("admin.emailModalTitle")}</h2>
                <p className="font-small text-fp-slate/72">{t("admin.emailModalDescription")}</p>
              </div>
              <form
                className="mt-5 space-y-4"
                onSubmit={emailForm.handleSubmit(handleEmail)}
              >
                <FieldShell
                  label={t("common.email")}
                  error={emailForm.formState.errors.email?.message}
                >
                  <AppInput
                    {...emailForm.register("email")}
                    type="email"
                    inputMode="email"
                  />
                </FieldShell>
                <div className="grid gap-3 sm:grid-cols-2">
                  <AppButton
                    type="button"
                    variant="outline"
                    onClick={() => setEmailOpen(false)}
                  >
                    {t("common.cancel")}
                  </AppButton>
                  <AppButton
                    type="submit"
                    disabled={emailForm.formState.isSubmitting}
                  >
                    {t("common.send")}
                  </AppButton>
                </div>
              </form>
            </AppCardBody>
          </AppCard>
        </div>
      ) : null}
    </PageShell>
  );
}
