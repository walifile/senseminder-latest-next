import { z } from "zod";

export const signupSchema = z
  .object({
    firstName: z.string().optional(),
    // firstName: z.string().min(1, "First name is required"),
    // lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    // countryCode: z.string(),
    // phoneNumber: z.string().min(1, "Phone number is required"),
    // cellphone: z.string(),
    // organizationName: z.string().min(1, "Organization name is required"),
    // country: z.string().min(1, "Country is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/,
        "Password must include at least one uppercase letter and one special character"
      ),
    confirmPassword: z.string().min(8, "Confirm password is required"),
    isMFAEnabled: z.boolean().optional(),
    authenticator: z.string().optional(),
    otp: z.string().optional(),
    isPaymentEnabled: z.boolean().optional(),
    paymentMethod: z.string().optional(),
    cardNumber: z.string().optional(),
    expirationDate: z.string().optional(),
    cvv: z.string().optional(),
    billingAddress: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Show error on confirmPassword field
  })
  .refine((data) => !data.isPaymentEnabled || data.paymentMethod, {
    message: "Required",
    path: ["paymentMethod"],
  })
  .refine((data) => !data.isPaymentEnabled || data.expirationDate, {
    message: "Required",
    path: ["expirationDate"],
  })
  .refine((data) => !data.isPaymentEnabled || data.cardNumber, {
    message: "Required",
    path: ["cardNumber"],
  })
  .refine((data) => !data.isPaymentEnabled || data.cvv, {
    message: "Required",
    path: ["cvv"],
  })
  .refine((data) => !data.isPaymentEnabled || data.cvv, {
    message: "Required",
    path: ["billingAddress"],
  })
  .refine((data) => !data.isMFAEnabled || data.authenticator, {
    message: "Required",
    path: ["authenticator"],
  })
  .refine((data) => !data.isMFAEnabled || data.otp, {
    message: "Required",
    path: ["otp"],
  });

export const signinValidationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password Required"),
  rememberMe: z.array(z.string()).optional(),
});

export const configFormSchema = z.object({
  operatingSystem: z.string().min(1, "Operating System is required"),
  systemName: z.string().min(1, "System Name is required"),
  machineType: z.string().min(1, "Machine Type is required"),
  storageSize: z.string().min(1, "Storage Size is required"),
  region: z.string().min(1, "Region is required"),
  preInstalledSoftware: z.string().optional(),
});

export const idleTimeoutSettingsFormSchema = z.object({
  smartPC: z.string().min(1, "SmartPC selection is required"),
  timeoutDuration: z.string().min(1, "Timeout duration is required"),
  enableAutoStop: z.boolean(),
  enableNotifications: z.boolean(),
  includeKeepActive: z.boolean(),
});

export const settingsFormSchema = z.object({
  bandwidthUsage: z.string().min(1, "Bandwidth usage is required"),
  enableHighQuality: z.boolean(),
  cpuUsageAlerts: z.boolean(),
  schedulingUpdates: z.boolean(),
  idleTimeoutWarnings: z.boolean(),
  email: z
    .string()
    .refine((val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Please enter a valid email address",
    }),
  phone: z.string().refine((val) => val === "" || /^\d{12}$/.test(val), {
    message: "Please enter a valid phone number",
  }),
  darkMode: z.boolean(),
  idleTimeout: z.string().min(1, "Idle timeout is required"),
  defaultTimeZone: z.string().min(1, "Time zone is required"),
  enableRecurring: z.boolean(),
  selectedColor: z.string(),
});

export const SchedulingformSchema = z.object({
  // smartPC: z.string({
  //   required_error: "Please select a SmartPC",
  // }),
  timeZone: z.string({
    required_error: "Please select a timezone",
  }),
  startTime: z.date({
    required_error: "Please select a start date",
  }),
  stopTime: z.date({
    required_error: "Please select a stop date",
  }),
  recurrence: z.string({
    required_error: "Please select recurrence",
  }),
});

export type SignupFormValuesType = z.infer<typeof signupSchema>;
export type SignInFormValuesType = z.infer<typeof signinValidationSchema>;
export type ConfigFormValues = z.infer<typeof configFormSchema>;
export type IdleTimeoutSettingsFormValues = z.infer<
  typeof idleTimeoutSettingsFormSchema
>;
export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
export type SchedulingFormValues = z.infer<typeof SchedulingformSchema>;
