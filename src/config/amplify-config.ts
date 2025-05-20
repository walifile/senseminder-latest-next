import { Amplify } from "aws-amplify";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { CookieStorage } from "aws-amplify/utils";
// test commit
export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || "",
        userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || "",
        loginWith: {
          email: true,
          // @ts-expect-error @ts-ignore
          externalProviders: {
            google: {
              clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
              clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
              scopes: ["email", "openid", "profile"],
            },
            callbackUrls: [process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL],
            logoutUrls: [process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL],
            signInWithApple: {
              clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID,
              keyId: "Z96G67TY56",
              privateKey: process.env.NEXT_PUBLIC_APPLE_PRIVATE_KEY,
              teamId: "DCW353BKVA",
            },
          },

          oauth: {
            domain: process.env.NEXT_PUBLIC_OAUTH_DOMAIN || "",
            scopes: ["email", "openid", "aws.cognito.signin.user.admin"],
            redirectSignIn: [
              `${process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL}auth/callback` || "",
            ],
            redirectSignOut: [process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL || ""],
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
