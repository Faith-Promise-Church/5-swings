import { forwardRef } from "react";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

export function AppCard({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
}) {
  return (
    <div
      {...props}
      className={cn("rounded-xl border border-fp-line bg-white shadow-fp", className)}
    >
      {children}
    </div>
  );
}

export function AppCardBody({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
}) {
  return (
    <div {...props} className={cn("px-5 py-6 sm:px-8 sm:py-8", className)}>
      {children}
    </div>
  );
}

export const AppInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function AppInput({ className, ...props }, ref) {
    return (
      <input
        {...props}
        ref={ref}
        className={cn(
          "h-12 w-full rounded-lg border border-fp-line bg-white px-4 text-base text-fp-slate shadow-sm outline-none focus:border-fp-teal focus:ring-2 focus:ring-fp-lt-blue",
          className,
        )}
      />
    );
  },
);

export const AppSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function AppSelect({ className, children, ...props }, ref) {
    return (
      <select
        {...props}
        ref={ref}
        className={cn(
          "h-12 w-full rounded-lg border border-fp-line bg-white px-4 text-base text-fp-slate shadow-sm outline-none focus:border-fp-teal focus:ring-2 focus:ring-fp-lt-blue",
          className,
        )}
      >
        {children}
      </select>
    );
  },
);

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
  fullWidth?: boolean;
};

export function AppButton({
  className,
  variant = "primary",
  fullWidth = false,
  type = "button",
  ...props
}: AppButtonProps) {
  return (
    <button
      type={type}
      {...props}
      className={cn(
        "tap-target inline-flex h-12 items-center justify-center rounded-pill px-6 text-base font-semibold transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-60",
        fullWidth && "w-full",
        variant === "primary" &&
          "bg-fp-teal text-white shadow-fp hover:bg-fp-slate",
        variant === "outline" &&
          "border border-fp-teal bg-white text-fp-teal shadow-fp hover:bg-fp-lt-blue/20 hover:text-fp-slate",
        variant === "ghost" &&
          "bg-transparent text-fp-slate/70 hover:bg-white/70 hover:text-fp-slate",
        className,
      )}
    />
  );
}
