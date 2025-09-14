"use client";

import React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { ArrowLeft } from "lucide-react";

const About = () => (
  <main className="flex-grow pt-24 pb-16">
    <div className="container mx-auto px-4 md:px-6">
      {/* Breadcrumb */}
      <div className="mb-8 mt-4">
        <Link
          href="/"
          className="text-primary hover:text-accent flex items-center text-sm transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      {/* Page Title */}
      <h1 className="text-4xl md:text-4xl font-bold mb-6 text-foreground">
        About <span className="text-primary">SenseMinder</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        {/* Left/Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mission */}
          <section className="glass-card p-8 rounded-xl transition-shadow hover:shadow-lg duration-300">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Our Mission
            </h2>
            <p className="text-foreground mb-4">
              <span className="font-semibold text-primary">Senseminder</span>{" "}
              was founded by{" "}
              <span className="font-semibold text-primary">Ashfak Ahmed</span>,
              a senior developer and operations engineer focused on cloud-native
              computing, and is proudly headquartered in{" "}
              <span className="font-semibold text-primary">Georgia, USA</span>.
            </p>
            <p className="text-foreground mb-4">
              Our mission is to democratize access to high-performance cloud
              computing through{" "}
              <span className="font-semibold text-primary">Sense PC</span> —
              your personal, scalable, on-demand desktop that launches instantly
              from anywhere.
            </p>
            <p className="text-foreground text-lg font-semibold">
              And the best part?{" "}
              <span className="text-blue-600 dark:text-blue-400 font-bold tracking-tight">
                You only pay for what you use.
              </span>
            </p>
          </section>

          {/* Vision */}
          <section className="glass-card p-8 rounded-xl transition-shadow hover:shadow-lg duration-300">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Our Vision
            </h2>
            <ul className="list-disc list-inside text-foreground mb-4 space-y-2">
              <li>Your PC launches in seconds from any device.</li>
              <li>You never worry about upgrades or storage again.</li>
              <li>Your data is secure and your impact is sustainable.</li>
              <li>Your computing power scales instantly with your needs.</li>
            </ul>
            <p className="text-foreground text-lg font-semibold">
              We’re not patching old models —{" "}
              <span className="text-blue-600 dark:text-blue-400 font-bold tracking-tight">
                we’re building the future
              </span>
              .
            </p>
          </section>

          {/* Story */}
          <section className="glass-card p-8 rounded-xl transition-shadow hover:shadow-lg duration-300">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Our Story
            </h2>
            <p className="text-foreground mb-4">
              In 2020, I (
              <span className="font-semibold text-primary">Ashfak Ahmed</span>)
              saw a frustrating truth: even the most talented users were still
              limited by their hardware.
            </p>
            <p className="text-foreground">
              So I built{" "}
              <span className="font-semibold text-primary">Senseminder</span> —
              a platform designed from the cloud up to offer people what they
              truly need: flexibility, power, and freedom.
            </p>
          </section>

          {/* Core Values */}
          <section className="glass-card p-8 rounded-xl transition-shadow hover:shadow-lg duration-300">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Our Core Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {[
                {
                  title: "Engineer-Led Innovation",
                  text: (
                    <span className="text-foreground">
                      Built by{" "}
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        developers
                      </span>
                      , for{" "}
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        performance
                      </span>{" "}
                      and{" "}
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        impact
                      </span>
                      .
                    </span>
                  ),
                },
                {
                  title: "Security by Design",
                  text: (
                    <span className="text-foreground">
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        Privacy
                      </span>{" "}
                      and{" "}
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        protection
                      </span>{" "}
                      are foundational — not optional.
                    </span>
                  ),
                },
                {
                  title: "Pay-As-You-Go Fairness",
                  text: (
                    <span className="text-foreground">
                      <span className="text-blue-600 dark:text-blue-400 font-bold tracking-tight">
                        You only pay for what you use.
                      </span>{" "}
                      Always fair, always honest.
                    </span>
                  ),
                },
                {
                  title: "Sustainability & Simplicity",
                  text: (
                    <span className="text-foreground">
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        Green
                      </span>
                      ,{" "}
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        powerful
                      </span>
                      , and{" "}
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        user-first
                      </span>{" "}
                      by design.
                    </span>
                  ),
                },
              ].map(({ title, text }) => (
                <div key={title} className="space-y-2">
                  <h3 className="text-lg font-medium text-primary hover:text-accent transition-colors duration-200">
                    {title}
                  </h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Who We Serve */}
          <section className="glass-card p-8 rounded-xl transition-shadow hover:shadow-lg duration-300">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Who We Serve
            </h2>
            <ul className="list-disc list-inside text-foreground space-y-2">
              {[
                "Cloud developers and engineers",
                "Remote professionals and startups",
                "Gamers, streamers, and creators",
                "Students, researchers, and educators",
                "Enterprises and innovation teams",
              ].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          {/* What's Next */}
          <section className="glass-card p-8 rounded-xl transition-shadow hover:shadow-lg duration-300">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              What’s Next
            </h2>
            <p className="text-foreground text-lg font-semibold mb-4">
              <span className="font-semibold text-primary">Sense PC</span> is
              just the beginning. We’re building a world where{" "}
              <span className="text-blue-600 dark:text-blue-400 font-bold tracking-tight">
                cloud computing is personal, powerful, and everywhere.
              </span>
            </p>
            <p className="text-muted-foreground">
              From smart billing to AI-optimized desktops — the future of
              personal computing is cloud-native, fast, and fair.
            </p>
          </section>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          {/* Founder */}
          <section className="glass-card p-8 rounded-xl text-center transition-shadow hover:shadow-lg duration-300">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Founder
            </h2>
            <div className="flex flex-col items-center">
              <img
                src="/images/founder.jpg"
                alt="Ashfak Ahmed"
                className="w-24 h-24 rounded-full object-cover border-2 border-primary shadow-md mt-2 mb-4 object-top"
              />
              <h3 className="text-lg font-medium text-primary">Ashfak Ahmed</h3>
              <p className="text-muted-foreground text-sm">
                Founder & CEO, Senseminder
              </p>
            </div>
          </section>

          {/* Join the Mission
            <section className="glass-card p-8 rounded-xl transition-shadow hover:shadow-lg duration-300">
              <h2 className="text-2xl font-semibold text-primary mb-4">Join the Mission</h2>
              <p className="text-foreground mb-4">
                We're always looking for bold, passionate people to help us build the future of computing.
              </p>
              <Button className="w-full hover:bg-accent transition-colors duration-200">
                Explore Careers
              </Button>
            </section> */}

          {/* Partner With Us */}
          <section className="glass-card p-8 rounded-xl transition-shadow hover:shadow-lg duration-300">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Partner With Us
            </h2>
            <p className="text-foreground mb-4">
              At <span className="font-semibold text-primary">Senseminder</span>
              , we believe in growing through collaboration, feedback, and
              shared vision. We welcome investors, partners, and innovators who
              are excited to shape the future of cloud-native computing with us.
            </p>
            <p className="text-foreground mb-4">
              Whether you're looking to invest, collaborate, or support our
              mission — or simply want to share an idea —{" "}
              <span className="text-blue-600 dark:text-blue-400 font-bold tracking-tight">
                we value your opinion and welcome your suggestions for
                improvement.
              </span>
            </p>
            <Button
              variant="outline"
              className="mt-6 hover:bg-accent transition-colors duration-200"
              asChild
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </section>
        </div>
      </div>
    </div>
  </main>
);

export default About;
