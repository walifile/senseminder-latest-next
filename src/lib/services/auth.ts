import { store } from "@/redux/store";
import {
  setUser,
  clearAuth,
  setLoading,
  setTempUser,
} from "@/redux/slices/auth/auth-slice";

import {
  signUp,
  signIn,
  signOut,
  confirmSignUp,
  resetPassword,
  getCurrentUser,
  fetchAuthSession,
  resendSignUpCode,
  signInWithRedirect,
  fetchUserAttributes,
  confirmResetPassword,
} from "aws-amplify/auth";

import { getErrorMessage } from "../utils";
import { Logger } from "@/lib/utils/logger";

interface SignUpFormData {
  email: string;
  password: string;
  firstName?: string;
  acceptedLegal?: boolean;
  // lastName: string;
  // country: string;
  // cellphone?: string;
  // organization?: string;
}

export const handleSignUp = async (formData: SignUpFormData) => {
  try {
    store.dispatch(setLoading(true));

    const response = await signUp({
      username: formData.email,
      password: formData.password,
      options: {
        userAttributes: {
          email: formData.email,
          // 'custom:country': formData.country,
          "custom:firstName": formData.firstName,
          // 'custom:lastName': formData.lastName,
          // phone_number: formData.cellphone,
          // 'custom:organization': formData.organization || 'N/A',
          "custom:role": "user",
          "custom:acceptedLegal": formData.acceptedLegal ? "true" : "false",
        },
      },
    });

    store.dispatch(setLoading(false));
    return { success: true, data: response };
  } catch (error) {
    store.dispatch(setLoading(false));
    Logger.log(error);
    return { success: false, error: getErrorMessage(error) };
  }
};

export const handleConfirmSignUp = async (email: string, otp: string) => {
  try {
    store.dispatch(setLoading(true));

    await confirmSignUp({
      username: email,
      confirmationCode: otp,
    });

    store.dispatch(setLoading(false));
    return { success: true };
  } catch (error) {
    store.dispatch(setLoading(false));
    return { success: false, error: getErrorMessage(error) };
  }
};

export const handleResendOtp = async (email: string) => {
  try {
    store.dispatch(setLoading(true));
    await resendSignUpCode({ username: email });
    store.dispatch(setLoading(false));
    return { success: true };
  } catch (error) {
    store.dispatch(setLoading(false));
    return { success: false, error: getErrorMessage(error) };
  }
};

export const getUserAttributes = async () => {
  try {
    const attributes = await fetchUserAttributes();
    const session = await fetchAuthSession();
    const jwt = session.tokens?.idToken?.toString();

    const userData = {
      email: attributes.email || "",
      firstName: attributes["custom:firstName"] || attributes.given_name || "",
      // lastName: attributes['custom:lastName'] || attributes.family_name || '',
      // organization: attributes['custom:organization'] || '',
      role: attributes["custom:role"] || "user",
      id: attributes["sub"] || "",
      ownerid: attributes["custom:ownerid"] || attributes["ownerid"] || "",
      // cellPhone: attributes.phone_number || '',
      // country: attributes['custom:country'] || ''
    };

    return {
      userData,
      token: jwt,
    };
  } catch (error) {
    Logger.error("Error getting user attributes:", error);
    return null;
  }
};

// Update handlePostAuthentication function
const handlePostAuthentication = async () => {
  const userInfo = await getUserAttributes();
  Logger.log("userInfo", userInfo);
  if (userInfo) {
    store.dispatch(
      setUser({
        user: userInfo.userData,
        token: userInfo.token || "",
      })
    );
    return { success: true, data: userInfo.userData };
  }
  return { success: false, error: "Failed to fetch user attributes" };
};

export const handleSignIn = async (email: string, password: string) => {
  try {
    store.dispatch(setLoading(true));

    // Sign out any existing session
    await signOut();

    // Sign in
    const signInResponse = await signIn({
      username: email,
      password,
    });
    Logger.log(
      "signInResponse from Cognito:",
      JSON.stringify(signInResponse, null, 2)
    );

    // Logger.log("sign in response", signInResponse);

    // Check if user needs to confirm signup
    if (signInResponse.nextStep?.signInStep === "CONFIRM_SIGN_UP") {
      await resendSignUpCode({ username: email });

      // Store email for OTP verification
      sessionStorage.setItem("verificationEmail", email);

      store.dispatch(setLoading(false));
      return {
        success: false,
        error: "Please verify your email first",
        requiresOTP: true,
      };
    }
    // ADD THIS:
    // if (signInResponse.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
    //   // Save the user for later password completion
    //   store.dispatch(setTempUser(signInResponse));
    //   store.dispatch(setLoading(false));
    //   return { success: false, requiresNewPassword: true };
    // }
    if (
      signInResponse.nextStep?.signInStep ===
      "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
    ) {
      store.dispatch(setTempUser(signInResponse)); // save temporary user to Redux
      store.dispatch(setLoading(false));
      return { success: false, requiresNewPassword: true };
    }

    if (
      signInResponse.nextStep?.signInStep ===
      "CONTINUE_SIGN_IN_WITH_MFA_SELECTION"
    ) {
      const step = signInResponse.nextStep as {
        preferredMfaSetting?: string | undefined;
        allowedMFATypes?: string[] | undefined;
      };

      // Determine preferred MFA method
      const preferredMfa = step.preferredMfaSetting;
      const availableMfas = step.allowedMFATypes || [];

      store.dispatch(setTempUser(signInResponse));
      sessionStorage.setItem("tempUserMFA", JSON.stringify(signInResponse));
      sessionStorage.setItem("mfaOptions", JSON.stringify(availableMfas));
      sessionStorage.setItem("mfaEmail", email);

      if (preferredMfa && availableMfas.includes(preferredMfa)) {
        if (preferredMfa === "TOTP") {
          return { success: false, mfaTotp: true };
        } else if (preferredMfa === "EMAIL") {
          return { success: false, mfaRequired: true };
        }
      }

      return {
        success: false,
        chooseMFA: true,
        mfaOptions: availableMfas,
        signInResult: signInResponse,
      };
    }

    // Case: MFA via Email Code
    if (
      signInResponse.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_EMAIL_CODE"
    ) {
      sessionStorage.setItem("tempUserMFA", JSON.stringify(signInResponse));
      store.dispatch(setLoading(false));
      return {
        success: false,
        mfaRequired: true,
        delivery: signInResponse.nextStep.codeDeliveryDetails,
      };
    }

    // Case: MFA via TOTP App
    if (
      signInResponse.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_TOTP_CODE"
    ) {
      store.dispatch(setTempUser(signInResponse)); // Save session
      sessionStorage.setItem("tempUserMFA", JSON.stringify(signInResponse));
      sessionStorage.setItem("mfaEmail", email);

      store.dispatch(setLoading(false));
      return {
        success: false,
        mfaTotp: true,
      };
    }

    return await handlePostAuthentication();
  } catch (error) {
    Logger.log("sign in error", getErrorMessage(error));
    store.dispatch(setLoading(false));
    return { success: false, error: getErrorMessage(error) };
  }
};

// function to handle the redirect result
export const handleAuthRedirect = async () => {
  try {
    store.dispatch(setLoading(true));

    // Add a small delay to ensure AWS processes are complete
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get current user and session
    const currentUser = await getCurrentUser();

    if (currentUser) {
      // Wait for session to be fully established
      const session = await fetchAuthSession();
      if (!session) {
        throw new Error("Session not established");
      }

      // Get user attributes and handle Redux state
      const userInfo = await getUserAttributes();
      if (userInfo) {
        store.dispatch(
          setUser({
            user: userInfo.userData,
            token: userInfo.token || "",
          })
        );

        // Clean up any oauth flags
        if (typeof window !== "undefined") {
          localStorage.removeItem(
            "CognitoIdentityServiceProvider.2lknj90rkjmtkcnph06q6r93ug.oauthSignIn"
          );
        }

        return { success: true, data: userInfo.userData };
      }
    }

    return { success: false, error: "Failed to get user information" };
  } catch (error) {
    Logger.log("Auth redirect error:", error);
    return { success: false, error: getErrorMessage(error) };
  } finally {
    store.dispatch(setLoading(false));
  }
};

export const handleGoogleSignUp = async () => {
  try {
    store.dispatch(setLoading(true));

    // Sign up with Google
    await signInWithRedirect({ provider: "Google" });

    return { success: true };
  } catch (error) {
    Logger.log("Google sign up error:", error);
    return { success: false, error: getErrorMessage(error) };
  } finally {
    store.dispatch(setLoading(false));
  }
};

export const handleAppleSignUp = async () => {
  try {
    store.dispatch(setLoading(true));

    // Sign up with Apple
    await signInWithRedirect({ provider: "Apple" });

    // After redirect back, get user data
    const currentUser = await getCurrentUser();
    if (currentUser) {
      return await handlePostAuthentication();
    }

    return { success: false, error: "Failed to get user information" };
  } catch (error) {
    Logger.log("Apple sign up error:", error);
    return { success: false, error: getErrorMessage(error) };
  } finally {
    store.dispatch(setLoading(false));
  }
};

export const handleSignOut = async () => {
  try {
    store.dispatch(setLoading(true));
    await signOut();
    store.dispatch(clearAuth());
    return { success: true };
  } catch (error) {
    store.dispatch(setLoading(false));
    return { success: false, error: getErrorMessage(error) };
  }
};

// export const handleResetPassword = async (email: string) => {
//   try {
//     store.dispatch(setLoading(true));
//     await resetPassword({
//       username: email,
//     });
//     store.dispatch(setLoading(false));
//     return { success: true };
//   } catch (error: any) {
//     store.dispatch(setLoading(false));
//     Logger.log(error);
//     return { success: false, error: error.message };
//   }
// };

export const handleResetPassword = async (email: string) => {
  try {
    store.dispatch(setLoading(true));
    await resetPassword({ username: email });
    store.dispatch(setLoading(false));
    return { success: true };
  } catch (err) {
    store.dispatch(setLoading(false));
    const error = err as Error;

    Logger.error("Cognito resetPassword error:", error);

    // Special case: MFA (TOTP) is enabled and user has no verified email/phone
    if (
      error.name === "InvalidParameterException" &&
      error.message.includes("no registered/verified")
    ) {
      return {
        success: false,
        error:
          "Password reset is blocked because your account has MFA enabled and no verified email. Please contact support.",
        code: "MFA_BLOCKED_RESET",
      };
    }

    // Other known cases
    if (error.name === "UserNotFoundException") {
      return {
        success: false,
        error: "No user found with this email.",
        code: "USER_NOT_FOUND",
      };
    }

    // default fallback
    return {
      success: false,
      error: error.message || "Unknown error occurred during password reset.",
    };
  }
};

export const handleConfirmResetPassword = async (
  email: string,
  code: string,
  newPassword: string
) => {
  try {
    store.dispatch(setLoading(true));
    await confirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword,
    });
    store.dispatch(setLoading(false));
    return { success: true };
  } catch (error) {
    store.dispatch(setLoading(false));
    Logger.log(error);
    return { success: false, error: getErrorMessage(error) };
  }
};

// Utility function to get current session/JWT
export const getCurrentSession = async () => {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString();
  } catch (error) {
    Logger.log(error);
    return null;
  }
};

export { handlePostAuthentication };
