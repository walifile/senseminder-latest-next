import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// import { useRouter } from "next/navigation";

const slides = [
  {
    id: 1,
    title: "High-Performance Cloud PCs",
    description: "Experience desktop-class performance anywhere, anytime",
    image: "/images/cloud-pc.webp",
    gradient: "from-blue-500/20 to-purple-500/20",
  },
  {
    id: 2,
    title: "Secure Data Storage",
    description: "Enterprise-grade encryption and backup solutions",
    image: "/images/secure-storage.webp",
    gradient: "from-green-500/20 to-blue-500/20",
  },
  {
    id: 3,
    title: "Seamless Collaboration",
    description: "Work together in real-time from anywhere in the world",
    image: "/images/collaboration.webp",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    id: 4,
    title: "Cost-Effective Solutions",
    description: "Pay only for what you use, scale as you grow",
    image: "/images/cost-effective.webp",
    gradient: "from-orange-500/20 to-red-500/20",
  },
];

const HeroSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  // const router = useRouter();

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const scrollToTutorials = () => {
    const element = document.getElementById("tutorials");
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="relative w-full aspect-[3/1] overflow-hidden bg-black/10">
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Gradient Background */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].gradient} pointer-events-none z-[1]`}
          />

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center text-center p-6 z-[2]">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl font-bold mb-2"
            >
              {slides[currentSlide].title}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm md:text-base text-muted-foreground mb-4"
            >
              {slides[currentSlide].description}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-4"
            >
              <Button asChild>
                <Link href="auth/sign-up">Get Started</Link>
              </Button>
              <Button variant="outline" onClick={scrollToTutorials}>
                Learn More
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="absolute inset-0 flex items-center justify-between p-4 z-[5] pointer-events-none">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-sm pointer-events-auto dark:bg-white/10 dark:hover:bg-white/20"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-sm pointer-events-auto dark:bg-white/10 dark:hover:bg-white/20"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-[5]">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? "w-8 bg-primary" : "w-2 bg-primary/50"
            }`}
            onClick={() => {
              setCurrentSlide(index);
              setIsAutoPlaying(false);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlideshow;
