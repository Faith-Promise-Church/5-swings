"use client";

import Link from "next/link";

import { PageShell } from "@/components/app/page-shell";
import { useLanguage } from "@/components/providers/language-provider";

export function HomeScreen() {
  const { t } = useLanguage();

  return (
    <PageShell className="justify-center">
      <div className="w-full max-w-3xl text-center">
        <div className="mx-auto max-w-2xl space-y-4">
          <h1 className="font-display text-fp-slate">{t("home.title")}</h1>
          <p className="font-small mx-auto max-w-xl text-fp-slate/72">
            {t("home.subtitle")}
          </p>
          <p className="font-small mx-auto max-w-xl text-fp-teal">
            {t("home.firstTime")}
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Link
            href="/enter"
            className="tap-target inline-flex h-14 items-center justify-center rounded-pill bg-fp-teal px-6 text-base font-semibold text-white no-underline shadow-fp hover:bg-fp-slate"
          >
            {t("home.enter")}
          </Link>
          <Link
            href="/edit"
            className="tap-target inline-flex h-14 items-center justify-center rounded-pill border border-fp-teal bg-white/80 px-6 text-base font-semibold text-fp-teal no-underline shadow-fp hover:bg-fp-lt-blue/20 hover:text-fp-slate"
          >
            {t("home.edit")}
          </Link>
          <Link
            href="/view"
            className="tap-target inline-flex h-14 items-center justify-center rounded-pill border border-fp-teal bg-white/80 px-6 text-base font-semibold text-fp-teal no-underline shadow-fp hover:bg-fp-lt-blue/20 hover:text-fp-slate"
          >
            {t("home.view")}
          </Link>
        </div>

        <div className="mt-14">
          <Link
            href="/admin"
            className="font-small inline-flex tap-target items-center justify-center text-fp-slate/60 underline-offset-4 hover:text-fp-slate hover:underline"
          >
            {t("home.admin")}
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
