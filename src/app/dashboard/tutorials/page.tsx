"use client";

import React, { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";

import { motion } from "framer-motion";
import { Search, Youtube } from "lucide-react";
import { TutorialDialog, type Tutorial } from "./_components/tutorial-dialog";

// Tutorial data
const tutorials: Tutorial[] = [
  {
    id: 1,
    title: "Getting Started with Sense PC",
    duration: "5:30",
    description:
      "Learn the basics of setting up and using your Sense PC cloud computer.",
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
      "Discover techniques to optimize your Sense PC for maximum performance.",
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
    description: "Master the art of managing your Sense cloud efficiently.",
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
    description: "Learn essential security measures to protect your Sense PC.",
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
    description: "Customize your Sense PC environment to suit your needs.",
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
            Learn how to make the most of your Sense PC
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-5">
          {filteredTutorials.map((tutorial) => (
            <motion.div
              key={tutorial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[rgba(255,255,255,0.03)] rounded-3xl overflow-hidden border border-[#8086F3] hover:border-[#8086F3] transition-colors h-full"
            >
              <TutorialDialog tutorial={tutorial} />
              <div className="px-4 py-5">
                <h3 className="font-semibold text-sm md:text-lg truncate text-[#020816] dark:text-white">
                  {tutorial.title}
                </h3>
                <p className="text-base text-[#454545] dark:text-[#B9C2D5] mt-1 line-clamp-2">
                  {tutorial.description}
                </p>
              </div>
              <div className="h-px w-full bg-[#8086F3] mt-5 " />
              <div className="px-4 py-4">
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] text-muted-foreground">
                    Uploaded:{" "}
                    {new Date(tutorial.uploadDate).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Updated:{" "}
                    {new Date(tutorial.lastUpdated).toLocaleDateString()}
                  </span>
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
