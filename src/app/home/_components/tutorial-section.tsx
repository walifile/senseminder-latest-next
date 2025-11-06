"use client";

import React, { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
} from "@/components/ui/dialog";

import { motion } from "framer-motion";
import { Youtube, ArrowLeft, ArrowRight } from "lucide-react";

import { TutorialCard } from "./tutorial-card";

const tutorials = [
  {
    id: 1,
    title: "Getting Started With Sense PC",
    duration: "5:30",
    description: "Learn the basics of setting up your Sense PC environment",
    image: "/assets/images/gettingStartedWithSensePc.png",
    videoUrl: "/videos/getting-started.mp4",
    youtubeUrl: "https://youtube.com/watch?v=example1",
  },
  {
    id: 2,
    title: "Optimizing Your Cloud PC",
    duration: "5:30",
    description: "Tips and tricks for better performance",
    image: "/assets/images/optimizing.jpg",
    videoUrl: "/videos/optimization.mp4",
    youtubeUrl: "https://youtube.com/watch?v=example2",
  },
  {
    id: 3,
    title: "Storage Management",
    duration: "5:20",
    description: "Efficiently manage your cloud storage space",
    image: "/assets/images/storageManagement.png",
    videoUrl: "/videos/storage.mp4",
    youtubeUrl: "https://youtube.com/watch?v=example3",
  },
  {
    id: 4,
    title: "Advanced Features",
    duration: "6:10",
    description: "Explore advanced features and customization options",
    image: "/assets/images/storageManagement.png",
    videoUrl: "/videos/advanced.mp4",
    youtubeUrl: "https://youtube.com/watch?v=example4",
  },
];

const TutorialSection = () => {
  const [selectedVideo, setSelectedVideo] = useState<
    (typeof tutorials)[0] | null
  >(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const checkScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  React.useEffect(() => {
    checkScrollButtons();
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);
      return () => {
        carousel.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("resize", checkScrollButtons);
      };
    }
    return undefined;
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.offsetWidth * 0.8;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

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

    if (isLeftSwipe && currentIndex < tutorials.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }

    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <section className="relative">
      <div className="hidden dark:md:block z-0 absolute -top-10 -right-20 w-[195px] h-[357px] opacity-40 bg-[linear-gradient(270deg,#A801BA_0%,#2530F0_100%)] blur-[100px]" />
      <div className="hidden dark:md:block z-0 absolute -bottom-10 left-32 w-[195px] h-[357px] opacity-40 bg-[#9C05BF] blur-[100px]" />

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
            <h4 className="font-space-grotesk font-semibold text-2xl md:text-5xl text-center md:text-left">
              Learn How to{" "}
              <span className="text-transparent bg-clip-text bg-[linear-gradient(290.5deg,#D971FF_-70.94%,#4C55F8_10.02%,#8086F3_115.42%)]">
                Get Started
              </span>
            </h4>

            <p className="text-paragraph text-center md:text-left text-base md:text-2xl">
              Watch our tutorial series to master your Sense PC experience
            </p>
          </motion.div>

          {/* Navigation Buttons - Only show on desktop */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="hidden md:flex items-center gap-3"
          >
            <Button
              size="lg"
              variant={canScrollLeft ? "default" : "outline"}
              className="w-fit px-4 rounded-full"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
            >
              <ArrowLeft />
            </Button>

            <Button
              size="lg"
              variant={canScrollRight ? "default" : "outline"}
              className="w-fit px-4 rounded-full"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
            >
              <ArrowRight />
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
          {tutorials.map((tutorial, index) => (
            <TutorialCard
              key={tutorial.id}
              tutorial={tutorial}
              index={index}
              type="desktop"
              onClick={() => setSelectedVideo(tutorial)}
            />
          ))}
        </motion.div>

        {/* Mobile Layout - Carousel with peek view */}
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
          {/* Carousel container with peek */}
          <div
            className="flex gap-4 transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(calc(-${currentIndex * 96}% - ${
                currentIndex * 1
              }rem + 2%))`,
            }}
          >
            {tutorials.map((tutorial, index) => (
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

          {/* Mobile Dots Indicator */}
          <div className="flex justify-center gap-4">
            {tutorials.map((_, index) => (
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

        {/* Dialog for video playback */}
        <Dialog
          open={!!selectedVideo}
          onOpenChange={() => setSelectedVideo(null)}
        >
          <DialogContent className="max-w-4xl bg-background border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {selectedVideo?.title}
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
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(selectedVideo.youtubeUrl, "_blank")
                    }
                  >
                    <Youtube /> Watch on YouTube
                  </Button>
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
