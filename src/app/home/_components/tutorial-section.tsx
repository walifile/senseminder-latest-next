import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Play, Youtube, ChevronLeft, ChevronRight } from "lucide-react";

const tutorials = [
  {
    id: 1,
    title: "Getting Started With Sense PC",
    duration: "5:30",
    description: "Learn the basics of setting up your Sense PC environment",
    image: "/gettingStartedWithSensePc.png",
    videoUrl: "/videos/getting-started.mp4",
    youtubeUrl: "https://youtube.com/watch?v=example1",
  },
  {
    id: 2,
    title: "Optimizing Your Cloud PC",
    duration: "5:30",
    description: "Tips and tricks for better performance",
    image: "/images/optimizing.jpg",
    videoUrl: "/videos/optimization.mp4",
    youtubeUrl: "https://youtube.com/watch?v=example2",
  },
  {
    id: 3,
    title: "Storage Management",
    duration: "5:20",
    description: "Efficiently manage your cloud storage space",
    image: "/images/storage.jpg",
    videoUrl: "/videos/storage.mp4",
    youtubeUrl: "https://youtube.com/watch?v=example3",
  },
  {
    id: 4,
    title: "Advanced Features",
    duration: "6:10",
    description: "Explore advanced features and customization options",
    image: "/images/advanced.jpg",
    videoUrl: "/videos/advanced.mp4",
    youtubeUrl: "https://youtube.com/watch?v=example4",
  },
];

const TutorialSection = () => {
  const [selectedVideo, setSelectedVideo] = useState<(typeof tutorials)[0] | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.offsetWidth * 0.8;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
      <section className="relative py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-left">
                Learn How to{" "}
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Get Started
              </span>
              </h2>
              <p className="text-muted-foreground text-left text-lg">
                Watch our tutorial series to master your Sense PC experience
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              <Button
                  variant="outline"
                  size="icon"
                  onClick={() => scroll("left")}
                  className="rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                  variant="outline"
                  size="icon"
                  onClick={() => scroll("right")}
                  className="rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Carousel Section */}
          <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4"
          >
            {tutorials.map((tutorial, index) => (
                <motion.div
                    key={tutorial.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={() => setSelectedVideo(tutorial)}
                    className={`relative group cursor-pointer shrink-0 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300
  ${index === 0
                        ? "w-[400px] md:w-[600px] lg:w-[700px]"   // first card = full size
                        : "w-[200px] md:w-[300px] lg:w-[350px]"   // others = half width
                    } aspect-[4/3]`}
                >
                  <img
                      src={tutorial.image}
                      alt={tutorial.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs rounded-md px-2 py-1">
                    {tutorial.duration}
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-md rounded-full p-4 group-hover:scale-110 transition-transform">
                      <Play className="text-white h-6 w-6" />
                    </div>
                  </div>

                  {/* Text Overlay (bottom-left) */}
                  <div className="absolute bottom-0 left-0 p-5 text-left text-white z-10">
                    <h3 className="text-lg font-semibold mb-1">{tutorial.title}</h3>
                    <p className="text-sm text-gray-200">{tutorial.description}</p>
                  </div>
                </motion.div>
            ))}
          </div>

          {/* Dialog for video playback */}
          <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{selectedVideo?.title}</DialogTitle>
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
                          onClick={() => window.open(selectedVideo.youtubeUrl, "_blank")}
                          className="flex items-center gap-2"
                      >
                        <Youtube className="h-4 w-4" /> Watch on YouTube
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
