"use client";

import type { RootState } from "@/redux/store";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { routes, publicRoutes } from "@/constants/routes";
import { setUser, setLoading } from "@/redux/slices/auth/auth-slice";

import { Logger } from "@/lib/utils/logger";

import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";

import { useDispatch, useSelector } from "react-redux";

import { Loader2 } from "lucide-react";

import { handleSignOut, getUserAttributes } from "@/lib/services/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthProviderProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [initialized, setInitialized] = useState(false);
  const isLanding = pathname === "/";
  const isAuthRoute = pathname.startsWith("/auth");

  // Treat entries ending with "/" as prefixes, except the root "/".
  const isPublicRoute = publicRoutes.some(
    (r) =>
      pathname === r ||
      (r !== "/" && r.endsWith("/") && pathname.startsWith(r)),
  );
  const shouldSkipInitialization = isLanding || isAuthRoute;

  const initializeAuth = useCallback(async () => {
    try {
      dispatch(setLoading(true));

      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error("No user");

      const session = await fetchAuthSession();
      if (!session?.tokens?.idToken) throw new Error("Invalid session");

      const userInfo = await getUserAttributes();
      if (!userInfo) throw new Error("No user info");

      dispatch(
        setUser({
          user: userInfo.userData,
          token: userInfo.token || "",
        }),
      );
    } catch (error) {
      Logger.error("Auth initialization error:", error);
      if (!isPublicRoute) {
        await handleSignOut();
        router.replace(routes.auth);
      }
    } finally {
      dispatch(setLoading(false));
      setInitialized(true);
    }
  }, [dispatch, isPublicRoute, router]);

  useEffect(() => {
    if (shouldSkipInitialization) {
      setInitialized(true);
      dispatch(setLoading(false));
      return;
    }

    if (!initialized) {
      void initializeAuth();
    }
  }, [dispatch, initializeAuth, initialized, shouldSkipInitialization]);

  useEffect(() => {
    if (initialized && !isAuthenticated && !isPublicRoute) {
      router.replace(routes.auth);
    }
  }, [initialized, isAuthenticated, isPublicRoute, router]);

  if (!isPublicRoute && (!initialized || !isAuthenticated)) {
    if (initialized && !isAuthenticated) return null;
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/10 dark:bg-black/10 backdrop-blur-sm z-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return <>{children}</>;
}
