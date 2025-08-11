import { z } from "zod";

// Define a base schema for the common fields
export const baseFormSchema = z.object({
  operatingSystem: z.string().min(1, "Operating system is required"),
  cpu: z.string().min(1, "CPU selection is required"),
  storage: z.string().min(1, "Storage selection is required"),
  region: z.string().min(1, "Region is required"),
});

export const formSchema = baseFormSchema.extend({
  pcName: z
    .string()
    .min(1, "PC name is required")
    .max(50, "PC name must be at most 50 characters")
    .regex(
      /^(?![_-])(?!.*[_-]{2})[A-Za-z0-9_-]+(?<![_-])$/,
      "PC name can only contain letters, numbers, dash (-), underscore (_), and no spaces or consecutive special characters"
    ),
  billingPlan: z.string().min(1, "Billing plan is required"),
});

export type FormValues = z.infer<typeof formSchema>;

export type BaseFormValues = z.infer<typeof baseFormSchema>;
