"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const About = () => {
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

        <h1 className="text-4xl md:text-5xl font-bold mb-8 gradient-text">
          About SmartPC
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
          <div className="lg:col-span-2 space-y-6">
            <section className="glass-card p-8 rounded-xl">
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-gray-300 mb-4">
                At SmartPC, our mission is to democratize access to
                high-performance computing by delivering powerful cloud PC
                solutions that enable users to work, create, and play from
                anywhere in the world. We believe that technology should empower
                people without being limited by hardware constraints or
                geographical boundaries.
              </p>
              <p className="text-gray-300">
                We are committed to providing reliable, secure, and eco-friendly
                computing services that meet the evolving needs of individuals
                and businesses in an increasingly digital world.
              </p>
            </section>

            <section className="glass-card p-8 rounded-xl">
              <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
              <p className="text-gray-300 mb-4">
                Founded in 2020, SmartPC emerged from a vision to transform how
                people interact with computers. Our founders, experienced tech
                professionals, noticed a growing need for powerful computing
                that wasn't constrained by physical hardware limitations.
              </p>
              <p className="text-gray-300 mb-4">
                What started as a small team with big ideas has grown into a
                leading provider of smart PC solutions, serving thousands of
                users across the globe. Our journey has been defined by
                continuous innovation, a customer-first approach, and a
                commitment to technical excellence.
              </p>
              <p className="text-gray-300">
                Today, SmartPC continues to push the boundaries of what's
                possible in cloud computing, guided by our original vision and
                energized by the feedback from our diverse and growing user
                community.
              </p>
            </section>

            <section className="glass-card p-8 rounded-xl">
              <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-primary">
                    Innovation
                  </h3>
                  <p className="text-gray-300">
                    We constantly seek new ways to improve our technology and
                    services, staying ahead of industry trends.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-primary">
                    Reliability
                  </h3>
                  <p className="text-gray-300">
                    We build systems that users can depend on, with uptime and
                    performance as top priorities.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-primary">Security</h3>
                  <p className="text-gray-300">
                    We implement the highest standards of data protection and
                    privacy in everything we do.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-primary">
                    Sustainability
                  </h3>
                  <p className="text-gray-300">
                    We design our infrastructure to minimize environmental
                    impact while maximizing performance.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="glass-card p-8 rounded-xl">
              <h2 className="text-2xl font-semibold mb-4">Leadership Team</h2>
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-primary/20 mb-4"></div>
                  <h3 className="text-lg font-medium">Sarah Johnson</h3>
                  <p className="text-gray-400 text-sm">CEO & Co-Founder</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-primary/20 mb-4"></div>
                  <h3 className="text-lg font-medium">Michael Chen</h3>
                  <p className="text-gray-400 text-sm">CTO & Co-Founder</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-primary/20 mb-4"></div>
                  <h3 className="text-lg font-medium">David Rodriguez</h3>
                  <p className="text-gray-400 text-sm">COO</p>
                </div>
              </div>
            </section>

            <section className="glass-card p-8 rounded-xl">
              <h2 className="text-2xl font-semibold mb-4">Join Our Team</h2>
              <p className="text-gray-300 mb-4">
                We're always looking for talented individuals who share our
                passion for innovation and excellence.
              </p>
              <Button className="w-full">View Open Positions</Button>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default About;
