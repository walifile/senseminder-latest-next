import React, { useState } from "react";
import { Play, Youtube } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const tutorials = [
  {
    id: 1,
    title: "Getting Started with SmartPC",
    duration: "3:45",
    description: "Learn the basics of setting up your smart PC environment",
    videoUrl: "/videos/getting-started.mp4",
    youtubeUrl: "https://youtube.com/watch?v=example1",
  },
  {
    id: 2,
    title: "Optimizing Your Cloud PC",
    duration: "4:20",
    description: "Tips and tricks for better performance",
    videoUrl: "/videos/optimization.mp4",
    youtubeUrl: "https://youtube.com/watch?v=example2",
  },
  {
    id: 3,
    title: "Storage Management",
    duration: "5:15",
    description: "Efficiently manage your cloud storage space",
    videoUrl: "/videos/storage.mp4",
    youtubeUrl: "https://youtube.com/watch?v=example3",
  },
  {
    id: 4,
    title: "Advanced Features",
    duration: "6:30",
    description: "Explore advanced features and customization options",
    videoUrl: "/videos/advanced.mp4",
    youtubeUrl: "https://youtube.com/watch?v=example4",
  },
];

const TutorialSection = () => {
  const [selectedVideo, setSelectedVideo] = useState<
    (typeof tutorials)[0] | null
  >(null);

  return (
    <section id="tutorials" className="py-20 bg-background/50 dark:bg-background/80 backdrop-blur-sm">
      <div className="container relative space-y-6 py-8 md:py-12 lg:py-24 lg:space-y-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-primary/10 dark:bg-primary/20 rounded-full mb-4 px-4 py-1.5">
            <span className="text-sm font-medium text-primary">
              Video Tutorials
            </span>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Learn How to <span className="gradient-text">Get Started</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Watch our tutorial series to master your smart PC experience
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tutorials.map((tutorial, index) => (
            <motion.div
              key={tutorial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative cursor-pointer"
              onClick={() => setSelectedVideo(tutorial)}
            >
              <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-900">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
                </div>

                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-4 backdrop-blur-sm transition-transform group-hover:scale-110">
                    <Play className="h-6 w-6 text-primary" />
                  </div>
                </div>

                {/* Duration badge */}
                <div className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-1 text-xs text-white backdrop-blur-sm dark:bg-black/60">
                  {tutorial.duration}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                  {tutorial.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {tutorial.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Video Dialog */}
        <Dialog
          open={!!selectedVideo}
          onOpenChange={() => setSelectedVideo(null)}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedVideo?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="aspect-video relative bg-black rounded-lg overflow-hidden">
                {selectedVideo && (
                  <video
                    key={selectedVideo.videoUrl}
                    src={selectedVideo.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full"
                    controlsList="nodownload"
                    playsInline
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
              {selectedVideo && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() =>
                      window.open(selectedVideo.youtubeUrl, "_blank")
                    }
                  >
                    <Youtube className="h-4 w-4" />
                    Watch on YouTube
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default TutorialSection;
