"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";

import { Logger } from "@/lib/utils/logger";

const PREFETCH_IMAGES = [
  "/assets/svg/way-we-compute-icon.svg",
  "/assets/svg/future-of-computing-card-bg-dark.svg",
  "/assets/images/noise.png",
  "/assets/svg/get-started-cta-bottom.svg",
  "/assets/svg/get-started-cta-top.svg",
  "/assets/svg/rent-smarter-light.svg",
  "/assets/svg/rent-smarter-dark.svg",
];

export default function HomeClientEffects() {
  const router = useRouter();

  useEffect(() => {
    async function handleRedirect() {
      try {
        const { checkOnboarded } = await import("@/lib/utils/checkOnboarded");
        const onboarded = await checkOnboarded();
        if (onboarded === false) {
          router.replace(routes.welcome);
        }
      } catch (err) {
        Logger.error("Onboarding check failed:", err);
      }
    }

    handleRedirect();
  }, [router]);

  useEffect(() => {
    // Prefetch heavy landing-page visuals to smooth scroll-in rendering.
    const prefetch = () => {
      PREFETCH_IMAGES.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(prefetch, { timeout: 1500 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = setTimeout(prefetch, 200);
    return () => clearTimeout(timeoutId);
  }, []);

  return null;
}
