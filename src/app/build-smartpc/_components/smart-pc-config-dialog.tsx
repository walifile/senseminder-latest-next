"use client";
import React, { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formSchema, FormValues } from "../schema";
import {
  cpuCategories,
  cpuOptions,
  locationOptions,
  osOptions,
  storageOptions,
} from "../data";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useGetEstimateMutation,
  useListRemoteDesktopQuery,
} from "@/api/fileManagerAPI";
import { useCreateVMMutation } from "@/api/vmManagement";
import { clearSmartPcConfig } from "@/redux/slices/build-pc/smart-pc-config-slice";
import { Field, Form } from "@/components/shared/hook-form";
import { fetchEstimate } from "../api/fetch-estimate";
import { fCurrency } from "@/lib/utils/format-number";
import { ResizeInitial, SmartPCConfigDialogProps } from "../types";

const SmartPCConfigDialog = (props: SmartPCConfigDialogProps) => {
  const {
    showNewPCDialog,
    setShowNewPCDialog,
    mode = "create",
    initial,
    lockedFields = [],
    onConfirm,
    instanceIdForResize,
    loadExisting,
  } = props;

  const dispatch = useDispatch();
  const { toast } = useToast();

  const isResize = mode === "resize";
  const locked = new Set(lockedFields);

  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const config = useSelector((state: RootState) => state.smartPcConfig);

  const [drag, setDrag] = React.useState({ x: 0, y: 0 });
  const dragStartRef = React.useRef<{ x: number; y: number } | null>(null);

  const [getEstimate, { data, isLoading }] = useGetEstimateMutation();
  const { refetch: refetchRemoteDesktops } = useListRemoteDesktopQuery({
    userId,
  });
  const [createVM, { isLoading: isCreating }] = useCreateVMMutation();

  function isLocked(
    field: "pcName" | "operatingSystem" | "region" | "billingPlan" | "storage"
  ) {
    return isResize && (locked.has(field) || field === "storage");
  }

  const [existingData, setExistingData] = useState<ResizeInitial | undefined>(
    undefined
  );

  const OS_VALUES = osOptions.map((o) => o.value);

  function normalizeOSFromApi(
    raw?: string,
    configId?: string
  ): "Windows 11" | "Windows 10" | "Linux" {
    const val = (raw || "").trim();

    // direct match first
    if (OS_VALUES.includes(val as any)) return val as any;

    // soft match for Windows
    if (/windows\s*11/i.test(val)) return "Windows 11";
    if (/windows\s*10/i.test(val)) return "Windows 10";

    // derive from configId when OS text is missing/ambiguous
    if (configId) {
      if (/win11/i.test(configId) || /_win11_/i.test(configId))
        return "Windows 11";
      if (/win10/i.test(configId) || /_win10_/i.test(configId))
        return "Windows 10";
      if (/ubuntu|_lts_|_arm_|_x64_/i.test(configId)) return "Linux";
    }

    // last resort: Linux (so we don't show blank)
    return "Linux";
  }

  /** Given a Linux configId, try to pick the right Linux category select value */
  function inferLinuxCategoryFromConfigId(
    configId = ""
  ):
    | "Ubuntu_24.04_LTS_X64"
    | "Ubuntu_24.04_LTS_ARM"
    | "Ubuntu_22.04_LTS_X64"
    | "Ubuntu_22.04_LTS_ARM"
    | undefined {
    const id = configId.toLowerCase();
    if (id.includes("24.04") && id.includes("x64"))
      return "Ubuntu_24.04_LTS_X64";
    if (id.includes("24.04") && id.includes("arm"))
      return "Ubuntu_24.04_LTS_ARM";
    if (id.includes("22.04") && id.includes("x64"))
      return "Ubuntu_22.04_LTS_X64";
    if (id.includes("22.04") && id.includes("arm"))
      return "Ubuntu_22.04_LTS_ARM";
    return undefined;
  }

  function coerceCpuForOS(
    os: string,
    cpuFromApi: string | undefined,
    linuxCategory: string | undefined
  ): { cpu: string; linuxCategory?: string } {
    if (os === "Linux") {
      const chosenCategory =
        linuxCategory ||
        inferLinuxCategoryFromConfigId(cpuFromApi) ||
        "Ubuntu_24.04_LTS_X64";

      const opts = cpuCategories.Linux[chosenCategory] || [];
      const match = opts.find((o) => o.value === cpuFromApi)?.value;
      return {
        cpu: match || (opts[0]?.value ?? ""),
        linuxCategory: chosenCategory,
      };
    }

    const opts = cpuOptions[os] || [];
    const match = opts.find((o) => o.value === cpuFromApi)?.value;
    return { cpu: match || (opts[0]?.value ?? "") };
  }

  // ------ Dialog drag (no external dependency) ------

  const onDragStart = React.useCallback(
    (e: React.MouseEvent) => {
      // skip dragging from interactive controls
      if ((e.target as HTMLElement).closest("[data-cancel-drag]")) return;
      dragStartRef.current = { x: e.clientX - drag.x, y: e.clientY - drag.y };

      const onMove = (ev: MouseEvent) => {
        if (!dragStartRef.current) return;
        setDrag({
          x: ev.clientX - dragStartRef.current.x,
          y: ev.clientY - dragStartRef.current.y,
        });
      };
      const onUp = () => {
        dragStartRef.current = null;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [drag.x, drag.y]
  );

  // reset drag when dialog closes
  React.useEffect(() => {
    if (!showNewPCDialog) setDrag({ x: 0, y: 0 });
  }, [showNewPCDialog]);

  // ------ React Hook Form ------
  const {
    control,
    handleSubmit,
    reset,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      pcName: "",
      operatingSystem: config.operatingSystem || osOptions[0].value,
      cpu: config.cpu || cpuOptions[config.operatingSystem]?.[0]?.value || "",
      storage: config.storage || storageOptions[0].value,
      region: config.region || locationOptions[0].value,
      billingPlan: "hourly",
      linuxCategory: "Ubuntu_24.04_LTS_X64",
    },
  });

  // ------ Baseline CPU for "current → new" badge ------
  const initialCpuRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!showNewPCDialog) initialCpuRef.current = null;
  }, [showNewPCDialog]);

  // ------ Fetch & prefill for resize ------
  const [loadingExisting, setLoadingExisting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (!isResize || !showNewPCDialog) return;
      if (!loadExisting && !instanceIdForResize && !initial) return;

      setLoadingExisting(true);
      try {
        let src: ResizeInitial | undefined;

        if (loadExisting) {
          src = await loadExisting();
        }

        if (!src) src = initial;
        if (cancelled || !src) return;

        setExistingData(src);

        // Normalize OS & CPU (handle Linux category)
        const normalizedOS = normalizeOSFromApi(src.operatingSystem, src.cpu);
        const currentLinuxCategory = inferLinuxCategoryFromConfigId(src.cpu);
        const coerced = coerceCpuForOS(
          normalizedOS,
          src.cpu,
          currentLinuxCategory
        );

        // Write fields in dependency-safe order
        setValue("pcName", src.pcName ?? "", { shouldDirty: false });
        setValue("operatingSystem", normalizedOS, { shouldDirty: false });

        if (normalizedOS === "Linux" && coerced.linuxCategory) {
          setValue("linuxCategory", coerced.linuxCategory as any, {
            shouldDirty: false,
          });
        }

        setValue("cpu", coerced.cpu, { shouldDirty: false });

        // Record the current CPU once for the badge (resize only)
        if (isResize && !initialCpuRef.current) {
          initialCpuRef.current = coerced.cpu;
        }

        if (src.storage)
          setValue("storage", String(src.storage), { shouldDirty: false });
        if (src.region) setValue("region", src.region, { shouldDirty: false });
        if (src.billingPlan)
          setValue("billingPlan", src.billingPlan, { shouldDirty: false });
      } catch (e) {
        console.error("Failed to load existing PC config for resize:", e);
        toast({
          title: "Unable to load PC details",
          description: "We couldn't prefill the current configuration.",
          variant: "destructive",
        });
      } finally {
        if (!cancelled) setLoadingExisting(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResize, showNewPCDialog, instanceIdForResize, loadExisting, setValue]);

  /* ----- dynamic form logic ----- */
  const selectedOS = useWatch({ control, name: "operatingSystem" });
  const isLinuxOS = selectedOS === "Linux";
  const selectedLinuxCategory = useWatch({ control, name: "linuxCategory" });
  const linuxCategoryCpuOptions =
    cpuCategories.Linux[`${selectedLinuxCategory}`] || [];

  const cpuOptionsForOS = isLinuxOS
    ? linuxCategoryCpuOptions
    : cpuOptions[selectedOS] || [];

  // label helper (after cpuOptionsForOS is defined)
  const cpuLabelFor = React.useCallback(
    (val?: string | null) => {
      if (!val) return "";
      const found = cpuOptionsForOS.find((o) => o.value === val);
      return found?.label ?? val;
    },
    [cpuOptionsForOS]
  );

  // when OS (or Linux category) changes, ensure CPU remains valid
  useEffect(() => {
    const current = getValues("cpu");
    const validValues = cpuOptionsForOS.map((o) => o.value);
    if (!validValues.includes(current)) {
      const next = validValues[0] || "";
      setValue("cpu", next, { shouldDirty: false, shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOS, selectedLinuxCategory]);

  const billingPlan = useWatch({ control, name: "billingPlan" });
  const cpu = useWatch({ control, name: "cpu" });
  const region = useWatch({ control, name: "region" });
  const storage = useWatch({ control, name: "storage" });

  // Disable resize unless configuration changes"
  const isNoResizeChange = React.useMemo(
    () =>
      isResize &&
      !!initialCpuRef.current &&
      cpu === initialCpuRef.current &&
      existingData?.storage &&
      storage === existingData?.storage,
    [isResize, cpu, storage, initialCpuRef, existingData]
  );

  // Disable resize unless plan is "hourly"
  const isPlanBlocked = React.useMemo(
    () => isResize && billingPlan !== "hourly",
    [isResize, billingPlan]
  );

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [confirmationAccepted, setConfirmationAccepted] = useState(false);

  /* ----- estimate helpers ----- */
  const getFormattedTotalPrice = () => {
    if (isLoading || !data?.total) return "...";
    const price =
      billingPlan === "hourly"
        ? data.total.pricePerHour?.toFixed(3)
        : billingPlan === "daily"
        ? data.total.pricePerDay?.toFixed(2)
        : data.total.pricePerMonth?.toFixed(2);
    const suffix =
      billingPlan === "hourly"
        ? "/hour"
        : billingPlan === "daily"
        ? "/day"
        : "/month";
    return `$${price} ${suffix}`;
  };

  // debounce estimates
  useEffect(() => {
    if (!cpu || !storage || !region) return;
    const t = setTimeout(() => {
      getEstimate({ configId: cpu, storageSize: storage, region })
        .unwrap()
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [cpu, storage, region, billingPlan, getEstimate]);

  // If a CPU was pre-selected in Redux for this OS, adopt it; else ensure some CPU is set
  useEffect(() => {
    const opts = cpuOptionsForOS.map((o) => o.value);
    const current = getValues("cpu");
    if (config.cpu && opts.includes(config.cpu) && current !== config.cpu) {
      setValue("cpu", config.cpu, {
        shouldDirty: false,
        shouldValidate: false,
      });
    } else if (!current && opts.length > 0) {
      setValue("cpu", opts[0], { shouldDirty: false, shouldValidate: false });
    }
  }, [config.cpu, cpuOptionsForOS, getValues, setValue]);

  // initial estimate
  useEffect(() => {
    const v = getValues();
    if (!v.cpu || !v.storage || !v.region) return;
    getEstimate({ configId: v.cpu, storageSize: v.storage, region: v.region })
      .unwrap()
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEstimate = async () => {
    const valid = await trigger();
    if (!valid) return;
    const v = getValues();
    await getEstimate({
      configId: v.cpu,
      storageSize: v.storage,
      region: v.region,
    })
      .unwrap()
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to fetch estimate",
          variant: "destructive",
        });
      });
  };

  /* ----- submit flows ----- */
  const onSubmit = async (form: FormValues) => {
    if (!deleteConfirmed) return;
    try {
      await createVM({
        action: "create",
        configId: form.cpu,
        systemName: form.pcName,
        region: form.region || "us-east-1",
        storageSize: parseInt(form.storage, 10),
        billingPlan: form.billingPlan,
      }).unwrap();

      while (true) {
        const res = await refetchRemoteDesktops();
        if (res.status === "fulfilled") break;
        await new Promise((r) => setTimeout(r, 2000));
      }

      toast({
        title: "Sense PC Created",
        description: `${form.pcName} has been successfully created.`,
      });

      reset();
      setShowNewPCDialog(false);
      setShowConfirmation(false);
      setDeleteConfirmed(false);
      return true;
    } catch (err) {
      const errorData = (err as { data?: any })?.data;
      const errorMsg =
        errorData?.message ??
        "Something went wrong. Please try again or contact support.";

      toast({
        title: "Failed to Create Computer",
        description: errorMsg,
        variant: "destructive",
      });

      setShowConfirmation(false);
      setDeleteConfirmed(false);
      return false;
    }
  };

  async function handleResizeSubmit() {
    if (isPlanBlocked) {
      toast({
        title: "Plan not eligible",
        description: "CPU resize is only allowed on the Hourly billing plan.",
        variant: "destructive",
      });
      return;
    }

    if (loadingExisting) return;
    const valid = await trigger(["cpu", "storage"]);
    if (!valid) return;

    const cpuVal = getValues("cpu");

    // ⛔ stop if user picked the same config
    if (isNoResizeChange) {
      toast({
        title: "No change detected",
        description:
          "Choose a different CPU size or storage to apply the resize.",
        variant: "destructive",
      });
      return;
    }

    if (!onConfirm) {
      setShowNewPCDialog(false);
      return;
    }

    const ok = await onConfirm({ cpu, storage });
    if (ok) {
      reset();
      setShowNewPCDialog(false);
    }
  }

  return (
    <>
      <Dialog
        open={isResize ? showNewPCDialog : showNewPCDialog && !showConfirmation}
        onOpenChange={(isOpen) => {
          setShowNewPCDialog(isOpen);
          if (!isOpen) dispatch(clearSmartPcConfig());
        }}
      >
        <DialogContent
          key={isResize ? initial?.pcName || "resize" : "build"}
          style={{
            transform: `translate(calc(-50% + ${drag.x}px), calc(-50% + ${drag.y}px))`,
          }}
          className="sm:max-w-[760px] max-h-[95vh] overflow-hidden p-0"
        >
          {/* Header (drag handle) */}
          <div
            className="dialog-handle cursor-move select-none px-6 pt-6 pb-3 border-b"
            onMouseDown={onDragStart}
          >
            <DialogHeader data-cancel-drag>
              <div
                className="flex items-start justify-between pr-12 sm:pr-1"
                // ↑ keeps the badge away from the top-right X (DialogClose)
              >
                <div>
                  <DialogTitle className="text-xl">
                    {isResize
                      ? "PC Resize (CPU & Memory)"
                      : "Choose Your Computer Configurations"}
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    {isResize
                      ? "Update CPU & Memory for your existing Computer."
                      : "Customize your Computer."}
                  </DialogDescription>
                </div>

                <span
                  className={cn(
                    // slim the pill a bit and add right margin
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium mr-8 sm:mr-12",
                    isResize
                      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                      : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  )}
                  data-cancel-drag
                >
                  {isResize ? "Resize" : "Build"}
                </span>
              </div>

              {isResize && (
                <div
                  className="mt-3 rounded-md border border-amber-200 bg-amber-50 text-amber-800 text-xs px-3 py-2"
                  data-cancel-drag
                >
                  Changes require the PC to be{" "}
                  <span className="font-semibold">Stopped</span> and are allowed
                  only for <span className="font-semibold">Hourly</span> plans.
                </div>
              )}
            </DialogHeader>
          </div>

          {/* Body (scrollable); footer is outside to avoid covering Billing */}
          <div
            className="grid gap-6 px-6 pt-6 pb-40 md:grid-cols-12 max-h-[calc(95vh-64px)] overflow-y-auto"
            data-cancel-drag
          >
            {/* LEFT: FORM with section panels */}
            <div
              className={cn(
                "md:col-span-8 space-y-6",
                loadingExisting && "opacity-60 pointer-events-none"
              )}
            >
              <form
                onSubmit={handleSubmit(
                  isResize ? async () => handleResizeSubmit() : onSubmit
                )}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
                aria-busy={loadingExisting}
              >
                {/* Basics (section) */}
                <section className="rounded-lg border bg-muted/30 p-4 space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Basics :
                  </h4>

                  {/* OS */}
                  <div className="space-y-2">
                    <Label>Select Operating System (OS)</Label>
                    <Controller
                      control={control}
                      name="operatingSystem"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={
                            isLocked("operatingSystem") || loadingExisting
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Operating System" />
                          </SelectTrigger>
                          <SelectContent>
                            {osOptions.map((os) => (
                              <SelectItem key={os.value} value={os.value}>
                                {os.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {!isResize && errors.operatingSystem && (
                      <p className="text-red-500 text-xs">
                        {errors.operatingSystem.message}
                      </p>
                    )}
                  </div>

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
                          className={cn(
                            !isResize && errors.pcName && "border-red-500"
                          )}
                          placeholder="Enter a name for your computer"
                          {...field}
                          disabled={isLocked("pcName") || loadingExisting}
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

                {/* Configuration (section) */}
                <section className="rounded-lg border bg-muted/20 p-4 space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Configuration :
                  </h4>

                  {/* Linux category */}
                  {isLinuxOS && (
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Controller
                        control={control}
                        name="linuxCategory"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isResize || loadingExisting}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Linux category" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(cpuCategories.Linux).map(
                                (category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {!isResize && errors.cpu && (
                        <p className="text-red-500 text-xs">
                          {errors.cpu.message}
                        </p>
                      )}
                    </div>
                  )}

                  {/* CPU */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <Label>CPU + Memory</Label>

                      {/* current → new badge (resize only) */}
                      {isResize && initialCpuRef.current && (
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="rounded-full bg-muted px-2 py-0.5">
                            {cpuLabelFor(initialCpuRef.current)}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5",
                              cpu !== initialCpuRef.current
                                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {cpuLabelFor(cpu)}
                          </span>
                          {cpu === initialCpuRef.current && (
                            <span className="ml-2 text-[10px] text-muted-foreground">
                              No change
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <Controller
                      control={control}
                      name="cpu"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={loadingExisting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select CPU size" />
                          </SelectTrigger>
                          <SelectContent>
                            {cpuOptionsForOS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.cpu && (
                      <p className="text-red-500 text-xs">
                        {errors.cpu.message}
                      </p>
                    )}
                  </div>

                  {/* Storage */}
                  <div className="space-y-2">
                    <Label>Storage (SSD)</Label>
                    {isResize && existingData?.storage && (
                      <div className="flex items-center gap-1 text-[11px]">
                        <span className="rounded-full bg-muted px-2 py-0.5">
                          {existingData?.storage}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5",
                            storage !== existingData?.storage
                              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {storage}
                        </span>
                        {storage === existingData?.storage && (
                          <span className="ml-2 text-[10px] text-muted-foreground">
                            No change
                          </span>
                        )}
                      </div>
                    )}

                    <Controller
                      control={control}
                      name="storage"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={loadingExisting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select storage size" />
                          </SelectTrigger>
                          <SelectContent>
                            {storageOptions
                              .filter(
                                (s) =>
                                  Number(s.value) >=
                                  Number(existingData?.storage)
                              )
                              .map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.storage && (
                      <p className="text-red-500 text-xs">
                        {errors.storage.message}
                      </p>
                    )}
                  </div>

                  {/* Region */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="m-0">Location</Label>

                      {/* Inline help (i) */}
                      <TooltipProvider delayDuration={150}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="p-1 rounded-md text-muted-foreground hover:text-foreground"
                              aria-label="Location help"
                              data-cancel-drag
                            >
                              <Info className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            align="start"
                            className="max-w-xs"
                          >
                            Choose your nearest location for the best latency
                            and performance.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <Controller
                      control={control}
                      name="region"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isLocked("region") || loadingExisting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select nearest datacenter" />
                          </SelectTrigger>
                          <SelectContent>
                            {locationOptions.map((location) => (
                              <SelectItem
                                key={location.value}
                                value={location.value}
                              >
                                {location.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />

                    {!isResize && errors.region && (
                      <p className="text-red-500 text-xs">
                        {errors.region.message}
                      </p>
                    )}
                  </div>
                </section>

                {/* Billing (section) */}
                <section className="rounded-lg border bg-muted/10 p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Billing Plan :
                  </h4>

                  <div className="space-y-2">
                    <Label>Billing Plan</Label>
                    <Controller
                      control={control}
                      name="billingPlan"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isLocked("billingPlan") || loadingExisting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose billing plan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </section>

                {/* Mobile actions (unchanged) */}
                <div className="mt-6 flex gap-2 md:hidden">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewPCDialog(false)}
                    disabled={loadingExisting}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleEstimate}
                    disabled={isLoading || isCreating || loadingExisting}
                    className="w-full"
                  >
                    {isLoading ? "Estimating..." : "Estimate"}
                  </Button>
                </div>
              </form>
            </div>

            {/* RIGHT: SUMMARY (unchanged) */}
            <aside className="md:col-span-4 space-y-4">
              <div className="rounded-lg border bg-card text-card-foreground">
                <div className="p-4 border-b">
                  <h4 className="text-sm font-semibold">Summary</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Estimated cost based on your selections.
                  </p>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>CPU</span>
                    <span className="font-medium">
                      {isLoading
                        ? "—"
                        : billingPlan === "hourly"
                        ? `$${data?.instance?.pricePerHour?.toFixed(3) ?? "-"}`
                        : billingPlan === "daily"
                        ? `$${data?.instance?.pricePerDay?.toFixed(2) ?? "-"}`
                        : `$${
                            data?.instance?.pricePerMonth?.toFixed(2) ?? "-"
                          }`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage{isResize ? " (current)" : ""}</span>
                    <span className="font-medium">
                      {isLoading
                        ? "—"
                        : billingPlan === "hourly"
                        ? `$${data?.storage?.pricePerHour?.toFixed(3) ?? "-"}`
                        : billingPlan === "daily"
                        ? `$${data?.storage?.pricePerDay?.toFixed(2) ?? "-"}`
                        : `$${data?.storage?.pricePerMonth?.toFixed(2) ?? "-"}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-semibold">
                    <span>Total</span>
                    <span>
                      {isLoading
                        ? "—"
                        : billingPlan === "hourly"
                        ? `$${data?.total?.pricePerHour?.toFixed(3) ?? "-"}`
                        : billingPlan === "daily"
                        ? `$${data?.total?.pricePerDay?.toFixed(2) ?? "-"}`
                        : `$${data?.total?.pricePerMonth?.toFixed(2) ?? "-"}`}
                    </span>
                  </div>

                  <div className="pt-3">
                    <Button
                      type="button"
                      onClick={handleEstimate}
                      disabled={isLoading || isCreating || loadingExisting}
                      className="w-full"
                    >
                      {isLoading ? "Estimating..." : "Refresh Estimate"}
                    </Button>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Estimates are approximate and may vary at runtime.
                  </p>
                </div>
              </div>

              <div className="rounded-md border bg-muted/30 text-muted-foreground p-3 text-xs">
                {isResize ? (
                  <>
                    Changes take a few minutes. You’ll see the new CPU once the
                    PC starts again.
                  </>
                ) : (
                  <>
                    You can resize later. Some changes require the PC to be
                    stopped.
                  </>
                )}
              </div>
            </aside>
          </div>

          {/* Sticky footer */}
          <div
            className="sticky bottom-0 inset-x-0 border-t bg-background px-6 py-4"
            data-cancel-drag
          >
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowNewPCDialog(false)}
                disabled={loadingExisting}
              >
                Cancel
              </Button>

              {!isResize && (
                <Button
                  type="button"
                  onClick={handleEstimate}
                  disabled={isLoading || isCreating || loadingExisting}
                  variant="secondary"
                >
                  {isLoading ? "Estimating..." : "Estimate"}
                </Button>
              )}

              {isResize ? (
                <Button
                  type="submit"
                  disabled={
                    isCreating ||
                    isLoading ||
                    loadingExisting ||
                    isNoResizeChange ||
                    isPlanBlocked
                  }
                  onClick={async (e) => {
                    e.preventDefault();
                    await handleResizeSubmit();
                  }}
                >
                  {isNoResizeChange
                    ? "No Changes to Apply"
                    : "Apply CPU Resize"}
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={isCreating || isLoading}
                  onClick={async () => {
                    const valid = await trigger();
                    if (!valid) return;
                    setShowConfirmation(true);
                    setConfirmationAccepted(false);
                  }}
                >
                  Build PC
                </Button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase confirmation (create only) — unchanged */}
      {!isResize && (
        <Dialog
          open={showConfirmation}
          onOpenChange={(open) => {
            setShowConfirmation(open);
            if (open) setShowNewPCDialog(false);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Your Purchase</DialogTitle>
              <DialogDescription>
                You are about to be charged upfront for this Computer based on
                your selected plan.
                <br />
                <span className="mt-2 inline-block text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                  Estimated total: {getFormattedTotalPrice()}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 flex items-start gap-2">
              <input
                type="checkbox"
                id="purchase-confirm-check"
                checked={deleteConfirmed}
                onChange={(e) => setDeleteConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 border rounded"
              />
              <label
                htmlFor="purchase-confirm-check"
                className="text-sm text-muted-foreground leading-snug"
              >
                I acknowledge and accept the above statement.
              </label>
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isCreating || !deleteConfirmed}
                onClick={handleSubmit(async (formData) => {
                  if (!deleteConfirmed) return;
                  const success = await onSubmit(formData);
                  setShowConfirmation(false);
                  setShowNewPCDialog(false);
                  setDeleteConfirmed(false);
                  setConfirmationAccepted(false);
                })}
              >
                {isCreating ? "Processing..." : "Confirm & Pay"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
export default SmartPCConfigDialog;
