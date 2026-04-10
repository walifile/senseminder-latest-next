"use client";

import { useState } from "react";
import { useSendContactMessageMutation } from "@/api/contactAPI";
import { trackContactSubmit } from "@/app/contact/utils/analytics";
import {
  MAX_NAME_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_SUBJECT_LENGTH,
  MAX_MESSAGE_LENGTH,
} from "@/app/contact/constants";

import { getErrorMessage } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Send, Loader2 } from "lucide-react";

import { toast } from "@/hooks/use-toast";

const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(MAX_NAME_LENGTH, {
      message: `Name must be less than ${MAX_NAME_LENGTH + 1} characters.`,
    }),
  email: z
    .string()
    .trim()
    .email({
      message: "Please enter a valid email address.",
    })
    .max(MAX_EMAIL_LENGTH, {
      message: "Email address is too long.",
    }),
  subject: z
    .string()
    .trim()
    .min(5, {
      message: "Subject must be at least 5 characters.",
    })
    .max(MAX_SUBJECT_LENGTH, {
      message: `Subject must be less than ${MAX_SUBJECT_LENGTH + 1} characters.`,
    }),
  message: z
    .string()
    .trim()
    .min(10, {
      message: "Message must be at least 10 characters.",
    })
    .max(MAX_MESSAGE_LENGTH, {
      message: `Message must be less than ${MAX_MESSAGE_LENGTH + 1} characters.`,
    }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendContactMessage] = useSendContactMessageMutation();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true);
    try {
      await sendContactMessage(data).unwrap();

      toast({
        title: "Message Sent",
        description:
          "Thank you for your message. We'll respond as soon as possible.",
      });

      trackContactSubmit();
      form.reset();
    } catch (err) {
      toast({
        title: "Submission failed",
        description: getErrorMessage(err, "Please try again later."),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="justify-start text-black dark:text-white text-2xl md:text-3xl font-bold font-['Space_Grotesk'] leading-8 mb-3">
        Send Us a Message
      </h2>

      <p className="font-['Inter'] text-paragraph text-base font-light leading-[32px] text-[#454545] dark:text-[#B9C2D5]">
        Please fill out the form below and we will contact you within 24 hours.
      </p>

      <br />
      <hr />
      <br />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 font-['Inter']"
          aria-label="Contact form"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block self-stretch justify-start text-black dark:text-white text-lg font-semibold font-['Space_Grotesk'] leading-8">
                    Your Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      maxLength={MAX_NAME_LENGTH}
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block self-stretch justify-start text-black dark:text-white text-lg font-semibold font-['Space_Grotesk'] leading-8">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      maxLength={MAX_EMAIL_LENGTH}
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block self-stretch justify-start text-black dark:text-white text-lg font-semibold font-['Space_Grotesk'] leading-8">
                  Subject
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="How can we help you?"
                    maxLength={MAX_SUBJECT_LENGTH}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block self-stretch justify-start text-black dark:text-white text-lg font-semibold font-['Space_Grotesk'] leading-8">
                  Message
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please provide details about your inquiry..."
                    className="min-h-[150px]"
                    maxLength={MAX_MESSAGE_LENGTH}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full font-['Inter']"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
