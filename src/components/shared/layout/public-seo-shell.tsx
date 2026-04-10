"use client";

import type { ReactNode } from "react";

import { useEffect } from "react";
import { ReduxProvider } from "@/redux/provider";
import { configureAmplify } from "@/config/amplify-config";
import { setUser, clearAuth, setLoading } from "@/redux/slices/auth/auth-slice";

import { Logger } from "@/lib/utils/logger";

import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";

import { useDispatch } from "react-redux";

import { getUserAttributes } from "@/lib/services/auth";

import Footer from "@/components/shared/layout/footer";
import Navbar from "@/components/shared/layout/navbar";
import { ThemeWrapper } from "@/components/shared/layout/theme-wrapper";
import AnnouncementBar from "@/components/shared/announcement/announcement-bar";

function PublicSeoAuthBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        configureAmplify();
        dispatch(setLoading(true));

        const currentUser = await getCurrentUser();
        if (!currentUser) {
          throw new Error("No user");
        }

        const session = await fetchAuthSession();
        if (!session?.tokens?.idToken) {
          throw new Error("Invalid session");
        }

        const userInfo = await getUserAttributes();
        if (!userInfo || !isMounted) {
          throw new Error("No user info");
        }

        dispatch(
          setUser({
            user: userInfo.userData,
            token: userInfo.token || "",
          }),
        );
      } catch (error) {
        if (isMounted) {
          dispatch(clearAuth());
        }
        Logger.warn("Public auth bootstrap skipped:", error);
      } finally {
        if (isMounted) {
          dispatch(setLoading(false));
        }
      }
    };

    void initAuth();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return null;
}

export default function PublicSeoShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ReduxProvider persist={false}>
      <ThemeWrapper>
        <PublicSeoAuthBootstrap />
        <div className="flex min-h-screen flex-col">
          <AnnouncementBar />
          <Navbar seoMode />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </ThemeWrapper>
    </ReduxProvider>
  );
}
