"use client";

import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const RentSmarter: React.FC = () => {
    return (
        <section className="container bg-background/50 dark:bg-background/80 text-foreground flex flex-col md:flex-row items-center justify-center gap-10 p-10 backdrop-blur-sm rounded-3xl">
            {/* Left Illustration */}
            <div className="md:w-1/2 flex justify-center">
                <div
                    className="-mt-[80px] rounded-2xl p-6 transition-colors
                     bg-[#F4F1FF] dark:bg-transparent"
                >
                    <Image
                        src="/rent-smarter.png"
                        alt="Cloud computing illustration"
                        width={400}
                        height={400}
                        className="rounded-2xl drop-shadow-2xl"
                        priority
                    />
                </div>
            </div>

            <div className="md:w-1/2 max-w-md space-y-6">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl md:text-3xl font-bold mb-4 leading-tight"
                >
                    <span>Why Buy</span> <br /> Expensive Hardware When You Can{" "}
                    Rent Smarter?
                </motion.h2>

                <Card
                    className="border-0 rounded-2xl shadow-lg text-foreground
                     bg-[#F4F1FF] dark:bg-[linear-gradient(135deg,#370046_0%,#071432_100%)]"
                >
                    <CardContent className="p-5 space-y-2">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/question_mark.svg"
                                alt="Problem Icon"
                                width={20}
                                height={20}
                                className="drop-shadow-2xl"
                            />
                            <h2 className="font-semibold text-lg">Problem</h2>
                        </div>
                        <p className="text-sm opacity-90">
                            Physical computers are expensive, inflexible, and hard to upgrade.
                        </p>
                    </CardContent>
                </Card>

                {/* Solution Card */}
                <Card
                    className="border-0 rounded-2xl shadow-lg text-foreground
                     bg-[#F4F1FF] dark:bg-[linear-gradient(270deg,#D971FF_5%,#512C80_64%,#000333_100%)]"
                >
                    <CardContent className="p-5 space-y-2">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/tick-mark.svg"
                                alt="Solution Icon"
                                width={20}
                                height={20}
                                className="drop-shadow-2xl"
                            />
                            <h2 className="font-semibold text-lg">Solution</h2>
                        </div>
                        <p className="text-sm opacity-90">
                            Sense PC offers flexible, cost-effective cloud computing that
                            scales with your needs.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
};

export default RentSmarter;
