"use client";

import { useRouter, usePathname } from "next/navigation";
import { useRef, useMemo, useState, useEffect, useCallback } from "react";

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";

import GradientSearchInput from "@/components/shared/inputs/gradient-search-input";

type TutorialFiltersProps = {
  categories: string[];
  difficulties: string[];
  initialSearchQuery: string;
  initialCategory: string;
  initialDifficulty: string;
};

const normalizeTag = (value: string) => value.trim().toLowerCase();

const humanLabel = (value: string) =>
  value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const TutorialFilters = ({
  categories,
  difficulties,
  initialSearchQuery,
  initialCategory,
  initialDifficulty,
}: TutorialFiltersProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);

  const isFirstSearchRun = useRef(true);
  const selectedCategoryRef = useRef(initialCategory);
  const selectedDifficultyRef = useRef(initialDifficulty);

  const categoryOptions = useMemo(
    () => ["all", ...categories.map((item) => normalizeTag(item))],
    [categories],
  );
  const difficultyOptions = useMemo(
    () => ["all", ...difficulties.map((item) => normalizeTag(item))],
    [difficulties],
  );

  const applyFilters = useCallback(
    (searchTerm: string, category: string, difficulty: string) => {
      const params = new URLSearchParams();

      if (searchTerm.trim()) params.set("q", searchTerm.trim());
      if (category !== "all") params.set("category", category);
      if (difficulty !== "all") params.set("difficulty", difficulty);

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [pathname, router],
  );

  useEffect(() => {
    if (isFirstSearchRun.current) {
      isFirstSearchRun.current = false;
      return undefined;
    }

    const timer = setTimeout(() => {
      applyFilters(
        searchQuery,
        selectedCategoryRef.current,
        selectedDifficultyRef.current,
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [applyFilters, searchQuery]);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <GradientSearchInput
        placeholder="Search tutorials..."
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        name="tutorial-search"
        id="tutorial-search"
      />

      <div className="flex flex-col gap-4 sm:flex-row">
        <Select
          value={selectedCategory}
          onValueChange={(value) => {
            setSelectedCategory(value);
            selectedCategoryRef.current = value;
            applyFilters(searchQuery, value, selectedDifficultyRef.current);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]" variant="pill">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent variant="pill">
            {categoryOptions.map((category) => (
              <SelectItem key={category} value={category}>
                {category === "all" ? "All Categories" : humanLabel(category)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedDifficulty}
          onValueChange={(value) => {
            setSelectedDifficulty(value);
            selectedDifficultyRef.current = value;
            applyFilters(searchQuery, selectedCategoryRef.current, value);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]" variant="pill">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent variant="pill">
            {difficultyOptions.map((difficulty) => (
              <SelectItem key={difficulty} value={difficulty}>
                {difficulty === "all" ? "All Difficulty" : humanLabel(difficulty)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TutorialFilters;
