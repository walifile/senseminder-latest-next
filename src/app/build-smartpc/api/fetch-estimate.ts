import type { UseFormReturn } from "react-hook-form";

import type { FormValues } from "../schema";
import { Logger } from "@/lib/utils/logger";

interface ToastFunction {
  (options: {
    title: string;
    description: string;
    variant?: "default" | "destructive";
  }): void;
}

interface GetEstimateMutation {
  (params: { configId: string; storageSize: string; region: string }): {
    unwrap(): Promise<unknown>;
  };
}

interface FetchEstimateParams {
  methods: UseFormReturn<FormValues>;
  getEstimate: GetEstimateMutation;
  toast?: ToastFunction;
  showError?: boolean;
}

export const fetchEstimate = async ({
  methods,
  getEstimate,
  toast,
  showError = true,
}: FetchEstimateParams) => {
  const { trigger, getValues } = methods;

  const isValid = await trigger();
  if (!isValid) return;

  const values = getValues();

  try {
    await getEstimate({
      configId: values.cpu,
      storageSize: values.storage,
      region: values.region,
    }).unwrap();
  } catch (err) {
    Logger.error("Estimate error:", err);
    if (showError && toast) {
      toast({
        title: "Error",
        description: "Failed to fetch estimate",
        variant: "destructive",
      });
    }
  }
};
