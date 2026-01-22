"use client";

import React, { useState } from "react";

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";

import { motion } from "framer-motion";

import GradientSearchInput from "@/components/shared/inputs/gradient-search-input";

import { type Tutorial, TutorialDialog } from "./_components/tutorial-dialog";

// Tutorial data
const tutorials: Tutorial[] = [
  {
    id: 1,
    title: "Introduce Sense PC ",
    duration: "0:56",
    description: "Build a powerful cloud PC in minutes and access it from any browser, on any device, from anywhere—no hardware needed.",
    videoUrl: "https://d2dlj0hxnln4ry.cloudfront.net/SENSEPC%201.mp4",
    youtubeUrl: "https://youtube.com",
    thumbnail: "/assets/images/gettingStartedWithSensePc.png",
    category: "Basic",
    difficulty: "Beginner",
    uploadDate: "2025-12-25",
    lastUpdated: "2025-12-25",
    showCategory: true
  },
  {
    id: 2,
    title: "How Sense PC Works",
    duration: "1:30",
    description: "See how SensePC delivers fast performance with built-in security—plus user management, billing, support ticketing, and in-app tutorials after login.",
    videoUrl: "https://d2dlj0hxnln4ry.cloudfront.net/SENSEPC%203.mp4",
    youtubeUrl: "https://youtube.com/watch?v=performance",
    thumbnail: "/assets/images/optimizing.jpg",
    category: "Sense PC Overview",
    difficulty: "Beginner",
    uploadDate: "2025-12-25",
    lastUpdated: "2025-12-25",
    showCategory: true
  },
  {
    id: 3,
    title: "Introduce Sense Cloud",
    duration: "0:50",
    description: "Securely store, organize, preview, and share files with smart cloud storage that stays synced across all your devices.",
    videoUrl: "https://d2dlj0hxnln4ry.cloudfront.net/SENSEPC%202.mp4",
    youtubeUrl: "https://youtube.com/watch?v=storage",
    thumbnail: "/assets/images/storageManagement.png",
    category: "Storage",
    difficulty: "Beginner",
    uploadDate: "2025-12-25",
    lastUpdated: "2025-12-25",
    showCategory: true
  }
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
    <div
      data-testid="dashboard-tutorials-page"
      className="rounded-3xl border border-[#8086F3] bg-white dark:bg-[rgba(255,255,255,0.03)] backdrop-blur-[32px] font-['Space_Grotesk']"
    >
      {/* Filters */}
      <div className="px-7 py-8">
        <div className="pb-5">
          <h1 className="text-2xl font-bold leading-8">Video Tutorials</h1>
          <p className="text-muted-foreground">
            Learn how to make the most of your Sense PC
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <GradientSearchInput
              placeholder="Search tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              name="tutorial-search"
              id="tutorial-search"
            />
          </div>

          <div className="flex gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] font-['Space_Grotesk']" variant="pill">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="font-['Space_Grotesk']">
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="font-['Space_Grotesk']">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedDifficulty}
              onValueChange={setSelectedDifficulty}
            >
              <SelectTrigger className="w-[180px] font-['Space_Grotesk']" variant="pill">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent className="font-['Space_Grotesk']">
                {difficulties.map((difficulty) => (
                  <SelectItem
                    key={difficulty}
                    value={difficulty}
                    className="font-['Space_Grotesk']"
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-[rgba(0,0,0,0.15)] dark:bg-[rgba(255,255,255,0.10)] rounded-full" />

      {/* Tutorials Grid */}
      <div className="px-7 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTutorials.map((tutorial) => (
            <motion.div
              key={tutorial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative bg-[rgba(255,255,255,0.03)] rounded-3xl overflow-hidden border border-[#8086F3] hover:border-[#8086F3] transition-colors h-full font-['Space_Grotesk'] pb-[53px]"
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

              <div className="absolute bottom-0 left-0 right-0">
                <div className="h-px w-full bg-[rgba(37,48,240,0.30)] dark:bg-[rgba(255,255,255,0.10)]" />

                <div className="px-4 py-4">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[14px] text-[#454545] dark:text-[#B9C2D5]">
                      Uploaded:{" "}
                      {new Date(tutorial.uploadDate).toLocaleDateString()}
                    </span>
                    <span className="text-[14px] text-[#454545] dark:text-[#B9C2D5]">
                      Updated:{" "}
                      {new Date(tutorial.lastUpdated).toLocaleDateString()}
                    </span>
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
