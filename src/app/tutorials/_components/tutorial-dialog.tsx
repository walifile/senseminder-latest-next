"use client";

import type { Tutorial } from "@/types/tutorial";

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

type TutorialDialogProps = {
  tutorial: Tutorial;
};

export const TutorialDialog = ({ tutorial }: TutorialDialogProps) => (
  <Dialog>
    <DialogTrigger asChild>
      <div
        data-testid={`dashboard-tutorial-trigger-${tutorial.id}`}
        className="relative cursor-pointer group"
      >
        <div className="relative h-[216px] overflow-hidden">
          <Image
            src={tutorial.thumbnail}
            alt={`${tutorial.title} thumbnail`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/assets/svg/tutorials/play-button.svg"
              alt="Play"
              width={32}
              height={32}
              className="h-16 w-16 rounded-[50%] backdrop-blur-sm"
            />
          </div>
          <div className="absolute top-3 right-3">
            <GradientPillBadge>{tutorial.duration}</GradientPillBadge>
          </div>
          {tutorial.showCategory && 
            <div className="absolute top-3 left-3">
              <GradientPillBadge>{tutorial.category}</GradientPillBadge>
            </div>
          }
        </div>
      </div>
    </DialogTrigger>
    <DialogContent
      data-testid={`dashboard-tutorial-dialog-${tutorial.id}`}
      className="max-w-4xl"
    >
      <DialogHeader>
        <DialogTitle>{tutorial.title}</DialogTitle>
        <DialogDescription>{tutorial.description}</DialogDescription>
      </DialogHeader>

      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <video src={tutorial.videoUrl}
          controls
          autoPlay
          playsInline
          className="w-full h-full"
          controlsList="nodownload"
        />
      </div>
    </DialogContent>
  </Dialog>
);
