/* eslint perfectionist/sort-imports: "off" */

"use client";

import type { UseFormReturn } from "react-hook-form";

import React, { useMemo, useState, useEffect } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Controller } from "react-hook-form";

import { Info, AlertCircle } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Form, Field } from "@/components/shared/hook-form";

import FieldChangePreview from "./field-change-preview";
import { osOptions, storageOptions, locationOptions } from "../data";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSmartPcConfigQuery } from "@/api/pc-config-api";

import type { FormValues } from "../schema";
import type { ResizeInitial } from "../types";

interface Props {
  methods: UseFormReturn<FormValues>;
  isResize: boolean;
  isStorageOnly?: boolean;
  existingCPU?: string;
  existingStorage?: string;
  existingData?: ResizeInitial;
  loadingExisting?: boolean;
}

type CpuOpt = { value: string; label: string };

// Strict GPU detection: only configs ending with ".GPU"
const isGpuString = (s?: unknown): boolean =>
  typeof s === "string" && s.trim().toLowerCase().endsWith(".gpu");

const isGpuOption = (opt: CpuOpt): boolean =>
  isGpuString(opt.value) || isGpuString(opt.label);

const SmartPcConfigForm = ({
  methods,
  isResize,
  isStorageOnly,
  existingCPU,
  existingStorage,
  loadingExisting,
}: Props) => {
  const PANEL =
    "rounded-[16px] border border-slate-200/80 bg-slate-50/80 px-3 py-2.5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]";

  const CONTROL_WRAP =
    "[&_button]:h-10 [&_button]:min-w-0 [&_button]:rounded-[12px] [&_button]:border [&_button]:border-slate-200/80 [&_button]:bg-white/90 [&_button]:px-3 [&_button]:text-[14px] [&_button]:font-medium [&_button]:leading-[20px] [&_button]:text-slate-900 [&_button]:shadow-none dark:[&_button]:border-white/10 dark:[&_button]:bg-white/[0.04] dark:[&_button]:text-white [&_button_span]:text-[14px] [&_button_span]:font-medium [&_button_span]:leading-[20px] [&_button_div]:text-[14px] [&_button_div]:font-medium [&_button_div]:leading-[20px] [&_button_p]:text-[14px] [&_button_p]:font-medium [&_button_p]:leading-[20px]";
  
  const CONTROL_WRAP_TRUNCATE =
    "[&_button]:h-10 [&_button]:min-w-0 [&_button]:rounded-[12px] [&_button]:border [&_button]:border-slate-200/80 [&_button]:bg-white/90 [&_button]:px-3 [&_button]:text-[14px] [&_button]:font-medium [&_button]:leading-[20px] [&_button]:text-slate-900 [&_button]:shadow-none dark:[&_button]:border-white/10 dark:[&_button]:bg-white/[0.04] dark:[&_button]:text-white [&_button_span]:block [&_button_span]:max-w-full [&_button_span]:truncate [&_button_span]:whitespace-nowrap [&_button_span]:text-[14px] [&_button_span]:font-medium [&_button_span]:leading-[20px] [&_button_div]:text-[14px] [&_button_div]:font-medium [&_button_div]:leading-[20px] [&_button_p]:text-[14px] [&_button_p]:font-medium [&_button_p]:leading-[20px]";

  const INPUT_CLASS =
    "h-10 rounded-[12px] border border-slate-200/80 bg-white/90 px-3 text-[14px] font-medium leading-[20px] text-slate-900 placeholder:text-[14px] placeholder:font-medium placeholder:leading-[20px] placeholder:text-slate-400 shadow-none dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500";

  const locked = new Set(["pcName", "operatingSystem", "region", "billingPlan"]);

  const {
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = methods;

  const values = watch();
  const {
    operatingSystem: selectedOS,
    linuxCategory: selectedLinuxCategory,
    cpu,
    storage,
    region,
  } = values;

  const isLinuxOS = selectedOS === "Linux";

  const {
    data: apiConfig,
    isLoading: isConfigLoading,
    isFetching: isConfigFetching,
  } = useGetSmartPcConfigQuery({ region }, { skip: !region });

  const apiCpuOptions = useMemo(
    () =>
      (apiConfig?.cpuOptions || {}) as Record<
        string,
        { value: string; label: string }[]
      >,
    [apiConfig?.cpuOptions],
  );

  const apiCpuCategories = useMemo(
    () =>
      (apiConfig?.cpuCategories || {}) as Record<
        string,
        Record<string, { value: string; label: string }[]>
      >,
    [apiConfig?.cpuCategories],
  );

  const configLoading = isConfigLoading || isConfigFetching;

  const linuxCategoryCpuOptions = useMemo(
    () => apiCpuCategories?.Linux?.[`${selectedLinuxCategory}`] || [],
    [selectedLinuxCategory, apiCpuCategories],
  );

  const cpuOptionsForOS = useMemo(
    () => (isLinuxOS ? linuxCategoryCpuOptions : apiCpuOptions[selectedOS] || []),
    [isLinuxOS, linuxCategoryCpuOptions, apiCpuOptions, selectedOS],
  );

  const linuxCategories = useMemo(
    () => Object.keys(apiCpuCategories?.Linux || {}),
    [apiCpuCategories],
  );

  /* ----- auto selection (CREATE only) ----- */
  useEffect(() => {
    if (isResize) return;
    if (!selectedOS) return;
    if (!region) return;
    if (configLoading) return;

    if (isLinuxOS) {
      const currentLinuxCategory = getValues("linuxCategory");
      const defaultLinuxCategory = linuxCategories.includes("Ubuntu_24.04_LTS_X64")
        ? "Ubuntu_24.04_LTS_X64"
        : linuxCategories[0];
      const isCurrentLinuxCategoryValid =
        !!currentLinuxCategory && linuxCategories.includes(currentLinuxCategory);

      if (!isCurrentLinuxCategoryValid && defaultLinuxCategory) {
        setValue("linuxCategory", defaultLinuxCategory, { shouldValidate: true });
      }
    }

    if (cpuOptionsForOS.length > 0) {
      const currentCpu = getValues("cpu");
      const isCurrentCpuValid = cpuOptionsForOS.some(
        (option) => option.value === currentCpu,
      );

      if (!isCurrentCpuValid) {
        setValue("cpu", cpuOptionsForOS[0].value, { shouldValidate: true });
      }
    }
  }, [
    isResize,
    selectedOS,
    region,
    isLinuxOS,
    linuxCategories,
    getValues,
    setValue,
    configLoading,
    cpuOptionsForOS,
  ]);

  useEffect(() => {
    if (isResize) return;
    if (!isLinuxOS) return;
    if (!region) return;
    if (configLoading) return;

    if (linuxCategoryCpuOptions.length > 0) {
      setValue("cpu", linuxCategoryCpuOptions[0].value, { shouldValidate: true });
    }
  }, [isResize, isLinuxOS, region, linuxCategoryCpuOptions, setValue, configLoading]);

  /* ----- CREATE: GPU checkbox filter ----- */
  const [showGpuOnly, setShowGpuOnly] = useState(false);

  const hasAnyGpuOptions = useMemo(
    () => cpuOptionsForOS.some(isGpuOption),
    [cpuOptionsForOS],
  );

  const gpuCpuOptions = useMemo(
    () => cpuOptionsForOS.filter(isGpuOption),
    [cpuOptionsForOS],
  );

  const nonGpuCpuOptions = useMemo(
    () => cpuOptionsForOS.filter((o) => !isGpuOption(o)),
    [cpuOptionsForOS],
  );

  const displayedCpuOptions = useMemo(() => {
    if (isResize) return cpuOptionsForOS;

    if (!hasAnyGpuOptions) return cpuOptionsForOS;

    if (showGpuOnly) return gpuCpuOptions.length ? gpuCpuOptions : cpuOptionsForOS;

    return nonGpuCpuOptions.length ? nonGpuCpuOptions : cpuOptionsForOS;
  }, [
    isResize,
    cpuOptionsForOS,
    hasAnyGpuOptions,
    showGpuOnly,
    gpuCpuOptions,
    nonGpuCpuOptions,
  ]);

  // Keep selection valid on CREATE when toggling GPU checkbox / OS changes
  useEffect(() => {
    if (isResize) return;
    if (configLoading) return;

    if (!hasAnyGpuOptions && showGpuOnly) {
      setShowGpuOnly(false);
      return;
    }

    const stillValid = displayedCpuOptions.some((o) => o.value === cpu);
    if (!stillValid && displayedCpuOptions.length > 0) {
      setValue("cpu", displayedCpuOptions[0].value, { shouldValidate: true });
    }
  }, [
    isResize,
    configLoading,
    hasAnyGpuOptions,
    showGpuOnly,
    displayedCpuOptions,
    cpu,
    setValue,
  ]);

  /* ----- RESIZE: lock to same GPU class as existingCPU ----- */
  const resizeCpuOptions = useMemo(() => {
    if (!isResize || isStorageOnly) return cpuOptionsForOS;
    if (!existingCPU) return cpuOptionsForOS;

    const existingIsGpu = isGpuString(existingCPU);
    const filtered = cpuOptionsForOS.filter(
      (o) => isGpuOption(o) === existingIsGpu,
    );

    return filtered.length ? filtered : cpuOptionsForOS;
  }, [isResize, isStorageOnly, existingCPU, cpuOptionsForOS]);

  // Keep selection valid on RESIZE when category changes
  useEffect(() => {
    if (!isResize || isStorageOnly) return;
    if (configLoading) return;

    const stillValid = resizeCpuOptions.some((o) => o.value === cpu);
    if (!stillValid && resizeCpuOptions.length > 0) {
      setValue("cpu", resizeCpuOptions[0].value, { shouldValidate: true });
    }
  }, [isResize, isStorageOnly, configLoading, resizeCpuOptions, cpu, setValue]);

  /* ----- locked fields ----- */
  function isLocked(
    field: "pcName" | "operatingSystem" | "region" | "billingPlan" | "storage",
  ) {
    if (!isResize) return false;
    if (loadingExisting) return true;
    if (isStorageOnly) return field !== "storage";
    return locked.has(field) || field === "storage";
  }

  /* ----- cpu label helpers ----- */
  const cpuLabelFor = React.useCallback(
    (val?: string | null) => {
      if (!val) return "";
      const found = cpuOptionsForOS.find((o) => o.value === val);
      return found?.label ?? val;
    },
    [cpuOptionsForOS],
  );

  const pcNameError = errors.pcName;

  return (
    <div
      className={cn(
        "space-y-2.5 font-sans",
        loadingExisting && "pointer-events-none opacity-60",
      )}
    >
      <Form methods={methods}>
        <div className="grid gap-2.5 lg:grid-cols-2">
          {/* BASIC INFORMATION */}
          <section className={cn(PANEL, "flex flex-col")}>
            <h3 className="font-['Space_Grotesk'] text-[15px] font-bold leading-5 text-slate-900 dark:text-white">
              Basic Information
            </h3>

            <div className="mt-2.5 flex flex-1 flex-col gap-2.5">
              <div className="space-y-1">
                <Label className="text-[12px] font-semibold text-slate-800 dark:text-slate-200">
                  PC Name
                </Label>

                <Controller
                  control={control}
                  name="pcName"
                  rules={
                    isResize
                      ? undefined
                      : {
                          required: "Computer name is required",
                          pattern: {
                            value: /^[a-zA-Z0-9-_ ]{1,30}$/,
                            message:
                              "Only letters, numbers, spaces, dash and underscore allowed (max 30)",
                          },
                        }
                  }
                  render={({ field }) => (
                    <Input
                      variant="auth"
                      className={cn(
                        INPUT_CLASS,
                          "!text-[14px] !font-medium !leading-[16px] placeholder:!text-[12px] placeholder:!font-medium placeholder:!leading-[16px]",
                          "focus-visible:border-[#6a5cff] focus-visible:ring-0",
                        !isResize &&
                          pcNameError &&
                          "border-red-500 focus-visible:border-red-500"
                      )}
                      placeholder="E.g., My-game-partner"
                      {...field}
                      disabled={isLocked("pcName")}
                      data-cancel-drag
                      data-testid="sensepc-computer-name-input"
                    />
                  )}
                />

                <div className="flex min-h-[16px] items-center gap-1.5">
                  {pcNameError ? (
                    <>
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                      <p className="text-[10px] leading-[14px] text-amber-600 dark:text-amber-400">
                        {pcNameError.message}
                      </p>
                    </>
                  ) : (
                    <span className="text-[10px] leading-[14px] text-transparent">
                      placeholder
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[12px] font-semibold text-slate-800 dark:text-slate-200">
                  Operating System
                </Label>

                <div className={CONTROL_WRAP}>
                  <Field.Select
                    name="operatingSystem"
                    placeholder="Select Operating System"
                    options={osOptions}
                    disabled={isResize || loadingExisting}
                    selectVariant="glowingSelector"
                  />
                </div>

                {isLinuxOS && (
                  <div className="rounded-[12px] border border-slate-200/80 bg-slate-50/70 px-3 py-2 dark:border-white/10 dark:bg-white/[0.035]">
                    <p className="text-[12px] font-medium leading-[16px] text-slate-700 dark:text-slate-200">
                      Linux selected
                    </p>
                    <p className="mt-1 text-[11px] leading-[16px] text-slate-500 dark:text-slate-400">
                      Please choose a category under Hardware Configuration to load the matching CPU and memory options.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* HARDWARE CONFIGURATION */}
          <section className={PANEL}>
            <h3 className="font-['Space_Grotesk'] text-[15px] font-bold leading-5 text-slate-900 dark:text-white">
              Hardware Configuration
            </h3>

            <div className="mt-2.5 space-y-2.5">
              {isLinuxOS &&
                (configLoading ? (
                  <div className="space-y-1">
                    <Label className="text-[12px] font-semibold text-slate-800 dark:text-slate-200">
                      Category
                    </Label>
                    <Skeleton className="h-10 w-full rounded-[12px]" />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Label className="text-[12px] font-semibold text-slate-800 dark:text-slate-200">
                      Category
                    </Label>
                    <div className={CONTROL_WRAP}>
                      <Field.Select
                        name="linuxCategory"
                        placeholder="Select Linux category"
                        options={Object.keys(
                          (apiCpuCategories?.Linux || {}) as Record<string, unknown>,
                        )}
                        disabled={isResize || loadingExisting}
                        selectVariant="glowingSelector"
                      />
                    </div>
                  </div>
                ))}

              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <Label className="text-[12px] font-semibold text-slate-800 dark:text-slate-200">
                      CPU + Memory
                    </Label>

                    {!isResize && (
                      <TooltipProvider delayDuration={150}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <label
                              className={cn(
                                "inline-flex items-center gap-2 rounded-full border px-2.5 py-1",
                                "border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-white/[0.035]",
                                "text-[11px] leading-[16px] text-slate-700 dark:text-slate-300",
                                !hasAnyGpuOptions && "cursor-not-allowed opacity-70"
                              )}
                            >
                              <Checkbox
                                checked={showGpuOnly}
                                onCheckedChange={(v) => setShowGpuOnly(Boolean(v))}
                                disabled={loadingExisting || configLoading || !hasAnyGpuOptions}
                              />
                              <span className="truncate">Show GPU configurations only</span>
                            </label>
                          </TooltipTrigger>

                          {!hasAnyGpuOptions && (
                            <TooltipContent
                              side="top"
                              align="center"
                              className="max-w-[220px] text-[11px] leading-[16px]"
                            >
                              No GPU options are available for the selected operating system or category.
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>

                  {isResize && !isStorageOnly && existingCPU && (
                    <FieldChangePreview
                      oldValue={cpuLabelFor(existingCPU)}
                      newValue={cpuLabelFor(cpu)}
                      hasChanged={cpu !== existingCPU}
                    />
                  )}
                </div>

                {configLoading ? (
                  <Skeleton className="h-10 w-full rounded-[12px]" />
                ) : (
                  <div className={CONTROL_WRAP_TRUNCATE}>
                    <Field.Select
                      name="cpu"
                      selectVariant="glowingSelector"
                      placeholder="Select CPU size"
                      options={isResize ? resizeCpuOptions : displayedCpuOptions}
                      triggerTestId="sensepc-cpu-config-select"
                      disabled={
                        loadingExisting ||
                        (isResize && isStorageOnly) ||
                        configLoading
                      }
                      onValueChange={(value) => {
                        if (value) setValue("cpu", value, { shouldValidate: true });
                      }}
                    />
                  </div>
                )}

                {isResize && !isStorageOnly && existingCPU && (
                  <p className="text-[10px] leading-[14px] text-slate-500 dark:text-slate-400">
                    Resize options are limited to{" "}
                    {isGpuString(existingCPU) ? "GPU" : "non-GPU"} configurations.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label className="text-[12px] font-semibold text-slate-800 dark:text-slate-200">
                    Storage (SSD)
                  </Label>

                  {isResize && isStorageOnly && existingStorage && (
                    <FieldChangePreview
                      oldValue={`${existingStorage} GB`}
                      newValue={`${storage} GB`}
                      hasChanged={Number(storage) !== Number(existingStorage)}
                    />
                  )}
                </div>

                <div className={CONTROL_WRAP}>
                  <Field.Select
                    name="storage"
                    selectVariant="glowingSelector"
                    placeholder="Select storage size"
                    options={storageOptions}
                    triggerTestId="sensepc-memory-config-select"
                    disabled={isLocked("storage")}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* LOCATION */}
          <section className={PANEL}>
            <div className="mb-1 flex items-center gap-1.5">
              <Label className="text-[12px] font-semibold text-slate-800 dark:text-slate-200">
                Location
              </Label>

              <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:bg-black/5 dark:text-slate-500 dark:hover:bg-white/10"
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      aria-label="Location info"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>

                  <TooltipContent
                    side="top"
                    align="start"
                    className="max-w-[240px] text-[11px] leading-[16px]"
                  >
                    Pick the closest location for faster response and smoother performance.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className={CONTROL_WRAP}>
              <Field.Select
                name="region"
                selectVariant="glowingSelector"
                placeholder="Select nearest location"
                options={locationOptions}
                disabled={isLocked("region")}
              />
            </div>
          </section>

          {/* BILLING PLAN */}
          <section className={PANEL}>
            <div className="mb-1 flex items-center gap-1.5">
              <Label className="text-[12px] font-semibold text-slate-800 dark:text-slate-200">
                Billing Plan
              </Label>

              <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:bg-black/5 dark:text-slate-500 dark:hover:bg-white/10"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Billing plan info"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>

                  <TooltipContent
                    side="right"
                    align="center"
                    className="max-w-[240px] text-[11px] leading-[16px]"
                  >
                    You can change your billing plan later from your dashboard.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className={CONTROL_WRAP}>
              <Field.Select
                name="billingPlan"
                selectVariant="glowingSelector"
                placeholder="Choose billing plan"
                disabled={isLocked("billingPlan")}
                options={[
                  { value: "hourly", label: "Hourly" },
                  { value: "daily", label: "Daily" },
                  { value: "monthly", label: "Monthly" },
                ]}
              />
            </div>
          </section>
        </div>
      </Form>
    </div>
  );
};

export default SmartPcConfigForm;