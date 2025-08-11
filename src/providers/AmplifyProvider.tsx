"use client";
import { useEffect, useState } from "react";
import { configureAmplify } from "@/config/amplify-config";

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    console.log("typeof window L: " + typeof window);
    if (typeof window !== "undefined" && !isConfigured) {
      configureAmplify();
      setIsConfigured(true);
    }
  }, [isConfigured]);

  if (!isConfigured) {
    return null;
  }

  return <>{children}</>;
}
