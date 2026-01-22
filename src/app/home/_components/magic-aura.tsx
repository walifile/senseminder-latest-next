"use client";

import React from "react";

type Spark = {
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
};

const genSparks = (count = 16): Spark[] =>
  Array.from({ length: count }, () => ({
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 4,
    duration: 2.5 + Math.random() * 3.5,
  }));

const MagicAura: React.FC<{ count?: number; className?: string }> = ({
  count = 18,
  className = "",
}) => {
  const [sparks] = React.useState(() => genSparks(count));

  return (
    <div
      className={
        "pointer-events-none absolute inset-0 select-none overflow-visible " +
        className
      }
    >
      {/* soft rotating glow */}
      <div className="absolute -inset-8 mx-auto my-0 left-1/2 -translate-x-1/2 size-[520px] md:size-[640px] rounded-full bg-[radial-gradient(circle_at_center,rgba(130,154,251,0.25)_0%,rgba(130,154,251,0.1)_35%,transparent_60%)] blur-3xl animate-slow-spin" />

      {/* floating gradient blobs */}
      <div className="absolute -top-6 -left-6 size-40 md:size-56 rounded-full bg-[conic-gradient(from_90deg_at_50%_50%,#A801BA,transparent_60%)] opacity-60 animate-blob" />
      <div className="absolute -bottom-10 -right-4 size-44 md:size-64 rounded-full bg-[conic-gradient(from_10deg_at_50%_50%,#2530F0,transparent_60%)] opacity-60 animate-blob animation-delay-2000" />

      {/* twinkling sparks */}
      {sparks.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full mix-blend-screen bg-white twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            // @ts-ignore custom property for CSS animation
            "--twinkle-delay": `${s.delay}s`,
            // @ts-ignore custom property for CSS animation
            "--twinkle-duration": `${s.duration}s`,
            boxShadow:
              "0 0 8px rgba(130,154,251,0.9), 0 0 18px rgba(168,1,186,0.55)",
          }}
        />
      ))}
    </div>
  );
};

export default MagicAura;

