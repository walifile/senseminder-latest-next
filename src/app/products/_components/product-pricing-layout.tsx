import React from "react";

import { cn } from "@/lib/utils";

type ProductPricingLayoutProps = {
  leftTopContent: React.ReactNode;
  leftBottomContent: React.ReactNode;
  rightContent: React.ReactNode;
  sectionClassName?: string;
  containerClassName?: string;
  gridClassName?: string;
  leftColumnClassName?: string;
  rightColumnClassName?: string;
};

const ProductPricingLayout = ({
  leftTopContent,
  leftBottomContent,
  rightContent,
  sectionClassName,
  containerClassName,
  gridClassName,
  leftColumnClassName,
  rightColumnClassName,
}: ProductPricingLayoutProps) => (
  <section className={cn("relative py-16 md:py-20", sectionClassName)}>
    <div className={cn("container mx-auto px-4 md:px-6", containerClassName)}>
      <div className={cn("grid gap-[30px] lg:grid-cols-[1.2fr,0.8fr]", gridClassName)}>
        <div className={cn("space-y-[23px]", leftColumnClassName)}>
          {leftTopContent}
          {leftBottomContent}
        </div>

        <div className={cn("space-y-[30px]", rightColumnClassName)}>{rightContent}</div>
      </div>
    </div>
  </section>
);

export default ProductPricingLayout;
