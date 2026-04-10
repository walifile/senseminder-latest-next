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

import CostSummary from "./cost-summary";
import { fetchEstimate } from "../api/fetch-estimate";
import { formSchema, type FormValues } from "../schema";
import { osOptions, storageOptions, locationOptions } from "../data";

import type { BillingPlan } from "../data/billing";

const selectIconWrapper =
  "pointer-events-none absolute left-4 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center";

// const HERO_TITLE =
//   "font-space-grotesk font-bold text-[24px] leading-[30px] md:text-[30px] md:leading-[36px] lg:text-[34px] lg:leading-[40px]";

// const HERO_SUBTITLE =
//   "font-inter text-paragraph text-[13px] leading-[20px] md:text-[14px] md:leading-[22px] lg:text-[15px] lg:leading-[24px]";

// const SECTION_TITLE =
//   "font-space-grotesk font-semibold text-slate-900 dark:text-white text-[16px] leading-[22px] md:text-[18px] md:leading-[24px]";

// const SECTION_SUBTITLE =
//   "font-inter text-slate-600 dark:text-slate-400 text-[13px] leading-[20px] md:text-[14px] md:leading-[22px]";

const FIELD_LABEL =
  "font-inter font-medium text-slate-900 dark:text-slate-300 text-[13px] leading-[20px]";

const SELECT_TRIGGER_TYPO =
  "font-inter text-[15px] leading-[22px] text-slate-900 dark:text-white";

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
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: baseDefaults,
  });

  const { control, reset, watch, setValue, handleSubmit, trigger } = methods;

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
    if (!hasAnyGpuOptions && showGpuOnly) {
      setShowGpuOnly(false);
      return;
    }
  
    const current = methods.getValues("cpu");
    const isValid = displayedCpuOptions.some((o) => o.value === current);
  
    // Keep it empty by default. Only clear it if current value becomes invalid.
    if (current && !isValid) {
      setValue("cpu", "", { shouldValidate: false });
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

  const stableEstimateRef = useRef<typeof data>(null);

  useEffect(() => {
    if (data) stableEstimateRef.current = data;
  }, [data]);

  const effectiveEstimate = useMemo(
    () => data ?? stableEstimateRef.current,
    [data]
  );

  const handleEstimate = async () => {
    const isValid = await trigger(["pcName", "cpu"]);
  
    if (!isValid) return;
  
    await fetchEstimate({
      methods,
      getEstimate,
      toast,
    });
  };    

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
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,_#F4F1FF_0%,_#FFFFFF_100%)] dark:bg-none">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[240px] bg-[radial-gradient(circle_at_top,rgba(37,48,240,0.14),transparent_58%)] dark:bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.18),transparent_58%)]"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute right-[-120px] top-[80px] -z-10 hidden h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(168,1,186,0.10),transparent_65%)] blur-3xl lg:block"
        aria-hidden
      />
  
      <div className="relative mx-auto w-full max-w-[1440px] px-4 pb-4 pt-16 md:px-6 md:pt-7 lg:px-8 lg:pt-4">
        <div className="space-y-4">
          <PublicCard
            className={cn(
              "relative overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/90 px-4 py-3 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl",
              "dark:border-white/10 dark:bg-white/[0.04] dark:text-white",
            )}
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(37,48,240,0.06),transparent_42%,rgba(168,1,186,0.05)_100%)] dark:bg-[linear-gradient(135deg,rgba(96,165,250,0.08),transparent_45%,rgba(168,85,247,0.08)_100%)]"
              aria-hidden
            />
  
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="min-w-0 space-y-2">
                {/* <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                    Sense PC Builder
                  </span>
                  <p className="font-inter text-[12px] leading-[18px] text-slate-500 dark:text-slate-400">
                    <span className="text-link-primary">Home</span>
                    <span>{` / `}</span>
                    <span>Build Sense PC</span>
                  </p>
                </div> */}
  
                <div className="space-y-1">
                  <h1
                    className={cn(
                      "font-space-grotesk text-[22px] font-bold leading-[28px] text-slate-900 md:text-[26px] md:leading-[32px] lg:text-[30px] lg:leading-[36px] dark:text-white",
                    )}
                  >
                    Build your Sense PC
                  </h1>
                  <p className="max-w-[760px] font-inter text-[13px] leading-[20px] text-slate-600 md:text-[14px] md:leading-[22px] dark:text-slate-400">
                    Choose your operating system, compute profile, storage,
                    location, and billing plan in one streamlined workflow with a
                    live estimate.
                  </p>
                </div>
              </div>
  
              <div className="hidden shrink-0 items-center justify-end lg:flex">
                <Image
                  src="/assets/build-sensepc/hero-illustration.svg"
                  alt="Build Sense PC illustration"
                  width={160}
                  height={160}
                  priority
                  className="h-auto w-[96px] xl:w-[112px] object-contain opacity-95"
                />
              </div>
            </div>
          </PublicCard>
  
          <Form {...methods} control={control}>
            <form onSubmit={onSubmit}>
              <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.85fr)_380px]">
                <PublicCard
                  className={cn(
                    "rounded-[24px] border border-slate-200/70 bg-white/90 px-3 py-3 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl",
                    "dark:border-white/10 dark:bg-white/[0.04]",
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1.5 border-b border-slate-200/80 pb-2 md:flex-row md:items-end md:justify-between dark:border-white/10">
                      <div>
                        <h2 className="font-space-grotesk text-[18px] font-semibold leading-[24px] text-slate-900 dark:text-white">
                          Configuration
                        </h2>
                        {/* <p className="font-inter text-[13px] leading-[20px] text-slate-600 dark:text-slate-400">
                          Enterprise-style setup with all controls kept on a
                          single workspace.
                        </p> */}
                      </div>
  
                      <div className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[12px] font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                        Live estimate updates automatically
                      </div>
                    </div>
  
                    <div className="grid gap-3 lg:grid-cols-2">
                      <PublicCard
                        className={cn(
                          "rounded-[20px] border border-slate-200/80 bg-white/95 px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_6px_18px_rgba(15,23,42,0.045)]",
                          "dark:border-white/10 dark:bg-white/[0.03]",
                        )}
                      >
                        <div className="space-y-2.5">
                          <header className="space-y-1">
                            <h3 className="font-space-grotesk text-[15px] font-semibold leading-[20px] text-slate-900 dark:text-white">
                              Basic Information
                            </h3>
                            <p className="font-inter text-[12px] leading-[18px] text-slate-600 dark:text-slate-400">
                              Name your Sense PC and choose an operating system.
                            </p>
                          </header>
  
                          <div className="h-px bg-slate-200/80 dark:bg-white/10" />
  
                          <div className="space-y-2.5">
                            <FormField
                              control={control}
                              name="pcName"
                              render={({ field }) => (
                                <FormItem className="space-y-1">
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
  
                            <FormField
                              control={control}
                              name="operatingSystem"
                              render={({ field }) => (
                                <FormItem className="space-y-1">
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
                        </div>
                      </PublicCard>
  
                      <PublicCard
                        className={cn(
                          "rounded-[20px] border border-slate-200/80 bg-white/95 px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_6px_18px_rgba(15,23,42,0.045)]",
                          "dark:border-white/10 dark:bg-white/[0.03]",
                        )}
                      >
                        <div className="space-y-2.5">
                          <header className="space-y-1">
                            <h3 className="font-space-grotesk text-[15px] font-semibold leading-[20px] text-slate-900 dark:text-white">
                              Hardware Configuration
                            </h3>
                            <p className="font-inter text-[12px] leading-[18px] text-slate-600 dark:text-slate-400">
                              Choose your computing profile and storage.
                            </p>
                          </header>
  
                          <div className="h-px bg-slate-200/80 dark:bg-white/10" />
  
                          <div className="space-y-2.5">
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
                                    <FormItem className="space-y-1">
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
  
                            <FormField
                              control={control}
                              name="cpu"
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <FormLabel className={cn(FIELD_LABEL)}>
                                      CPU + Memory
                                    </FormLabel>
  
                                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/90 px-2.5 py-1 dark:border-white/10 dark:bg-white/[0.03]">
                                      <Checkbox
                                        checked={showGpuOnly}
                                        onCheckedChange={(v) =>
                                          setShowGpuOnly(Boolean(v))
                                        }
                                        disabled={!hasAnyGpuOptions}
                                      />
                                      <p className="text-[12px] leading-[18px] text-slate-700 dark:text-slate-300">
                                        Show GPU configurations only
                                        {!hasAnyGpuOptions && (
                                          <span className="ml-1 text-[11px] text-slate-500 dark:text-slate-400">
                                            (No GPU options)
                                          </span>
                                        )}
                                      </p>
                                    </div>
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
  
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value ?? ""}
                                      >
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
  
                            <FormField
                              control={control}
                              name="storage"
                              render={({ field }) => (
                                <FormItem className="space-y-1">
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
                        </div>
                      </PublicCard>
  
                      <PublicCard
                        className={cn(
                          "rounded-[20px] border border-slate-200/80 bg-white/95 px-3 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_6px_18px_rgba(15,23,42,0.045)]",
                          "dark:border-white/10 dark:bg-white/[0.03]",
                        )}
                      >
                        <div className="space-y-2.5">
                          <header className="space-y-1">
                            <h3 className="font-space-grotesk text-[15px] font-semibold leading-[20px] text-slate-900 dark:text-white">
                              Location
                            </h3>
                            <p className="font-inter text-[12px] leading-[18px] text-slate-600 dark:text-slate-400">
                              Choose the nearest region for lower latency.
                            </p>
                          </header>
  
                          <div className="h-px bg-slate-200/80 dark:bg-white/10" />
  
                          <div className="space-y-2.5">
                            <FormField
                              control={control}
                              name="region"
                              render={({ field }) => (
                                <FormItem className="space-y-1">
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
                        </div>
                      </PublicCard>
  
                      <PublicCard
                        className={cn(
                          "rounded-[20px] border border-slate-200/80 bg-white/95 px-3 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_6px_18px_rgba(15,23,42,0.045)]",
                          "dark:border-white/10 dark:bg-white/[0.03]",
                        )}
                      >
                        <div className="space-y-2.5">
                          <header className="space-y-1">
                            <h3 className="font-space-grotesk text-[15px] font-semibold leading-[20px] text-slate-900 dark:text-white">
                              Billing Plan
                            </h3>
                            <p className="font-inter text-[12px] leading-[18px] text-slate-600 dark:text-slate-400">
                              Select how you want your usage billed.
                            </p>
                          </header>
  
                          <div className="h-px bg-slate-200/80 dark:bg-white/10" />
  
                          <div className="space-y-2.5">
                            <FormField
                              control={control}
                              name="billingPlan"
                              render={({ field }) => (
                                <FormItem className="space-y-1">
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
                        </div>
                      </PublicCard>
                    </div>
  
                    <div className="flex flex-col gap-2 rounded-[20px] border border-slate-200/80 bg-slate-50/80 px-3 py-3 md:flex-row md:items-center md:justify-between dark:border-white/10 dark:bg-white/[0.03]">
                      <div className="min-w-0">
                        <h3 className="font-space-grotesk text-[15px] font-semibold leading-[20px] text-slate-900 dark:text-white">
                          Build
                        </h3>
                        <p className="mt-0.5 font-inter text-[12px] leading-[18px] text-slate-600 dark:text-slate-400">
                          We&apos;ll provision your Sense PC securely using the
                          selected configuration.
                        </p>
  
                        {error && (
                          <p className="mt-2 font-inter text-[13px] leading-[20px] text-red-500">
                            Error getting estimate.
                          </p>
                        )}
                      </div>
  
                      <div className="flex w-full shrink-0 md:w-auto">
                        <Button
                          type="submit"
                          size="lg"
                          className="w-full rounded-full px-4 py-2.5 font-inter text-[14px] font-medium leading-[20px] md:w-auto"
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
                      </div>
                    </div>
                  </div>
                </PublicCard>
  
                <div ref={asideRef} className="xl:sticky xl:top-4">
                  <PublicCard
                    className={cn(
                      "flex flex-col rounded-[24px] border border-slate-200/70 bg-white/90 px-3 py-2.5 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl",
                      "dark:border-white/10 dark:bg-white/[0.04]",
                    )}
                  >
                    <div className="border-b border-slate-200/80 pb-2 dark:border-white/10">
                      <p className="font-space-grotesk text-[15px] font-semibold leading-[20px] text-slate-900 dark:text-white">
                        Cost Summary
                      </p>
                      <p className="mt-0.5 font-inter text-[12px] leading-[18px] text-slate-600 dark:text-slate-400">
                        Review your live estimate before provisioning your Sense PC.
                      </p>
                    </div>
  
                    <div className="flex-1">
                      <CostSummary
                        isResize={false}
                        billingPlan={billingPlan as BillingPlan}
                        handleEstimate={handleEstimateWithFX}
                        estimateData={effectiveEstimate}
                        isEstimating={isLoading}
                      />
                    </div>
                  </PublicCard>
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

