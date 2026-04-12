"use client";

import { cn } from "@/lib/utils";

type WizardProgressProps = {
  total: number;
  current: number;
};

export function WizardProgress({ total, current }: WizardProgressProps) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, index) => {
        const isActive = index <= current;

        return (
          <span
            key={index}
            className={cn(
              "h-2.5 rounded-pill transition-all duration-200 ease-out",
              isActive ? "w-7 bg-fp-teal" : "w-2.5 bg-fp-line",
            )}
          />
        );
      })}
    </div>
  );
}
