function requireEnvVar(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const appConfig = {
  CURRENT_ENVIRONMENT: requireEnvVar(
    process.env.NEXT_PUBLIC_CURRENT_ENVIRONMENT,
    "NEXT_PUBLIC_CURRENT_ENVIRONMENT"
  ),

  // Authentication
  AUTH_REDIRECT_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL,
    "NEXT_PUBLIC_AUTH_REDIRECT_URL"
  ),
  GOOGLE_CLIENT_ID: requireEnvVar(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    "NEXT_PUBLIC_GOOGLE_CLIENT_ID"
  ),
  GOOGLE_CLIENT_SECRET: requireEnvVar(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
    "NEXT_PUBLIC_GOOGLE_CLIENT_SECRET"
  ),
  OAUTH_DOMAIN: requireEnvVar(
    process.env.NEXT_PUBLIC_OAUTH_DOMAIN,
    "NEXT_PUBLIC_OAUTH_DOMAIN"
  ),
  USER_POOL_CLIENT_ID: requireEnvVar(
    process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
    "NEXT_PUBLIC_USER_POOL_CLIENT_ID"
  ),
  USER_POOL_ID: requireEnvVar(
    process.env.NEXT_PUBLIC_USER_POOL_ID,
    "NEXT_PUBLIC_USER_POOL_ID"
  ),

  // API URLs
  BASE_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_BASE_API_URL,
    "NEXT_PUBLIC_BASE_API_URL"
  ),
  ASSIGN_API_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_ASSIGN_API_URL,
    "NEXT_PUBLIC_ASSIGN_API_URL"
  ),
  BILLING_API_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_BILLING_API_URL,
    "NEXT_PUBLIC_BILLING_API_URL"
  ),
  CONTACT_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_CONTACT_URL,
    "NEXT_PUBLIC_CONTACT_URL"
  ),
  ESTIMATION_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_ESTIMATION_URL,
    "NEXT_PUBLIC_ESTIMATION_URL"
  ),
  FETCH_PC_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_FETCH_PC_URL,
    "NEXT_PUBLIC_FETCH_PC_URL"
  ),

  // VM Management URLs
  VM_MANAGEMENT_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_VM_MANAGEMENT_URL,
    "NEXT_PUBLIC_VM_MANAGEMENT_URL"
  ),
  VM_VALIDATE_SESSION_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_VM_VALIDATE_SESSION_URL,
    "NEXT_PUBLIC_VM_VALIDATE_SESSION_URL"
  ),
  VM_SESSION_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_VM_SESSION_URL,
    "NEXT_PUBLIC_VM_SESSION_URL"
  ),
  VM_STOP_SESSION_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_VM_STOP_SESSION_URL,
    "NEXT_PUBLIC_VM_STOP_SESSION_URL"
  ),
  VM_EXTEND_SESSION_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_VM_EXTEND_SESSION_URL,
    "NEXT_PUBLIC_VM_EXTEND_SESSION_URL"
  ),
  VM_SCHEDULES_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_VM_SCHEDULES_URL,
    "NEXT_PUBLIC_VM_SCHEDULES_URL"
  ),
  SAVE_VM_SCHEDULE_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_SAVE_VM_SCHEDULE_URL,
    "NEXT_PUBLIC_SAVE_VM_SCHEDULE_URL"
  ),

  // User & Profile APIs
  FIRST_TIME_TOKEN_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_FIRST_TIME_TOKEN_URL,
    "NEXT_PUBLIC_FIRST_TIME_TOKEN_URL"
  ),
  PROFILE_API_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_PROFILE_API_URL,
    "NEXT_PUBLIC_PROFILE_API_URL"
  ),
  USER_MANAGEMENT_API: requireEnvVar(
    process.env.NEXT_PUBLIC_USER_MANAGEMENT_API,
    "NEXT_PUBLIC_USER_MANAGEMENT_API"
  ),
  SECURITY_QUESTION_API: requireEnvVar(
    process.env.NEXT_PUBLIC_SECURITY_QUESTION_API,
    "NEXT_PUBLIC_SECURITY_QUESTION_API"
  ),
  MFA_API_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_MFA_API_URL,
    "NEXT_PUBLIC_MFA_API_URL"
  ),

  // Session & Client APIs
  CLIENT_SESSION_API: requireEnvVar(
    process.env.NEXT_PUBLIC_CLIENT_SESSION_API,
    "NEXT_PUBLIC_CLIENT_SESSION_API"
  ),
  IDLE_API_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_IDLE_API_URL,
    "NEXT_PUBLIC_IDLE_API_URL"
  ),
  INSTANCE_DETAILS_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_INSTANCE_DETAILS_URL,
    "NEXT_PUBLIC_INSTANCE_DETAILS_URL"
  ),

  // External Services
  LEGAL_DOCUMENTS_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_LEGAL_DOCUMENTS_URL,
    "NEXT_PUBLIC_LEGAL_DOCUMENTS_URL"
  ),
  NEWSLETTER_API_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_NEWSLETTER_API_URL,
    "NEXT_PUBLIC_NEWSLETTER_API_URL"
  ),
  SUPPORT_API_BASE: requireEnvVar(
    process.env.NEXT_PUBLIC_SUPPORT_API_BASE,
    "NEXT_PUBLIC_SUPPORT_API_BASE"
  ),
  NOTIFICATION_API: requireEnvVar(
    process.env.NEXT_PUBLIC_NOTIFICATION_API,
    "NEXT_PUBLIC_NOTIFICATION_API"
  ),
  WEBSOCKET_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_WEBSOCKET_URL,
    "NEXT_PUBLIC_WEBSOCKET_URL"
  ),

  // IP & Location Services
  IPIFY_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_IPIFY_URL,
    "NEXT_PUBLIC_IPIFY_URL"
  ),
  IPINFO_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_IPINFO_URL,
    "NEXT_PUBLIC_IPINFO_URL"
  ),
  STORAGE_PING_URL: requireEnvVar(
    process.env.NEXT_PUBLIC_STORAGE_PING_URL,
    "NEXT_PUBLIC_STORAGE_PING_URL"
  ),
} as const;

export default appConfig;
