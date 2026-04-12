"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { LanguageToggle } from "@/components/app/language-toggle";
import { Logo } from "@/components/app/logo";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

type PageShellProps = {
  children: ReactNode;
  showHomeLink?: boolean;
  rightSlot?: ReactNode;
  className?: string;
};

export function PageShell({
  children,
  showHomeLink = false,
  rightSlot,
  className,
}: PageShellProps) {
  const { t } = useLanguage();

  return (
    <div className="screen-padding min-h-screen">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-5xl flex-col">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="min-w-[88px]">
            {showHomeLink ? (
              <Link
                href="/"
                className="tap-target inline-flex items-center rounded-pill px-3 text-sm font-medium text-fp-slate/75 hover:bg-white/70 hover:text-fp-slate"
              >
                ← {t("common.home")}
              </Link>
            ) : null}
          </div>
          <Logo className="h-16 w-auto max-w-[220px] object-contain" />
          <div className="flex min-w-[88px] justify-end gap-2">
            {rightSlot}
            <LanguageToggle />
          </div>
        </div>

        <main
          className={cn(
            "flex flex-1 flex-col items-center justify-center pb-6",
            className,
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
