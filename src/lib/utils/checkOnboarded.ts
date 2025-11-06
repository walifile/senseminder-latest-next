import { fetchAuthSession } from "aws-amplify/auth";
import { Logger } from "./logger";


export async function checkOnboarded(): Promise<boolean | null> {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    if (!idToken) {
      Logger.warn("No ID token found in session.");
      return null; // user not signed in
    }

    // Decode JWT payload
    const [, payloadBase64] = idToken.split(".");
    const decodedPayload = JSON.parse(
      Buffer.from(payloadBase64, "base64").toString("utf8")
    );

    const onboarded = decodedPayload["custom:onboarded"];

    return onboarded === "true";
  } catch (err) {
    Logger.error("Failed to check onboarded status:", err);
    return null;
  }
}
