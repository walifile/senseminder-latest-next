import React from "react";
import Image from "next/image";

const PublicLightBackground: React.FC = () => (
  <>
    <div className="pointer-events-none absolute max-w-none">
      <Image
        src="/assets/authlayout/light/rounded.svg"
        alt=""
        width={0}
        height={0}
        sizes="100vw"
        className="block max-w-none"
        style={{ width: "auto", height: "auto" }}
      />
    </div>
    <div className="pointer-events-none absolute w-full max-w-none">
      <Image
        src="/assets/authlayout/light/pulse-gradient.png"
        alt=""
        width={0}
        height={0}
        sizes="100vw"
        className="block max-w-none w-full h-[305.951px]"
        style={{ objectFit: "fill" }}
      />
    </div>
    <div
      className="
        pointer-events-none
          absolute
        -right-[1px]
        z-0
        top-[25%]
      "
    >
      <Image
        src="/assets/authlayout/light/right-shad.png"
        alt=""
        width={0}
        height={0}
        sizes="100vw"
        className="block max-w-none h-[680px]"
        style={{ width: "auto" }}
      />
    </div>

    <div
      className="pointer-events-none absolute max-w-none"
      style={{
        left: "50%",
        top: "calc(50% + 205.5px)",
        width: "520px",
        height: "520px",
        transform: "translate(-50%, -50%)",
      }}
    >
      <Image
        src="/assets/authlayout/light/Ellipse 5.svg"
        alt=""
        width={0}
        height={0}
        sizes="100vw"
        className="block h-full  w-full max-w-none"
        style={{ objectFit: "fill" }}
      />
    </div>

    <div
      className="
          pointer-events-none
          absolute
          inset-x-0            
          bottom-[-260px]      
          z-0
        "
    >
      <Image
        src="/assets/authlayout/light/Ellipse 2.png"
        alt=""
        width={0}
        height={0}
        sizes="100vw"
        className="block edf w-full max-w-none"
        style={{ height: "auto" }}
      />
    </div>
  </>
);

export default PublicLightBackground;
