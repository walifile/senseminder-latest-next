"use client";

import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

const PublicDarkBackground: React.FC = () => {
  const pathname = usePathname();

  // ✅ Hide this one glow on /about (and any nested /about/* routes)
  const hideEllipse5Glow =
    pathname === "/about" || pathname.startsWith("/about/");

  return (
    <>
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          -translate-x-1/2
          top-[6vh]
          hidden md:block
          opacity-0.5
        "
        aria-hidden
      >
        <Image
          src="/assets/authlayout/dark/Vector.svg"
          alt=""
          width={0}
          height={0}
          sizes="85vw"
          className="block h-full w-full max-w-none"
        />
      </div>

      <div
        className="
          pointer-events-none
          absolute
          top-[11vh]
        "
        aria-hidden
      >
        <Image
          src="/assets/authlayout/dark/Vector (3).svg"
          alt=""
          width={0}
          height={0}
          sizes="85vw"
          className="block h-full w-full max-w-none"
        />
      </div>

      <div className="pointer-events-none absolute max-w-none">
        <Image
          src="/assets/authlayout/dark/Ellipse 2.png"
          alt=""
          width={0}
          height={0}
          sizes="85vw"
          className="block h-full w-full max-w-none"
        />
      </div>

      <div className="pointer-events-none absolute top-0 right-0">
        <Image
          src="/assets/authlayout/dark/Ellipse 1.png"
          alt=""
          width={0}
          height={0}
          sizes="85vw"
          className="block h-auto w-auto max-w-none"
        />
      </div>

      {/* ✅ This glow will NOT render on /about */}
      {!hideEllipse5Glow && (
        <div
          className="
            pointer-events-none absolute
            left-1/2 top-[calc(50%+220.5px)]
            h-[680px] w-[680px]
            -translate-x-1/2 -translate-y-1/2
          "
          aria-hidden
        >
          <div className="absolute inset-[-73.53%]">
            <Image
              src="/assets/authlayout/dark/Ellipse 5.svg"
              alt=""
              width={0}
              height={0}
              sizes="85vw"
              className="block h-full w-full max-w-none"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PublicDarkBackground;
