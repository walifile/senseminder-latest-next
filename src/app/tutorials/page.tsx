"use client";

import React, { useMemo, useState } from "react";

import { motion } from "framer-motion";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GradientSearchInput from "@/components/shared/inputs/gradient-search-input";
import { cn } from "@/lib/utils";

import {
  TutorialDialog,
  type Tutorial,
} from "@/app/dashboard/tutorials/_components/tutorial-dialog";

const tutorials: Tutorial[] = [
  {
    id: 1,
    title: "Introduce Sense PC",
    duration: "0:56",
    description:
      "Build a powerful cloud PC in minutes and access it from any browser, on any device, from anywhere - no hardware needed.",
    videoUrl: "https://d2dlj0hxnln4ry.cloudfront.net/SENSEPC%201.mp4",
    youtubeUrl: "https://youtube.com",
    thumbnail: "/assets/images/gettingStartedWithSensePc.png",
    category: "Start here",
    difficulty: "Beginner",
    uploadDate: "2025-12-25",
    lastUpdated: "2025-12-25",
    showCategory: true,
  },
  {
    id: 2,
    title: "How Sense PC Works",
    duration: "1:30",
    description:
      "See how SensePC delivers fast performance with built-in security - plus user management, billing, support ticketing, and in-app tutorials after login.",
    videoUrl: "https://d2dlj0hxnln4ry.cloudfront.net/SENSEPC%203.mp4",
    youtubeUrl: "https://youtube.com/watch?v=performance",
    thumbnail: "/assets/images/optimizing.jpg",
    category: "Start here",
    difficulty: "Beginner",
    uploadDate: "2025-12-25",
    lastUpdated: "2025-12-25",
    showCategory: true,
  },
  {
    id: 3,
    title: "Introduce Sense Cloud",
    duration: "0:50",
    description:
      "Securely store, organize, preview, and share files with smart cloud storage that stays synced across all your devices.",
    videoUrl: "https://d2dlj0hxnln4ry.cloudfront.net/SENSEPC%202.mp4",
    youtubeUrl: "https://youtube.com/watch?v=storage",
    thumbnail: "/assets/images/storageManagement.png",
    category: "Start here",
    difficulty: "Beginner",
    uploadDate: "2025-12-25",
    lastUpdated: "2025-12-25",
    showCategory: true,
  },
];

const TutorialsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const filteredTutorials = useMemo(
    () =>
      tutorials.filter((tutorial) => {
        const matchesSearch =
          tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === "all" || tutorial.category === selectedCategory;
        const matchesDifficulty =
          selectedDifficulty === "all" ||
          tutorial.difficulty === selectedDifficulty;
        return matchesSearch && matchesCategory && matchesDifficulty;
      }),
    [searchQuery, selectedCategory, selectedDifficulty]
  );

  const categories = [
    "all",
    ...Array.from(new Set(tutorials.map((t) => t.category))),
  ];
  const difficulties = [
    "all",
    ...Array.from(new Set(tutorials.map((t) => t.difficulty))),
  ];

  return (
    <div className="relative min-h-screen bg-[#020817] text-white">
      <div className="pointer-events-none absolute -top-24 left-0 h-[220px] w-[440px] rounded-[50%] bg-[#4027E5] opacity-40 blur-[160px]" />
      <div className="pointer-events-none absolute -top-28 right-0 h-[220px] w-[440px] rounded-[50%] bg-[#9C05BF] opacity-35 blur-[160px]" />

      <div className="relative container py-14 space-y-10 font-['Space_Grotesk']">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">
            Tutorials
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Learn Sense PC and Sense Cloud{" "}
            <span className="text-transparent bg-clip-text bg-[linear-gradient(290.5deg,#D971FF_-70.94%,#4C55F8_10.02%,#8086F3_115.42%)]">
              the fast way
            </span>
          </h1>
          <p className="max-w-2xl text-white/70 text-base md:text-lg">
            Watch quick, practical walkthroughs and master the platform in
            minutes. Start here and level up as you go.
          </p>
        </div>

        <div className="rounded-3xl border border-[#2E3192] bg-[rgba(255,255,255,0.03)] p-6 md:p-8 backdrop-blur-[28px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <GradientSearchInput
              placeholder="Search tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              name="tutorial-search"
              id="tutorial-search"
            />

            <div className="flex flex-col gap-4 sm:flex-row">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-[180px]" variant="pill">
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
                <SelectTrigger className="w-full sm:w-[180px]" variant="pill">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty.charAt(0).toUpperCase() +
                        difficulty.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTutorials.map((tutorial, index) => (
            <motion.div
              key={tutorial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className={cn(
                "group relative overflow-hidden rounded-3xl border border-[#3037A8] bg-[rgba(255,255,255,0.02)]",
                "shadow-[0_0_24px_rgba(37,48,240,0.08)]"
              )}
            >
              <TutorialDialog tutorial={tutorial} />

              <div className="px-5 py-5 space-y-2">
                <h3 className="text-lg md:text-xl font-semibold text-white">
                  {tutorial.title}
                </h3>
                <p className="text-sm md:text-base text-white/70 line-clamp-2">
                  {tutorial.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                  <span>{tutorial.category}</span>
                  <span className="h-1 w-1 rounded-full bg-white/40" />
                  <span>{tutorial.difficulty}</span>
                </div>
              </div>

              <div className="border-t border-white/10 px-5 py-4 text-xs md:text-sm text-white/60">
                <div className="flex items-center justify-between">
                  <span>
                    Uploaded: {new Date(tutorial.uploadDate).toLocaleDateString()}
                  </span>
                  <span>
                    Updated: {new Date(tutorial.lastUpdated).toLocaleDateString()}
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
