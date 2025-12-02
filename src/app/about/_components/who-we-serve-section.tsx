"use client";

import Image from "next/image";

import { GradientInfoCard } from "../../home/_components/gradient-info-card";

export function WhoWeServeSection() {
  return (
    <section className="container z-10 relative mb-16 md:mb-32">
      <div className="grid gap-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1.45fr)] items-stretch">
        {/* LEFT: Founder card */}
        <div className="relative h-full">
          <div className="relative h-full overflow-hidden rounded-3xl bg-[#5B8CFF]">
            <Image
              src="/assets/images/ashfak-ahmed.png" // <- update path to your image
              alt="Ashfak Ahmed"
              width={600}
              height={720}
              className="h-full w-full object-cover"
              priority
            />
            {/* Name badge */}
            <div className="absolute left-0 bottom-0 md:bottom-6 px-5 py-4 bg-white rounded-tr-[10px] rounded-br-0 md:rounded-br-[10px] inline-flex flex-col justify-start items-start w-[18.5rem] md:w-96">
                <div className="text-[#020816] font-['Space_Grotesk'] font-semibold md:font-semibold text-2xl md:text-5xl leading-8 md:leading-[56px]">Ashfak Ahmed</div>
                <div className="text-[#020816] font-['Inter'] font-normal text-lg md:text-2xl leading-8 md:leading-10">Founder & CEO, Senseminder</div>
            </div>
          </div>
        </div>

        {/* RIGHT: Who We Serve + What's Next */}
        <div className="grid h-full gap-6 md:grid-rows-2 auto-rows-fr">
          {/* Who We Serve */}
          <section className="w-full">
            <div
              className="relative w-full h-full rounded-[16px] border border-white/20 px-[26px] py-[26px] text-left bg-[linear-gradient(315deg,rgba(27,6,81,1)_0%,rgba(18,11,87,1)_50%,rgba(13,9,95,1)_100%)] bg-opacity-50 backdrop-blur-md"
              // className="relative w-full h-full rounded-[16px] border border-white/20 px-[26px] py-[26px] text-left bg-gradient-to-l from-blue-700/30 via-slate-950/50 to-fuchsia-600/50"
            >
              {/* Title */}
              <h2 className="font-space-grotesk text-white text-3xl md:text-4xl font-semibold leading-tight">
                Who We Serve
              </h2>

              {/* Bullets */}
              <ul className="mt-6 list-disc space-y-3 pl-5 text-sm md:text-base text-[#C8D3F5]">
                <li>Cloud developers and engineers</li>
                <li>Remote professionals and startups</li>
                <li>Gamers, streamers, and creators</li>
                <li>Students, researchers, and educators</li>
                <li>Enterprises and innovation teams</li>
              </ul>
            </div>
          </section>


          {/* What's Next */}
          <GradientInfoCard title="What’s Next" className="h-full">
            <p className="font-semibold text-white">
              Sense PC is just the beginning. We’re building a world where cloud
              computing is{" "}
              <span className="text-[#A5B4FF]">
                personal, powerful, and everywhere.
              </span>
            </p>

            <p>
              From smart billing to AI-optimized desktops — the future of
              personal computing is cloud-native, fast, and fair.
            </p>
          </GradientInfoCard>
        </div>
      </div>
    </section>
  );
}
