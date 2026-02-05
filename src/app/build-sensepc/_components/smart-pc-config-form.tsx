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

// ✅ Strict GPU detection: only configs ending with ".GPU"
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
  const locked = new Set(["pcName", "operatingSystem", "region", "billingPlan"]);

  const {
    control,
    watch,
    setValue,
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
  } = useGetSmartPcConfigQuery(
    { region },
    { skip: !region },
  );

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

  /* ----- auto selection (CREATE only) ----- */
  useEffect(() => {
    if (isResize) return;
    if (!selectedOS) return;
    if (!region) return;
    if (configLoading) return;

    // Default Linux category (harmless for non-Linux if your schema allows it)
    setValue("linuxCategory", "Ubuntu_24.04_LTS_X64", { shouldValidate: true });

    if (cpuOptionsForOS.length > 0) {
      setValue("cpu", cpuOptionsForOS[0].value, { shouldValidate: true });
    }
  }, [isResize, selectedOS, region, setValue, configLoading, cpuOptionsForOS]);

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

    // If no GPU options, force checkbox off
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
    // Only apply for CPU resize (not create, not storage-only resize)
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
    <div className={cn("space-y-8", loadingExisting && "opacity-60 pointer-events-none")}>
      <Form methods={methods}>
        <div className="space-y-8">
          {/* ========== BASIC ========== */}
          <section className="space-y-4">
            <p className="text-xs font-medium text-muted-foreground">Basic:</p>

            <Field.Select
              name="operatingSystem"
              label="Select  Operating System (OS)"
              placeholder="Select Operating System"
              options={osOptions}
              disabled={isResize || loadingExisting}
              selectVariant="glowingSelector"
            />

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Name of the computer</Label>

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
                      "bg-[rgba(37,48,240,0.07)]",
                      "border border-[#2530F0]/20 dark:border-white/10",
                      "focus-visible:outline-none focus-visible:border-[#5f4bf6]",
                      "h-[60px]",
                      !isResize && pcNameError && "border-red-500 focus-visible:border-red-500",
                    )}
                    placeholder="Enter a name for your computer"
                    {...field}
                    disabled={isLocked("pcName")}
                    data-cancel-drag
                    data-testid="sensepc-computer-name-input"
                  />
                )}
              />

              <div className="mt-1.5 flex items-center gap-2">
                <AlertCircle
                  className={cn(
                    "h-4 w-4",
                    pcNameError ? "text-yellow-600" : "text-muted-foreground/80",
                  )}
                />
                <p className={cn("text-xs", pcNameError ? "text-yellow-700" : "text-muted-foreground")}>
                  {pcNameError?.message ?? "PC name is required"}
                </p>
              </div>
            </div>

            {/* Location (tooltip to the right of label) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold">Location</Label>

                <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        aria-label="Location info"
                      >
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>

                    <TooltipContent side="top" align="start" className="max-w-[260px]">
                      Pick the closest location for faster response and smoother performance.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <Field.Select
                name="region"
                selectVariant="glowingSelector"
                placeholder="Select nearest datacenter"
                options={locationOptions}
                disabled={isLocked("region")}
              />
            </div>
          </section>

          {/* ========== CONFIGURATIONS ========== */}
          <section className="space-y-4">
            <p className="text-xs font-medium text-muted-foreground">Configurations:</p>

            {isLinuxOS &&
              (configLoading ? (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Category</Label>
                  <Skeleton className="h-11 w-full" />
                </div>
              ) : (
                <Field.Select
                  name="linuxCategory"
                  label="Category"
                  placeholder="Select Linux category"
                  options={Object.keys((apiCpuCategories?.Linux || {}) as Record<string, unknown>)}
                  disabled={isResize || loadingExisting}
                  selectVariant="glowingSelector"
                />
              ))}

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label className="text-sm font-semibold">CPU +  Memory</Label>

                {isResize && !isStorageOnly && existingCPU && (
                  <FieldChangePreview
                    oldValue={cpuLabelFor(existingCPU)}
                    newValue={cpuLabelFor(cpu)}
                    hasChanged={cpu !== existingCPU}
                  />
                )}
              </div>

              {/* CREATE: GPU checkbox */}
              {!isResize && (
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={showGpuOnly}
                    onCheckedChange={(v) => setShowGpuOnly(Boolean(v))}
                    disabled={loadingExisting || configLoading || !hasAnyGpuOptions}
                  />
                  <p className="text-sm text-foreground">
                    Show GPU configurations only
                    {!hasAnyGpuOptions && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (No GPU options for this OS)
                      </span>
                    )}
                  </p>
                </div>
              )}

              {configLoading ? (
                <Skeleton className="h-11 w-full" />
              ) : (
                <Field.Select
                  name="cpu"
                  selectVariant="glowingSelector"
                  placeholder="Select CPU size"
                  options={isResize ? resizeCpuOptions : displayedCpuOptions}
                  triggerTestId="sensepc-cpu-config-select"
                  disabled={loadingExisting || (isResize && isStorageOnly) || configLoading}
                  onValueChange={(value) => {
                    if (value) setValue("cpu", value, { shouldValidate: true });
                  }}
                />
              )}

              {isResize && !isStorageOnly && existingCPU && (
                <p className="text-xs text-muted-foreground">
                  Resize options are limited to{" "}
                  {isGpuString(existingCPU) ? "GPU" : "non-GPU"} configurations.
                </p>
              )}
            </div>

            {/* Storage */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label className="text-sm font-semibold">Storage (SSD)</Label>

                {isResize && isStorageOnly && existingStorage && (
                  <FieldChangePreview
                    oldValue={`${existingStorage} GB`}
                    newValue={`${storage} GB`}
                    hasChanged={Number(storage) !== Number(existingStorage)}
                  />
                )}
              </div>

              <Field.Select
                name="storage"
                selectVariant="glowingSelector"
                placeholder="Select storage size"
                options={storageOptions}
                triggerTestId="sensepc-memory-config-select"
                disabled={isLocked("storage")}
              />
            </div>

          </section>

          {/* ========== BILLING ========== */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-muted-foreground">Billing Plan:</p>

              <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Billing plan info"
                    >
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>

                  <TooltipContent side="right" align="center" className="max-w-[260px]">
                    You can change your billing plan later from your dashboard.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Field.Select
              name="billingPlan"
              label="Billing Plan"
              selectVariant="glowingSelector"
              placeholder="Choose billing plan"
              disabled={isLocked("billingPlan")}
              options={[
                { value: "hourly", label: "Hourly" },
                { value: "daily", label: "Daily" },
                { value: "monthly", label: "Monthly" },
              ]}
            />
          </section>
        </div>
      </Form>
    </div>
  );
};

export default SmartPcConfigForm;
