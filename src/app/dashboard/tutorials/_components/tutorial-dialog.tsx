"use client";

import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";

export type Tutorial = {
  id: number;
  title: string;
  duration: string;
  description: string;
  videoUrl: string;
  youtubeUrl: string;
  category: string;
  difficulty: string;
  uploadDate: string;
  lastUpdated: string;
  thumbnail: string;
};

type TutorialDialogProps = {
  tutorial: Tutorial;
};

export const TutorialDialog = ({ tutorial }: TutorialDialogProps) => (
  <Dialog>
    <DialogTrigger asChild>
      <div className="relative cursor-pointer group">
        <div className="relative aspect-[16/9] rounded-2xl border border-[#4b56d8] overflow-hidden">
          <Image
            src={tutorial.thumbnail}
            alt={`${tutorial.title} thumbnail`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/assets/svg/tutorials/play-button.svg"
              alt="Play"
              width={32}
              height={32}
              className="h-16 w-16"
              priority
            />
          </div>
          <div className="absolute top-3 right-3 bg-black/80 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
            {tutorial.duration}
          </div>
        </div>
      </div>
    </DialogTrigger>
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>{tutorial.title}</DialogTitle>
        <DialogDescription>{tutorial.description}</DialogDescription>
      </DialogHeader>
      <div className="relative w-full rounded-2xl border border-[#4b56d8] overflow-hidden h-[216px]">
        <Image
          src={tutorial.thumbnail}
          alt={`${tutorial.title} preview`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/70 bg-black/50 backdrop-blur-sm">
            <Image
              src="/assets/svg/tutorials/play-button.svg"
              alt="Play"
              width={32}
              height={32}
              className="h-8 w-8"
              priority
            />
          </div>
        </div>
        <div className="absolute top-3 right-3 bg-black/80 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
          {tutorial.duration}
        </div>
      </div>
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <video src={tutorial.videoUrl} controls className="w-full h-full" />
      </div>
    </DialogContent>
  </Dialog>
);
