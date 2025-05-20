"use client";

import React, { useState } from "react";
import { Play, Youtube, Search } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Tutorial data
const tutorials = [
  {
    id: 1,
    title: "Getting Started with SmartPC",
    duration: "5:30",
    description:
      "Learn the basics of setting up and using your SmartPC cloud computer.",
    videoUrl: "/videos/getting-started.mp4",
    youtubeUrl: "https://youtube.com/watch?v=getting-started",
    category: "Basics",
    difficulty: "Beginner",
    uploadDate: "2024-02-15",
    lastUpdated: "2024-03-10",
  },
  {
    id: 2,
    title: "Advanced Performance Optimization",
    duration: "8:45",
    description:
      "Discover techniques to optimize your SmartPC for maximum performance.",
    videoUrl: "/videos/performance.mp4",
    youtubeUrl: "https://youtube.com/watch?v=performance",
    category: "Performance",
    difficulty: "Advanced",
    uploadDate: "2024-02-01",
    lastUpdated: "2024-03-05",
  },
  {
    id: 3,
    title: "Storage Management Guide",
    duration: "6:15",
    description: "Master the art of managing your smart storage efficiently.",
    videoUrl: "/videos/storage.mp4",
    youtubeUrl: "https://youtube.com/watch?v=storage",
    category: "Storage",
    difficulty: "Intermediate",
    uploadDate: "2024-01-20",
    lastUpdated: "2024-02-28",
  },
  {
    id: 4,
    title: "Security Best Practices",
    duration: "7:20",
    description: "Learn essential security measures to protect your SmartPC.",
    videoUrl: "/videos/security.mp4",
    youtubeUrl: "https://youtube.com/watch?v=security",
    category: "Security",
    difficulty: "Intermediate",
    uploadDate: "2024-01-15",
    lastUpdated: "2024-03-01",
  },
  {
    id: 5,
    title: "Customization and Personalization",
    duration: "4:55",
    description: "Customize your SmartPC environment to suit your needs.",
    videoUrl: "/videos/customization.mp4",
    youtubeUrl: "https://youtube.com/watch?v=customization",
    category: "Customization",
    difficulty: "Beginner",
    uploadDate: "2024-02-10",
    lastUpdated: "2024-02-25",
  },
];

const TutorialsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  // Filter tutorials based on search, category, and difficulty
  const filteredTutorials = tutorials.filter((tutorial) => {
    const matchesSearch =
      tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || tutorial.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "all" ||
      tutorial.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Get unique categories and difficulties for filters
  const categories = [
    "all",
    ...Array.from(new Set(tutorials.map((t) => t.category))),
  ];
  const difficulties = [
    "all",
    ...Array.from(new Set(tutorials.map((t) => t.difficulty))),
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Video Tutorials</h1>
          <p className="text-muted-foreground">
            Learn how to make the most of your SmartPC
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedDifficulty}
              onValueChange={setSelectedDifficulty}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((difficulty) => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tutorials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTutorials.map((tutorial) => (
            <motion.div
              key={tutorial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-card rounded-lg overflow-hidden border hover:border-primary/50 transition-colors"
            >
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative cursor-pointer group">
                    {/* Placeholder for video thumbnail */}
                    <div className="aspect-[16/9] bg-muted flex items-center justify-center">
                      <Play className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-medium">
                      {tutorial.duration}
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>{tutorial.title}</DialogTitle>
                    <DialogDescription>
                      {tutorial.description}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      src={tutorial.videoUrl}
                      controls
                      className="w-full h-full"
                    />
                  </div>
                </DialogContent>
              </Dialog>

              <div className="p-3">
                <h3 className="font-medium text-sm truncate">
                  {tutorial.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {tutorial.description}
                </p>
                <div className="flex flex-col gap-2 mt-3">
                  <div className="flex gap-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      {tutorial.category}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/10 text-secondary">
                      {tutorial.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground">
                        Uploaded:{" "}
                        {new Date(tutorial.uploadDate).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Updated:{" "}
                        {new Date(tutorial.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => window.open(tutorial.youtubeUrl, "_blank")}
                    >
                      <Youtube className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TutorialsPage;
