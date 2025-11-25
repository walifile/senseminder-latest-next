"use client";

import Link from "next/link";
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
    <main className="flex-grow pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        {/* Breadcrumb */}
        <div className="my-8 flex items-center space-x-2 text-sm">
          <span />
        </div>

        <div className="glass-card !shadow-none dark:gradient-outline-border !rounded-3xl !border-0 px-0 md:px-12 py-12 w-full flex flex-col-reverse md:flex-row gap-8 md:gap-24">
          <div className="w-full md:w-3/4 px-6 md:px-0">
            <div className="mb-6 flex items-center space-x-2 text-sm font-light text-paragraph dark:text-gray-300">
              <Link
                href="/"
                className="text-primary hover:text-primary/80"
              >
                Home
              </Link>
              <span>-</span>
              <span>Build Smartpc</span>
            </div>
            <h1 className="w-full font-space-grotesk text-4xl md:text-[50px] font-bold mb-6 leading-[1]">
              Contact Us
            </h1>
            <p className="text-base md:text-lg text-paragraph dark:text-gray-300 leading-relaxed font-light">
              Let’s connect. Whether you have a question, need support, or want to explore a
              partnership — we’re here for you. Our team is always ready to assist, collaborate,
              or simply hear your ideas. Reach out using any of the options below — we’d love
              to hear from you.
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

        <div className="glass-card !shadow-none dark:gradient-outline-border !rounded-3xl !border-0 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 mt-8 px-6 md:px-12 py-12">
          <div className="space-y-8">
            <p className="font-space-grotesk font-semibold text-3xl mb-3">
              Contact Information
            </p>

            <div className="space-y-6">
              <div className="flex items-center">
                <div className="min-w-16 w-16 h-16 md:min-w-20 md:w-20 md:h-20 bg-[#F3DBF5] dark:bg-[#210E39] text-white rounded-full flex items-center justify-center mr-4">
                  <Image
                    src="/assets/svg/contact/phone.svg"
                    alt="Contact Us"
                    className="h-8 w-8 md:h-10 md:w-10"
                    width={34}
                    height={34}
                    priority
                  />
                </div>
                <div>
                  <h3 className="text-paragraph text-base mb-3">Phone Number</h3>
                  <p className="text-black dark:text-white text-base md:text-xl font-semibold leading-[30px]">
                    <a
                      href="tel:+16462265995"
                      className="hover:text-primary transition-colors"
                    >
                      +1 (646) 226-5995
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="min-w-16 w-16 h-16 md:min-w-20 md:w-20 md:h-20 bg-[#F3DBF5] dark:bg-[#210E39] text-white rounded-full flex items-center justify-center mr-4">
                  <Image
                    src="/assets/svg/contact/email.svg"
                    alt="Contact Us"
                    className="h-8 w-8 md:h-10 md:w-10"
                    width={34}
                    height={34}
                    priority
                  />
                </div>
                <div>
                  <h3 className="text-paragraph text-base mb-3">Email Address</h3>
                  <p className="text-black dark:text-white text-base md:text-xl font-semibold leading-[30px]">
                    <a
                      href="mailto:info@smartpc.com"
                      className="hover:text-primary transition-colors"
                    >
                      contact@senseminder.com
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="min-w-16 w-16 h-16 md:min-w-20 md:w-20 md:h-20 bg-[#F3DBF5] dark:bg-[#210E39] text-white rounded-full flex items-center justify-center mr-4">
                  <Image
                    src="/assets/svg/contact/location.svg"
                    alt="Contact Us"
                    className="h-8 w-8 md:h-10 md:w-10"
                    width={34}
                    height={34}
                    priority
                  />
                </div>
                <div>
                  <p className="text-black dark:text-white text-base md:text-xl font-semibold leading-[30px]">
                    Elan Satellite Place
                    3100 Commerce Avenue NW
                    Duluth, GA 30096,
                    United States
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 py-4 md:px-8 md:py-6 rounded-lg border bg-[#5220DE09] dark:[#ffffff0a]">
              <h2 className="text-2xl font-semibold mb-6 flex gap-4 items-center">
                  <Image
                    src="/assets/svg/contact/clock.svg"
                    alt="Contact Us"
                    className="h-8 w-8"
                    width={34}
                    height={34}
                    priority
                  />
                Business Hours
              </h2>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-paragraph text-xl font-semibold">Monday - Friday:</span>
                  <span className="text-paragraph text-xl font-semibold">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-paragraph text-xl font-semibold">Saturday:</span>
                  <span className="text-paragraph text-xl font-semibold">Closed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-paragraph text-xl font-semibold">Sunday:</span>
                  <span className="text-paragraph text-xl font-semibold">Closed</span>
                </div>
                <p className="text-sm font-light text-paragraph dark:text-gray-300 pt-4">
                  * All times are in Eastern Standard Time (EST)
                </p>
              </div>
            </div>
          </div>
          <div>
            <p className="font-space-grotesk font-semibold text-3xl mb-3">
              Send Us a Message
            </p>
            <p className="text-paragraph text-base font-light leading-[32px]">
              Please fill out the form below and we will contact you within 24 hours.
            </p>
            <br />
            <hr />
            <br />
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                            className="bg-card border-border"
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
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                            className="bg-card border-border"
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
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="How can we help you?"
                          {...field}
                          className="bg-card border-border"
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
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide details about your inquiry..."
                          className="min-h-[150px] bg-card border-border"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
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
