"use client";

import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex rounded-pill border border-fp-line bg-white/80 p-1 shadow-fp backdrop-blur-sm">
      {(["en", "es"] as const).map((option) => {
        const isActive = option === language;

        return (
          <button
            key={option}
            type="button"
            onClick={() => setLanguage(option)}
            className={cn(
              "tap-target rounded-pill px-3 text-sm font-medium uppercase tracking-[0.08em]",
              isActive
                ? "bg-fp-teal text-white shadow-sm"
                : "text-fp-slate/70 hover:bg-fp-cream",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
