"use client";

import type { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

import { FieldShell } from "@/components/app/field-shell";
import { AppInput } from "@/components/app/primitives";

type SwingFieldsProps<T extends FieldValues> = {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  swings: Array<{ category: string; wins: string[] }>;
  expandedWins: boolean[];
  onToggleWins: (index: number) => void;
  onAddWin: (index: number) => void;
  onRemoveWin: (index: number, winIndex: number) => void;
  title: string;
  subtitle: string;
  addWinsLabel: string;
  addAnotherWinsLabel: string;
  hideWinsLabel: string;
  weeklyWinLabel: string;
  removeLabel: string;
};

export function SwingFields<T extends FieldValues>({
  register,
  errors,
  swings,
  expandedWins,
  onToggleWins,
  onAddWin,
  onRemoveWin,
  title,
  subtitle,
  addWinsLabel,
  addAnotherWinsLabel,
  hideWinsLabel,
  weeklyWinLabel,
  removeLabel,
}: SwingFieldsProps<T>) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h2 className="font-h1 text-fp-slate">{title}</h2>
        <p className="font-body text-fp-slate/72">{subtitle}</p>
      </div>

      <div className="space-y-4">
        {Array.from({ length: 5 }, (_, index) => {
          const swingError =
            (errors.swings as Array<{ category?: { message?: string }; wins?: Array<{ message?: string }> }> | undefined)?.[index];
          const categoryError = swingError?.category?.message;
          const winsErrors = swingError?.wins ?? [];

          return (
            <div
              key={index}
              className="rounded-xl border border-fp-line bg-white p-4 shadow-fp"
            >
              <FieldShell
                label={`SWING ${index + 1}`}
                error={categoryError}
                className="space-y-3"
              >
                <AppInput
                  {...register(`swings.${index}.category` as never)}
                  placeholder={`SWING ${index + 1}`}
                />
              </FieldShell>

              <button
                type="button"
                onClick={() => onToggleWins(index)}
                className="tap-target mt-2 inline-flex items-center px-1 text-sm font-medium text-fp-teal underline-offset-4 hover:text-fp-slate hover:underline"
              >
                {expandedWins[index] ? hideWinsLabel : addWinsLabel}
              </button>

              {expandedWins[index] ? (
                <div className="mt-3 grid gap-3">
                  {swings[index]?.wins.map((_, winIndex) => (
                    <FieldShell
                      key={winIndex}
                      label={`${weeklyWinLabel} ${winIndex + 1}`}
                      error={winsErrors[winIndex]?.message}
                    >
                      <div className="flex items-end gap-3">
                        <AppInput
                          {...register(`swings.${index}.wins.${winIndex}` as never)}
                        />
                        <button
                          type="button"
                          onClick={() => onRemoveWin(index, winIndex)}
                          className="tap-target mb-1 inline-flex shrink-0 items-center px-1 text-sm font-medium text-fp-error underline-offset-4 hover:underline"
                        >
                          {removeLabel}
                        </button>
                      </div>
                    </FieldShell>
                  ))}
                  {swings[index]?.wins.length < 2 ? (
                    <button
                      type="button"
                      onClick={() => onAddWin(index)}
                      className="tap-target inline-flex items-center px-1 text-sm font-medium text-fp-teal underline-offset-4 hover:text-fp-slate hover:underline"
                    >
                      {addAnotherWinsLabel}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
