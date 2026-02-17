"use client";

import type { RootState } from "@/redux/store";
import type { UseFormReturn } from "react-hook-form";

import React, { useState, useCallback } from "react";
import { useCreateVMMutation } from "@/api/vmManagement";
import { FEEDBACK_TRIGGERS } from "@/constants/app-constants";
import { useListRemoteDesktopQuery } from "@/api/fileManagerAPI";

import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

import { useSelector } from "react-redux";

import { useToast } from "@/hooks/use-toast";
import { useFeedback } from "@/hooks/use-feedback";

import { formatUsd, isFiniteNumber } from "../utils";

import type { FormValues } from "../schema";

type Props = {
  open: boolean;
  onClose: () => void;
  methods: UseFormReturn<FormValues>;
  estimateData: {
    total: {
      pricePerHour?: number;
      pricePerDay?: number;
      pricePerMonth?: number;
    };
  };
  isEstimating: boolean;
  onSuccess: () => void;
};

const ConfirmPurchaseDialog = ({
  open,
  onClose,
  methods,
  estimateData,
  isEstimating,
  onSuccess,
}: Props) => {
  const { toast } = useToast();
  const { triggerFeedback } = useFeedback();
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const [acceptConfirmed, setAcceptConfirmed] = useState(false);

  const [createVM, { isLoading: isCreating }] = useCreateVMMutation();
  const { refetch: refetchRemoteDesktops } = useListRemoteDesktopQuery({
    userId,
  });

  const { watch, handleSubmit } = methods;

  const values = watch();
  const { billingPlan } = values;

  /* ----- submit flows ----- */
  const onSubmit = handleSubmit(async (form: FormValues) => {
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

      void triggerFeedback({
        trigger: FEEDBACK_TRIGGERS.PC_ACTION,
        delayMinutes: 0,
      });

      onSuccess();
      closeDialog();
    } catch (err) {
      toast({
        title: "Failed to Create Computer",
        description: getErrorMessage(
          err,
          "Something went wrong. Please try again or contact support."
        ),
        variant: "destructive",
      });
    }
  });

  /* ----- estimate helpers ----- */
  const getFormattedTotalPrice = () => {
    if (isEstimating || !estimateData?.total) return "...";
    const price =
      billingPlan === "hourly"
        ? estimateData.total.pricePerHour
        : billingPlan === "daily"
        ? estimateData.total.pricePerDay
        : estimateData.total.pricePerMonth;
    if (!isFiniteNumber(price)) return "-";
    const suffix =
      billingPlan === "hourly"
        ? "/hour"
        : billingPlan === "daily"
        ? "/day"
        : "/month";
    return `${formatUsd(price, 2)} ${suffix}`;
  };

  const closeDialog = useCallback(() => {
    setAcceptConfirmed(false);
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Your Purchase</DialogTitle>
          <DialogDescription>
            You are about to be charged upfront for this Computer based on your
            selected plan.
            <br />
            <span
              className="mt-2 inline-block text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md"
              data-testid="sensepc-estimated-total"
            >
              Estimated total: {getFormattedTotalPrice()}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex items-start gap-2">
          <input
            type="checkbox"
            id="purchase-confirm-check"
            checked={acceptConfirmed}
            onChange={(e) => setAcceptConfirmed(e.target.checked)}
            className="mt-1 h-4 w-4 border rounded"
            data-testid="sensepc-acknowledge-checkbox"
          />
          <label
            htmlFor="purchase-confirm-check"
            className="text-sm text-muted-foreground leading-snug"
          >
            I acknowledge and accept the above statement.
          </label>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isCreating || !acceptConfirmed}
            onClick={onSubmit}
            data-testid="sensepc-confirm-pay-button"
          >
            {isCreating ? "Processing..." : "Confirm & Pay"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmPurchaseDialog;
