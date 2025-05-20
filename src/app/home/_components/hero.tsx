"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Cloud,
  Monitor,
  Cpu,
  Wifi,
  Database,
  Lock,
  Users,
  Activity,
  LucideIcon,
} from "lucide-react";
import "../../../styles/animations.css";
import HeroSlideshow from "./hero-slide-show";

// interface FeatureProps {
//   title: string;
//   description: string;
//   Icon: LucideIcon;
// }

interface FloatingIconProps {
  icon: LucideIcon;
  className?: string;
  delay?: number;
}

// const Feature = ({ title, description, Icon }: FeatureProps) => (
//   <motion.div
//     initial={{ opacity: 0, y: 20 }}
//     animate={{ opacity: 1, y: 0 }}
//     className="flex flex-col items-center text-center p-6 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-black/5 dark:border-gray-800 shadow-lg dark:shadow-none"
//   >
//     <div className="flex items-center justify-center mb-4">
//       <Icon className="w-6 h-6 text-primary" />
//     </div>
//     <h3 className="text-lg font-semibold mb-2">{title}</h3>
//     <p className="text-sm text-muted-foreground">{description}</p>
//   </motion.div>
// );

const FloatingIcon = ({
  icon: Icon,
  className = "",
  delay = 0,
}: FloatingIconProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.5,
      delay,
      repeat: Infinity,
      repeatType: "reverse",
      repeatDelay: 2,
    }}
    className={`absolute ${className}`}
  >
    <div className="relative">
      <div className="absolute inset-0 rounded-full blur-xl dark:bg-primary/20 bg-primary/10"></div>
      <Icon className="w-6 h-6 text-primary relative z-10" />
    </div>
  </motion.div>
);

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full bg-background">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 dark:opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 dark:opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 dark:opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Background with enhanced gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] dark:bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000,transparent)]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background"></div>
      </div>

      {/* Floating Icons */}
      <FloatingIcon
        icon={Cloud}
        className="top-1/4 left-1/4 -translate-x-1/2"
        delay={0.2}
      />
      <FloatingIcon
        icon={Monitor}
        className="top-1/3 right-1/4 translate-x-1/2"
        delay={0.4}
      />
      <FloatingIcon icon={Cpu} className="bottom-1/3 left-1/3" delay={0.6} />
      <FloatingIcon icon={Wifi} className="top-1/2 right-1/3" delay={0.8} />
      <FloatingIcon
        icon={Database}
        className="bottom-1/4 right-1/4"
        delay={1.0}
      />
      <FloatingIcon icon={Lock} className="bottom-1/3 left-1/4" delay={1.2} />

      <div className="w-full relative z-10">
        <div className="w-full">
          <div className="text-center space-y-8">
            {/* Announcement Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">
                Launching Soon
              </span>
            </motion.div>

            {/* Main Heading with enhanced gradient */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                The <span className="gradient-text">Future</span> of Computing
                is Here
              </h1>
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-primary/10 rounded-full blur-lg"></div>
              <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-primary/10 rounded-full blur-lg"></div>
            </motion.div>

            {/* Subheading with glowing effect */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl md:text-4xl font-semibold relative"
            >
              <span className="bg-gradient-to-r from-primary to-primary/50 text-transparent bg-clip-text">
                Welcome to SmartPC
              </span>
              <div className="absolute inset-0 blur-2xl bg-primary/10 dark:bg-primary/20 -z-10"></div>
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Create, manage, and optimize your computer in minutes
            </motion.p>

            {/* Slideshow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 w-full"
            >
              <HeroSlideshow />
            </motion.div>

            {/* Stats with enhanced styling */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-12"
            >
              {[
                {
                  label: "Active Users",
                  value: "10K+",
                  icon: <Users className="w-5 h-5 text-primary" />,
                },
                {
                  label: "Cloud PCs",
                  value: "50K+",
                  icon: <Monitor className="w-5 h-5 text-primary" />,
                },
                {
                  label: "Uptime",
                  value: "99.9%",
                  icon: <Activity className="w-5 h-5 text-primary" />,
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  className="text-center p-4 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-black/5 dark:border-gray-800 shadow-lg dark:shadow-none"
                >
                  <div className="flex items-center justify-center mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced decorative bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 dark:via-primary/50 to-transparent"></div>
    </section>
  );
};

export default Hero;
