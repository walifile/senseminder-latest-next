import { forwardRef, ElementType } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RHFTextProps {
  name: string;
  label?: string;
  description?: string; // label description
  placeholder?: string;
  helperText?: string;
  tooltipText?: any; // optional tooltip content
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  icon?: ElementType; // icon component
  multiline?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  rows?: number; // for textarea
  maxLength?: number;
  minLength?: number;
  onChange?: (value: string) => void;
}

export const RHFText = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  RHFTextProps
>(
  (
    {
      name,
      label,
      description,
      placeholder,
      helperText,
      tooltipText,
      type = "text",
      icon: Icon,
      multiline = false,
      disabled = false,
      required = false,
      className,
      labelClassName,
      inputClassName,
      rows = 4,
      maxLength,
      minLength,
      onChange,
    },
    ref
  ) => {
    const { control } = useFormContext();

    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => {
          const hasError = !!error;

          const handleChange = (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          ) => {
            const value = e.target.value;
            if (onChange) {
              onChange(value);
            } else {
              field.onChange(value);
            }
          };

          return (
            <div className={cn("flex flex-col gap-2", className)}>
              {(label || description) && (
                <div className="flex items-center justify-between">
                  <div>
                    {label && (
                      <Label
                        htmlFor={name}
                        className={cn(
                          hasError && "text-red-500",
                          labelClassName
                        )}
                      >
                        {label}
                        {required && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </Label>
                    )}
                    {description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {description}
                      </p>
                    )}
                  </div>

                  {tooltipText && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{tooltipText}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}

              <div className="relative">
                {Icon && (
                  <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                )}

                {multiline ? (
                  <Textarea
                    ref={ref as React.RefObject<HTMLTextAreaElement>}
                    id={name}
                    placeholder={placeholder}
                    value={field.value || ""}
                    onChange={handleChange}
                    disabled={disabled}
                    rows={rows}
                    maxLength={maxLength}
                    minLength={minLength}
                    className={cn(
                      hasError && "border-red-500 focus:border-red-500",
                      Icon && "pl-10",
                      inputClassName
                    )}
                  />
                ) : (
                  <Input
                    ref={ref as React.RefObject<HTMLInputElement>}
                    id={name}
                    type={type}
                    placeholder={placeholder}
                    value={field.value || ""}
                    onChange={handleChange}
                    disabled={disabled}
                    maxLength={maxLength}
                    minLength={minLength}
                    className={cn(
                      "h-11",
                      hasError && "border-red-500 focus:border-red-500",
                      Icon && "pl-10",
                      inputClassName
                    )}
                  />
                )}
              </div>

              {(error?.message || helperText) && (
                <p
                  className={cn(
                    "text-sm",
                    error?.message ? "text-red-500" : "text-gray-500"
                  )}
                >
                  {error?.message || helperText}
                </p>
              )}
            </div>
          );
        }}
      />
    );
  }
);

RHFText.displayName = "RHFText";
