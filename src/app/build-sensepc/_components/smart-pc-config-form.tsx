



/* eslint perfectionist/sort-imports: "off" */

"use client";

import type { UseFormReturn } from "react-hook-form";

import React, { useMemo, useEffect } from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Controller } from "react-hook-form";

import { AlertCircle } from "lucide-react";

import { Form, Field } from "@/components/shared/hook-form";

import FieldChangePreview from "./field-change-preview";
import { osOptions, storageOptions, locationOptions } from "../data";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSmartPcConfigQuery } from "@/api/smartPCConfigAPI";

import type { FormValues } from "../schema";
import type { ResizeInitial } from "../types";

/**
 * Shared field focus border style (matches Figma: #8086F3)
 * You can import & reuse this in page.tsx or other components if needed.
 */

interface Props {
  methods: UseFormReturn<FormValues>;
  isResize: boolean;
  isStorageOnly?: boolean;
  existingCPU?: string;
  existingStorage?: string;
  existingData?: ResizeInitial;
  loadingExisting?: boolean;
}

const SmartPcConfigForm = ({
  methods,
  isResize,
  isStorageOnly,
  existingCPU,
  existingStorage,
  loadingExisting,
}: Props) => {
  const locked = new Set([
    "pcName",
    "operatingSystem",
    "region",
    "billingPlan",
  ]);

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
  } = values;

  /* ----- dynamic form logic ----- */
  const isLinuxOS = selectedOS === "Linux";

  // Fetch API cpuOptions via RTK Query
  const {
    data: apiConfig,
    isLoading: isConfigLoading,
    isFetching: isConfigFetching,
  } = useGetSmartPcConfigQuery();

  const apiCpuOptions = useMemo(
    () =>
      (apiConfig?.cpuOptions || {}) as Record<
        string,
        { value: string; label: string }[]
      >,
    [apiConfig?.cpuOptions]
  );

  const apiCpuCategories = useMemo(
    () =>
      (apiConfig?.cpuCategories || {}) as Record<
        string,
        Record<string, { value: string; label: string }[]>
      >,
    [apiConfig?.cpuCategories]
  );

  const configLoading = isConfigLoading || isConfigFetching;

  const linuxCategoryCpuOptions = useMemo(
    () => apiCpuCategories?.Linux?.[`${selectedLinuxCategory}`] || [],
    [selectedLinuxCategory, apiCpuCategories]
  );

  const cpuOptionsForOS = useMemo(
    () =>
      isLinuxOS ? linuxCategoryCpuOptions : apiCpuOptions[selectedOS] || [],
    [isLinuxOS, linuxCategoryCpuOptions, apiCpuOptions, selectedOS]
  );

  // auto cpu selection
  useEffect(() => {
    if (!isResize && selectedOS && !configLoading) {
      setValue("linuxCategory", "Ubuntu_24.04_LTS_X64", {
        shouldValidate: true,
      });

      const opts = apiCpuOptions?.[selectedOS];
      if (opts && opts.length > 0) {
        setValue("cpu", opts[0].value, {
          shouldValidate: true,
        });
      }
    }
  }, [isResize, selectedOS, setValue, apiCpuOptions, configLoading]);

  useEffect(() => {
    if (
      !isResize &&
      isLinuxOS &&
      !configLoading &&
      linuxCategoryCpuOptions.length > 0
    ) {
      setValue("cpu", linuxCategoryCpuOptions[0].value, {
        shouldValidate: true,
      });
    }
  }, [isResize, isLinuxOS, linuxCategoryCpuOptions, setValue, configLoading]);

  /* ----- locked fields ----- */
  function isLocked(
    field: "pcName" | "operatingSystem" | "region" | "billingPlan" | "storage"
  ) {
    if (!isResize) return false;
    if (loadingExisting) return true;
    if (isStorageOnly) return field !== "storage";
    return locked?.has(field) || field === "storage";
  }

  /* ----- cpu label helpers ----- */
  const cpuLabelFor = React.useCallback(
    (val?: string | null) => {
      if (!val) return "";
      const found = cpuOptionsForOS.find((o) => o.value === val);
      return found?.label ?? val;
    },
    [cpuOptionsForOS]
  );

  const pcNameError = errors.pcName;

  return (
    <div
      className={cn(
        "space-y-8",
        loadingExisting && "opacity-60 pointer-events-none"
      )}
    >
      <Form methods={methods}>
        <div className="space-y-8">
          {/* ========== BASIC ========== */}
          <section className="space-y-4">
            <p className="text-xs font-medium text-muted-foreground">
              Basic:
            </p>

            {/* OS */}
            <Field.Select
              name="operatingSystem"
              label="Select  Operating System (OS)"
              placeholder="Select Operating System"
              options={osOptions}
              disabled={isResize || loadingExisting}
              selectVariant="glowingSelector"

            />

            {/* Name of the computer */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Name of the computer
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
                    "bg-[rgba(37,48,240,0.07)]",
                    "border border-[#2530F0]/20 dark:border-white/10",
                    "focus-visible:outline-none focus-visible:border-[#5f4bf6]",
                    "h-[60px]",

                    !isResize && pcNameError && "border-red-500 focus-visible:border-red-500"
                  )}
                  placeholder="Enter a name for your computer"
                  {...field}
                  disabled={isLocked("pcName")}
                  data-cancel-drag
                />

                )}
              />

              {/* Helper row: always visible like Figma, message changes on error */}
              <div className="mt-1.5 flex items-center gap-2">
                <AlertCircle
                  className={cn(
                    "h-4 w-4",
                    pcNameError
                      ? "text-yellow-600"
                      : "text-muted-foreground/80"
                  )}
                />
                <p
                  className={cn(
                    "text-xs",
                    pcNameError
                      ? "text-yellow-700"
                      : "text-muted-foreground"
                  )}
                >
                  {pcNameError?.message ?? "PC name is required"}
                </p>
              </div>
            </div>
          </section>

          {/* ========== CONFIGURATIONS ========== */}
          <section className="space-y-4">
            <p className="text-xs font-medium text-muted-foreground">
              Configurations:
            </p>

            {/* Linux category (only for Linux OS) */}
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
                  options={Object.keys(
                    (apiCpuCategories?.Linux || {}) as Record<string, unknown>
                  )}
                  disabled={isResize || loadingExisting}
                  selectVariant="glowingSelector"

                />
              ))}

            {/* CPU + Memory */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label className="text-sm font-semibold">
                  CPU +  Memory
                </Label>

                {isResize && !isStorageOnly && existingCPU && (
                  <FieldChangePreview
                    oldValue={cpuLabelFor(existingCPU)}
                    newValue={cpuLabelFor(cpu)}
                    hasChanged={cpu !== existingCPU}
                  />
                )}
              </div>

              {configLoading ? (
                <Skeleton className="h-11 w-full" />
              ) : (
                <Field.Select
                  name="cpu"
                  selectVariant="glowingSelector"

                  placeholder="Select CPU size"
                  options={cpuOptionsForOS}
                  disabled={
                    loadingExisting ||
                    (isResize && isStorageOnly) ||
                    configLoading
                  }
                  onValueChange={(value) => {
                    if (value) {
                      setValue("cpu", value, { shouldValidate: true });
                    }
                  }}
                />
              )}
            </div>

            {/* Storage */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label className="text-sm font-semibold">Storage</Label>

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
                disabled={isLocked("storage")}
              />
            </div>

            {/* Region */}
            <Field.Select
              name="region"
              selectVariant="glowingSelector"

              label="Region"
              placeholder="Select nearest datacenter"
              options={locationOptions}
              tooltipText="Choose your nearest location for the best latency and performance."
              disabled={isLocked("region")}
            />
          </section>

          {/* ========== BILLING ========== */}
          <section className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">
              Billing Plan:
            </p>

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
