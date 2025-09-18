"use client";

import type { RootState } from "@/redux/store";

import appConfig from "@/config/app-config";
import { useGetEstimateMutation } from "@/api/fileManagerAPI";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { clearSmartPcConfig } from "@/redux/slices/build-pc/smart-pc-config-slice";

import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogContent } from "@/components/ui/dialog";

import { useDispatch, useSelector } from "react-redux";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useToast } from "@/hooks/use-toast";
import { useBoolean } from "@/hooks/use-boolean";

import { formSchema } from "../schema";
import CostSummary from "./cost-summary";
import { fetchEstimate } from "../api/fetch-estimate";
import SmartPcConfigForm from "./smart-pc-config-form";
import ConfirmPurchaseDialog from "./confirm-purchase-dialog";
import SmartPcConfigDialogHeader from "./smart-pc-config-dialog-header";
import {
  osOptions,
  cpuOptions,
  storageOptions,
  locationOptions,
} from "../data";
import {
  makeResizeRequest,
  validateStorageIncrease,
  inferLinuxCategoryFromConfigId,
} from "../utils";

import type { FormValues } from "../schema";
import type { ResizeInitial, DesktopInstance } from "../types";

const { RESIZE_API_URL } = appConfig;

type Props = {
  isResize?: boolean;
  isStorageOnly?: boolean;
  open: boolean;
  onClose: () => void;
  userId?: string;
  selectedInstance?: DesktopInstance | null;
  onSuccess: () => void;
};

const SmartPCConfigDialog = ({
  isResize = false,
  isStorageOnly = false,
  open,
  onClose,
  userId,
  selectedInstance,
  onSuccess,
}: Props) => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const config = useSelector((state: RootState) => state.smartPcConfig);

  const [drag, setDrag] = React.useState({ x: 0, y: 0 });

  const [getEstimate, { data: estimateData, isLoading: isEstimating }] =
    useGetEstimateMutation();

  const showConfirmation = useBoolean();

  const [resizeSubmitting, setResizeSubmitting] = useState(false);

  const [loadingExisting, setLoadingExisting] = useState(false);
  const [existingData, setExistingData] = useState<ResizeInitial | undefined>(
    undefined
  );

  const existingCPU = existingData?.configId || "";
  const existingStorage = isStorageOnly ? existingData?.storage || "" : "";

  const disableAction = isEstimating || loadingExisting || resizeSubmitting;

  const pcIsStopped =
    isResize && selectedInstance?.state?.toLowerCase() === "stopped";
  const pcIsRunning =
    isResize && selectedInstance?.state?.toLowerCase() === "running";

  // ------ React Hook Form ------
  const defaultValues: Partial<FormValues> = useMemo(
    () => ({
      pcName: "",
      operatingSystem: config.operatingSystem || osOptions[0].value || "",
      cpu: config.cpu || cpuOptions[osOptions[0].value][0].value || "",
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

  const { reset, watch, trigger } = methods;

  const values = watch();
  const { billingPlan, cpu, region, storage } = values;

  // Disable STORAGE-only submit when no change
  const isNoStorageChange = useMemo(
    () => storage === existingStorage,
    [existingStorage, storage]
  );

  // Disable CPU-resize submit when no CPU change
  const isNoResizeChange = useMemo(
    () => cpu === existingCPU,
    [existingCPU, cpu]
  );

  // Plan check: CPU resize uses isPlanBlocked; storage increase has its own guard
  const isPlanBlocked = useMemo(
    // CPU resize (hourly only)
    () => isResize && billingPlan !== "hourly",
    [isResize, billingPlan]
  );

  // estimate
  useEffect(() => {
    fetchEstimate({
      methods,
      getEstimate,
      toast,
      showError: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpu, storage, region]);

  const handleEstimate = async () =>
    await fetchEstimate({
      methods,
      getEstimate,
      toast,
    });

  // ------ Load existing data for resize ------
  useEffect(() => {
    (async () => {
      if (!isResize || !open) return;

      setLoadingExisting(true);
      try {
        const res = await fetch(`${RESIZE_API_URL}/resize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            computerName: selectedInstance?.systemName,
          }),
        });

        const json = await res.json();
        const src = json?.data ?? json;

        if (!src) return;

        const currentLinuxCategory = inferLinuxCategoryFromConfigId(
          src.configId
        );

        setExistingData(src);

        reset({
          pcName: src.computerName ?? selectedInstance?.systemName,
          operatingSystem: src.operatingSystem ?? "Linux",
          cpu: src.configId ?? "",
          region: src.location ?? "us-east-1",
          billingPlan: src.billingPlan,
          storage: src?.storage ?? "",
          linuxCategory:
            src.operatingSystem === "Linux"
              ? currentLinuxCategory
              : "Ubuntu_24.04_LTS_X64",
        });
      } catch (e) {
        console.error("Failed to load existing PC config for resize:", e);
        toast({
          title: "Unable to load PC details",
          description: "We couldn't prefill the current configuration.",
          variant: "destructive",
        });
      } finally {
        setLoadingExisting(false);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResize, open]);

  /* ----- resize flows ----- */
  async function handleResizeSubmit() {
    if (!selectedInstance?.systemName) {
      toast({
        title: "Error",
        description: "No instance selected for resize.",
        variant: "destructive",
      });
      return;
    }

    setResizeSubmitting(true);

    try {
      if (isStorageOnly) {
        await handleConfirmStorageIncrease(storage);
      } else {
        await handleConfirmPCResize(cpu);
      }
    } catch (error) {
      console.error("Resize operation failed:", error);
    } finally {
      setResizeSubmitting(false);
    }
  }

  const handleConfirmPCResize = async (cpu: string) => {
    try {
      const valid = await trigger(["cpu"]);
      if (!valid) return;

      await makeResizeRequest(`${RESIZE_API_URL}/resize`, {
        userId,
        computerName: selectedInstance?.systemName,
        targetConfigId: cpu,
      });

      toast({
        title: "Resize submitted",
        description: `${selectedInstance?.systemName} is updating its CPU & Memory. It does not take more than 60 seconds.`,
      });

      onSuccess();
      closeDialog();
    } catch (error: any) {
      console.error("CPU resize failed:", error);
      toast({
        title: "Resize failed",
        description:
          error.message || "Failed to resize this PC. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmStorageIncrease = async (storage: string) => {
    try {
      const valid = await trigger(["storage"]);
      if (!valid) return;

      const validation = validateStorageIncrease(existingStorage, storage);
      if (!validation.valid) {
        toast({
          title: validation.error!,
          description: validation.description!,
          variant: "destructive",
        });
        return;
      }

      const newVolumeSizeGiB = parseInt(storage, 10);

      await makeResizeRequest(`${RESIZE_API_URL}/increase-volume`, {
        userId,
        computerName: selectedInstance?.systemName,
        newVolumeSizeGiB,
      });

      toast({
        title: "Storage increase submitted",
        description: `${selectedInstance?.systemName} storage is being increased to ${newVolumeSizeGiB} GiB.`,
      });

      onSuccess();
      closeDialog();
    } catch (error: any) {
      console.error("Storage increase failed:", error);
      toast({
        title: "Storage increase failed",
        description:
          error.message || "Failed to increase volume (SSD). Please try again.",
        variant: "destructive",
      });
    }
  };

  // Close dialog
  const closeDialog = useCallback(() => {
    reset();
    onClose();
    setExistingData(undefined);
    setDrag({ x: 0, y: 0 });
    dispatch(clearSmartPcConfig());
  }, [reset, onClose, dispatch]);

  return (
    <>
      <Dialog
        open={isResize ? open : open && !showConfirmation.value}
        onOpenChange={closeDialog}
      >
        <DialogContent
          key={isResize ? "resize" : "build"}
          style={{
            transform: `translate(calc(-50% + ${drag.x}px), calc(-50% + ${drag.y}px))`,
          }}
          className="sm:max-w-[760px] max-h-[95vh] overflow-hidden p-0"
        >
          {/* Header (drag handle) */}
          <SmartPcConfigDialogHeader
            drag={drag}
            setDrag={setDrag}
            isResize={isResize}
            isStorageOnly={isStorageOnly}
          />

          {/* Body (scrollable); footer is outside to avoid covering Billing */}
          <div
            className="grid gap-6 px-6 pt-6 pb-40 md:grid-cols-12 max-h-[calc(95vh-64px)] overflow-y-auto"
            data-cancel-drag
          >
            {/* LEFT: FORM */}
            <SmartPcConfigForm
              methods={methods}
              isResize={isResize}
              isStorageOnly={isStorageOnly}
              existingCPU={existingCPU}
              existingStorage={existingStorage}
              existingData={existingData}
              loadingExisting={loadingExisting}
            />

            {/* RIGHT: SUMMARY */}
            <CostSummary
              isResize={isResize}
              billingPlan={billingPlan}
              handleEstimate={handleEstimate}
              estimateData={estimateData}
              isEstimating={isEstimating}
            />
          </div>

          {/* Sticky footer */}
          <div
            className="sticky bottom-0 inset-x-0 border-t bg-background px-6 py-4"
            data-cancel-drag
          >
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={closeDialog}
                disabled={loadingExisting}
              >
                Cancel
              </Button>

              {!isResize && (
                <Button
                  onClick={handleEstimate}
                  disabled={disableAction}
                  variant="secondary"
                >
                  {isEstimating ? "Estimating..." : "Estimate"}
                </Button>
              )}

              {isResize ? (
                <Button
                  disabled={
                    disableAction ||
                    isPlanBlocked ||
                    (isStorageOnly ? isNoStorageChange : isNoResizeChange) ||
                    (!isStorageOnly && !pcIsStopped) || // CPU: must be hourly AND stopped
                    (isStorageOnly && !pcIsRunning) // Storage: must be hourly AND running
                  }
                  onClick={handleResizeSubmit}
                >
                  {isStorageOnly
                    ? isNoStorageChange
                      ? "No Changes to Apply"
                      : "Apply Storage Increase"
                    : isNoResizeChange
                    ? "No Changes to Apply"
                    : "Apply CPU Resize"}
                </Button>
              ) : (
                <Button
                  disabled={disableAction}
                  onClick={async () => {
                    const valid = await trigger();
                    if (!valid) return;
                    showConfirmation.onTrue();
                  }}
                >
                  Build PC
                </Button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase confirmation (create only) */}
      <ConfirmPurchaseDialog
        open={showConfirmation.value}
        onClose={showConfirmation.onFalse}
        methods={methods}
        estimateData={estimateData}
        isEstimating={isEstimating}
        onSuccess={() => {
          onSuccess();
          closeDialog();
        }}
      />
    </>
  );
};

export default SmartPCConfigDialog;
