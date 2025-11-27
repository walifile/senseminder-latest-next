/* eslint perfectionist/sort-imports: "off" */

"use client";

import type { RootState } from "@/redux/store";

import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";
import React, { useRef, useMemo, useEffect } from "react";
import { useCreateVMMutation } from "@/api/vmManagement";
import { FEEDBACK_TRIGGERS } from "@/constants/app-constants";
import {
  useGetEstimateMutation,
  useListRemoteDesktopQuery,
} from "@/api/fileManagerAPI";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
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

import { motion } from "framer-motion";
import { Cpu, Globe, HardDrive, MoveRight, MonitorPlay } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useFeedback } from "@/hooks/use-feedback";

import { Field } from "@/components/shared/hook-form";
import Navbar from "@/components/shared/layout/navbar";

import { formSchema } from "./schema";
import { fetchEstimate } from "./api/fetch-estimate";

import { useGetSmartPcConfigQuery } from "@/api/smartPCConfigAPI";
import CostSummary from "./_components/cost-summary";
import { osOptions, storageOptions, locationOptions } from "./data";

import type { FormValues } from "./schema";

export default function BuildSmartPCPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { triggerFeedback } = useFeedback();
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const config = useSelector((state: RootState) => state.smartPcConfig);

  const [getEstimate, { data, isLoading, error }] = useGetEstimateMutation();
  const { refetch: refetchRemoteDesktops } = useListRemoteDesktopQuery({ userId });
  const [createVM, { isLoading: isCreating }] = useCreateVMMutation();

  const defaultValues: Partial<FormValues> = useMemo(
    () => ({
      pcName: "",
      operatingSystem: config.operatingSystem || osOptions[0].value || "",
      cpu: config.cpu || "",
      storage: config.storage || storageOptions[0].value || "",
      region: config.region || locationOptions[0].value || "",
      billingPlan: "hourly",
      linuxCategory: "",
    }),
    [config]
  );

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues,
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

  // API-driven options (memoized to avoid changing deps each render)
  const { data: apiConfig } = useGetSmartPcConfigQuery();
  const apiCpuOptions = useMemo(() => apiConfig?.cpuOptions ?? {}, [apiConfig?.cpuOptions]);
  const apiCpuCategories = useMemo(() => apiConfig?.cpuCategories ?? {}, [apiConfig?.cpuCategories]);

  const linuxCategoryCpuOptions =
    (
      apiCpuCategories as Record<
        string,
        Record<string, { value: string; label: string }[]>
      >
    )?.Linux?.[`${selectedLinuxCategory}`] || [];

  const cpuOptionsForOS = isLinuxOS
    ? linuxCategoryCpuOptions
    : (apiCpuOptions as Record<string, { value: string; label: string }[]>)[selectedOS] || [];

  useEffect(() => {
    if (selectedOS) {
      if (isLinuxOS) {
        setValue("linuxCategory", "Ubuntu_24.04_LTS_X64", { shouldValidate: true });
      }
      const opts = (apiCpuOptions as Record<string, { value: string }[]>)?.[selectedOS];
      if (opts && opts.length > 0) {
        setValue("cpu", opts[0].value, { shouldValidate: true });
      }
    }
  }, [selectedOS, isLinuxOS, setValue, apiCpuOptions]);

  // Trigger estimate on key changes
  useEffect(() => {
    fetchEstimate({
      methods,
      getEstimate,
      toast,
      showError: false,
    });
  }, [cpu, storage, region, methods, getEstimate, toast]);

  // Keep last stable estimate to prevent UI flicker
  const stableEstimateRef = useRef<typeof data>(null);
  useEffect(() => {
    if (data) stableEstimateRef.current = data;
  }, [data]);

  // Use the fresh `data` if present; otherwise fall back to last stable.
  const effectiveEstimate = useMemo(
    () => data ?? stableEstimateRef.current,
    [data]
  );

  // Ensure this handler returns no value (void)
  const handleEstimate = async () => {
    await fetchEstimate({
      methods,
      getEstimate,
      toast,
    });
  };

  // Visual click effect ONLY on the Refresh button (inside CostSummary)
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

  // Also ensure no return value here
  const handleEstimateWithFX = async () => {
    await handleEstimate();
  };

  const onSubmit = handleSubmit(async (formData: FormValues) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create your Sense PC.",
        variant: "destructive",
      });
      router.push(routes.signIn);
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
      void triggerFeedback({ trigger: FEEDBACK_TRIGGERS.PC_ACTION, delayMinutes: 0 });
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#070713]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-8 mx-auto h-40 w-[90%] rounded-full blur-3xl opacity-30 dark:opacity-60"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0) 70%)",
          }}
        />
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="text-4xl font-bold tracking-tight sm:text-5xl"
            >
              Build your <span className="text-indigo-600 dark:text-indigo-400">Sense PC</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="mt-3 text-base text-muted-foreground sm:text-lg"
            >
              Configure in minutes — priced with a built-in estimator.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Builder + Summary */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3"
          >
            {/* Left: Form */}
            <div className="md:col-span-2 grid gap-5">
              <Form {...methods} control={control}>
                <form className="grid gap-5" onSubmit={onSubmit}>
                  {/* Basic */}
                  <Card className="border border-border/60 shadow-sm">
                    <CardHeader className="py-2">
                      <CardTitle className="text-lg">Basic Information</CardTitle>
                      <CardDescription className="mt-0.5">
                        Name your Sense PC and choose an operating system.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 py-3">
                      <FormField
                        control={control}
                        name="pcName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PC Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="E.g., Design-Workstation"
                                {...field}
                                aria-label="PC Name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Field.Select
                        name="operatingSystem"
                        label="Operating System"
                        options={osOptions}
                        icon={MonitorPlay}
                      />
                    </CardContent>
                  </Card>

                  {/* Hardware */}
                  <Card className="border border-border/60 shadow-sm">
                    <CardHeader className="py-2">
                      <CardTitle className="text-lg">Hardware Configuration</CardTitle>
                      <CardDescription className="mt-0.5">
                        Choose your computing resources.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 py-3">
                      {isLinuxOS && (
                        <Field.Select
                          name="linuxCategory"
                          label="Linux Distribution"
                          options={Object.keys(
                            (
                              apiCpuCategories as Record<string, Record<string, unknown>>
                            )?.Linux || {}
                          )}
                        />
                      )}

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field.Select
                          name="cpu"
                          label="CPU"
                          options={cpuOptionsForOS}
                          icon={Cpu}
                        />
                        <Field.Select
                          name="storage"
                          label="Storage (SSD)"
                          options={storageOptions.map((opt) => ({
                            value: opt.value,
                            label: `${opt.label}${opt.pricePerHour ? ` — $${opt.pricePerHour}/hr` : ""}`,
                          }))}
                          icon={HardDrive}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location */}
                  <Card className="border border-border/60 shadow-sm">
                    <CardHeader className="py-2">
                      <CardTitle className="text-lg">Location</CardTitle>
                      <CardDescription className="mt-0.5">
                        Select the closest region for low latency.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-3">
                      <Field.Select
                        name="region"
                        label="Region"
                        options={locationOptions}
                        icon={Globe}
                      />
                    </CardContent>
                  </Card>

                  {/* Billing */}
                  <Card className="border border-border/60 shadow-sm">
                    <CardHeader className="py-2">
                      <CardTitle className="text-lg">Billing Plan</CardTitle>
                      <CardDescription className="mt-0.5">
                        Choose how you’d like to be billed.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 py-3">
                      <Field.Select
                        name="billingPlan"
                        label="Billing Plan"
                        placeholder="Choose billing plan"
                        options={[
                          { value: "hourly", label: "Hourly" },
                          { value: "daily", label: "Daily" },
                          { value: "monthly", label: "Monthly" },
                        ]}
                      />
                      <div className="rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                        Tip: Hourly is flexible. Daily/Monthly give predictable spend. You can change plans later from your dashboard.
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions (Build only) */}
                  <Card className="border border-border/60 shadow-sm">
                    <CardHeader className="py-2">
                      <CardTitle className="text-lg">Build</CardTitle>
                      <CardDescription className="mt-0.5">
                        We’ll spin up your Sense PC securely.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <Button
                        type="submit"
                        className="group/build w-full"
                        disabled={isCreating || isLoading}
                        aria-disabled={isCreating || isLoading}
                      >
                        {isCreating ? (
                          "Building..."
                        ) : (
                          <>
                            Build This PC Now
                            <MoveRight
                              className="ml-2 h-4 w-4 transition-transform duration-200 group-hover/build:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </>
                        )}
                      </Button>

                      {error && (
                        <p className="mt-2 text-sm text-red-500">Error getting estimate.</p>
                      )}
                    </CardContent>
                  </Card>
                </form>
              </Form>
            </div>

            {/* Right: Cost Summary (sticky, no flicker) */}
            <aside ref={asideRef} className="md:sticky md:top-24 h-max">
              <Card className="border border-border/60 shadow-sm">
                <CardHeader className="py-2">
                  <CardTitle className="text-lg">Cost Summary</CardTitle>
                  <CardDescription className="mt-0.5">
                    Live estimate based on your selections.
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-3">
                  <CostSummary
                    isResize={false}
                    billingPlan={billingPlan}
                    handleEstimate={handleEstimateWithFX}
                    estimateData={effectiveEstimate}
                    isEstimating={isLoading}
                  />
                </CardContent>
              </Card>
            </aside>
          </motion.div>
        </div>
      </section>

      {/* Only decorates the Refresh Estimate button */}
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
