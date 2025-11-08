import { Logger } from "@/lib/utils/logger";

import { Amplify } from "aws-amplify";
import { CookieStorage } from "aws-amplify/utils";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";

import appConfig from "./app-config";

const {
  USER_POOL_ID,
  USER_POOL_CLIENT_ID,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  AUTH_REDIRECT_URL,
  APPLE_CLIENT_ID,
  APPLE_PRIVATE_KEY,
  OAUTH_DOMAIN,
} = appConfig;

// test commit
export function configureAmplify() {
  const poolId = USER_POOL_ID;
  Logger.log("poolId: " + poolId);
  const clientPoolId = USER_POOL_CLIENT_ID;
  Logger.log("clientPoolId: " + clientPoolId);
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: USER_POOL_ID || "",
        userPoolClientId: USER_POOL_CLIENT_ID || "",
        loginWith: {
          email: true,
          // @ts-expect-error @ts-ignore
          externalProviders: {
            google: {
              clientId: GOOGLE_CLIENT_ID,
              clientSecret: GOOGLE_CLIENT_SECRET,
              scopes: ["email", "openid", "profile"],
            },
            callbackUrls: [AUTH_REDIRECT_URL],
            logoutUrls: [AUTH_REDIRECT_URL],
            signInWithApple: {
              clientId: APPLE_CLIENT_ID,
              keyId: "Z96G67TY56",
              privateKey: APPLE_PRIVATE_KEY,
              teamId: "DCW353BKVA",
            },
          },

          oauth: {
            domain: OAUTH_DOMAIN || "",
            scopes: ["email", "openid", "aws.cognito.signin.user.admin"],
            redirectSignIn: [
              AUTH_REDIRECT_URL ? `${AUTH_REDIRECT_URL}auth/callback` : "",
            ],
            redirectSignOut: [AUTH_REDIRECT_URL || ""],
            responseType: "code",
            providers: ["Google", "Apple"],
          },

          signUpVerificationMethod: "code",
          userAttributes: {
            email: {
              required: true,
            },
          },
          allowGuestAccess: true,
          passwordFormat: {
            minLength: 8,
            requireLowercase: true,
            requireUppercase: true,
            requireNumbers: true,
            requireSpecialCharacters: true,
          },
        },
      },
    },
  });

  cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage());
}
