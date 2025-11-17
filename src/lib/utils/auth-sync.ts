import appConfig from "@/config/app-config";

import { setCookie, deleteCookie } from "cookies-next";

const { NODE_ENV } = appConfig;

export const syncAuthState = (
  isAuthenticated: boolean,
  token: string | null
) => {
  if (isAuthenticated && token) {
    setCookie("auth.state", JSON.stringify({ isAuthenticated, token }), {
      path: "/",
      secure: NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
  } else {
    deleteCookie("auth.state", { path: "/" });
  }
};
