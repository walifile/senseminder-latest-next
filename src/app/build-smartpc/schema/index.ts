import { z } from "zod";

export const formSchema = z.object({
  pcName: z
    .string()
    .min(1, "PC name is required")
    .max(50, "PC name must be at most 50 characters")
    .regex(
      /^(?![_-])(?!.*[_-]{2})[A-Za-z0-9_-]+(?<![_-])$/,
      "PC name can only contain letters, numbers, dash (-), underscore (_), and no spaces or consecutive special characters"
    ),
  operatingSystem: z.string(),
  cpu: z.string(),
  // memory: z.string(),
  storage: z.string(),
  region: z.string(),
});

export type FormValues = z.infer<typeof formSchema>;
