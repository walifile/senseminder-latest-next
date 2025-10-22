"use client";

import React from "react";
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";

import { motion } from "framer-motion";

const RentSmarterProcess: React.FC = () => {
    const steps = [
        {
            step: "STEP-1",
            icon: "/settings1.svg", // You'll need to add this icon
            title: "Choose Your Configuration",
            description: "Select your ideal resources (CPU, RAM, Storage).",
        },
        {
            step: "STEP-2",
            icon: "/rocket.svg", // You'll need to add this icon
            title: "Launch Your Sense PC",
            description: "Access your virtual computer instantly via browser or smart monitor.",
        },
        {
            step: "STEP-3",
            icon: "/computer1.svg", // You'll need to add this icon
            title: "Work, Play, and Create",
            description: "Enjoy seamless performance and flexibility anytime, anywhere.",
        },
    ];

    return (
        <section className="relative py-16 text-foreground overflow-hidden">
            {/* Background decorative elements - only visible in dark mode */}
            <div className="absolute inset-0 opacity-10 dark:opacity-10">
                <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
            </div>

            <div className="container relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 px-8">

                {/* Left Content */}
                <div className="w-full lg:w-1/2 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-8">
                            Why Buy <br/>
                            Expensive Hardware
                            When You Smarter?
                        </h1>


                        <motion.button
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-border text-sm h-10 rounded-full px-4 text-white"
                            style={{
                                background: 'linear-gradient(to left, #A801BA 0%, #2530F0 100%)',
                                boxShadow: '0 10px 25px rgba(168, 1, 186, 0.25)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(to right, #9100A3 0%, #1E28D9 100%)';
                                e.currentTarget.style.boxShadow = '0 15px 35px rgba(168, 1, 186, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(to right, #A801BA 0%, #2530F0 100%)';
                                e.currentTarget.style.boxShadow = '0 10px 25px rgba(168, 1, 186, 0.25)';
                            }}
                        >
                            Build Your Sense PC Now!
                            <Image
                                src="/arrow-up-right.svg"
                                alt="Arrow icon"
                                width={20}
                                height={20}
                            />
                        </motion.button>
                    </motion.div>
                </div>

                {/* Right Content - Steps */}
                {/* Desktop Layout (Large screens) */}
                <div className="lg:w-1/2 relative hidden lg:flex">
                    {/* Dotted connecting line container */}
                    <div className="relative flex-shrink-0 w-16 mr-6">
                        {/* Soft radial glow effect around the dotted line */}
                        <div
                            className="absolute left-8 transform -translate-x-1/2 w-20 opacity-30 blur-xl"
                            style={{
                                top: '80px',
                                height: 'calc(100% - 160px)',
                                background: 'linear-gradient(to bottom, rgba(130, 155, 251, 0.5) 0%, rgba(130, 154, 251, 0.3) 50%, rgba(130, 154, 251, 0.1) 100%)',
                            }}
                         />

                        <div
                            className="absolute left-8 transform -translate-x-1/2 w-12 opacity-40 blur-lg"
                            style={{
                                top: '80px',
                                height: 'calc(100% - 160px)',
                                background: 'linear-gradient(to bottom, rgba(130, 155, 251, 0.6) 0%, rgba(130, 154, 251, 0.4) 50%, rgba(130, 154, 251, 0.15) 100%)',
                            }}
                         />

                        <div
                            className="absolute left-8 w-0.5 opacity-60"
                            style={{
                                top: '80px', // Center of first card
                                height: 'calc(100% - 160px)', // To center of third card
                                background: 'repeating-linear-gradient(to bottom, #8b5cf6 0px, #8b5cf6 8px, transparent 8px, transparent 16px)'
                            }}
                         />

                        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-semibold px-6 py-2 rounded-full shadow-lg whitespace-nowrap"
                             style={{
                                 top: '64px',
                                 fontSize: '20px',
                                 background: 'linear-gradient(to left, #A801BA 0%, #2530F0 100%)'
                             }}>
                            STEP-1
                        </div>

                        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-semibold px-6 py-2 rounded-full shadow-lg whitespace-nowrap"
                             style={{
                                 top: 'calc(50% - 16px)',
                                 fontSize: '20px',
                                 background: 'transparent',
                                 border: '2px solid transparent',
                                 backgroundImage: 'linear-gradient(rgba(26, 11, 46, 0.8), rgba(26, 11, 46, 0.8)), linear-gradient(to left, #A801BA 0%, #2530F0 100%)',
                                 backgroundOrigin: 'border-box',
                                 backgroundClip: 'padding-box, border-box'
                             }}>
                            STEP-2
                        </div>

                        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-semibold px-6 py-2 rounded-full shadow-lg whitespace-nowrap"
                             style={{
                                 top: 'calc(100% - 96px)',
                                 fontSize: '20px',
                                 background: 'transparent',
                                 border: '2px solid transparent',
                                 backgroundImage: 'linear-gradient(rgba(26, 11, 46, 0.8), rgba(26, 11, 46, 0.8)), linear-gradient(to left, #A801BA 0%, #2530F0 100%)',
                                 backgroundOrigin: 'border-box',
                                 backgroundClip: 'padding-box, border-box'
                             }}>
                            STEP-3
                        </div>
                    </div>

                    <div className="flex-1 space-y-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                className="relative"
                            >
                                <Card className="relative border p-10 border-white/10 rounded-2xl hover:opacity-90 transition-all duration-300 group" style={{ background: 'linear-gradient(to right, rgba(128, 134, 243, 1) 0%, rgba(3, 10, 135, 0.5) 33%, rgba(186, 37, 240, 1) 95%)' }}>
                                    <CardContent className="p-0">
                                        <div className="flex items-center gap-4">
                                            <Image
                                                src={step.icon}
                                                alt="Arrow icon"
                                                width={65}
                                                height={65}
                                            />

                                            {/* Content */}
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-white mb-2">
                                                    {step.title}
                                                </h3>
                                                <p className="text-gray-300 text-sm leading-relaxed">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="w-full lg:hidden relative flex flex-col items-center">
                    {steps.map((step, index) => (
                        <div key={index} className="relative w-full max-w-md flex flex-col items-center">
                            {/* For Step 2 and 3: equal spacing before and after badge */}
                            {index > 0 && (
                                <>
                                    <div className="w-0.5 opacity-60"
                                         style={{
                                             height: '32px',
                                             background: 'repeating-linear-gradient(to bottom, #8b5cf6 0px, #8b5cf6 8px, transparent 8px, transparent 16px)'
                                         }} />

                                    {/* Step badge */}
                                    <div className="flex justify-center relative z-10">
                                        <div className="text-white font-semibold px-6 py-2 rounded-full shadow-lg whitespace-nowrap"
                                             style={{
                                                 fontSize: '20px',
                                                 background: 'transparent',
                                                 border: '2px solid transparent',
                                                 backgroundImage: 'linear-gradient(rgba(26, 11, 46, 0.8), rgba(26, 11, 46, 0.8)), linear-gradient(to left, #A801BA 0%, #2530F0 100%)',
                                                 backgroundOrigin: 'border-box',
                                                 backgroundClip: 'padding-box, border-box'
                                             }}>
                                            {step.step}
                                        </div>
                                    </div>

                                    {/* Dotted line from badge to card */}
                                    <div className="w-0.5 opacity-60"
                                         style={{
                                             height: '32px',
                                             background: 'repeating-linear-gradient(to bottom, #8b5cf6 0px, #8b5cf6 8px, transparent 8px, transparent 16px)'
                                         }} />
                                </>
                            )}

                            {index === 0 && (
                                <>
                                    <div className="flex justify-center relative z-10">
                                        <div className="text-white font-semibold px-6 py-2 rounded-full shadow-lg whitespace-nowrap"
                                             style={{
                                                 fontSize: '20px',
                                                 background: 'linear-gradient(to left, #A801BA 0%, #2530F0 100%)'
                                             }}>
                                            {step.step}
                                        </div>
                                    </div>

                                    <div className="w-0.5 opacity-60"
                                         style={{
                                             height: '20px',
                                             background: 'repeating-linear-gradient(to bottom, #8b5cf6 0px, #8b5cf6 8px, transparent 8px, transparent 16px)'
                                         }} />
                                </>
                            )}

                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                className="relative w-full"
                            >
                                <Card className="relative border border-white/10 rounded-2xl p-6 hover:opacity-90 transition-all duration-300" style={{ background: 'linear-gradient(to right, rgba(128, 134, 243, 1) 0%, rgba(3, 10, 135, 0.5) 33%, rgba(186, 37, 240, 1) 95%)' }}>
                                    <CardContent className="p-0">
                                        <div className="flex flex-col gap-4">
                                            {/* Icon Row */}
                                            <div className="flex justify-start">
                                                <Image
                                                    src={step.icon}
                                                    alt={step.title}
                                                    width={65}
                                                    height={65}
                                                />
                                            </div>

                                            {/* Content Row */}
                                            <div className="flex-1 text-left">
                                                <h3 className="text-xl font-semibold text-white mb-2">
                                                    {step.title}
                                                </h3>
                                                <p className="text-gray-300 text-sm leading-relaxed">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {index < steps.length - 1 && (
                                <div className="w-0.5 opacity-60"
                                     style={{
                                         height: index === 0 ? '20px' : '32px',
                                         background: 'repeating-linear-gradient(to bottom, #8b5cf6 0px, #8b5cf6 8px, transparent 8px, transparent 16px)'
                                     }} />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RentSmarterProcess;