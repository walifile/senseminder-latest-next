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
      sameSite: "strict",
    });
  } else {
    deleteCookie("auth.state");
  }
};
