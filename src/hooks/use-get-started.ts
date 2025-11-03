"use client";

/* eslint-disable perfectionist/sort-imports */

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import { routes } from "@/constants/routes";
import { selectIsAuthenticated } from "@/redux/slices/auth/auth-slice";

/**
 * Returns a stable handler that routes the user to the right place when
 * clicking “Get Started”. If unauthenticated, goes to Sign Up; otherwise to Dashboard.
 */
export function useGetStartedNav() {
  const router = useRouter();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return useCallback(() => {
    if (!isAuthenticated) router.push(routes.signUp);
    else router.push(routes.dashboard);
  }, [isAuthenticated, router]);
}

/**
 * Stateless helper if you already know auth state and have a router.
 */
export function navigateGetStarted(
  router: { push: (href: string) => void },
  isAuthenticated: boolean
) {
  if (!isAuthenticated) router.push(routes.signUp);
  else router.push(routes.dashboard);
}

/**
 * Build PC entry: if authenticated, go to Dashboard; otherwise go to Build PC flow.
 */
export function useBuildPcNav() {
  const router = useRouter();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return useCallback(() => {
    router.push(isAuthenticated ? routes.dashboard : routes.buildPc);
  }, [isAuthenticated, router]);
}

export function navigateBuildPc(
  router: { push: (href: string) => void },
  isAuthenticated: boolean
) {
  router.push(isAuthenticated ? routes.dashboard : routes.buildPc);
}
