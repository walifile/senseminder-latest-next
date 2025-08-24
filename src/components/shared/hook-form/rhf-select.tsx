import { forwardRef, ElementType } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface RHFSelectProps {
  name: string;
  label?: string;
  description?: string; // label description
  placeholder?: string;
  helperText?: string;
  tooltipText?: any; // optional tooltip content
  options: SelectOption[] | string[];
  icon?: ElementType; // icon component, e.g. MonitorPlay
  disabled?: boolean;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  triggerClassName?: string;
  onValueChange?: (value: string) => void;
}

export const RHFSelect = forwardRef<HTMLButtonElement, RHFSelectProps>(
  (
    {
      name,
      label,
      description,
      placeholder = "Select an option",
      helperText,
      tooltipText,
      options = [],
      icon: Icon,
      disabled = false,
      required = false,
      className,
      labelClassName,
      triggerClassName,
      onValueChange,
    },
    ref
  ) => {
    const { control } = useFormContext();

    const normalizedOptions: SelectOption[] = options.map((option) =>
      typeof option === "string" ? { value: option, label: option } : option
    );

    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => {
          const hasError = !!error;

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
                          disabled && "text-gray-500",
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

              <Select
                value={field.value || ""}
                onValueChange={(val) => {
                  field.onChange(val);
                  onValueChange?.(val);
                }}
                disabled={disabled}
              >
                <SelectTrigger
                  ref={ref}
                  id={name}
                  className={cn(
                    "h-11 w-full",
                    hasError && "border-red-500 focus:border-red-500",
                    triggerClassName
                  )}
                >
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>

                <SelectContent>
                  {normalizedOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="h-4 w-4 mr-2" />}
                        <span>{option.label}</span>
                        {option.description && (
                          <span className="text-xs text-muted-foreground block">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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

RHFSelect.displayName = "RHFSelect";
