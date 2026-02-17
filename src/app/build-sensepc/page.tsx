"use client";

import type { RootState } from "@/redux/store";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";
import { useCreateVMMutation } from "@/api/vmManagement";
import React, { useRef, useMemo, useEffect } from "react";
import { FEEDBACK_TRIGGERS } from "@/constants/app-constants";
import { useGetSmartPcConfigQuery } from "@/api/pc-config-api";
import {
  useGetEstimateMutation,
  useListRemoteDesktopQuery,
} from "@/api/fileManagerAPI";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PublicCard } from "@/components/ui/public-card";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { useSelector } from "react-redux";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ArrowUpRight } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useFeedback } from "@/hooks/use-feedback";

import CostSummary from "./_components/cost-summary";
import { fetchEstimate } from "./api/fetch-estimate";
import { formSchema, type FormValues } from "./schema";
import { osOptions, storageOptions, locationOptions } from "./data";

import type { BillingPlan } from "./data/billing";

const selectIconWrapper =
  "pointer-events-none absolute left-4 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center";

/* ---------------- Typography (fonts only) ---------------- */
const HERO_TITLE =
  "font-space-grotesk font-bold text-[26px] leading-[32px] md:text-[34px] md:leading-[40px] lg:text-[44px] lg:leading-[52px]";
const HERO_SUBTITLE =
  "font-inter text-paragraph text-[14px] leading-[22px] md:text-[16px] md:leading-[26px] lg:text-[18px] lg:leading-[28px]";

const SECTION_TITLE =
  "font-space-grotesk font-semibold text-slate-900 dark:text-white text-[18px] leading-[24px] md:text-[22px] md:leading-[30px]";
const SECTION_SUBTITLE =
  "font-inter text-slate-600 dark:text-slate-400 text-[14px] leading-[22px] md:text-[16px] md:leading-[26px]";

const FIELD_LABEL =
  "font-inter font-medium text-slate-900 dark:text-slate-300 text-[14px] leading-[22px]";

// Fixes “Location” select looking different (and keeps all selects consistent)
const SELECT_TRIGGER_TYPO =
  "font-inter text-[16px] leading-[24px] text-slate-900 dark:text-white";
const SELECT_ITEM_TYPO = "font-inter text-[14px] leading-[20px]";

export default function BuildSensePcPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { triggerFeedback } = useFeedback();

  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [getEstimate, { data, isLoading, error }] = useGetEstimateMutation();
  const { refetch: refetchRemoteDesktops } = useListRemoteDesktopQuery({
    userId,
  });
  const [createVM, { isLoading: isCreating }] = useCreateVMMutation();

  // Default values using Redux config + static options from ./data
  const baseDefaults = useMemo(
    () => ({
      pcName: "",
      operatingSystem: osOptions[0]?.value || "",
      cpu: "",
      storage: storageOptions[0]?.value || "",
      region: locationOptions[0]?.value || "",
      billingPlan: "hourly",
      linuxCategory: "",
    }),
    []
  );
  
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: baseDefaults,
  });  

  const { control, reset, watch, setValue, handleSubmit } = methods;

  const values = watch();
  const {
    operatingSystem: selectedOS,
    linuxCategory: selectedLinuxCategory,
    cpu,
    region,
    storage,
    billingPlan,
  } = values;

  const isLinuxOS = selectedOS === "Linux";

  // API-driven options
  const { data: apiConfig } = useGetSmartPcConfigQuery(
    { region },
    { skip: !region },
  );

  const apiCpuOptions = useMemo(
    () => apiConfig?.cpuOptions ?? {},
    [apiConfig?.cpuOptions],
  );
  const apiCpuCategories = useMemo(
    () => apiConfig?.cpuCategories ?? {},
    [apiConfig?.cpuCategories],
  );

  const linuxCategoryCpuOptions = React.useMemo(
    () =>
      (
        (
          apiCpuCategories as Record<
            string,
            Record<string, { value: string; label: string }[]>
          >
        )?.Linux?.[String(selectedLinuxCategory)] || []
      ),
    [apiCpuCategories, selectedLinuxCategory]
  );
  
  const cpuOptionsForOS = React.useMemo(
    () =>
      (isLinuxOS && selectedLinuxCategory
        ? linuxCategoryCpuOptions
        : ((apiCpuOptions as Record<string, { value: string; label: string }[]>)[
            String(selectedOS)
          ] || [])),
    [apiCpuOptions, isLinuxOS, selectedLinuxCategory, selectedOS, linuxCategoryCpuOptions]
  );   

  type CpuOpt = { value: string; label: string };

  const isGpuString = React.useCallback(
    (s?: unknown) =>
      typeof s === "string" && s.trim().toLowerCase().endsWith(".gpu"),
    []
  );
  
  const isGpuOption = React.useCallback(
    (opt: CpuOpt) => isGpuString(opt.value) || isGpuString(opt.label),
    [isGpuString]
  );            

  const [showGpuOnly, setShowGpuOnly] = React.useState(false);

  const hasAnyGpuOptions = React.useMemo(
    () => cpuOptionsForOS.some(isGpuOption),
    [cpuOptionsForOS, isGpuOption]
  );
  
  const displayedCpuOptions = React.useMemo(() => {
    if (!hasAnyGpuOptions) return cpuOptionsForOS;
    if (showGpuOnly) return cpuOptionsForOS.filter(isGpuOption);
  
    const nonGpu = cpuOptionsForOS.filter((o) => !isGpuOption(o));
    return nonGpu.length ? nonGpu : cpuOptionsForOS;
  }, [cpuOptionsForOS, hasAnyGpuOptions, showGpuOnly, isGpuOption]);  

  useEffect(() => {
    if (!selectedOS) return;

    const currentLinux = methods.getValues("linuxCategory");

    if (isLinuxOS) {
      if (!currentLinux) {
        setValue("linuxCategory", "Ubuntu_24.04_LTS_X64", {
          shouldValidate: true,
        });
      }
    } else {
      if (currentLinux) {
        setValue("linuxCategory", "", { shouldValidate: true });
      }
    }
  }, [selectedOS, isLinuxOS, methods, setValue]);

  useEffect(() => {
    // If GPU-only is enabled but no GPU exists, disable it once.
    if (!hasAnyGpuOptions && showGpuOnly) {
      setShowGpuOnly(false);
      return;
    }

    const current = methods.getValues("cpu");
    const isValid = displayedCpuOptions.some((o) => o.value === current);

    // Choose first visible option (respects GPU filter)
    const next = displayedCpuOptions[0]?.value ?? "";

    // Only set if it actually changes something
    if (!isValid && current !== next) {
      setValue("cpu", next, { shouldValidate: true });
    }
  }, [displayedCpuOptions, hasAnyGpuOptions, showGpuOnly, methods, setValue]);

  const lastEstimateKeyRef = useRef<string>("");

  useEffect(() => {
    if (!cpu || !storage || !region) return;
  
    const key = `${cpu}|${storage}|${region}`;
    if (lastEstimateKeyRef.current === key) return;
    lastEstimateKeyRef.current = key;
  
    void fetchEstimate({
      methods,
      getEstimate,
      toast,
      showError: false,
    });
  }, [cpu, storage, region, methods, getEstimate, toast]);  

  // Keep last stable estimate to prevent flicker
  const stableEstimateRef = useRef<typeof data>(null);

  useEffect(() => {
    if (data) stableEstimateRef.current = data;
  }, [data]);

  const effectiveEstimate = useMemo(
    () => data ?? stableEstimateRef.current,
    [data]
  );

  const handleEstimate = async () => {
    await fetchEstimate({
      methods,
      getEstimate,
      toast,
    });
  };      

  // Visual click FX on "Refresh Estimate" button (inside CostSummary)
  const asideRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = asideRef.current;
    if (!root) return () => {};

    const findRefreshBtn = (): HTMLButtonElement | null => {
      const buttons = root.querySelectorAll<HTMLButtonElement>("button");
      for (const b of buttons) {
        const txt = (b.textContent || "").trim().toLowerCase();
        if (txt.includes("refresh estimate")) return b;
      }
      return null;
    };

    let refreshBtn = findRefreshBtn();

    const attach = (btn: HTMLButtonElement | null) => {
      if (!btn) return () => {};
      btn.classList.add("sm-refresh-btn");
      const onClick = () => {
        btn.classList.add("sm-pressed");
        setTimeout(() => btn.classList.remove("sm-pressed"), 160);
      };
      btn.addEventListener("click", onClick);
      return () => btn.removeEventListener("click", onClick);
    };

    let detach = attach(refreshBtn);

    const mo = new MutationObserver(() => {
      const newBtn = findRefreshBtn();
      if (newBtn && newBtn !== refreshBtn) {
        detach?.();
        refreshBtn = newBtn;
        detach = attach(refreshBtn);
      }
    });

    mo.observe(root, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      detach?.();
    };
  }, []);

  const handleEstimateWithFX = async () => {
    await handleEstimate();
  };

  // Submit = create VM (original logic)
  const onSubmit = handleSubmit(async (formData: FormValues) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in to continue",
        description: "Please sign in to build your Sense PC — it only takes a moment.",
        variant: "default",
      });
    
      setTimeout(() => {
        router.push(routes.signIn);
      }, 700);
    
      return;
    }    

    try {
      await createVM({
        action: "create",
        configId: formData.cpu,
        systemName: formData.pcName,
        region: formData.region || "us-east-1",
        storageSize: parseInt(formData.storage, 10),
        billingPlan: formData.billingPlan,
      }).unwrap();

      while (true) {
        const fetchResult = await refetchRemoteDesktops();
        if (fetchResult.status === "fulfilled") break;

        await new Promise((res) => setTimeout(res, 2000));
      }

      void triggerFeedback({
        trigger: FEEDBACK_TRIGGERS.PC_ACTION,
        delayMinutes: 0,
      });

      reset();
      router.push(routes.dashboard);
    } catch (err) {
      toast({
        title: "Failed to Create Sense PC",
        description:
          (err as { data?: { message?: string } })?.data?.message ??
          "Something went wrong. Please try again or contact support.",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="relative min-h-screen">
      {/* ===== Ellipse 4 – right-side vertical glow (fixed bg behind everything) ===== */}
      <div
        className="pointer-events-none fixed hidden dark:md:block
                  right-0 top-[32vh]
                  w-[26.5625vw] max-w-[440px] aspect-[425/777] -z-10"
        aria-hidden
      >
        <img
          src="/assets/build-sensepc/Ellipse 4.png"
          alt=""
          className="block h-full w-full max-w-none"
        />
      </div>

      {/* Ellipse 3 – center glow dark mode only */}
      <div
        className="pointer-events-none absolute hidden dark:md:block
                left-1/3 top-[16vh] -z-10"
        aria-hidden
      >
        <img
          src="/assets/build-sensepc/Ellipse 3.svg"
          alt=""
          className="block h-full w-full max-w-none"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0
                   top-[100vh] md:top-[100vh] lg:top-[90vh]
                   -z-10 hidden md:flex justify-center"
        aria-hidden
      >
        <div className="w-full max-w-[1600px] aspect-[1600/1447]">
          <img
            src="/assets/build-sensepc/build-sensepc-waves.png"
            alt=""
            className="block h-full w-full max-w-none"
          />
        </div>
      </div>

      <div className="relative w-full px-4 md:px-6 pt-20 md:pt-16 lg:pt-48 pb-16 md:pb-20">
        <div className="mx-auto w-full max-w-[1200px] 2xl:max-w-[1360px] space-y-8 lg:space-y-10">
          <PublicCard
            className={cn(
              "relative w-full overflow-hidden",
              "px-5 md:px-7 lg:px-8 py-4 md:py-5 lg:py-6",
              "text-slate-900 dark:text-slate-50",
            )}
          >
            <div
              className="pointer-events-none absolute inset-0 flex items-center dark:hidden"
              aria-hidden
            >
              <div className="w-[50%]">
                <img
                  src="/assets/build-sensepc/Ellipse 11.svg"
                  alt=""
                  className="block w-full h-auto max-w-none"
                />
              </div>
            </div>

            <div className="relative z-10 grid items-center gap-4 lg:gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              {/* Left: breadcrumb + title + subtitle */}
              <div className="space-y-3 md:space-y-4 lg:space-y-5">
                <p className="font-inter text-[14px] leading-[20px] md:text-[16px] md:leading-[24px] text-paragraph">
                  <span className="text-link-primary">Home</span>
                  <span>{` - `}</span>
                  <span>Build Sense PC</span>
                </p>

                <h1 className={cn(HERO_TITLE, "text-slate-900 dark:text-white")}>
                  Build your&nbsp;Sense PC
                </h1>

                <p className={cn(HERO_SUBTITLE)}>
                  Configure in minutes — priced with a built-in estimator.
                </p>
              </div>

              {/* Right: illustration */}
              <div className="flex items-center justify-end">
                <Image
                  src="/assets/build-sensepc/hero-illustration.svg"
                  alt="Build Sense PC illustration"
                  width={200}
                  height={200}
                  priority
                  className="w-[180px] md:w-[190px] lg:w-[200px] h-auto object-contain"
                />
              </div>
            </div>
          </PublicCard>

          <Form {...methods} control={control}>
            <form onSubmit={onSubmit} className="space-y-10">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start">
                <PublicCard className="px-4 md:px-5 lg:px-6 py-5 md:py-6 lg:py-7">
                  <div className="space-y-5">
                    <PublicCard
                      className={cn(
                        "space-y-4 px-5 md:px-6 py-5 md:py-6 rounded-2xl border",
                        "bg-[rgba(82,32,222,0.09)] border-[rgba(37,48,240,0.1)]",
                        "dark:bg-[rgba(255,255,255,0.02)] dark:border-[rgba(255,255,255,0.1)]",
                      )}
                    >
                      <header className="space-y-1.5">
                        <h2 className={cn(SECTION_TITLE)}>Basic Information</h2>
                        <p className={cn(SECTION_SUBTITLE)}>
                          Name your Sense PC and choose an operating system.
                        </p>
                      </header>

                      <div className="h-px bg-[#2530f0]/10 dark:bg-white/10" />

                      <div className="space-y-4">
                        {/* PC Name */}
                        <FormField
                          control={control}
                          name="pcName"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className={cn(FIELD_LABEL)}>
                                PC Name
                              </FormLabel>

                              <FormControl>
                                <div className="relative">
                                  <span className={selectIconWrapper}>
                                    <Image
                                      src="/assets/svg/build-sensepc/pc-name.svg"
                                      alt="PC name icon"
                                      width={20}
                                      height={20}
                                    />
                                  </span>

                                  <Input
                                    {...field}
                                    id="pcName"
                                    type="text"
                                    placeholder="E.g., My-game-partner"
                                    uiSize="form"
                                    className="pl-11"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Operating System */}
                        <FormField
                          control={control}
                          name="operatingSystem"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className={cn(FIELD_LABEL)}>
                                Operating System
                              </FormLabel>

                              <FormControl>
                                <div className="relative">
                                  <span className={selectIconWrapper}>
                                    <Image
                                      src="/assets/svg/build-sensepc/os.svg"
                                      alt="Operating system icon"
                                      width={20}
                                      height={20}
                                    />
                                  </span>

                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value ?? ""}
                                  >
                                    <SelectTrigger
                                      id="operatingSystem"
                                      variant="form"
                                      className={cn("pl-11", SELECT_TRIGGER_TYPO)}
                                    >
                                      <SelectValue placeholder="Select OS" />
                                    </SelectTrigger>

                                    <SelectContent variant="form">
                                      {osOptions.map((opt) => (
                                        <SelectItem
                                          key={opt.value}
                                          value={opt.value}
                                          className={cn(SELECT_ITEM_TYPO)}
                                        >
                                          {opt.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </PublicCard>

                    {/* 2) Hardware Configuration */}
                    <PublicCard
                      className={cn(
                        "space-y-4 px-5 md:px-6 py-5 md:py-6 rounded-2xl border",
                        "bg-[rgba(82,32,222,0.09)] border-[rgba(37,48,240,0.1)]",
                        "dark:bg-[rgba(255,255,255,0.02)] dark:border-[rgba(255,255,255,0.1)]",
                      )}
                    >
                      <header className="space-y-1.5">
                        <h2 className={cn(SECTION_TITLE)}>
                          Hardware Configuration
                        </h2>
                        <p className={cn(SECTION_SUBTITLE)}>
                          Choose your computing resources.
                        </p>
                      </header>

                      <div className="h-px bg-[#2530f0]/10 dark:bg-white/10" />

                      <div className="space-y-4">
                        {/* Linux distribution (only for Linux OS) */}
                        {isLinuxOS && (
                          <FormField
                            control={control}
                            name="linuxCategory"
                            render={({ field }) => {
                              const linuxOptions = Object.keys(
                                (
                                  apiCpuCategories as Record<
                                    string,
                                    Record<string, unknown>
                                  >
                                )?.Linux || {},
                              );

                              return (
                                <FormItem className="space-y-1.5">
                                  <FormLabel className={cn(FIELD_LABEL)}>
                                    Linux Distribution
                                  </FormLabel>
                                  <FormControl>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value ?? ""}
                                    >
                                      <SelectTrigger
                                        id="linuxCategory"
                                        variant="form"
                                        className={cn(SELECT_TRIGGER_TYPO)}
                                      >
                                        <SelectValue placeholder="Select Linux distribution" />
                                      </SelectTrigger>

                                      <SelectContent variant="form">
                                        {linuxOptions.map((key) => (
                                          <SelectItem
                                            key={key}
                                            value={key}
                                            className={cn(SELECT_ITEM_TYPO)}
                                          >
                                            {key}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                        )}

                        {/* CPU */}
                        <FormField
                          control={control}
                          name="cpu"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className={cn(FIELD_LABEL)}>CPU + Memory</FormLabel>

                              {/* ✅ GPU checkbox between label and dropdown */}
                              <div className="flex items-center gap-3 pb-1">
                                <Checkbox
                                  checked={showGpuOnly}
                                  onCheckedChange={(v) => setShowGpuOnly(Boolean(v))}
                                  disabled={!hasAnyGpuOptions}
                                />
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                  Show GPU configurations only
                                  {!hasAnyGpuOptions && (
                                    <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                                      (No GPU options for this OS)
                                    </span>
                                  )}
                                </p>
                              </div>

                              <FormControl>
                                <div className="relative">
                                  <span className={selectIconWrapper}>
                                    <Image
                                      src="/assets/svg/build-sensepc/cpu.svg"
                                      alt="CPU icon"
                                      width={20}
                                      height={20}
                                    />
                                  </span>

                                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                    <SelectTrigger
                                      id="cpu"
                                      variant="form"
                                      className={cn("pl-11", SELECT_TRIGGER_TYPO)}
                                    >
                                      <SelectValue placeholder="Select CPU & Memory" />
                                    </SelectTrigger>

                                    <SelectContent variant="form">
                                      {displayedCpuOptions.map((opt) => (
                                        <SelectItem
                                          key={opt.value}
                                          value={opt.value}
                                          className={cn(SELECT_ITEM_TYPO)}
                                        >
                                          {opt.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Storage (SSD) */}
                        <FormField
                          control={control}
                          name="storage"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className={cn(FIELD_LABEL)}>
                                Storage (SSD)
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className={selectIconWrapper}>
                                    <Image
                                      src="/assets/svg/build-sensepc/storage.svg"
                                      alt="Storage icon"
                                      width={20}
                                      height={20}
                                    />
                                  </span>

                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value ?? ""}
                                  >
                                    <SelectTrigger
                                      id="storage"
                                      variant="form"
                                      className={cn("pl-11", SELECT_TRIGGER_TYPO)}
                                    >
                                      <SelectValue placeholder="Select storage size" />
                                    </SelectTrigger>

                                    <SelectContent variant="form">
                                      {storageOptions.map((opt) => (
                                        <SelectItem
                                          key={opt.value}
                                          value={opt.value}
                                          className={cn(SELECT_ITEM_TYPO)}
                                        >
                                          {opt.label}
                                          {opt.pricePerHour
                                            ? ` — $${opt.pricePerHour}/hr`
                                            : ""}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </PublicCard>

                    {/* 3) Location */}
                    <PublicCard
                      className={cn(
                        "space-y-4 px-5 md:px-6 py-5 md:py-6 rounded-2xl border",
                        "bg-[rgba(82,32,222,0.09)] border-[rgba(37,48,240,0.1)]",
                        "dark:bg-[rgba(255,255,255,0.02)] dark:border-[rgba(255,255,255,0.1)]",
                      )}
                    >
                      <header className="space-y-1.5">
                        <h2 className={cn(SECTION_TITLE)}>Location</h2>
                        <p className={cn(SECTION_SUBTITLE)}>
                          Choose a nearby location for better performance.
                        </p>
                      </header>

                      <div className="h-px bg-[#2530f0]/10 dark:bg-white/10" />

                      <div className="space-y-4">
                        <FormField
                          control={control}
                          name="region"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className={cn(FIELD_LABEL)}>
                                Location
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className={selectIconWrapper}>
                                    <Image
                                      src="/assets/svg/build-sensepc/region.svg"
                                      alt="Region icon"
                                      width={20}
                                      height={20}
                                    />
                                  </span>

                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value ?? ""}
                                  >
                                    <SelectTrigger
                                      id="region"
                                      variant="form"
                                      className={cn("pl-11", SELECT_TRIGGER_TYPO)}
                                    >
                                      <SelectValue placeholder="Select region" />
                                    </SelectTrigger>

                                    <SelectContent variant="form">
                                      {locationOptions.map((opt) => (
                                        <SelectItem
                                          key={opt.value}
                                          value={opt.value}
                                          className={cn(SELECT_ITEM_TYPO)}
                                        >
                                          {opt.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </PublicCard>

                    {/* 4) Billing Plan */}
                    <PublicCard
                      className={cn(
                        "space-y-4 px-5 md:px-6 py-5 md:py-6 rounded-2xl border",
                        "bg-[rgba(82,32,222,0.09)] border-[rgba(37,48,240,0.1)]",
                        "dark:bg-[rgba(255,255,255,0.02)] dark:border-[rgba(255,255,255,0.1)]",
                      )}
                    >
                      <header className="space-y-1.5">
                        <h2 className={cn(SECTION_TITLE)}>Billing Plan</h2>
                        <p className={cn(SECTION_SUBTITLE)}>
                          Choose how you&apos;d like to be billed.
                        </p>
                      </header>

                      <div className="h-px bg-[#2530f0]/10 dark:bg-white/10" />

                      <div className="space-y-4">
                        <FormField
                          control={control}
                          name="billingPlan"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className={cn(FIELD_LABEL)}>
                                Billing Plan
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className={selectIconWrapper}>
                                    <Image
                                      src="/assets/svg/build-sensepc/bill.svg"
                                      alt="Billing icon"
                                      width={20}
                                      height={20}
                                    />
                                  </span>

                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value ?? ""}
                                  >
                                    <SelectTrigger
                                      id="billingPlan"
                                      variant="form"
                                      className={cn("pl-11", SELECT_TRIGGER_TYPO)}
                                    >
                                      <SelectValue placeholder="Select billing plan" />
                                    </SelectTrigger>

                                    <SelectContent variant="form">
                                      <SelectItem
                                        value="hourly"
                                        className={cn(SELECT_ITEM_TYPO)}
                                      >
                                        Hourly
                                      </SelectItem>
                                      <SelectItem
                                        value="daily"
                                        className={cn(SELECT_ITEM_TYPO)}
                                      >
                                        Daily
                                      </SelectItem>
                                      <SelectItem
                                        value="monthly"
                                        className={cn(SELECT_ITEM_TYPO)}
                                      >
                                        Monthly
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </PublicCard>

                    {/* Build section */}
                    <div className="pt-4 mt-1 border-t border-white/5 space-y-3">
                      <div>
                        <h3 className="font-space-grotesk text-[18px] leading-[24px] md:text-[20px] md:leading-[28px] font-semibold text-slate-900 dark:text-white">
                          Build
                        </h3>
                        <p className="mt-1 font-inter text-[14px] leading-[20px] md:text-[16px] md:leading-[24px] text-slate-600 dark:text-slate-400">
                          We&apos;ll spin up your Sense PC securely.
                        </p>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full rounded-full font-inter text-[16px] leading-[24px] font-medium inline-flex items-center justify-center gap-2"
                        disabled={isCreating || isLoading}
                        aria-disabled={isCreating || isLoading}
                      >
                        {isCreating ? (
                          "Building..."
                        ) : (
                          <>
                            Build This PC Now
                            <ArrowUpRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>

                      {error && (
                        <p className="mt-2 font-inter text-[14px] leading-[20px] md:text-[16px] md:leading-[24px] text-red-500">
                          Error getting estimate.
                        </p>
                      )}
                    </div>
                  </div>
                </PublicCard>

                <div ref={asideRef} className="lg:sticky lg:top-28 self-start">
                  <CostSummary
                    isResize={false}
                    billingPlan={billingPlan as BillingPlan}
                    handleEstimate={handleEstimateWithFX}
                    estimateData={effectiveEstimate}
                    isEstimating={isLoading}
                  />
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>

      <style>{`
        .sm-refresh-btn {
          transition: transform 150ms ease, box-shadow 150ms ease, opacity 150ms ease;
        }
        .sm-refresh-btn.sm-pressed {
          transform: scale(0.98);
          box-shadow: 0 0 0 8px rgba(99, 102, 241, 0.18);
          opacity: 0.96;
        }
      `}</style>
    </div>
  );
}
