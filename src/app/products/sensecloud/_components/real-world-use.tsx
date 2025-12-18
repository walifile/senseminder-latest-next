
// "use client";

// import React from "react";
// import Image from "next/image";

// import FeatureCards from "./feature-cards";
// import ProductFeatureCard from "./product-feature-card";

// type RealWorldItem = {
//   title: string;
//   description: string;
//   imageSrc: string; // replace with real paths
// };

// const REAL_WORLD_ITEMS: RealWorldItem[] = [
//   {
//     title: "Remote Work & Freelancers",
//     description:
//       "Carry your powerful work desktop in the cloud — not in your backpack. Log in from anywhere and pick up exactly where you left off.",
//     imageSrc: "/assets/product/remote.svg",
//   },
//   {
//     title: "Teams & Small Businesses",
//     description:
//       "Standardize desktops for your team, control costs centrally, and onboard new members in minutes, not weeks.",
//     imageSrc: "/assets/product/team.svg",
//   },
//   {
//     title: "Developers & Builders",
//     description:
//       "Spin up dev-ready environments with the tools you need, without worrying about local specs or OS conflicts.",
//     imageSrc: "/assets/product/developer.svg",
//   },
//   {
//     title: "Students & Learners",
//     description:
//       "Use demanding software and tools from any affordable device, without needing a high-end laptop.",
//     imageSrc: "/assets/product/student.svg",
//   },
// ];

// const RealWorld = () => {
//   return (
//     <section className="py-16 md:py-20">
//       <div className="container mx-auto px-4 md:px-6">
//         {/* Figma main card: 1320x732, padding X=50, Y=70 (use responsive padding) */}
//         <FeatureCards className="px-6 py-10 md:px-[50px] md:py-[70px]">
//           {/* Figma: title -> grid gap 50 */}
//           <div className="flex flex-col items-center gap-8 md:gap-[50px]">
//             {/* Figma title: 48/56, tracking -1 */}
//             <h2 className="w-full text-center font-[var(--font-space-grotesk)] text-[28px] font-semibold leading-[36px] tracking-[-1px] text-[#020816] dark:text-white md:text-[48px] md:leading-[56px]">
//               Designed For Real-World Use
//             </h2>

//             {/* Figma grid: 2 cols, gap 30 */}
//             <div className="grid w-full gap-6 md:grid-cols-2 md:gap-[30px]">
//               {REAL_WORLD_ITEMS.map((item) => (
//                 <ProductFeatureCard
//                   key={item.title}
//                   className="w-full p-6 md:p-[30px]"
//                 >
//                   {/* Figma inner layout: image left + gap 24 + text */}
//                   <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-6">
//                     {/* Figma image box: 165x160 (responsive fallback on mobile) */}
//                     <div className="relative h-[92px] w-[120px] shrink-0 md:h-[160px] md:w-[165px]">
//                       <Image
//                         src={item.imageSrc}
//                         alt=""
//                         fill
//                         className="object-contain"
//                         unoptimized
//                       />
//                     </div>

//                     {/* Text block: gap 8 */}
//                     <div className="flex flex-col gap-2">
//                       {/* Figma: title 24/32 tracking -0.4 */}
//                       <h3 className="font-[var(--font-space-grotesk)] text-[18px] font-semibold leading-[26px] tracking-[-0.4px] text-[#020816] dark:text-white md:text-[24px] md:leading-[32px]">
//                         {item.title}
//                       </h3>

//                       {/* Figma: desc 18/32 tracking -0.3 */}
//                       <p className="text-[16px] leading-[24px] tracking-[-0.3px] text-[#454545] dark:text-[#B9C2D5] md:text-[18px] md:leading-[32px]">
//                         {item.description}
//                       </p>
//                     </div>
//                   </div>
//                 </ProductFeatureCard>
//               ))}
//             </div>
//           </div>
//         </FeatureCards>
//       </div>
//     </section>
//   );
// };

// export default RealWorld;

















"use client";

import React from "react";
import Image from "next/image";

import FeatureCards from "./feature-cards";
import ProductFeatureCard from "./product-feature-card";

type RealWorldItem = {
  title: string;
  description: string;
  imageSrc: string;
};

const REAL_WORLD_ITEMS: RealWorldItem[] = [
  {
    title: "Remote Work & Freelancers",
    description:
      "Carry your powerful work desktop in the cloud — not in your backpack. Log in from anywhere and pick up exactly where you left off.",
    imageSrc: "/assets/product/remote.svg",
  },
  {
    title: "Teams & Small Businesses",
    description:
      "Standardize desktops for your team, control costs centrally, and onboard new members in minutes, not weeks.",
    imageSrc: "/assets/product/team.svg",
  },
  {
    title: "Developers & Builders",
    description:
      "Spin up dev-ready environments with the tools you need, without worrying about local specs or OS conflicts.",
    imageSrc: "/assets/product/developer.svg",
  },
  {
    title: "Students & Learners",
    description:
      "Use demanding software and tools from any affordable device, without needing a high-end laptop.",
    imageSrc: "/assets/product/student.svg",
  },
];

const RealWorld = () => (
    <section className="relative py-16 md:py-20">
      {/* Background glows (slightly down from top, left & right) */}
       <div className="pointer-events-none absolute left-0 top-[-70%] z-0">
    <img
      src="/assets/product/Ellipse 9.svg"
      alt=""
      className="block h-auto w-auto max-w-none select-none"
    />
  </div>

  <div className="pointer-events-none absolute right-0 top-[-70%] z-0">
    <img
      src="/assets/product/Ellipse 8.svg"
      alt=""
      className="block h-auto w-auto max-w-none select-none"
    />
  </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        {/* Figma main card: 1320x732, padding X=50, Y=70 (use responsive padding) */}
        <FeatureCards className="px-6 py-10 md:px-[50px] md:py-[70px]">
          <div className="flex flex-col items-center gap-8 md:gap-[50px]">
            <h2 className="w-full text-center font-[var(--font-space-grotesk)] text-[28px] font-semibold leading-[36px] tracking-[-1px] text-[#020816] dark:text-white md:text-[48px] md:leading-[56px]">
              Designed For Real-World Use
            </h2>

            <div className="grid w-full gap-6 md:grid-cols-2 md:gap-[30px]">
              {REAL_WORLD_ITEMS.map((item) => (
                <ProductFeatureCard
                  key={item.title}
                  className="w-full p-6 md:p-[30px]"
                >
                  <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-6">
                    <div className="relative h-[92px] w-[120px] shrink-0 md:h-[160px] md:w-[165px]">
                      <Image
                        src={item.imageSrc}
                        alt=""
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <h3 className="font-[var(--font-space-grotesk)] text-[18px] font-semibold leading-[26px] tracking-[-0.4px] text-[#020816] dark:text-white md:text-[24px] md:leading-[32px]">
                        {item.title}
                      </h3>

                      <p className="text-[16px] leading-[24px] tracking-[-0.3px] text-[#454545] dark:text-[#B9C2D5] md:text-[18px] md:leading-[32px]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </ProductFeatureCard>
              ))}
            </div>
          </div>
        </FeatureCards>
      </div>
    </section>
);

export default RealWorld;
