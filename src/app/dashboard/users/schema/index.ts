import { z } from "zod";

import { schemaHelper } from "@/components/shared/hook-form/schema-helper";

export const formSchema = z.object({
  name: schemaHelper.input("Name", { required: true }),
  email: schemaHelper.email("Email", { required: true }),
  role: schemaHelper.select("Role", { required: true }),
});

export type FormValues = z.infer<typeof formSchema>;
