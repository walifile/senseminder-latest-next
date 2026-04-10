export const BUSINESS_INTENT_KEY = "businessSignupIntent";
export const BUSINESS_BILLING_PROMPT_SEEN_KEY = "businessBillingPromptSeen";

export const BUSINESS_SESSION_KEYS = [
  BUSINESS_BILLING_PROMPT_SEEN_KEY,
  "businessOrganizationName",
  "businessTeamSize",
  "businessTargetPcCount",
  "businessUseCase",
  "businessInviteEmails",
  "businessBillingPlan",
  "businessWalletAmount",
] as const;
