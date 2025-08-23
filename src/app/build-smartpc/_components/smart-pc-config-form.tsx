"use client";
import React, { useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  cpuCategories,
  cpuOptions,
  locationOptions,
  osOptions,
  storageOptions,
} from "../data";
import { Form, Field } from "@/components/shared/hook-form";
import { ResizeInitial } from "../types";
import FieldChangePreview from "./field-change-preview";

interface Props {
  methods: any;
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
  existingData,
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

  const linuxCategoryCpuOptions = useMemo(() => {
    return cpuCategories.Linux[`${selectedLinuxCategory}`] || [];
  }, [selectedLinuxCategory]);

  const cpuOptionsForOS = isLinuxOS
    ? linuxCategoryCpuOptions
    : cpuOptions[selectedOS] || [];

  console.log("check1", existingData);
  console.log("check2", cpu);
  console.log("check3", cpuOptionsForOS);

  // auto cpu selection
  useEffect(() => {
    if (!isResize && selectedOS) {
      setValue("linuxCategory", "Ubuntu_24.04_LTS_X64", {
        shouldValidate: true,
      });
      setValue("cpu", cpuOptions[selectedOS][0].value, {
        shouldValidate: true,
      });
    }
  }, [isResize, selectedOS, setValue]);

  useEffect(() => {
    if (!isResize && isLinuxOS) {
      setValue("cpu", linuxCategoryCpuOptions[0].value, {
        shouldValidate: true,
      });
    }
  }, [isResize, isLinuxOS, linuxCategoryCpuOptions, setValue]);

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

  return (
    <div
      className={cn(
        "md:col-span-8 space-y-6",
        loadingExisting && "opacity-60 pointer-events-none"
      )}
    >
      <Form methods={methods}>
        {/* Basics */}
        <section className="rounded-lg border bg-muted/30 p-4 space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Basics :
          </h4>

          {/* OS */}
          <Field.Select
            name="operatingSystem"
            label="Select Operating System (OS)"
            placeholder="Select Operating System"
            options={osOptions}
            disabled={isResize || loadingExisting}
          />

          {/* Name */}
          <div className="space-y-2">
            <Label>Name of the computer</Label>
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
                  className={cn(!isResize && errors.pcName && "border-red-500")}
                  placeholder="Enter a name for your computer"
                  {...field}
                  disabled={isLocked("pcName")}
                  data-cancel-drag
                />
              )}
            />
            {!isResize && errors.pcName && (
              <div className="flex items-center gap-2 mt-1.5">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <p className="text-xs text-yellow-700">
                  {errors.pcName.message}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Configuration */}
        <section className="rounded-lg border bg-muted/20 p-4 space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Configuration :
          </h4>

          {/* Linux category */}
          {isLinuxOS && (
            <Field.Select
              name="linuxCategory"
              label="Category"
              placeholder="Select Linux category"
              options={Object.keys(cpuCategories.Linux)}
              disabled={isResize || loadingExisting}
            />
          )}

          {/* CPU */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Label>CPU + Memory</Label>
              {isResize && !isStorageOnly && existingCPU && (
                <FieldChangePreview
                  oldValue={cpuLabelFor(existingCPU)}
                  newValue={cpuLabelFor(cpu)}
                  hasChanged={cpu !== existingCPU}
                />
              )}
            </div>

            <Field.Select
              name="cpu"
              placeholder="Select CPU size"
              options={cpuOptionsForOS}
              disabled={loadingExisting || (isResize && isStorageOnly)}
              onValueChange={(value) => {
                if (value) {
                  setValue("cpu", value, { shouldValidate: true });
                }
              }}
            />
          </div>

          {/* Storage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Label>Storage (SSD)</Label>
              {isResize && isStorageOnly && existingStorage && (
                <FieldChangePreview
                  oldValue={`${existingStorage} GB`}
                  newValue={`${storage} GB`}
                  hasChanged={storage !== existingStorage}
                />
              )}
            </div>

            <Field.Select
              name="storage"
              placeholder="Select storage size"
              options={storageOptions}
              disabled={isLocked("storage")}
            />
          </div>

          {/* Region */}
          <Field.Select
            name="region"
            label="Location"
            placeholder="Select nearest datacenter"
            options={locationOptions}
            tooltipText="Choose your nearest location for the best latency
                              and performance."
            disabled={isLocked("region")}
          />
        </section>

        {/* Billing */}
        <section className="rounded-lg border bg-muted/10 p-4 space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Billing Plan :
          </h4>

          <Field.Select
            name="billingPlan"
            label="Billing Plan"
            placeholder="Choose billing plan"
            disabled={isLocked("billingPlan")}
            options={[
              { value: "hourly", label: "Hourly" },
              { value: "daily", label: "Daily" },
              { value: "monthly", label: "Monthly" },
            ]}
          />
        </section>
      </Form>
    </div>
  );
};

export default SmartPcConfigForm;
