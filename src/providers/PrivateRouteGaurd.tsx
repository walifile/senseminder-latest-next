"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const publicRoutes = [
  "/login",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
  "/auth/callback",
  "/",
];
interface RootState {
  auth: {
    isAuthenticated: boolean;
  };
}

const PrivateRouteGuard = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const isPublicRoute = () => {
    if (typeof window !== "undefined") {
      return publicRoutes.some(
        (route) =>
          window.location.pathname === route ||
          window.location.pathname === `${route}/`
      );
    }
    return false;
  };

  useEffect(() => {
    if (!isAuthenticated && !isPublicRoute()) {
      const currentPath = window.location.pathname;
      // Use replace instead of push to prevent back navigation
      window.location.replace(`/login?from=${currentPath}`);
    }
  }, [isAuthenticated, pathname]);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      if (!isAuthenticated && !isPublicRoute()) {
        // Clear history state on unmount
        window.history.replaceState(null, "", "/login");
      }
    };
  }, [isAuthenticated]);

  return isPublicRoute() || isAuthenticated ? children : null;
};

export default PrivateRouteGuard;
