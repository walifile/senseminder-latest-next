import React from "react";

import { cn } from "@/lib/utils";

type ProductHeroProps = {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  sectionClassName?: string;
  containerClassName?: string;
  gridClassName?: string;
  leftColumnClassName?: string;
};

const ProductHero = ({
  leftContent,
  rightContent,
  sectionClassName,
  containerClassName,
  gridClassName,
  leftColumnClassName,
}: ProductHeroProps) => (
  <section className={cn("relative overflow-hidden pt-14", sectionClassName)}>
    <div
      className={cn(
        "relative z-10 container mx-auto px-4 md:px-6 pt-16 md:pt-28 pb-16 md:pb-20",
        containerClassName
      )}
    >
      <div
        className={cn(
          "grid items-center gap-10 lg:grid-cols-[1.15fr,1fr]",
          gridClassName
        )}
      >
        <div className={cn("flex flex-col items-start gap-6", leftColumnClassName)}>
          {leftContent}
        </div>

        {rightContent}
      </div>
    </div>
  </section>
);

export default ProductHero;
