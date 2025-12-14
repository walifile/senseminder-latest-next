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
};

type TutorialDialogProps = {
  tutorial: Tutorial;
};

export const TutorialDialog = ({ tutorial }: TutorialDialogProps) => (
  <Dialog>
    <DialogTrigger asChild>
      <div className="relative cursor-pointer group">
        {/* Placeholder for video thumbnail */}
        <div className="aspect-[16/9] bg-muted flex items-center justify-center">
          <Image
            src="/assets/svg/tutorials/play-button.svg"
            alt="Play"
            width={48}
            height={48}
            className="h-16 w-16 transition-transform group-hover:scale-105"
            priority
          />
        </div>
        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-medium">
          {tutorial.duration}
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
