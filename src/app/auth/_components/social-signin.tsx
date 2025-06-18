// "use client";

// import React, { useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { FcGoogle } from "react-icons/fc";
// import { signInWithRedirect } from "aws-amplify/auth";
// import { useToast } from "@/hooks/use-toast";

// declare global {
//   interface Window {
//     google?: any;
//   }
// }

// const SocialSignIn = () => {
//   const { toast } = useToast();

//   useEffect(() => {
//     // Load Google Identity Services SDK
//     const script = document.createElement("script");
//     script.src = "https://accounts.google.com/gsi/client";
//     script.async = true;
//     script.defer = true;
//     document.body.appendChild(script);
//   }, []);

//   const checkUserExists = async (email: string): Promise<boolean> => {
//     try {
//       const res = await fetch("https://your-api-gateway-url.com/dev/check-user", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email }),
//       });

//       const data = await res.json();
//       return data.exists === true;
//     } catch (err) {
//       toast({
//         title: "Error",
//         description: "Failed to check user existence.",
//       });
//       console.error("API call error:", err);
//       return false;
//     }
//   };

//   const handleGoogleSignIn = async () => {
//     const client_id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

//     if (!window.google || !client_id) {
//       toast({ title: "Google SDK not loaded" });
//       return;
//     }

//     window.google.accounts.id.initialize({
//       client_id,
//       callback: async (response: any) => {
//         const credential = response.credential;

//         if (!credential) {
//           toast({ title: "Google login failed" });
//           return;
//         }

//         const payload = JSON.parse(atob(credential.split(".")[1]));
//         const email = payload?.email;

//         if (!email) {
//           toast({ title: "Email not found in Google token" });
//           return;
//         }

//         const exists = await checkUserExists(email);

//         if (exists) {
//           try {
//             await signInWithRedirect({
//               provider: "Google",
//               customState: JSON.stringify({ intent: "signin" }),
//             });
//           } catch (err) {
//             toast({
//               title: "Redirect failed",
//               description: (err as Error)?.message ?? "Could not start sign-in.",
//             });
//           }
//         } else {
//           toast({
//             title: "No account found",
//             description: "Please sign up before using Google sign-in.",
//           });
//         }
//       },
//     });

//     window.google.accounts.id.prompt(); // Show Google popup
//   };

//   return (
//     <div className="w-full">
//       <Button
//         variant="outline"
//         onClick={handleGoogleSignIn}
//         className="w-full border-gray-200 bg-white/50 text-gray-700 hover:bg-gray-50 dark:border-[#ffffff1a] dark:bg-[#ffffff0f] dark:text-white dark:hover:bg-[#ffffff1a]"
//       >
//         <FcGoogle className="mr-2 h-4 w-4" />
//         Sign in with Google
//       </Button>
//     </div>
//   );
// };

// export default SocialSignIn;
