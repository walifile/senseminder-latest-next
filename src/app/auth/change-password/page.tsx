// app/change-password/page.tsx
// eslint-disable-next-line @typescript-eslint/no-unused-vars
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { confirmSignIn } from "aws-amplify/auth";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setLoading, setTempUser } from "@/redux/slices/auth-slice";
import { RootState } from "@/redux/store"; // Adjust this path to your Redux store
import { routes } from "@/constants/routes";

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();
  const dispatch = useDispatch();
  const tempUser = useSelector((state: RootState) => state.auth.tempUser);

  useEffect(() => {
    if (!tempUser) {
      router.push("/auth");
    }
  }, [tempUser, router]);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    dispatch(setLoading(true));

    try {
      const result = await confirmSignIn({
        challengeResponse: newPassword,
      });
      console.log("Password change result:", result);
      if (result.isSignedIn) {
        // Optionally, fetch user attributes here and dispatch setUser
        //@ts-ignore
        dispatch(setUser({ user: {/* user data */}, token: "token" }));
        dispatch(setTempUser(null));
        await new Promise((resolve) => setTimeout(resolve, 100));
        router.push("/dashboard/smart-pc");
      } else if (result.nextStep?.signInStep === "CONTINUE_SIGN_IN_WITH_TOTP_SETUP") {
        router.push("/auth");
      } else {
        setError("Unexpected response. Please try logging in again.");
        router.push("/auth");
      }
    } catch (err) {
      console.error("Password change failed:", err);
      setError("Failed to change password: " + (err as Error).message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Change Password</h1>
      <p className="text-sm mb-4 text-gray-600">
        Please choose a unique password to secure your account.
      </p>

      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />
      <input
        type="password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />

      <button
        onClick={handleChangePassword}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Change Password
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
