
import React from "react";


const AuthDarkBackground: React.FC = () => (
  <>
    <div className="pointer-events-none absolute inset-0">
      <img
        src="/assets/authlayout/dark/slide.svg"
        alt=""
        className="h-full w-full object-cover"
      />
    </div>

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
    <img
      src="/assets/authlayout/dark/Vector.svg"
      alt=""
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
    <img
      src="/assets/authlayout/dark/Vector (3).svg"
      alt=""
      className="block h-full w-full max-w-none"
    />
  </div>


    <div className="pointer-events-none absolute max-w-none">
      <img
        src="/assets/authlayout/dark/Ellipse 2.png"
        alt=""
        className="block h-full w-full max-w-none"
      />
    </div>

    <div className="pointer-events-none absolute top-0 right-0">
      <img
        src="/assets/authlayout/dark/Ellipse 1.png"
        alt=""
        className="block h-auto w-auto max-w-none"
      />
    </div>

    <div
      className="
        pointer-events-none absolute
        left-1/2 top-[calc(50%+220.5px)]
        h-[680px] w-[680px]
        -translate-x-1/2 -translate-y-1/2
      "
    >
      <div className="absolute inset-[-73.53%]">
        <img
          src="/assets/authlayout/dark/Ellipse 5.svg"
          alt=""
          className="block h-full w-full max-w-none"
        />
      </div>
    </div>
  </>
);

export default AuthDarkBackground;

