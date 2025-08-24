"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { formSchema, FormValues } from "../schema";
import {
  cpuOptions,
  locationOptions,
  osOptions,
  storageOptions,
} from "../data";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetEstimateMutation } from "@/api/fileManagerAPI";
import { clearSmartPcConfig } from "@/redux/slices/build-pc/smart-pc-config-slice";
import { fetchEstimate } from "../api/fetch-estimate";
import { ResizeInitial, SmartPCConfigDialogProps } from "../types";
import { inferLinuxCategoryFromConfigId } from "../utils";
import ConfirmPurchaseDialog from "./confirm-purchase-dialog";
import { useBoolean } from "@/hooks/use-boolean";
import CostSummary from "./cost-summary";
import SmartPcConfigForm from "./smart-pc-config-form";
import SmartPcConfigDialogHeader from "./smart-pc-config-dialog-header";

interface ExtendedProps extends SmartPCConfigDialogProps {
  isStorageOnly?: boolean;
  onConfirmStorage?: (draft: { storage: string }) => Promise<boolean> | boolean;
  pcIsRunning?: boolean;
  pcIsStopped?: boolean;
}

const SmartPCConfigDialog = ({
  showNewPCDialog,
  setShowNewPCDialog,
  mode = "create",
  onConfirm,
  loadExisting,
  isStorageOnly = false,
  onConfirmStorage,
  pcIsRunning = false,
  pcIsStopped = false,
}: ExtendedProps) => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const isResize = mode === "resize";

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

  const existingCPU = existingData?.cpu || "";
  const existingStorage = isStorageOnly ? "" : existingData?.storage || "";

  const disableAction = isEstimating || loadingExisting || resizeSubmitting;

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
      if (!isResize || !showNewPCDialog || !loadExisting) return;

      setLoadingExisting(true);
      try {
        const src: ResizeInitial | undefined = await loadExisting();
        if (!src) return;

        const currentLinuxCategory = inferLinuxCategoryFromConfigId(src.cpu);

        setExistingData(src);

        reset({
          pcName: src?.pcName,
          operatingSystem: src?.operatingSystem,
          cpu: src?.cpu,
          storage: src?.storage,
          region: src?.region,
          billingPlan: src?.billingPlan,
          linuxCategory:
            src?.operatingSystem === "Linux"
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
  }, [isResize, showNewPCDialog, loadExisting]);

  /* ----- resize flows ----- */
  async function handleResizeSubmit() {
    try {
      setResizeSubmitting(true);

      // STORAGE-ONLY MODE
      if (isStorageOnly) {
        const valid = await trigger(["storage"]);
        if (!valid) return;

        if (existingStorage) {
          const prev = parseInt(existingStorage, 10);
          const next = parseInt(storage, 10);
          if (isNaN(next)) {
            toast({
              title: "Invalid size",
              description: "Please choose a valid storage size.",
              variant: "destructive",
            });
            return;
          }
          if (next < prev) {
            toast({
              title: "Storage cannot be decreased",
              description:
                "Choose a size equal to or larger than the current storage.",
              variant: "destructive",
            });
            return;
          }
          if (next === prev) {
            toast({
              title: "No change detected",
              description:
                "Choose a larger storage size to apply the increase.",
              variant: "destructive",
            });
            return;
          }
        }

        const ok = await onConfirmStorage?.({ storage });
        if (ok) {
          reset();
          setShowNewPCDialog(false);
        }
      } else {
        // CPU-RESIZE MODE
        const valid = await trigger(["cpu"]);
        if (!valid) return;

        const ok = await onConfirm?.({ cpu });
        if (ok) {
          reset();
          setShowNewPCDialog(false);
        }
      }
    } catch (error) {
      console.error("Resize submit failed:", error);
      toast({
        title: "Something went wrong",
        description: "We couldn't apply your changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResizeSubmitting(false);
    }
  }

  /* ----- cleanup ----- */
  React.useEffect(() => {
    if (!showNewPCDialog) {
      setExistingData(undefined);
      setDrag({ x: 0, y: 0 });
      dispatch(clearSmartPcConfig());
    }
  }, [showNewPCDialog, dispatch]);

  return (
    <>
      <Dialog
        open={
          isResize
            ? showNewPCDialog
            : showNewPCDialog && !showConfirmation.value
        }
        onOpenChange={setShowNewPCDialog}
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
                onClick={() => setShowNewPCDialog(false)}
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
                  onClick={async (e) => {
                    e.preventDefault();
                    await handleResizeSubmit();
                  }}
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
          reset();
          setShowNewPCDialog(false);
        }}
      />
    </>
  );
};

export default SmartPCConfigDialog;
