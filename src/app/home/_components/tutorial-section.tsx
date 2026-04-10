"use client";

import type { Tutorial } from "@/types/tutorial";

import Link from "next/link";
import React, { useRef, useState } from "react";
import { tutorials } from "@/constants/tutorials";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
} from "@/components/ui/dialog";

import { motion } from "framer-motion";

import { TutorialCard } from "./tutorial-card";

const homeTutorials = tutorials.slice(0, 3);

const TutorialSection = () => {
  const [selectedVideo, setSelectedVideo] = useState<Tutorial | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);


  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < homeTutorials.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }

    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <section data-testid="home-tutorial-section" className="relative">
      <div className="container my-12 md:my-20 space-y-8 md:space-y-12 overflow-hidden">
        {/* Header Section */}
        <div className="flex items-center justify-between gap-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="max-md:w-full space-y-3 md:space-y-2.5"
          >
            <h2 className="font-space-grotesk font-semibold text-2xl md:text-4xl text-center md:text-left">
              New to Sense PC?{" "}
              <span className="text-transparent bg-clip-text bg-[linear-gradient(290.5deg,#D971FF_-70.94%,#4C55F8_10.02%,#8086F3_115.42%)]">
                Start Here
              </span>
            </h2>

            <p className="text-paragraph text-center md:text-left text-base md:text-2xl">
              Our tutorial videos show you how to set up and optimize your cloud
              desktop easily.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="hidden md:flex items-center"
          >
            <Button
              asChild
              size="sm"
              variant="outline"
              className="rounded-full px-4"
            >
              <Link href="/tutorials">View all tutorials</Link>
            </Button>
          </motion.div>
        </div>

        {/* Desktop Layout - Horizontal Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          ref={carouselRef}
          className="hidden md:flex gap-6 overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {homeTutorials.map((tutorial, index) => (
            <TutorialCard
              key={tutorial.id}
              tutorial={tutorial}
              index={index}
              type="desktop"
              onClick={() => setSelectedVideo(tutorial)}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8 md:hidden relative overflow-visible"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex gap-4 transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(calc(-${currentIndex * 96}% - ${
                currentIndex * 1
              }rem + 2%))`,
            }}
          >
            {homeTutorials.map((tutorial, index) => (
              <TutorialCard
                key={tutorial.id}
                tutorial={tutorial}
                index={index}
                type="mobile"
                onClick={() => {
                  if (index === currentIndex) {
                    setSelectedVideo(tutorial);
                  } else {
                    setCurrentIndex(index);
                  }
                }}
              />
            ))}
          </div>

          <div className="flex justify-center gap-4">
            {homeTutorials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`size-4 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-[linear-gradient(270deg,#A801BA_0%,#2530F0_100%)]"
                    : "bg-[#454545] dark:bg-white"
                }`}
              />
            ))}
          </div>
        </motion.div>

        <Dialog
          open={!!selectedVideo}
          onOpenChange={() => setSelectedVideo(null)}
        >
          <DialogContent className="max-w-4xl bg-background border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                <div className="z-10 space-y-2">
                  <h3 className="font-space-grotesk font-bold text-xl md:text-2xl">
                    {selectedVideo?.title}
                  </h3>
                  <p className="self-stretch justify-start text-[#454545] dark:text-[#A3A3A3] text-sm font-normal font-['Inter'] leading-5">
                    {selectedVideo?.description}
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>
            {selectedVideo && (
              <div className="space-y-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={selectedVideo.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full"
                    controlsList="nodownload"
                  />
                </div>

              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default TutorialSection;
