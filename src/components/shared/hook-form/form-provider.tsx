
"use client";

import type { FieldValues, UseFormReturn } from "react-hook-form";

import * as React from "react";

import { FormProvider as RHFForm } from "react-hook-form";

// ----------------------------------------------------------------------

export type FormProps<T extends FieldValues> = {

  onSubmit?: ((e?: React.BaseSyntheticEvent) => void) | (() => void);
  children: React.ReactNode;
  methods: UseFormReturn<T>;
  className?: string;
  submitOnEnter?: boolean;
};

export function Form<T extends FieldValues>({
  children,
  onSubmit,
  methods,
  className = "",
  submitOnEnter = false,
}: FormProps<T>) {
  return (
    <RHFForm {...methods}>
      <form
        onSubmit={onSubmit as React.FormEventHandler<HTMLFormElement>}
        noValidate
        autoComplete="off"
        onKeyDown={(e) => {
          // Keep current behavior unless explicitly enabled.
          if (!submitOnEnter && e.key === "Enter") e.preventDefault();
        }}
        className={className}
      >
        {children}
      </form>
    </RHFForm>
  );
}
