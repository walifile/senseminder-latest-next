import type { FieldValues, UseFormReturn } from "react-hook-form";

import { FormProvider as RHFForm } from "react-hook-form";

// ----------------------------------------------------------------------

export type FormProps<T extends FieldValues> = {
  onSubmit?: () => void;
  children: React.ReactNode;
  methods: UseFormReturn<T>;
  className?: string;
};

export function Form<T extends FieldValues>({
  children,
  onSubmit,
  methods,
  className = "",
}: FormProps<T>) {
  return (
    <RHFForm {...methods}>
      <form
        onSubmit={onSubmit}
        noValidate
        autoComplete="off"
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
        className={className}
      >
        {children}
      </form>
    </RHFForm>
  );
}
