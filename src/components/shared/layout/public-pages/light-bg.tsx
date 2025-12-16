import React from "react";

const PublicLightBackground: React.FC = () => (
  <>
    <div className="pointer-events-none absolute max-w-none">
      <img
        src="/assets/authlayout/light/rounded.svg"
        alt=""
        className="block max-w-none"
      />
    </div>
    <div className="pointer-events-none absolute w-full max-w-none">
      <img
        src="/assets/authlayout/light/pulse-gradient.png"
        alt=""
        className="block max-w-none ali w-full h-[305.951px] "
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
      <img
        src="/assets/authlayout/light/right-shad.png"
        alt=""
        className="block max-w-none 
        h-[680px] 
        
         wali 
        "
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
      <img
        src="/assets/authlayout/light/Ellipse 5.svg"
        alt=""
        className="block h-full w-full max-w-none"
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
      <img
        src="/assets/authlayout/light/Ellipse 2.png"
        alt=""
        className="block w-full max-w-none"
      />
    </div>
  </>
);

export default PublicLightBackground;
