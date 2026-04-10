import { z } from "zod";

import { schemaHelper } from "@/components/shared/hook-form";

const MINIMUM_BUSINESS_PC_COUNT = 3;

const positiveIntegerString = z
  .string()
  .trim()
  .refine((value) => {
    if (!/^\d+$/.test(value)) return false;

    const num = Number.parseInt(value, 10);
    return Number.isFinite(num) && num >= 1;
  });

const minimumBusinessPcCountString = positiveIntegerString.refine(
  (value) => Number.parseInt(value, 10) >= MINIMUM_BUSINESS_PC_COUNT,
);

const businessOnboardingDetailsSchema = z.object({
  organization: z.string().trim().min(1),
  teamSize: positiveIntegerString.transform((value) =>
    Number.parseInt(value, 10),
  ),
  pcCount: minimumBusinessPcCountString.transform((value) =>
    Number.parseInt(value, 10),
  ),
  businessUseCase: z.string().trim().min(1),
});

export const businessOnboardingInviteUserSchema = z.object({
  email: schemaHelper.email("Email", { required: true }),
  role: schemaHelper.enum("Role", ["admin", "member"], { required: true }),
});

export type BusinessOnboardingDetails = z.infer<
  typeof businessOnboardingDetailsSchema
>;
export type BusinessOnboardingInviteUserFormValues = z.infer<
  typeof businessOnboardingInviteUserSchema
>;

type BusinessOnboardingDetailsInput = {
  organization: string;
  teamSize: string;
  pcCount: string;
  businessUseCase: string;
};

type ValidationError = {
  title: string;
  description: string;
};

export function validateBusinessOnboardingDetails(
  input: BusinessOnboardingDetailsInput,
):
  | { data: BusinessOnboardingDetails; error: null }
  | { data: null; error: ValidationError } {
  const result = businessOnboardingDetailsSchema.safeParse(input);

  if (result.success) {
    return { data: result.data, error: null };
  }

  const field = result.error.issues[0]?.path[0];

  if (field === "organization") {
    return {
      data: null,
      error: {
        title: "Organization required",
        description: "Please confirm your organization name to continue.",
      },
    };
  }

  if (field === "teamSize") {
    return {
      data: null,
      error: {
        title: "Team size required",
        description: "Please enter a valid team size.",
      },
    };
  }

  if (field === "pcCount") {
    return {
      data: null,
      error: {
        title: "PC count required",
        description: `Please enter at least ${MINIMUM_BUSINESS_PC_COUNT} PCs.`,
      },
    };
  }

  return {
    data: null,
    error: {
      title: "Business use case required",
      description: "Please tell us about your business use case.",
    },
  };
}
