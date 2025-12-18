"use client";

import React from "react";
import Image from "next/image";

import { motion } from "framer-motion";

type GetStartedCTAProps = {
  children: React.ReactNode;
  gradient?: React.ReactNode;
  padding?: string;
};

export default function GetStartedCTA({
  children,
  padding = "px-4 py-28 md:px-12 md:py-32",
  gradient,
}: GetStartedCTAProps) {
  return (
    <section className="relative">
      <div className="relative container my-12 md:my-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className={`relative rounded-2xl ${padding} overflow-hidden bg-[#F4F1FF] dark:bg-transparent dark:bg-[linear-gradient(276.71deg,rgba(128,134,243,0.5)_-194.99%,rgba(3,10,135,0.25)_-40.44%,rgba(186,37,240,0.5)_248.78%)]`}
          role="img"
          aria-label="Get started background"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mx-auto w-fit text-center space-y-4 md:space-y-8"
          >
            {children}
          </motion.div>

          <div className="pointer-events-none">
            <Image
              src="/assets/svg/home2/get-started-cta-top.svg"
              alt="FAQ Illustration"
              width={320}
              height={320}
              className="absolute w-[140px] h-[93px] md:size-80 top-0 md:-top-5 left-0 -z-10 -z-[1px]"
              priority
            />
          </div>

          <div className="pointer-events-none">
            <Image
              src="/assets/svg/home2/get-started-cta-bottom.svg"
              alt="FAQ Illustration"
              width={320}
              height={320}
              className="absolute w-[140px] h-[93px] md:size-80 -bottom-0 md:-bottom-8 right-0 -z-[1px]"
              priority
            />
          </div>

          <div className="pointer-events-none">
            {/* <Image
              src="/assets/svg/home2/abc.png"
              alt="Gradient"
              width={568}
              height={321}
              className="absolute bottom-0 left-48 h-[79px]"
              priority
            /> */}
            <div className="w-[620.02px] h-96 bottom-[-378px] left-[135px] absolute origin-top-left rotate-[-11.32deg] bg-gradient-to-l from-fuchsia-600 via-blue-700 to-indigo-400 rounded-[50%] blur-[150px] -z-[1px]" />
          </div>
        </motion.div>
      </div>

      {gradient}
      <div className="z-0 absolute top-1/2 -translate-y-1/2 right-0 blur-[100px] md:blur-[150px] size-24 bg-[#E7ECEF]" />
    </section>
  );
}
