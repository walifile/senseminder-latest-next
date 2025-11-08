"use client";

/* eslint-disable perfectionist/sort-imports */

import { useMemo, useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useLocation from "@/hooks/use-location";
import {
  useSubscribeToNewsletterMutation,
  useUnsubscribeFromNewsletterMutation,
} from "@/api/newsletterAPI";
import { useSearchParams } from "next/navigation";

import { useToast } from "@/hooks/use-toast";
import { Logger } from "@/lib/utils/logger";

type NewsletterFormProps = {
  variant?: "inline" | "card";
  source?: string; // e.g., "footer", "landing"
  className?: string;
};

const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;

export default function NewsletterForm({
  variant = "inline",
  source = "footer",
  className = "",
}: NewsletterFormProps) {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { userLocation } = useLocation();

  const [email, setEmail] = useState("");

  const [subscribe, { isLoading: isSubscribing }] =
    useSubscribeToNewsletterMutation();
  const [unsubscribe] = useUnsubscribeFromNewsletterMutation();

  const disabled = useMemo(
    () => isSubscribing || !emailRegex.test(email),
    [isSubscribing, email]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const location = userLocation || {
      country: "unknown",
      city: "unknown",
      ip: "unknown",
    };

    const response = await subscribe({
      email,
      location,
      signup: false,
    });

    if (!("error" in response)) {
      toast({
        title: "Subscribed!",
        description: "You've successfully subscribed to the newsletter.",
      });
      setEmail("");
    } else {
      Logger.log({ else: "Ddffdfdfff" });

      let errorMessage = "Subscription failed. Please try again.";

      if ("error" in response) {
        const err = response.error as Error & {
          data?: string | { message: string };
        };

        if (err.data && typeof err.data === "object" && "message" in err.data) {
          errorMessage = err.data.message;
        } else if ("message" in err) {
          errorMessage = err.message;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (email && token) {
      unsubscribe({ email, token }).then((res) => {
        if (!("error" in res)) {
          toast({
            title: "Unsubscribed",
            description:
              "You have been successfully unsubscribed from the newsletter.",
          });

          // Remove query params from URL
          const url = new URL(window.location.href);
          url.searchParams.delete("email");
          url.searchParams.delete("token");
          window.history.replaceState(
            {},
            document.title,
            url.pathname + url.search
          );
        } else {
          let errorMessage = "Unsubscription failed. Please try again.";
          if ("error" in res) {
            const err = res.error as Error & {
              data?: string | { message: string };
            };

            if (
              err.data &&
              typeof err.data === "object" &&
              "message" in err.data
            ) {
              errorMessage = err.data.message;
            } else if ("message" in err) {
              errorMessage = err.message;
            }
          }

          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      });
    }
  }, [searchParams, unsubscribe, toast]);

  const wrapperClasses =
    variant === "card"
      ? "glass-card p-4 sm:p-6 md:p-8 border border-white/15 bg-white/10 backdrop-blur-md"
      : "";

  return (
    <form
      onSubmit={handleSubmit}
      className={`${wrapperClasses} ${className}`.trim()}
      aria-label="Newsletter subscription form"
    >
      <div className={variant === "card" ? "space-y-4" : "space-y-2"}>
        <div>
          <h3 className="text-base sm:text-lg font-semibold">
            Subscribe to our newsletter
          </h3>
          <p className="text-sm text-[#B9C2D5] dark:text-paragraph">
            Get the latest updates on SensePC features and releases.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <label htmlFor={`newsletter-email-${source}`} className="sr-only">
            Email address
          </label>
          <Input
            id={`newsletter-email-${source}`}
            type="email"
            inputMode="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/80 text-black placeholder:text-black/50 dark:bg-white/10 dark:text-white dark:placeholder:text-white/60 border-white/20"
            required
          />
          <Button type="submit" size="sm" disabled={disabled}>
            {isSubscribing ? "Subscribing..." : "Subscribe"}
          </Button>
        </div>
      </div>
    </form>
  );
}
