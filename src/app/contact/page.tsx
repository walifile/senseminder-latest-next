"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useSendContactMessageMutation } from "@/api/contactAPI";

import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/utils";
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

import { Breadcrumb } from "../home/_components/breadcrumb";

const contactFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact = () => {
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
    <main className="flex-grow pt-24 pb-16 font-['Inter']">
      <div className="container mx-auto px-4 md:px-6">
        {/* Breadcrumb */}
        <div className="my-8 flex items-center space-x-2 text-sm">
          <span />
        </div>

        <div className="glass-card !shadow-none gradient-outline-border !rounded-3xl !border-0 px-0 md:px-12 py-12 w-full flex flex-col-reverse md:flex-row gap-8 md:gap-24">
          <div className="w-full md:w-3/4 px-6 md:px-0">
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "Contact" }]}
            />

            {/* ✅ Heading font applied */}
            <h1 className="justify-start text-black dark:text-white text-2xl md:text-[50px] font-bold font-['Space_Grotesk'] leading-[1] mb-6">
              Contact Us
            </h1>

            {/* ✅ Body font applied */}
            <p className="font-['Inter'] text-base md:text-lg text-[#454545] dark:text-[#B9C2D5] leading-relaxed font-light">
              Let’s connect. Whether you have a question, need support, or want
              to explore a partnership — we’re here for you. Our team is always
              ready to assist, collaborate, or simply hear your ideas. Reach out
              using any of the options below — we’d love to hear from you.
            </p>
          </div>

          <div className="w-full md:w-1/4 content-center justify-items-center">
            <Image
              src="/assets/svg/contact-us.svg"
              alt="Contact Us"
              className="w-full md:w-auto px-6 md:px-0"
              width={312}
              height={205}
              priority
            />
          </div>
        </div>

        <div className="glass-card !shadow-none gradient-outline-border !rounded-3xl !border-0 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 mt-8 px-6 md:px-12 py-12">
          <div className="flex h-full flex-col gap-8">
            {/* Top content */}
            <div className="space-y-8">
              {/* ✅ Section heading font applied */}
              <p className="justify-start text-black dark:text-white text-2xl md:text-3xl font-bold font-['Space_Grotesk'] leading-8 tracking-tight">
                Contact Information
              </p>

              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-center gap-4">
                  <div className="min-w-16 w-16 h-16 md:min-w-20 md:w-20 md:h-20 bg-[#F3DBF5] dark:bg-[#210E39] text-white rounded-full flex items-center justify-center">
                    <Image
                      src="/assets/svg/contact/email.svg"
                      alt="Email"
                      className="h-8 w-8 md:h-10 md:w-10"
                      width={34}
                      height={34}
                      priority
                    />
                  </div>

                  <div>
                    <p className="font-['Inter'] text-foreground text-base md:text-lg font-medium leading-relaxed tracking-[-0.2px]">
                      <a
                        href="mailto:contact@sensepc.com"
                        className="hover:text-primary transition-colors underline-offset-4 hover:underline"
                      >
                        contact@sensepc.com
                      </a>
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-4">
                  <div className="min-w-16 w-16 h-16 md:min-w-20 md:w-20 md:h-20 bg-[#F3DBF5] dark:bg-[#210E39] text-white rounded-full flex items-center justify-center">
                    <Image
                      src="/assets/svg/contact/location.svg"
                      alt="Location"
                      className="h-8 w-8 md:h-10 md:w-10"
                      width={34}
                      height={34}
                      priority
                    />
                  </div>

                  <div>
                    <p className="font-['Inter'] text-foreground text-base md:text-lg font-medium leading-relaxed tracking-[-0.2px]">
                      1372 Peachtree
                      <br />
                      Atlanta, Georgia 30309
                      <br />
                      United States of America
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ Push Business Hours down */}
            <div className="mt-auto">
              <div className="px-4 py-4 md:px-8 md:py-6 rounded-xl border bg-[#5220DE09] dark:bg-[#ffffff0a]">
                {/* ✅ Heading font applied */}
                <h2 className="justify-start text-black dark:text-white text-2xl md:text-2xl font-bold font-['Space_Grotesk'] leading-8 tracking-tight mb-5 flex items-center gap-3">
                  <Image
                    src="/assets/svg/contact/clock.svg"
                    alt="Business Hours"
                    className="h-6 w-6 md:h-7 md:w-7"
                    width={34}
                    height={34}
                    priority
                  />
                  Business Hours
                </h2>

                <div className="space-y-3 font-['Inter']">
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-sm md:text-base font-medium text-muted-foreground">
                      Monday – Friday
                    </span>
                    <span className="text-sm md:text-base font-semibold text-foreground">
                      10:00 AM – 4:00 PM
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-6">
                    <span className="text-sm md:text-base font-medium text-muted-foreground">
                      Saturday
                    </span>
                    <span className="text-sm md:text-base font-semibold text-foreground">
                      Closed
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-6">
                    <span className="text-sm md:text-base font-medium text-muted-foreground">
                      Sunday
                    </span>
                    <span className="text-sm md:text-base font-semibold text-foreground">
                      Closed
                    </span>
                  </div>

                  <p className="pt-3 text-xs md:text-sm text-muted-foreground">
                    * All times are in Eastern Standard Time (EST)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div>
            {/* ✅ Heading font applied */}
            <p className="justify-start text-black dark:text-white text-2xl md:text-3xl font-bold font-['Space_Grotesk'] leading-8 mb-3">
              Send Us a Message
            </p>

            {/* ✅ Body font applied */}
            <p className="font-['Inter'] text-paragraph text-base font-light leading-[32px] text-[#454545] dark:text-[#B9C2D5]">
              Please fill out the form below and we will contact you within 24
              hours.
            </p>

            <br />
            <hr />
            <br />

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 font-['Inter']"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        {/* ✅ Label font applied */}
                        <FormLabel className="block self-stretch justify-start text-black dark:text-white text-lg font-semibold font-['Space_Grotesk'] leading-8">
                          Your Name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
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
                        {/* ✅ Label font applied */}
                        <FormLabel className="block self-stretch justify-start text-black dark:text-white text-lg font-semibold font-['Space_Grotesk'] leading-8">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
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
                      {/* ✅ Label font applied */}
                      <FormLabel className="block self-stretch justify-start text-black dark:text-white text-lg font-semibold font-['Space_Grotesk'] leading-8">
                        Subject
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="How can we help you?" {...field} />
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
                      {/* ✅ Label font applied */}
                      <FormLabel className="block self-stretch justify-start text-black dark:text-white text-lg font-semibold font-['Space_Grotesk'] leading-8">
                        Message
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide details about your inquiry..."
                          className="min-h-[150px]"
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
        </div>
      </div>
    </main>
  );
};

export default Contact;
