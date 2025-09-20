"use client";

import Link from "next/link";
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

import { Mail, Send, Phone, MapPin, Loader2, ArrowLeft } from "lucide-react";

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
        <div className="mb-8 mt-4">
          <Link
            href="/"
            className="text-primary hover:text-primary/80 flex items-center text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <h1 className="text-4xl md:text-4xl font-bold mb-6 gradient-text">
          Contact Us
        </h1>
        <p className="text-base md:text-lg text-foreground max-w-2xl leading-relaxed mb-10">
          Let’s connect. Whether you have a question, need support, or want to
          explore a partnership — we’re here for you. Our team is always ready
          to assist, collaborate, or simply hear your ideas. Reach out using any
          of the options below — we’d love to hear from you.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <div className="glass-card p-8 rounded-xl">
              <h2 className="text-2xl font-semibold mb-6">Send Us a Message</h2>

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

          <div className="space-y-6">
            <div className="glass-card p-8 rounded-xl">
              <h2 className="text-2xl font-semibold mb-6">
                Contact Information
              </h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-primary mr-4 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Our Office</h3>
                    <p className="text-gray-300">
                      Elan Satellite Place
                      <br />
                      3100 Commerce Avenue NW
                      <br />
                      Duluth, GA 30096,
                      <br />
                      United States
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="h-6 w-6 text-primary mr-4 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Phone</h3>
                    <p className="text-gray-300">
                      <a
                        href="tel:+16462265995"
                        className="hover:text-primary transition-colors"
                      >
                        +1 (646) 226-5995
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="h-6 w-6 text-primary mr-4 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Email</h3>
                    <p className="text-gray-300">
                      <a
                        href="mailto:info@smartpc.com"
                        className="hover:text-primary transition-colors"
                      >
                        contact@senseminder.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-xl">
              <h2 className="text-2xl font-semibold mb-6">Business Hours</h2>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Monday - Friday:</span>
                  <span>10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Saturday:</span>
                  <span>Closed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Sunday:</span>
                  <span>Closed</span>
                </div>
                <p className="text-sm text-gray-400 pt-4">
                  * All times are in Eastern Standard Time (EST)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;
