"use client";

import type { RootState } from "@/redux/store";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { routes, publicRoutes } from "@/constants/routes";
import { setUser, setLoading } from "@/redux/slices/auth/auth-slice";

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

  const isPublicRoute = publicRoutes.includes(pathname);

  const initializeAuth = async () => {
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
        })
      );
    } catch (error) {
      console.error("Auth initialization error:", error);
      await handleSignOut();
      if (!isPublicRoute) {
        router.replace(routes.auth);
      }
    } finally {
      dispatch(setLoading(false));
      setInitialized(true);
    }
  };

  useEffect(() => {
    if (!initialized) {
      initializeAuth();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isPublicRoute && (!initialized || !isAuthenticated)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/10 dark:bg-black/10 backdrop-blur-sm z-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return <>{children}</>;
}
