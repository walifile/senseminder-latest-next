export const routes = {
  home: "/",
  auth: "/auth",
  signIn: "/auth",
  signUp: "/auth/sign-up",
  verifyOTP: "/auth/verify-otp",
  resetPassword: "/auth/reset-password",
  forgotPassword: "/auth/forgot-password",
  dashboard: "/dashboard/smart-pc",
  callback: "/auth/callback",
  smartStorage: "/smart-storage",
  buildPc: "/build-smartpc",
  pcViewer: "/pc-viewer",
};

export const publicRoutes: string[] = [
  routes.home,
  routes.signIn,
  routes.signUp,
  routes.forgotPassword,
  routes.resetPassword,
  routes.verifyOTP,
  routes.callback,
  routes.smartStorage,
  routes.buildPc,
  "/login",
  "/index",
];
