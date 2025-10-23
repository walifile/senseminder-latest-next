"use client";

import Image from "next/image";
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
      <div className="container my-12 md:my-20 space-y-12 overflow-hidden">
        {/* Header Section */}
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-2.5">
            <h4 className="font-space-grotesk font-bold text-2xl md:text-5xl text-center md:text-left">
              Learn How to{" "}
              <span className="text-transparent bg-clip-text bg-[linear-gradient(290.5deg,#D971FF_-70.94%,#4C55F8_10.02%,#8086F3_115.42%)]">
                Get Started
              </span>
            </h4>

            <p className="text-paragraph text-center md:text-left text-2xl">
              Watch our tutorial series to master your Sense PC experience
            </p>
          </div>

          {/* Navigation Buttons - Only show on desktop */}
          <div className="hidden md:flex items-center gap-3">
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
          </div>
        </div>

        {/* Desktop Layout - Horizontal Carousel */}
        <div
          ref={carouselRef}
          className="hidden md:flex gap-6 overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tutorials.map((tutorial, index) => (
            <motion.div
              key={tutorial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => setSelectedVideo(tutorial)}
              className={`relative group cursor-pointer shrink-0 rounded-t-2xl overflow-hidden transition-all duration-300 h-[500px]
                ${
                  index === 0
                    ? "w-[48%] min-w-[200px]"
                    : "w-[24%] min-w-[150px]"
                }`}
            >
              <Image
                src={tutorial.image}
                alt={tutorial.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes={
                  index === 0
                    ? "(max-width: 1024px) 100vw, 48vw"
                    : "(max-width: 1024px) 100vw, 24vw"
                }
                priority={index <= 1}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent dark:bg-none" />

              <div
                className="absolute top-3 right-3 text-white text-xs font-medium shadow-lg inline-flex items-center justify-center"
                style={{
                  background: "rgba(0, 0, 0, 0.2)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "9999px",
                  padding: "0.25rem 0.625rem",
                  minWidth: "52px",
                  width: "52px",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "60%",
                    height: "40%",
                    borderTop: "1px solid white",
                    borderLeft: "1px solid white",
                    borderTopLeftRadius: "9999px",
                    pointerEvents: "none",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: "60%",
                    height: "40%",
                    borderBottom: "1px solid white",
                    borderRight: "1px solid white",
                    borderBottomRightRadius: "9999px",
                    pointerEvents: "none",
                  }}
                />
                <span
                  style={{
                    position: "relative",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                    fontSize: "0.75rem",
                  }}
                >
                  {tutorial.duration}
                </span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-md shadow-lg border border-white/30 transition-transform duration-300 group-hover:scale-110">
                  <Image
                    src="/Play.svg"
                    alt="play-button"
                    width={22}
                    height={25}
                  />
                </div>
              </div>

              {/* Text Overlay (bottom-left) */}
              <div className="absolute bottom-0 left-0 p-5 text-white z-10 space-y-2">
                <h3 className="font-space-grotesk font-bold text-xl md:text-2xl">
                  {tutorial.title}
                </h3>
                <p className="text-paragraph text-base md:text-lg">
                  {tutorial.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Layout - Carousel with peek view */}
        <div
          className="md:hidden relative overflow-visible"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Carousel container with peek */}
          <div
            className="flex gap-2 transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(calc(-${currentIndex * 96}% - ${
                currentIndex * 0.5
              }rem + 2%))`,
            }}
          >
            {tutorials.map((tutorial, index) => (
              <motion.div
                key={tutorial.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => {
                  if (index === currentIndex) {
                    setSelectedVideo(tutorial);
                  } else {
                    setCurrentIndex(index);
                  }
                }}
                className={`relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg transition-all duration-300 h-[70vh] max-h-[500px] flex-shrink-0 bg-card ${
                  index === currentIndex
                    ? "w-[96%] opacity-100"
                    : "w-[96%] opacity-50 scale-95"
                }`}
              >
                <Image
                  src={tutorial.image}
                  alt={tutorial.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  priority={index === 0}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {index === currentIndex && (
                  <>
                    <div
                      className="absolute top-4 right-4 text-white text-sm font-medium shadow-lg inline-flex items-center justify-center"
                      style={{
                        background: "rgba(0, 0, 0, 0.3)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "9999px",
                        padding: "0.5rem 1rem",
                        minWidth: "fit-content",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "60%",
                          height: "40%",
                          borderTop: "1px solid white",
                          borderLeft: "1px solid white",
                          borderTopLeftRadius: "9999px",
                          pointerEvents: "none",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          width: "60%",
                          height: "40%",
                          borderBottom: "1px solid white",
                          borderRight: "1px solid white",
                          borderBottomRightRadius: "9999px",
                          pointerEvents: "none",
                        }}
                      />
                      <span
                        style={{
                          position: "relative",
                          zIndex: 1,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {tutorial.duration}
                      </span>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-md rounded-full p-6 group-hover:scale-110 transition-transform">
                        <Image
                          src="/Play.svg"
                          alt="play-button"
                          width={27}
                          height={27}
                        />
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-left text-white z-10">
                      <h3 className="text-2xl font-bold mb-2">
                        {tutorial.title}
                      </h3>
                      <p className="text-base text-gray-200 max-w-md mx-auto">
                        {tutorial.description}
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>

          {/* Mobile Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {tutorials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-4 h-4 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-gradient-to-r from-blue-500 to-purple-500"
                    : "bg-muted-foreground/40 dark:bg-white"
                }`}
              />
            ))}
          </div>
        </div>

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
