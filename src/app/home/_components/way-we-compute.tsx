"use client";

import React from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const WayWeCompute = () => (
  <div className="container relative my-12 md:my-20">
    <div className="z-0 hidden dark:block absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 size-1/2 blur-[300px] bg-[#6A00FF]" />

    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className="relative dark:bg-[#FFFFFF08] bg-[#F4F1FF] backdrop-blur-3xl rounded-2xl flex flex-col-reverse md:grid md:grid-cols-2 md:items-center gap-6 md:gap-8 py-4 px-4 md:py-16 md:px-12"
    >
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col gap-6 md:gap-12"
      >
        <div className="flex flex-col gap-2.5">
          <p className="font-space-grotesk font-bold text-2xl md:text-5xl leading-none tracking-tight">
            SenseMinder Sense PC—
            <span className="text-transparent bg-clip-text bg-[linear-gradient(290.5deg,_#8086F3_-80.33%,_#4C55F8_25.08%,_#C421FF_115.42%)]">
              Revolutionizing
            </span>{" "}
            the Way We Compute
          </p>

          <p className="text-paragraph text-base md:text-2xl">
            This summarizes our commitment to innovation
          </p>
        </div>

        <Button size="lg" className="w-full md:w-fit">
          Learn More
          <ArrowUpRight />
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Image
          src="/assets/svg/way-we-compute-icon.svg"
          alt="Way We Compute"
          width={600}
          height={400}
          className="size-full"
          priority
        />
      </motion.div>
    </motion.div>
  </div>
);

export default WayWeCompute;
