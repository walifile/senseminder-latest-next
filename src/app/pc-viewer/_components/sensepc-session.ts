type ValidateSessionArgs = {
  instanceId: string;
  userId: string;
  sessionToken: string;
};

type ValidateSessionResponse = {
  status?: string;
  message?: string;
  dnsName?: string;
};

export type ValidateSessionResult = {
  status: "active" | "creating" | "expired" | "not_found" | "error";
  message?: string;
  dnsName?: string;
};

type ValidateSessionCall = (
  args: ValidateSessionArgs
) => Promise<ValidateSessionResponse>;

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function validateSessionWithPolling(
  validateSession: ValidateSessionCall,
  args: ValidateSessionArgs,
  options?: { maxAttempts?: number; delayMs?: number }
): Promise<ValidateSessionResult> {
  const maxAttempts = options?.maxAttempts ?? 3;
  const delayMs = options?.delayMs ?? 1500;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await validateSession(args);
      const status = response?.status;
      if (status === "creating") {
        if (attempt < maxAttempts - 1) {
          await sleep(delayMs);
          continue;
        }
        return { status: "creating", message: response?.message, dnsName: response?.dnsName };
      }

      return { status: "active", message: response?.message, dnsName: response?.dnsName };
    } catch (error) {
      const statusCode = (error as { status?: number })?.status;
      if (statusCode === 404) return { status: "not_found" };
      if (statusCode === 403) return { status: "expired" };
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  return { status: "error", message: "Validation attempts exhausted" };
}
