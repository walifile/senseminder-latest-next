"use client";

import Image from "next/image";

import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

import GradientPillBadge from "@/components/shared/gradient-pill-badge";

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
        <div
          className="relative h-[216px] overflow-hidden bg-center bg-cover"
          style={{
            background: `linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%), url(${tutorial.thumbnail}) center/cover no-repeat`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/assets/svg/tutorials/play-button.svg"
              alt="Play"
              width={32}
              height={32}
              className="h-16 w-16 rounded-[50%] backdrop-blur-sm"
              priority
            />
          </div>
          <div className="absolute top-3 right-3">
            <GradientPillBadge>{tutorial.duration}</GradientPillBadge>
          </div>
          <div className="absolute top-3 left-3">
            <GradientPillBadge>{tutorial.category}</GradientPillBadge>
          </div>
        </div>
      </div>
    </DialogTrigger>
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>{tutorial.title}</DialogTitle>
        <DialogDescription>{tutorial.description}</DialogDescription>
      </DialogHeader>

      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <video src={tutorial.videoUrl} controls className="w-full h-full" />
      </div>
    </DialogContent>
  </Dialog>
);
