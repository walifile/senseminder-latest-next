import Image from "next/image";

interface StepCardProps {
  icon: string;
  title: string;
  description: string;
}

export function StepCard({ icon, title, description }: StepCardProps) {
  return (
    <div className="relative w-full">
      {/* Opaque background layer */}
      <div className="absolute inset-0 bg-white dark:bg-[#000624] rounded-2xl" />

      {/* Gradient overlay and content */}
      <div className="relative flex max-md:flex-col items-start gap-4 p-4 md:p-12 rounded-2xl bg-[#EFEBFC] dark:bg-transparent dark:bg-[linear-gradient(276.71deg,rgba(128,134,243,0.5)_-194.99%,rgba(3,10,135,0.25)_-40.44%,rgba(186,37,240,0.5)_248.78%)]">
        <Image
          src={`/assets/svg/${icon}.svg`}
          alt={`${icon} icon`}
          width={65}
          height={65}
          className="max-md:size-10"
          unoptimized
        />

        {/* Content */}
        <div className="space-y-2">
          <h3 className="font-space-grotesk font-bold text-2xl md:text-[32px]">
            {title}
          </h3>
          <p className="text-paragraph text-base md:text-lg">{description}</p>
        </div>
      </div>
    </div>
  );
}
