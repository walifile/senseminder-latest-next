"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { signOut, fetchAuthSession } from "aws-amplify/auth";
import { Logger } from "@/lib/utils/logger";

type CognitoIdTokenPayload = {
  sub: string;
  email?: string;
  email_verified?: boolean;
};

type CognitoAccessTokenPayload = {
  sub: string;
  username?: string;
  scope?: string;
};

export default function Dashboard() {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [idPayload, setIdPayload] = useState<CognitoIdTokenPayload | null>(
    null
  );
  const [accessPayload, setAccessPayload] =
    useState<CognitoAccessTokenPayload | null>(null);
  const router = useRouter();

  // useEffect(() => {
  //   const loadTokens = async () => {
  //     try {
  //       const session = await fetchAuthSession();
  //       const id = session.tokens?.idToken?.toString();
  //       const access = session.tokens?.accessToken?.toString();

  //       if (!id || !access) throw new Error("Token(s) missing");

  //       const decodedIdPayload = JSON.parse(atob(id.split(".")[1]));
  //       const decodedAccessPayload = JSON.parse(atob(access.split(".")[1]));

  //       setIdToken(id);
  //       setAccessToken(access);
  //       setIdPayload(decodedIdPayload);
  //       setAccessPayload(decodedAccessPayload);
  //     } catch (err) {
  //       Logger.error("Error loading tokens:", err);
  //       router.push("/login");
  //     }
  //   };

  //   loadTokens();
  // }, []);


  useEffect(() => {
  const loadTokens = async () => {
    try {
      // ✅ force refresh so tokens always come from Cognito, not cache
      const session = await fetchAuthSession({ forceRefresh: true });
      const id = session.tokens?.idToken?.toString();
      const access = session.tokens?.accessToken?.toString();

      if (!id || !access) throw new Error("Token(s) missing");

      const decodedIdPayload = JSON.parse(atob(id.split(".")[1]));
      const decodedAccessPayload = JSON.parse(atob(access.split(".")[1]));

      setIdToken(id);
      setAccessToken(access);
      setIdPayload(decodedIdPayload);
      setAccessPayload(decodedAccessPayload);
    } catch (err) {
      Logger.error("Error loading tokens:", err);
      router.push("/login");
    }
  };

  loadTokens();
}, []);

  const handleCopy = (token: string | null, label: string) => {
    if (token) {
      navigator.clipboard
        .writeText(token)
        .then(() => {
          alert(`${label} copied to clipboard!`);
        })
        .catch((err) => {
          Logger.error(`Error copying ${label}: `, err);
        });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      Logger.error("Logout failed:", error);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">
        Hello, {idPayload?.email || "Loading..."}
      </h1>

      {/* ID Token Section */}
      <section>
        <h2 className="text-md font-semibold mb-1">ID Token</h2>
        <div className="flex items-center space-x-2 mb-2">
          <pre className="whitespace-pre-wrap break-words text-xs bg-gray-100 p-2 rounded flex-1 max-h-40 overflow-auto">
            {idToken || "Loading ID token..."}
          </pre>
          <button
            onClick={() => handleCopy(idToken, "ID token")}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Copy ID
          </button>
        </div>
        <pre className="text-xs bg-gray-50 p-2 rounded max-h-60 overflow-auto border">
          {idPayload
            ? JSON.stringify(idPayload, null, 2)
            : "Loading ID token claims..."}
        </pre>
      </section>

      {/* Access Token Section */}
      <section>
        <h2 className="text-md font-semibold mb-1">Access Token</h2>
        <div className="flex items-center space-x-2 mb-2">
          <pre className="whitespace-pre-wrap break-words text-xs bg-gray-100 p-2 rounded flex-1 max-h-40 overflow-auto">
            {accessToken || "Loading access token..."}
          </pre>
          <button
            onClick={() => handleCopy(accessToken, "Access token")}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Copy Access
          </button>
        </div>
        <pre className="text-xs bg-gray-50 p-2 rounded max-h-60 overflow-auto border">
          {accessPayload
            ? JSON.stringify(accessPayload, null, 2)
            : "Loading access token claims..."}
        </pre>
      </section>

      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
      >
        Logout
      </button>
    </div>
  );
}
