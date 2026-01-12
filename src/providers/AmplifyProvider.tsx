"use client";

import { useEffect } from "react";
import { configureAmplify } from "@/config/amplify-config";

import { Logger } from "@/lib/utils/logger";

let isAmplifyConfigured = false;

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    Logger.log("typeof window L: " + typeof window);
    if (typeof window !== "undefined" && !isAmplifyConfigured) {
      configureAmplify();
      isAmplifyConfigured = true;
    }
  }, []);

  return <>{children}</>;
}
