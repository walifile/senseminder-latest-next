import React from "react";

import { cn } from "@/lib/utils";

import { Check } from "lucide-react";

type ProductPricingInfoCardProps = {
  iconSrc: string;
  title: string;
  description?: string;
  items: string[];
  cardClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  listClassName?: string;
  dividerClassName?: string;
  iconWrapperClassName?: string;
};

const ProductPricingInfoCard = ({
  iconSrc,
  title,
  description,
  items,
  cardClassName,
  headerClassName,
  titleClassName,
  descriptionClassName,
  listClassName,
  dividerClassName,
  iconWrapperClassName,
}: ProductPricingInfoCardProps) => (
  <div
    className={cn(
      "relative flex flex-col gap-4 rounded-[16px] bg-transparent px-6 py-[20px]",
      "before:absolute before:inset-0 before:rounded-[16px] before:p-px before:content-['']",
      "before:[background:linear-gradient(270deg,_#A801BA_0%,_#2530F0_100%)]",
      "before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
      "before:[-webkit-mask-composite:xor]",
      "before:[mask-composite:exclude]",
      "before:pointer-events-none",
      cardClassName
    )}
  >
    <div className={headerClassName}>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-full text-[#2530F0] dark:text-[#13E1EA]",
            iconWrapperClassName
          )}
        >
          <img alt="" aria-hidden="true" src={iconSrc} className="h-8 w-8" />
        </span>

        <h3
          className={cn(
            "font-['Space_Grotesk'] text-2xl font-semibold leading-8 text-[#0B1220] dark:text-white",
            titleClassName
          )}
        >
          {title}
        </h3>
      </div>

      {description ? (
        <p
          className={cn(
            "mt-2 font-['Inter'] text-sm font-normal leading-5 text-[#454545] dark:text-white",
            descriptionClassName
          )}
        >
          {description}
        </p>
      ) : null}
    </div>

    {description ? <hr className={cn("", dividerClassName)} /> : null}

    <ul
      className={cn(
        "space-y-3 font-['Inter'] text-base font-normal leading-6 text-[#454545] dark:text-[#B9C2D5]",
        listClassName
      )}
    >
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-[2px] inline-flex h-5 w-5 min-w-5 items-center justify-center rounded-full bg-[#13E1EA]">
            <Check className="h-3 !w-3 text-white" />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default ProductPricingInfoCard;
