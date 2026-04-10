import React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export type ProductFeatureGridItem = {
  title: string;
  description: string;
  iconSrc: string;
  iconAlt: string;
  priority?: boolean;
};

type ProductFeatureGridSectionProps = {
  title: string;
  items: ProductFeatureGridItem[];
  CardComponent: React.ComponentType<
    React.PropsWithChildren<{ className?: string }>
  >;
  sectionClassName?: string;
  gridClassName?: string;
  titleClassName?: string;
  itemTitleClassName?: string;
  itemDescriptionClassName?: string;
  cardClassName?: string;
};

const ProductFeatureGridSection = ({
  title,
  items,
  CardComponent,
  sectionClassName,
  gridClassName,
  titleClassName,
  itemTitleClassName,
  itemDescriptionClassName,
  cardClassName,
}: ProductFeatureGridSectionProps) => (
  <section className={cn("relative py-16 md:py-20", sectionClassName)}>
    <div className="relative z-10 container mx-auto px-4 md:px-6">
      <div className="flex flex-col items-center gap-[50px]">
        <h2
          className={cn(
            "w-full text-center font-['Space_Grotesk'] text-[36px] font-semibold leading-[44px] tracking-[-1px] capitalize text-[#020816] dark:text-white md:text-[48px] md:leading-[56px]",
            titleClassName
          )}
        >
          {title}
        </h2>

        <div
          className={cn(
            "grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-4",
            gridClassName
          )}
        >
          {items.map((item) => (
            <CardComponent key={item.title} className={cn("w-full", cardClassName)}>
              <div className="flex w-full flex-col gap-6">
                <div className="relative h-[55px] w-[55px]">
                  <Image
                    src={item.iconSrc}
                    alt={item.iconAlt}
                    fill
                    className="object-contain"
                    priority={item.priority ?? false}
                  />
                </div>

                <div className="flex flex-col gap-2 tracking-[-0.3px]">
                  <h3
                    className={cn(
                      "font-['Space_Grotesk'] text-[18px] font-semibold leading-8 text-[#020816] dark:text-white",
                      itemTitleClassName
                    )}
                  >
                    {item.title}
                  </h3>

                  <p
                    className={cn(
                      "text-[16px] leading-6 text-[#454545] dark:text-[#B9C2D5]",
                      itemDescriptionClassName
                    )}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            </CardComponent>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default ProductFeatureGridSection;
