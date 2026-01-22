"use client";

import React from "react";
import Image from "next/image";

import { motion } from "framer-motion";

const RentSmarter: React.FC = () => (
  <section data-testid="home-rent-smarter" className="relative">
    <div className="z-0 absolute -top-60 -right-40 blur-[160px] md:blur-[200px] w-60 md:w-[400px] h-full opacity-20 dark:opacity-40 bg-[#9C05BF]" />
    <div className="z-0 absolute top-20 -right-60 blur-[160px] md:blur-[200px] w-60 md:w-[400px] h-full opacity-20 dark:opacity-40 bg-[#4027E5]" />

    <div className="container my-12 md:my-20 relative grid md:grid-cols-2 gap-8 md:gap-24">
      {/* Left Illustration */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        {/* Light mode image */}
        <Image
          src="/assets/svg/rent-smarter-light.svg"
          alt="Rent Smarter"
          width={640}
          height={578}
          className="w-full h-auto dark:hidden"
        />
        {/* Dark mode image */}
        <Image
          src="/assets/svg/rent-smarter-dark.svg"
          alt="Rent Smarter"
          width={640}
          height={578}
          className="w-full h-auto hidden dark:block"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="space-y-4 md:space-y-12"
      >
        <h2 className="font-space-grotesk font-bold text-2xl md:text-4xl">
          Why Buy
          <br /> Hardware When You Can Run It Into The Cloud?
        </h2>

        <div className="space-y-4 md:space-y-5">
          <div className="space-y-3 rounded-xl p-4 md:p-8 bg-[#F4F1FF] dark:bg-transparent dark:bg-[linear-gradient(90deg,rgba(55,0,70,0.55)_0%,rgba(7,20,50,1)_100%)]">
            <div className="flex items-center gap-2.5 md:gap-4">
              <Image
                src="/assets/svg/question_mark.svg"
                alt="Problem Icon"
                width={30}
                height={30}
                unoptimized
              />

              <h3 className="font-space-grotesk font-bold text-2xl md:text-3xl">
                Problem
              </h3>
            </div>

            <p className="text-paragraph text-base md:text-lg">
              Traditional computers are expensive to maintain, slow to upgrade, and tied to a single device.
            </p>
          </div>

          <div className="relative overflow-hidden space-y-3 rounded-xl p-4 md:p-8 bg-[#FFFFFF] dark:bg-transparent dark:bg-[linear-gradient(291.67deg,#D971FF_-83.89%,#000333_85.78%)]">
            <div className="dark:hidden absolute -top-96 -left-96 w-[1069.99px] h-[472.71px] -rotate-[11.32deg] opacity-20 bg-[linear-gradient(270deg,#BA25F0_4.8%,#2530F0_46.15%,#8086F3_100%)] blur-[50px] md:blur-[150px]" />

            <div className="dark:hidden absolute -bottom-32 md:-bottom-10 -right-60 md:-right-32 w-[287.53px] h-[178.04px] -rotate-[11.32deg] opacity-25 bg-[linear-gradient(270deg,#BA25F0_4.8%,#2530F0_46.15%,#8086F3_100%)] blur-[50px] md:blur-[150px]" />

            <div className="flex items-center gap-2.5 md:gap-4">
              <Image
                src="/assets/svg/tick-mark.svg"
                alt="Problem Icon"
                width={30}
                height={30}
                unoptimized
              />

              <h3 className="font-space-grotesk font-bold text-2xl md:text-3xl">
                Solution
              </h3>
            </div>

            <p className="text-paragraph text-base md:text-lg">
              Cloud computer that are fast, flexible and you can scale them instantly. 
              No more paying for hardware you don’t need.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default RentSmarter;
