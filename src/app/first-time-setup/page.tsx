"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkFirstLogin } from "@/api/first-time-setup";

export default function FirstTimeSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const check = async () => {
      try {
        const data = await checkFirstLogin();
        if (data.firstLogin && data.federatedUser) {
          setShowSetup(true);
        } else {
          router.replace("/dashboard");
        }
      } catch (err: unknown) {
        console.error("Error:", err);
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [router]);

  const handleContinue = () => {
    router.replace("/dashboard");
  };

  const handleCancel = async () => {
    const confirmed = confirm("Are you sure you want to cancel account creation?");
    if (confirmed) {
      // Will implement delete call later
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-blue-500">Checking your account...</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-500">{error}</div>;
  }

  if (!showSetup) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-blue-600 to-blue-400 text-white dark:from-gray-900 dark:to-black px-4">
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-2xl shadow-2xl p-10 max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-blue-600 dark:text-blue-400">Welcome to SmartPC</h1>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
          You're creating a new account using your Google credentials. Please confirm to proceed or cancel if it was by mistake.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <button
            onClick={handleContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl shadow"
          >
            Continue
          </button>
          <button
            onClick={handleCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-xl shadow dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            Cancel Account
          </button>
        </div>
      </div>
    </div>
  );
}