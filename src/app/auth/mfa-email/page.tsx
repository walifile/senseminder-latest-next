// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";

// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormControl,
//   FormDescription,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   InputOTP,
//   InputOTPGroup,
//   InputOTPSlot,
// } from "@/components/ui/input-otp";
// import { Loader2 } from "lucide-react";
// import { confirmSignIn } from "aws-amplify/auth";
// import { useToast } from "@/hooks/use-toast";
// import { routes } from "@/constants/routes";

// const formSchema = z.object({
//   code: z
//     .string()
//     .min(6, "Your MFA code must be 6 digits.")
//     .max(6, "Your MFA code must be 6 digits."),
// });

// type FormValues = z.infer<typeof formSchema>;

// export default function MFAEmailPage() {
//   const router = useRouter();
//   const { toast } = useToast();
//   const [isVerifying, setIsVerifying] = useState(false);

//   const form = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       code: "",
//     },
//   });

//   const onSubmit = async (data: FormValues) => {
//     try {
//       setIsVerifying(true);

//       const raw = sessionStorage.getItem("tempUserMFA");
//       if (!raw) throw new Error("MFA session not found.");

//       const session = JSON.parse(sessionStorage.getItem("tempUserMFA") || "{}");

// const response = await confirmSignIn({
//   challengeResponse: data.code,
//   ...(session && session.session && { signInSession: session.session }), // ✅ pass session back
// });

//       if (response.isSignedIn) {
//         toast({
//           title: "Success",
//           description: "Multi-factor authentication successful!",
//         });
//         router.push(routes.dashboard);
//       } else {
//         toast({
//           title: "Verification Incomplete",
//           description: "Unable to complete MFA. Try again or contact support.",
//         });
//       }
//     } catch (err) {
//       const error =
//         err instanceof Error ? err : new Error("Unknown verification error");

//       toast({
//         title: "MFA Error",
//         description: error.message || "Something went wrong during verification.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsVerifying(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="space-y-2 text-center">
//         <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
//           MFA Verification
//         </h1>
//         <p className="text-sm text-gray-500 dark:text-gray-400">
//           Enter the 6-digit code sent to your email.
//         </p>
//       </div>

//       <Form {...form}>
//         <form
//           onSubmit={form.handleSubmit(onSubmit)}
//           className="space-y-6 max-w-sm mx-auto"
//         >
//           <FormField
//             control={form.control}
//             name="code"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="text-center block">MFA Code</FormLabel>
//                 <FormControl>
//                   <div className="flex justify-center">
//                     <InputOTP maxLength={6} {...field}>
//                       <InputOTPGroup>
//                         {[...Array(6)].map((_, i) => (
//                           <InputOTPSlot key={i} index={i} />
//                         ))}
//                       </InputOTPGroup>
//                     </InputOTP>
//                   </div>
//                 </FormControl>
//                 <FormDescription className="text-center">
//                   Check your email for the verification code.
//                 </FormDescription>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <Button
//             type="submit"
//             disabled={isVerifying}
//             className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-[#0EA5E9] dark:to-[#6366F1] dark:hover:from-[#0284C7] dark:hover:to-[#4F46E5]"
//           >
//             {isVerifying ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Verifying...
//               </>
//             ) : (
//               "Verify Code"
//             )}
//           </Button>
//         </form>
//       </Form>

//       <p className="text-center text-sm text-gray-500 dark:text-gray-400">
//         <a
//           href="/auth"
//           className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
//         >
//           Back to Sign in
//         </a>
//       </p>
//     </div>
//   );
// }

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { setLoading, setTempUser } from "@/redux/slices/auth/auth-slice";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPSlot,
  InputOTPGroup,
} from "@/components/ui/input-otp";
import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

import { confirmSignIn } from "aws-amplify/auth";

import { useDispatch } from "react-redux";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Loader2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import { handleSignOut, handlePostAuthentication } from "@/lib/services/auth";

const formSchema = z.object({
  code: z
    .string()
    .min(6, "Your MFA code must be 6 digits.")
    .max(6, "Your MFA code must be 6 digits."),
});

type FormValues = z.infer<typeof formSchema>;

export default function MfaEmailPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    const stored = sessionStorage.getItem("tempUserMFA");
    if (!stored) {
      toast({
        title: "Session Expired",
        description: "Please login again.",
        variant: "destructive",
      });
      router.push("/auth");
      return;
    }

    let user: unknown;
    try {
      user = JSON.parse(stored);
      console.log(user);
    } catch {
      toast({
        title: "Invalid Session",
        description: "Could not resume your session. Please login again.",
        variant: "destructive",
      });
      router.push("/auth");
      return;
    }

    setIsVerifying(true);
    dispatch(setLoading(true));

    try {
      const result = await confirmSignIn({
        challengeResponse: data.code,
      });

      if (result.isSignedIn) {
        const finalResult = await handlePostAuthentication();

        if (finalResult.success) {
          dispatch(setTempUser(null));
          toast({
            title: "Logged in",
            description: "MFA verification successful!",
          });
          router.push("/dashboard/smart-pc");
        } else {
          throw new Error("Login finalization failed.");
        }
      } else {
        toast({
          title: "Incorrect Code",
          description: "Please check your email and try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Verification Failed",
        description:
          err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
      await handleSignOut();
      router.push("/auth");
    } finally {
      setIsVerifying(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md space-y-6 bg-card border p-6 rounded-2xl shadow-xl">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            MFA Email Verification
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent to your email.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 max-w-sm mx-auto"
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-center block">MFA Code</FormLabel>
                  <FormControl>
                    <div className="flex justify-center">
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          {[...Array(6)].map((_, i) => (
                            <InputOTPSlot key={i} index={i} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormDescription className="text-center">
                    Check your email for the verification code.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isVerifying} className="w-full">
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground">
          <a href="/auth" className="text-blue-600 hover:underline">
            Back to Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
