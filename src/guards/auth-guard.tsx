"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setLoading } from "@/redux/slices/auth/auth-slice";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import { getUserAttributes, handleSignOut } from "@/lib/services/auth";
import { Loader2 } from "lucide-react";
import { publicRoutes, routes } from "@/constants/routes";
import { usePathname, useRouter } from "next/navigation";
import { RootState } from "@/redux/store";

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

  if (!initialized || (!isPublicRoute && !isAuthenticated)) {
    return (
      <div className="flex items-center justify-center bg-gray-100 dark:bg-[#0A0A1B] px-4 min-h-screen">
        <div className="w-full max-w-md bg-white dark:bg-[#111827] p-8 rounded-2xl shadow-lg text-center space-y-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Completing Sign In
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please wait while we verify your credentials...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
