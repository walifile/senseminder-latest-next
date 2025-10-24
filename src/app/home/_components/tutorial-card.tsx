import Image from "next/image";

import { cn } from "@/lib/utils";

import { motion } from "framer-motion";

interface TutorialCardProps {
  tutorial: {
    id: number;
    title: string;
    duration: string;
    description: string;
    image: string;
    videoUrl: string;
    youtubeUrl: string;
  };
  index: number;
  onClick: () => void;
}

export const TutorialCard = ({
  tutorial,
  index,
  onClick,
}: TutorialCardProps) => (
  <motion.div
    key={tutorial.id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    onClick={onClick}
    className={cn(
      "relative group cursor-pointer shrink-0 rounded-t-2xl overflow-hidden transition-all duration-300 w-[96%] md:w-[31.5%] h-[500px]",
      index === 0
        ? "lg:w-[48%] lg:min-w-[200px]"
        : "lg:w-[24%] lg:min-w-[150px]"
    )}
  >
    <Image
      src={tutorial.image}
      alt={tutorial.title}
      fill
      className="object-cover transition-transform duration-500 group-hover:scale-105"
    />

    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,0,35,0)_0%,#070023_100%)]" />

    {tutorial.duration && (
      <div
        className={cn(
          "absolute top-4 right-4 bg-[#00000030] px-4 py-1 rounded-full",
          "backdrop-blur-lg bg-white/[0.03] before:content-[''] before:absolute before:inset-0 before:rounded-full before:p-[1px] before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-white/20 before:[mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] before:[mask-composite:exclude] before:pointer-events-none"
        )}
      >
        {tutorial.duration}
      </div>
    )}

    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex items-center justify-center w-20 h-20 rounded-full border border-white bg-[#F8F8F833] backdrop-blur-[14px] transition-transform duration-300 group-hover:scale-110">
        <Image
          src="/assets/svg/Play.svg"
          alt="play-button"
          width={27}
          height={30}
        />
      </div>
    </div>

    {/* Text Overlay (bottom-left) */}
    <div className="absolute bottom-0 left-0 p-4 text-white z-10 space-y-2">
      <h3 className="font-space-grotesk font-bold text-xl md:text-2xl">
        {tutorial.title}
      </h3>
      <p className="text-paragraph text-base md:text-lg">
        {tutorial.description}
      </p>
    </div>
  </motion.div>
);
