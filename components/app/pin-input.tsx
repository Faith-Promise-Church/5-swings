"use client";

import { useId } from "react";

import { AppInput } from "@/components/app/primitives";

type PinInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  helper?: string;
};

export function PinInput({
  label,
  value,
  onChange,
  onBlur,
  error,
  helper,
}: PinInputProps) {
  const id = useId();

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <label htmlFor={id} className="text-sm font-semibold text-fp-slate">
          {label}
        </label>
        {helper ? <p className="font-small text-fp-slate/65">{helper}</p> : null}
      </div>
      <AppInput
        id={id}
        value={value}
        onChange={(event) =>
          onChange(event.target.value.replace(/\D/g, "").slice(0, 4))
        }
        onBlur={onBlur}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={4}
        placeholder="1234"
        className="h-12 rounded-lg border-fp-line bg-white text-center text-base font-semibold tracking-[0.3em]"
      />
      {error ? <p className="font-small text-fp-error">{error}</p> : null}
    </div>
  );
}
