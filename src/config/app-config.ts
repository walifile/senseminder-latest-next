function requireEnvVar(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const ENV_VARS = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_CURRENT_ENVIRONMENT: process.env.NEXT_PUBLIC_CURRENT_ENVIRONMENT,

  // Missing Ones
  RESIZE_API_URL: process.env.NEXT_PUBLIC_RESIZE_API_URL,

  // Authentication
  AUTH_REDIRECT_URL: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL,
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  OAUTH_DOMAIN: process.env.NEXT_PUBLIC_OAUTH_DOMAIN,
  USER_POOL_CLIENT_ID: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
  USER_POOL_ID: process.env.NEXT_PUBLIC_USER_POOL_ID,

  // API URLs
  BASE_URL: process.env.NEXT_PUBLIC_BASE_API_URL,
  ASSIGN_API_URL: process.env.NEXT_PUBLIC_ASSIGN_API_URL,
  BILLING_API_URL: process.env.NEXT_PUBLIC_BILLING_API_URL,
  CONTACT_URL: process.env.NEXT_PUBLIC_CONTACT_URL,
  ESTIMATION_URL: process.env.NEXT_PUBLIC_ESTIMATION_URL,
  FETCH_PC_URL: process.env.NEXT_PUBLIC_FETCH_PC_URL,
  FEEDBACK_API_URL: process.env.NEXT_PUBLIC_FEEDBACK_API_URL,
  FEEDBACK_TRIGGER_API_URL: process.env.NEXT_PUBLIC_FEEDBACK_TRIGGER_API_URL,

  // VM Management URLs
  VM_MANAGEMENT_URL: process.env.NEXT_PUBLIC_VM_MANAGEMENT_URL,
  VM_VALIDATE_SESSION_URL: process.env.NEXT_PUBLIC_VM_VALIDATE_SESSION_URL,
  VM_SESSION_URL: process.env.NEXT_PUBLIC_VM_SESSION_URL,
  VM_STOP_SESSION_URL: process.env.NEXT_PUBLIC_VM_STOP_SESSION_URL,
  VM_EXTEND_SESSION_URL: process.env.NEXT_PUBLIC_VM_EXTEND_SESSION_URL,
  VM_SCHEDULES_URL: process.env.NEXT_PUBLIC_VM_SCHEDULES_URL,
  SAVE_VM_SCHEDULE_URL: process.env.NEXT_PUBLIC_SAVE_VM_SCHEDULE_URL,

  // User & Profile APIs
  FIRST_TIME_TOKEN_URL: process.env.NEXT_PUBLIC_FIRST_TIME_TOKEN_URL,
  PROFILE_API_URL: process.env.NEXT_PUBLIC_PROFILE_API_URL,
  USER_MANAGEMENT_API: process.env.NEXT_PUBLIC_USER_MANAGEMENT_API,
  SECURITY_QUESTION_API: process.env.NEXT_PUBLIC_SECURITY_QUESTION_API,
  MFA_API_URL: process.env.NEXT_PUBLIC_MFA_API_URL,

  // Session & Client APIs
  CLIENT_SESSION_API: process.env.NEXT_PUBLIC_CLIENT_SESSION_API,
  IDLE_API_URL: process.env.NEXT_PUBLIC_IDLE_API_URL,
  INSTANCE_DETAILS_URL: process.env.NEXT_PUBLIC_INSTANCE_DETAILS_URL,

  // External Services
  LEGAL_DOCUMENTS_URL: process.env.NEXT_PUBLIC_LEGAL_DOCUMENTS_URL,
  NEWSLETTER_API_URL: process.env.NEXT_PUBLIC_NEWSLETTER_API_URL,
  SUPPORT_API_BASE: process.env.NEXT_PUBLIC_SUPPORT_API_BASE,
  NOTIFICATION_API: process.env.NEXT_PUBLIC_NOTIFICATION_API,
  WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL,

  // Smart PC Config
  SMART_PC_CONFIG_URL: process.env.NEXT_PUBLIC_SMART_PC_CONFIG_URL,

  // IP & Location Services
  IPIFY_URL: process.env.NEXT_PUBLIC_IPIFY_URL,
  PROMO_API_URL: process.env.NEXT_PUBLIC_PROMO_API_URL,

  // Stripe
  STRIPE_PK: process.env.NEXT_PUBLIC_STRIPE_PK,
} as const;

const requiredAppConfig = Object.fromEntries(
  Object.entries(ENV_VARS).map(([key, value]) => [
    key,
    requireEnvVar(value, key),
  ]),
) as {
  [K in keyof typeof ENV_VARS]: string;
};

const serverEnv = {
  // TODO: keep server-side when backend env is fixed
  PING_API_URL: process.env.NEXT_PUBLIC_PING_API_URL ?? "",
  PING_API_KEY: process.env.NEXT_PUBLIC_PING_API_KEY ?? "",
  IPINFO_URL: process.env.NEXT_PUBLIC_IPINFO_URL ?? "",
  IPINFO_TOKEN: process.env.NEXT_PUBLIC_IPINFO_TOKEN ?? "",
};

const appConfig = {
  ...requiredAppConfig,
  ...serverEnv,
};

export default appConfig;
