"use client";

import Image from "next/image";

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
              <div className="text-[#020816] font-['Space_Grotesk'] font-semibold md:font-semibold text-2xl md:text-5xl leading-8 md:leading-[56px]">
                Ashfak Ahmed
              </div>
              <div className="text-[#020816] font-['Inter'] font-normal text-lg md:text-2xl leading-8 md:leading-10">
                Founder & CEO, Senseminder
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Who We Serve + What's Next */}
        <div className="grid h-full gap-6 md:grid-rows-2 auto-rows-fr">
          {/* Who We Serve */}
          <section className="w-full">
            <div className="relative w-full h-full rounded-[16px] outline outline-1 outline-offset-[-1px] outline-white/20 p-4 md:p-7 text-left bg-white dark:bg-[linear-gradient(135deg,rgba(28,6,82,0.25)_0%,rgba(18,11,87,1)_80%,rgba(13,9,95,1)_100%)] bg-opacity-50 backdrop-blur-md overflow-hidden">
              <div
                className="pointer-events-none absolute -z-10 dark:hidden w-[1069.988px] h-[472.7071px] rounded-[32px] backdrop-blur-[300px] opacity-20 blur-[150px]"
                style={{
                  background:
                    "linear-gradient(270deg, #BA25F0 4.8%, #2530F0 46.15%, #8086F3 100%)",
                  top: "-330px",
                  left: "-498px",
                  transform: "rotate(-5.6deg)",
                  borderRadius: "50%",
                }}
              />
              <div
                className="pointer-events-none absolute -z-10 dark:hidden w-[568.051px] h-[321.133px]  opacity-20 blur-[150px]"
                style={{
                  background:
                    "linear-gradient(270deg, #BA25F0 4.8%, #2530F0 46.15%, #8086F3 100%)",
                  transform: "rotate(-20.316deg)",
                  bottom: "-170px",
                  right: "-140px",
                  borderRadius: "50%",
                }}
              />

              {/* Title */}
              <h2 className="font-space-grotesk text-[#020816] dark:text-white text-2xl md:text-5xl font-semibold leading-8 md:leading-[56px] mb-4">
                Who We Serve
              </h2>

              {/* Bullets */}
              <ul className="list-disc pl-5">
                <li className="self-stretch justify-start text-paragraph text-base md:text-2xl font-normal font-['Inter'] leading-6 md:leading-10">
                  Cloud developers and engineers
                </li>
                <li className="self-stretch justify-start text-paragraph text-base md:text-2xl font-normal font-['Inter'] leading-6 md:leading-10">
                  Remote professionals and startups
                </li>
                <li className="self-stretch justify-start text-paragraph text-base md:text-2xl font-normal font-['Inter'] leading-6 md:leading-10">
                  Gamers, streamers, and creators
                </li>
                <li className="self-stretch justify-start text-paragraph text-base md:text-2xl font-normal font-['Inter'] leading-6 md:leading-10">
                  Students, researchers, and educators
                </li>
                <li className="self-stretch justify-start text-paragraph text-base md:text-2xl font-normal font-['Inter'] leading-6 md:leading-10">
                  Enterprises and innovation teams
                </li>
              </ul>
            </div>
          </section>

          {/* What's Next */}
          <section className="w-full">
            <div className="relative w-full h-full rounded-[16px] outline outline-1 outline-offset-[-1px] outline-white/20 p-4 md:p-7 text-left bg-white dark:bg-[linear-gradient(135deg,rgba(28,6,82,0.25)_0%,rgba(18,11,87,1)_80%,rgba(13,9,95,1)_100%)] bg-opacity-50 backdrop-blur-md space-y-4 overflow-hidden">
              {/* Title */}
              <div
                className="pointer-events-none absolute -z-10 dark:hidden w-[1069.988px] h-[472.7071px] rounded-[32px] backdrop-blur-[300px] opacity-20 blur-[150px]"
                style={{
                  background:
                    "linear-gradient(270deg, #BA25F0 4.8%, #2530F0 46.15%, #8086F3 100%)",
                  top: "-330px",
                  left: "-498px",
                  transform: "rotate(-5.6deg)",
                  borderRadius: "50%",
                }}
              />
              <div
                className="pointer-events-none absolute -z-10 dark:hidden w-[568.051px] h-[321.133px]  opacity-20 blur-[150px]"
                style={{
                  background:
                    "linear-gradient(270deg, #BA25F0 4.8%, #2530F0 46.15%, #8086F3 100%)",
                  transform: "rotate(-20.316deg)",
                  bottom: "-170px",
                  right: "-140px",
                  borderRadius: "50%",
                }}
              />
              <h2 className="font-space-grotesk text-[#020816] dark:text-white text-2xl md:text-5xl font-semibold leading-8 md:leading-[56px] mb-4">
                What’s Next
              </h2>
              <div className="self-stretch justify-start bg-[linear-gradient(90deg,#D971FF_0%,#4C55FB_45%,#8086F3_100%)] bg-clip-text text-transparent">
                <span className="text-transparent text-lg md:text-2xl font-normal md:font-semibold font-['Inter'] md:font-['Space_Grotesk'] capitalize leading-8">
                  Sense PC
                </span>
                <span className="text-[#020816] dark:text-white text-lg md:text-2xl font-normal md:font-semibold font-['Inter'] md:font-['Space_Grotesk'] lowercase md:capitalize leading-8">
                  {" "}
                  is just the beginning. We’re building a world where cloud
                  computing is{" "}
                </span>
                <span className="text-transparent text-lg md:text-2xl font-normal md:font-semibold font-['Inter'] md:font-['Space_Grotesk'] lowercase md:capitalize leading-8">
                  personal, powerful, and everywhere.
                </span>
              </div>
              <div className="self-stretch justify-start text-paragraph text-base md:text-2xl font-normal font-['Inter'] leading-6 md:leading-10">
                From smart billing to AI-optimized desktops — the future of
                personal computing is cloud-native, fast, and fair.
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
