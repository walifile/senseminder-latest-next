"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";
import { checkFirstLogin } from "@/api/first-time-setup";

import { fetchAuthSession } from "aws-amplify/auth";

import { useToast } from "@/hooks/use-toast";

import { handleSignOut } from "@/lib/services/auth";

import FAQ from "./faq";
import Hero from "./hero";
import { MainLayout } from "./layout";
import HowItWorks from "./how-it-works";
import FutureVision from "./future-vision";
import CostCalculator from "./cost-calculator";
import ProblemSolution from "./problem-solution";
import TutorialSection from "./tutorial-section";

const FIRST_TIME_SETUP_API = process.env.NEXT_PUBLIC_FIRST_TIME_TOKEN_URL!;

if (!FIRST_TIME_SETUP_API) {
  throw new Error("Missing NEXT_PUBLIC_FIRST_TIME_TOKEN_URL in .env file");
}

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showSetup, setShowSetup] = useState(false);
  const [idToken, setIdToken] = useState<string | null>(null);

  useEffect(() => {
    const checkFederatedSetup = async () => {
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();

        if (token) {
          setIdToken(token);
          const data = await checkFirstLogin();
          if (data.firstLogin && data.federatedUser) {
            setShowSetup(true);
          }
        }
      } catch (err) {
        console.error("Silent firstLogin check failed:", err);
      }
    };

    checkFederatedSetup();
  }, []);

  const handleContinue = async () => {
    try {
      await fetch(FIRST_TIME_SETUP_API, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      setShowSetup(false);
    } catch (err) {
      console.error("Failed to update first login status:", err);
    }
  };

  const handleCancel = async () => {
    const confirmed = confirm(
      "Are you sure you want to cancel account creation?"
    );
    if (!confirmed || !idToken) return;

    try {
      const response = await fetch(FIRST_TIME_SETUP_API, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      const logoutResult = await handleSignOut();
      if (logoutResult.success) {
        toast({
          title: "Account canceled",
          description: "User deleted and logged out.",
        });
        router.push(routes.home);
      } else {
        toast({
          title: "Logout Failed",
          description: logoutResult.error || "Logout failed after deletion.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      {showSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-2xl shadow-2xl p-12 max-w-xl w-full text-center z-50">
            <h1 className="text-4xl font-bold mb-6 text-blue-600 dark:text-blue-400">
              Welcome to Sense PC
            </h1>
            <p className="mb-8 text-base text-gray-600 dark:text-gray-300">
              You're creating a new account using your Google credentials.
              Please confirm to proceed or cancel if it was by mistake.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <button
                onClick={handleContinue}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow"
              >
                Continue
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-8 rounded-xl shadow dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              >
                Cancel Account
              </button>
            </div>
          </div>
        </div>
      )}

      <Hero />
      <TutorialSection />
      {/* <WhySettle /> */}
      <ProblemSolution />
      <HowItWorks />
      <FutureVision />
      {/* <WhyChooseUs /> */}
      {/* <Testimonials /> */}
      {/* <Pricing /> */}
      <CostCalculator />
      <FAQ />
    </MainLayout>
  );
}
