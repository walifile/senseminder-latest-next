import { z } from "zod";

export const formSchema = z.object({
  pcName: z.string().min(1, "PC name is required"),
  operatingSystem: z.string(),
  cpu: z.string(),
  // memory: z.string(),
  storage: z.string(),
  region: z.string(),
});

export type FormValues = z.infer<typeof formSchema>;
