import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FieldShellProps = {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function FieldShell({
  label,
  hint,
  error,
  children,
  className,
}: FieldShellProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="space-y-1">
        <label className="text-sm font-semibold text-fp-slate">{label}</label>
        {hint ? <p className="font-small text-fp-slate/65">{hint}</p> : null}
      </div>
      {children}
      {error ? <p className="font-small text-fp-error">{error}</p> : null}
    </div>
  );
}
