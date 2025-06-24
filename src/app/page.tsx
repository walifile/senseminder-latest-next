// "use client";
// import CostCalculator from "./home/_components/cost-calculator";
// import FAQ from "./home/_components/faq";
// import FutureVision from "./home/_components/future-vision";
// import Hero from "./home/_components/hero";
// import HowItWorks from "./home/_components/how-it-works";
// import { MainLayout } from "./home/_components/layout";
// import Pricing from "./home/_components/pricing";
// import ProblemSolution from "./home/_components/problem-solution";
// import Testimonials from "./home/_components/testimonials";
// import TutorialSection from "./home/_components/tutorial-section";
// import WhyChooseUs from "./home/_components/why-choose-us";
// import WhySettle from "./home/_components/why-settle";

// export default function HomePage() {
//   return (
//     <MainLayout>
//       <Hero />
//       <TutorialSection />
//       <WhySettle />
//       <ProblemSolution />
//       <HowItWorks />
//       <FutureVision />
//       <WhyChooseUs />
//       <Testimonials />
//       <Pricing />
//       <CostCalculator />
//       <FAQ />
//     </MainLayout>
//   );
// }


// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { fetchAuthSession } from "aws-amplify/auth";
// import { checkFirstLogin } from "@/api/first-time-setup";

// import CostCalculator from "./home/_components/cost-calculator";
// import FAQ from "./home/_components/faq";
// import FutureVision from "./home/_components/future-vision";
// import Hero from "./home/_components/hero";
// import HowItWorks from "./home/_components/how-it-works";
// import { MainLayout } from "./home/_components/layout";
// import Pricing from "./home/_components/pricing";
// import ProblemSolution from "./home/_components/problem-solution";
// import Testimonials from "./home/_components/testimonials";
// import TutorialSection from "./home/_components/tutorial-section";
// import WhyChooseUs from "./home/_components/why-choose-us";
// import WhySettle from "./home/_components/why-settle";

// export default function HomePage() {
//   const router = useRouter();
//   const [showSetup, setShowSetup] = useState(false);

//   useEffect(() => {
//     const checkFederatedSetup = async () => {
//       try {
//         const session = await fetchAuthSession();
//         const idToken = session.tokens?.idToken?.toString();

//         if (idToken) {
//           const data = await checkFirstLogin();
//           if (data.firstLogin && data.federatedUser) {
//             setShowSetup(true);
//           }
//         }
//       } catch (err) {
//         console.error("Silent firstLogin check failed:", err);
//         // Don't show error on UI — just fail silently
//       }
//     };

//     checkFederatedSetup();
//   }, []);

//   const handleContinue = () => {
//     router.replace("/dashboard/smart-pc");
//   };

//   const handleCancel = () => {
//     const confirmed = confirm("Are you sure you want to cancel account creation?");
//     if (confirmed) {
//       // Optional: implement user deletion
//     }
//   };

//   return (
//     <MainLayout>
//       {/* Confirmation Dialog - overlays on top */}
//       {showSetup && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
//           <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-2xl shadow-2xl p-10 max-w-lg w-full text-center z-50">
//             <h1 className="text-3xl font-bold mb-4 text-blue-600 dark:text-blue-400">Welcome to SmartPC</h1>
//             <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
//               You're creating a new account using your Google credentials. Please confirm to proceed or cancel if it was by mistake.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
//               <button
//                 onClick={handleContinue}
//                 className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl shadow"
//               >
//                 Continue
//               </button>
//               <button
//                 onClick={handleCancel}
//                 className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-xl shadow dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
//               >
//                 Cancel Account
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Always render homepage */}
//       <Hero />
//       <TutorialSection />
//       <WhySettle />
//       <ProblemSolution />
//       <HowItWorks />
//       <FutureVision />
//       <WhyChooseUs />
//       <Testimonials />
//       <Pricing />
//       <CostCalculator />
//       <FAQ />
//     </MainLayout>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";
import { checkFirstLogin } from "@/api/first-time-setup";
import { handleSignOut } from "@/lib/services/auth";
import { useToast } from "@/hooks/use-toast";
import { routes } from "@/constants/routes";

import CostCalculator from "./home/_components/cost-calculator";
import FAQ from "./home/_components/faq";
import FutureVision from "./home/_components/future-vision";
import Hero from "./home/_components/hero";
import HowItWorks from "./home/_components/how-it-works";
import { MainLayout } from "./home/_components/layout";
import Pricing from "./home/_components/pricing";
import ProblemSolution from "./home/_components/problem-solution";
import Testimonials from "./home/_components/testimonials";
import TutorialSection from "./home/_components/tutorial-section";
import WhyChooseUs from "./home/_components/why-choose-us";
import WhySettle from "./home/_components/why-settle";

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
      await fetch("https://qlabwdtr71.execute-api.us-east-1.amazonaws.com/prod/", {
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
    const confirmed = confirm("Are you sure you want to cancel account creation?");
    if (!confirmed || !idToken) return;

    try {
      const response = await fetch("https://qlabwdtr71.execute-api.us-east-1.amazonaws.com/prod/", {
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
        toast({ title: "Account canceled", description: "User deleted and logged out." });
        router.push(routes.home);
      } else {
        toast({
          title: "Logout Failed",
          description: logoutResult.error || "Logout failed after deletion.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
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
              Welcome to SmartPC
            </h1>
            <p className="mb-8 text-base text-gray-600 dark:text-gray-300">
              You're creating a new account using your Google credentials. Please confirm to proceed or cancel if it was by mistake.
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
      <WhySettle />
      <ProblemSolution />
      <HowItWorks />
      <FutureVision />
      <WhyChooseUs />
      <Testimonials />
      <Pricing />
      <CostCalculator />
      <FAQ />
    </MainLayout>
  );
}