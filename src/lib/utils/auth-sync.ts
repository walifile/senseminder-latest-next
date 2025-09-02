import { setCookie, deleteCookie } from "cookies-next";

export const syncAuthState = (
  isAuthenticated: boolean,
  token: string | null
) => {
  if (isAuthenticated && token) {
    setCookie("auth.state", JSON.stringify({ isAuthenticated, token }), {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  } else {
    deleteCookie("auth.state");
  }
};
