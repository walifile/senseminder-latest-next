"use client";

import type { RootState } from "@/redux/store";
import type { FormValues, BaseFormValues } from "@/app/build-sensepc/schema";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";
import React, { useMemo, useState, useEffect } from "react";
import { baseFormSchema } from "@/app/build-sensepc/schema";
import { useGetEstimateMutation } from "@/api/fileManagerAPI";
import { useGetSmartPcConfigQuery } from "@/api/smartPCConfigAPI";
import { setSmartPcConfig } from "@/redux/slices/build-pc/smart-pc-config-slice";
import { osOptions, storageOptions, locationOptions } from "@/app/build-sensepc/data";

import { cn } from "@/lib/utils";
import { Logger } from "@/lib/utils/logger";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import { useDispatch, useSelector } from "react-redux";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Check, ArrowUpRight } from "lucide-react";

import { Form, Field } from "@/components/shared/hook-form";

const FEATURES = [
  {
    icon: "clock",
    title: "Hourly Plan",
    desc: "Pay only for the time you use Sense PC. SSD is billed continuously.",
  },
  {
    icon: "calender",
    title: "Daily Plan",
    desc: "Flat daily rate that includes up to 10 hours of usage per day.",
  },
  {
    icon: "calender-2",
    title: "Monthly Plan",
    desc: "Flat monthly rate that includes up to 180 hours of usage per month.",
  },
  {
    icon: "storage",
    title: "Sense Cloud",
    desc: "No fixed plans — pay based on your highest cloud storage tier usage each month.",
  },
  {
    icon: "billing",
    title: "Billing Units",
    desc: "All charges are deducted from your Sense PC wallet at each billing cycle.",
  },
];

type CpuOpt = { value: string; label: string };

// Strict GPU detection: only configs ending with ".GPU"
const isGpuString = (s?: unknown): boolean =>
  typeof s === "string" && s.trim().toLowerCase().endsWith(".gpu");

const isGpuOption = (opt: CpuOpt): boolean =>
  isGpuString(opt.value) || isGpuString(opt.label);

export default function PCCostCalculator() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [getEstimate, { data: estimateData, isLoading }] =
    useGetEstimateMutation();

  const methods = useForm<FormValues>({
    resolver: zodResolver(baseFormSchema),
    defaultValues: {
      operatingSystem: "",
      cpu: "",
      storage: "",
      region: "",
      linuxCategory: "Ubuntu_24.04_LTS_X64",
    },
  });

  const { setValue, handleSubmit, watch } = methods;

  const values = watch();

  const onSubmit = async (data: BaseFormValues) => {
    Logger.log("Submitted Config:", data);

    dispatch(
      setSmartPcConfig({
        operatingSystem: data.operatingSystem,
        cpu: data.cpu,
        region: data.region,
        storage: data.storage,
        show: true,
      })
    );

    if (!isAuthenticated) {
      router.push("/auth/sign-in");
      return;
    }
    router.push(routes.dashboard);
  };

  const handleGetEstimate = async () => {
    const configId = watch("cpu");
    const storageSize = watch("storage");
    const region = watch("region");

    if (!configId || !storageSize || !region) return;

    try {
      const result = await getEstimate({
        configId,
        storageSize,
        region,
      }).unwrap();
      Logger.log("Estimated result:", result);
    } catch (err) {
      Logger.error("Error fetching estimate:", err);
    }
  };

  const selectedOS = watch("operatingSystem");
  const selectedLinuxCategory = watch("linuxCategory");

  const isLinuxOS = selectedOS === "Linux";

  // Fetch API cpuOptions via RTK Query
  const { data: apiConfig } = useGetSmartPcConfigQuery();

  const apiCpuOptions = useMemo(
    () => apiConfig?.cpuOptions ?? {},
    [apiConfig?.cpuOptions]
  );

  const apiCpuCategories = useMemo(
    () => apiConfig?.cpuCategories ?? {},
    [apiConfig?.cpuCategories]
  );

  const linuxCategoryCpuOptions = useMemo(
    () =>
      (
        (
          apiCpuCategories as Record<
            string,
            Record<string, { value: string; label: string }[]>
          >
        )?.Linux?.[`${selectedLinuxCategory}`] ?? []
      ),
    [apiCpuCategories, selectedLinuxCategory]
  );  

  const cpuOptionsForOS = useMemo(
    () =>
      (isLinuxOS
        ? linuxCategoryCpuOptions
        : ((apiCpuOptions as Record<string, { value: string; label: string }[]>)[
            selectedOS
          ] ?? [])),
    [apiCpuOptions, isLinuxOS, linuxCategoryCpuOptions, selectedOS]
  );  

  useEffect(() => {
    setValue("cpu", "");
  }, [selectedOS, selectedLinuxCategory, setValue]);

  const selectedOSOption = osOptions.find(
    (opt) => opt.value === values.operatingSystem
  );

  const selectedLocation = locationOptions.find(
    (opt) => opt.value === values.region
  );

  const selectedStorage = storageOptions.find(
    (opt) => opt.value === values.storage
  );

  const [showGpuOnly, setShowGpuOnly] = useState(false);

  const hasAnyGpuOptions = useMemo(
    () => cpuOptionsForOS.some(isGpuOption),
    [cpuOptionsForOS]
  );
  
  const gpuCpuOptions = useMemo(
    () => cpuOptionsForOS.filter(isGpuOption),
    [cpuOptionsForOS]
  );
  
  const nonGpuCpuOptions = useMemo(
    () => cpuOptionsForOS.filter((o) => !isGpuOption(o)),
    [cpuOptionsForOS]
  );
  
  const displayedCpuOptions = useMemo(() => {
    if (!hasAnyGpuOptions) return cpuOptionsForOS;
  
    if (showGpuOnly) return gpuCpuOptions.length ? gpuCpuOptions : cpuOptionsForOS;
  
    return nonGpuCpuOptions.length ? nonGpuCpuOptions : cpuOptionsForOS;
  }, [cpuOptionsForOS, hasAnyGpuOptions, showGpuOnly, gpuCpuOptions, nonGpuCpuOptions]);
  
  // If OS/category has no GPU, force toggle off
  useEffect(() => {
    if (!hasAnyGpuOptions && showGpuOnly) setShowGpuOnly(false);
  }, [hasAnyGpuOptions, showGpuOnly]);
  
  // If user already selected a CPU and it becomes hidden by the filter, keep it valid
  useEffect(() => {
    const currentCpu = watch("cpu");
    if (!currentCpu) return;
  
    const stillValid = displayedCpuOptions.some((o) => o.value === currentCpu);
    if (!stillValid && displayedCpuOptions.length > 0) {
      setValue("cpu", displayedCpuOptions[0].value, { shouldValidate: true });
    }
  }, [displayedCpuOptions, setValue, watch]);
  
  return (
    <>
      {/* Feature tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className="relative bg-white shadow-[0px_12px_48px_0px_#2530F01A] border border-[#2530F033] dark:border-none dark:shadow-none dark:bg-[#000624] rounded-xl px-3 py-4 space-y-3"
          >
            <Image
              src={`/assets/svg/${f.icon}.svg`}
              alt={`${f.icon} icon`}
              width={30}
              height={30}
              unoptimized
            />

            <div>
              <h2 className="font-space-grotesk font-bold text-lg">
                {f.title}
              </h2>
              <p className="text-paragraph text-sm">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Config + Summary */}
      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left card */}
          <div className="rounded-2xl p-4 md:p-10 space-y-8 bg-white dark:bg-transparent dark:bg-[linear-gradient(162.96deg,#170D44_11.73%,rgba(23,13,68,0.61)_98.26%)]">
            <div className="space-y-6">
              <h3
                className="font-space-grotesk font-bold text-2xl"
                data-testid="landing-choose-configurations-section"
              >
                Select Configurations
              </h3>

              <Separator className="bg-[#02081633] dark:bg-[#FFFFFF33]" />

              <div className="space-y-6">
                {/* Operating System */}
                <Field.Select
                  name="operatingSystem"
                  label="Operating System"
                  description="Select your preferred operating system"
                  tooltipText={
                    selectedOSOption
                      ? `Selected: ${selectedOSOption.label}`
                      : "No operating system selected"
                  }
                  options={osOptions}
                  placeholder="Select Operating System"
                  className="gap-4"
                  triggerTestId="landing-operating-system-dropdown"
                />

                {/* Linux Category */}
                {isLinuxOS && (
                  <Field.Select
                    name="linuxCategory"
                    label="Category"
                    description="Select Linux category"
                    {...(values.linuxCategory
                      ? { tooltipText: values.linuxCategory }
                      : {})}
                    options={Object.keys(
                      (
                        apiCpuCategories as Record<
                          string,
                          Record<string, unknown>
                        >
                      )?.Linux || {}
                    )}
                    className="gap-4"
                  />
                )}

                {/* CPU + Memory */}
                <div className="space-y-3">
                  {/* Label */}
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-foreground">CPU + Memory</div>
                  </div>

                  {/* ✅ Checkbox BETWEEN label and dropdown */}
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={showGpuOnly}
                      onCheckedChange={(v) => setShowGpuOnly(Boolean(v))}
                      disabled={!hasAnyGpuOptions}
                    />
                    <p className="text-sm text-paragraph">
                      Show GPU configurations only
                      {!hasAnyGpuOptions && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (No GPU options for this OS)
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Dropdown (no label/description so it doesn't add extra rows) */}
                  <Field.Select
                    name="cpu"
                    tooltipText={values.cpu ? `Selected: ${values.cpu}` : "No CPU & Memory selected"}
                    options={displayedCpuOptions}
                    placeholder={selectedOS ? "Select CPU & Memory" : "Select OS"}
                    className="gap-4"
                    triggerTestId="landing-cpu-memory-dropdown"
                  />
                </div>

                {/* Location */}
                <Field.Select
                  name="region"
                  label="Location"
                  description="Select where the PC will be hosted."
                  tooltipText={
                    selectedLocation
                      ? selectedLocation.label
                      : "No location selected"
                  }
                  options={locationOptions}
                  className="gap-4"
                  triggerTestId="landing-region-dropdown"
                />

                {/* Storage */}
                <Field.Select
                  name="storage"
                  label="Storage (SSD)"
                  description="Select storage capacity"
                  tooltipText={
                    selectedStorage
                      ? `${selectedStorage.label} selected`
                      : "No storage selected"
                  }
                  options={storageOptions}
                  className="gap-4"
                  triggerTestId="landing-storage-dropdown"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              * All prices are in USD. Hourly is billed per hour of usage. Daily is a flat rate (up to 10 hours/day) and Monthly is a flat rate (up to 180 hours/month).
            </p>
          </div>

          {/* Right card */}
          <div
            className={cn(
              "bg-white dark:bg-transparent dark:bg-[#170D44] rounded-2xl p-4 md:p-10 space-y-6",
              "border border-[#2530F033] dark:outline-border dark:before:rounded-[16px]"
            )}
          >
            <h3
              className="font-space-grotesk font-bold text-2xl"
              data-testid="landing-configuration-summary"
            >
              Your Configuration
            </h3>

            <div className="space-y-5">
              <div className="space-y-3">
                {[
                  {
                    label: "Operating System",
                    value:
                      osOptions.find(
                        (os) => os.value === watch("operatingSystem")
                      )?.label || null,
                  },
                  {
                    label: "CPU & Memory",
                    value: cpuOptionsForOS.find((c) => c.value === watch("cpu"))?.label || null,
                  },
                  
                  {
                    label: "Region",
                    value:
                      locationOptions.find(
                        (loc) => loc.value === watch("region")
                      )?.label || null,
                  },
                  {
                    label: "Storage (SSD)",
                    value:
                      storageOptions.find((s) => s.value === watch("storage"))
                        ?.label || null,
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      "rounded-lg dark:border bg-[#F4F1FF] dark:bg-[#2A2067] py-3 px-5 space-y-1",
                      "dark:border dark:outline-border dark:before:rounded-lg"
                    )}
                  >
                    <div className="text-sm text-paragraph">{item.label}</div>
                    <div className="font-semibold text-base">
                      {item.value ? item.value : <span>Not selected</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Cost */}
              <div className="flex items-center justify-between gap-5 flex-wrap rounded-2xl p-5 bg-[#2530F033] dark:bg-transparent dark:bg-[linear-gradient(276.71deg,rgba(128,134,243,0.5)_-194.99%,rgba(3,10,135,0.25)_-40.44%,rgba(186,37,240,0.5)_248.78%)]">
                <div className="space-y-1" data-testid="landing-est-monthly-price">
                  <div className="text-sm text-paragraph">Est. Monthly*</div>
                  <div className="text-base font-semibold">
                    {estimateData?.total?.pricePerMonth !== undefined
                      ? `$${estimateData?.total?.pricePerMonth}/month`
                      : "-"}
                  </div>
                </div>

                <Separator
                  orientation="vertical"
                  className="w-[1px] h-7 bg-[#02081633] dark:bg-[#FFFFFF33]"
                />

                <div className="space-y-1" data-testid="landing-est-daily-price">
                  <div className="text-sm text-paragraph">Est. Daily*</div>
                  <div className="text-base font-semibold">
                    {estimateData?.total?.pricePerDay !== undefined
                      ? `$${estimateData?.total.pricePerDay}/day`
                      : "-"}
                  </div>
                </div>

                <Separator
                  orientation="vertical"
                  className="w-[1px] h-7 bg-[#02081633] dark:bg-[#FFFFFF33]"
                />

                <div className="space-y-1" data-testid="landing-est-hourly-price">
                  <div className="text-sm text-paragraph">Est. Hourly*</div>
                  <div className="text-base font-semibold">
                    {estimateData?.total?.pricePerHour !== undefined
                      ? `$${estimateData?.total.pricePerHour}/hr`
                      : "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid md:grid-cols-2 gap-4">
              <Button
                size="lg"
                disabled={
                  !watch("operatingSystem") ||
                  !watch("cpu") ||
                  !watch("region") ||
                  !watch("storage") ||
                  isLoading
                }
                onClick={handleGetEstimate}
                data-testid="landing-view-estimate-button"
              >
                {isLoading ? "Calculating..." : "View Estimate"}
              </Button>

              <Button
                size="lg"
                variant="outline"
                type="submit"
                data-testid="landing-build-pc-button"
              >
                Build PC
                <ArrowUpRight />
              </Button>
            </div>

            {/* Benefits */}
            <div className="border-t pt-2">
              <div className="grid grid-cols-2 gap-3">
                {/* Left: Included with every plan */}
                <div>
                  <h4 className="text-xs font-medium mb-1.5">Included with every plan:</h4>
                  <div className="space-y-1.5">
                    {[
                      "Free data transfer",
                      "99.9% uptime SLA",
                      "Customer support",
                      "Security monitoring",
                    ].map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center text-xs text-muted-foreground"
                      >
                        <Check className="h-2.5 w-2.5 mr-1 text-primary" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Plan limits */}
                <div>
                  <h4 className="text-xs font-medium mb-1.5">Plan limits:</h4>
                  <div className="space-y-1.5">
                    {[
                      "Hourly plan: unlimited usage",
                      "Daily plan: up to 10 hours",
                      "Monthly plan: up to 180 hours",
                    ].map((limit, index) => (
                      <div
                        key={index}
                        className="flex items-center text-xs text-muted-foreground"
                      >
                        <Check className="h-2.5 w-2.5 mr-1 text-primary" />
                        {limit}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </>
  );
}
