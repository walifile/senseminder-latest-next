"use client";

import React from "react";
import Image from "next/image";

const ELLIPSE_LIST_SRC = "/assets/svg/about/ELLIPSE_LIST.svg";
const ELLIPSE_WHATS_NEXT_SRC = "/assets/svg/about/ELLIPSE_WHATS_NEXT.svg";

const FIGMA_ELLIPSE_6_LIGHT_URL =
  "/assets/svg/about/FIGMA_ELLIPSE_6_LIGHT_URL.svg";
const FIGMA_ELLIPSE_7_LIGHT_URL =
  "/assets/svg/about/FIGMA_ELLIPSE_7_LIGHT_URL.svg";

const FIGMA_CEO_ELLIPSE_6_LIGHT_URL =
  "/assets/svg/about/FIGMA_CEO_ELLIPSE_6_LIGHT_URL.svg";

const FIGMA_WHATS_NEXT_ELLIPSE_6_LIGHT_URL =
  "/assets/svg/about/FIGMA_WHATS_NEXT_ELLIPSE_6_LIGHT_URL.svg";
const FIGMA_WHATS_NEXT_ELLIPSE_1256_LIGHT_URL =
  "/assets/svg/about/FIGMA_WHATS_NEXT_ELLIPSE_1256_LIGHT_URL.svg";

const WHO_WE_SERVE = [
  "Developers and engineers who need consistent performance.",
  "Remote workers and distributed teams who need reliable access.",
  "Creators, streamers, and power users who rely on heavy workloads",
  "Students and researchers who need accessible computing power.",
  "Organizations looking for secure, scalable cloud desktops",
];

function useIsDarkMode() {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const root = document.documentElement;

    const update = () => setIsDark(root.classList.contains("dark"));
    update();

    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  bgClassName?: string;
  ellipseSrc?: string;
  ellipseOuterClassName?: string;
  ellipseBoxClassName?: string;

  isDark?: boolean;
};

function GlassCard({
  children,
  className,
  bgClassName,
  ellipseSrc,
  ellipseOuterClassName,
  ellipseBoxClassName,
  isDark = false,
}: GlassCardProps) {
  return (
    <div
      className={[
        "relative isolate w-full rounded-2xl border",
        "border-black/10 bg-white/60 backdrop-blur-xl",
        "shadow-[0_10px_30px_rgba(2,8,22,0.08)]",
        "dark:border-white/20 dark:bg-transparent dark:backdrop-blur-0 dark:shadow-none",
        bgClassName ?? "",
        className ?? "",
      ].join(" ")}
    >
      {ellipseSrc && isDark ? (
        <div
          className={[
            "pointer-events-none absolute z-10",
            ellipseOuterClassName ?? "",
          ].join(" ")}
          aria-hidden
        >
          <div
            className={[
              "relative h-[214px] w-[214px]",
              ellipseBoxClassName ?? "",
            ].join(" ")}
          >
            <div className="absolute inset-[-93.46%]">
              <div className="relative h-full w-full">
                <Image
                  src={ellipseSrc}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="214px"
                  priority={false}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="relative z-20">{children}</div>
    </div>
  );
}

export function WhoWeServeSection() {
  const isDark = useIsDarkMode();

  return (
    <section className="container relative z-10 mb-16 md:mb-32">
      <div className="flex flex-col gap-[30px]">
        {/* Top row */}
        <div className="grid grid-cols-1 items-start gap-[30px] lg:grid-cols-[436px_1fr] lg:items-stretch">
          <div className="mx-auto flex w-full max-w-[436px] flex-col items-center justify-center gap-[34px] lg:mx-0 lg:max-w-none lg:h-[400px] lg:justify-between lg:gap-0">
            <div className="relative h-[228px] w-[228px] overflow-hidden rounded-full">
              <Image
                src="/assets/images/ashfak-ahmed.png"
                alt="Ashfak Ahmed"
                fill
                className="object-cover"
                sizes="228px"
              />
            </div>

            <GlassCard
              isDark={isDark}
              className="overflow-hidden px-[26px] py-[20px] text-center"
              bgClassName="dark:bg-[linear-gradient(-71.75767244916892deg,rgba(40,49,216,0.35)_11.783%,rgba(1,5,38,0.5)_74.564%,rgba(186,37,240,0.5)_256.64%)]"
            >
              {!isDark ? (
                <div
                  className="pointer-events-none absolute inset-0 z-0"
                  aria-hidden
                >
                  {/* Left ellipse */}
                  <div className="absolute left-[calc(50%-286.46px)] top-[calc(50%+57.1px)] h-[305.752px] w-[518.432px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <div className="flex-none rotate-[348.684deg]">
                      <div className="relative h-[214.605px] w-[485.765px]">
                        <div className="absolute inset-[-139.79%_-61.76%]">
                          <img
                            src={FIGMA_CEO_ELLIPSE_6_LIGHT_URL}
                            alt=""
                            className="block h-full w-full max-w-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute left-[calc(50%+346.22px)] top-[calc(50%-28.12px)] h-[305.752px] w-[518.432px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <div className="flex-none rotate-[348.684deg]">
                      <div className="relative h-[214.605px] w-[485.765px]">
                        <div className="absolute inset-[-139.79%_-61.76%]">
                          <img
                            src={FIGMA_CEO_ELLIPSE_6_LIGHT_URL}
                            alt=""
                            className="block h-full w-full max-w-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <p className="font-space-grotesk text-[20px] font-bold leading-[32px] tracking-[-0.5px] text-[#020816] dark:text-white md:text-[32px] md:leading-[42px]">
                Ashfak Ahmed
              </p>
              <p className="mt-2 font-inter text-[14px] font-normal leading-[28px] tracking-[-0.4px] text-[#7D7D7D] dark:text-[#B9C2D5] md:text-[24px] md:leading-[40px]">
                Founder &amp; CEO, Senseminder
              </p>
            </GlassCard>
          </div>

          <GlassCard
            isDark={isDark}
            className="overflow-hidden dark:overflow-visible px-6 pb-6 pt-10 md:px-[26px] md:pb-[26px] md:pt-12 lg:h-[400px]"
            bgClassName="dark:bg-[linear-gradient(-77.4291868645794deg,rgba(40,49,216,0.35)_11.783%,rgba(1,5,38,0.5)_74.564%,rgba(186,37,240,0.5)_256.64%)]"
            ellipseSrc={ELLIPSE_LIST_SRC}
            ellipseOuterClassName="right-[27px] top-[-28px]"
          >
            {!isDark ? (
              <div
                className="pointer-events-none absolute inset-0 z-0"
                aria-hidden
              >
                <img
                  src={FIGMA_ELLIPSE_6_LIGHT_URL}
                  alt=""
                  className="absolute left-[-500px] top-[-240px] h-[623px] w-[1142px] max-w-none"
                />
                <img
                  src={FIGMA_ELLIPSE_7_LIGHT_URL}
                  alt=""
                  className="absolute bottom-[-220px] right-[-260px] h-[426px] w-[620px] max-w-none"
                />
              </div>
            ) : null}

            <div className="relative z-10 flex flex-col gap-4">
              <h2 className="font-space-grotesk text-[26px] font-semibold leading-[34px] tracking-[-1px] text-[#020816] dark:text-white md:text-[36px] md:leading-[44px] lg:text-[42px] lg:leading-[50px]">
                Who Can Use Our Platform
              </h2>

              <ul className="list-disc pl-6 font-inter text-[16px] font-normal leading-[24px] tracking-[-0.3px] text-[#7D7D7D] dark:text-[#B9C2D5] lg:pl-9 lg:text-[24px] lg:leading-[40px] lg:tracking-[-0.4px]">
                {WHO_WE_SERVE.map((item) => (
                  <li key={item} className="mb-0">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>
        </div>

        <GlassCard
          isDark={isDark}
          className="overflow-hidden p-8"
          bgClassName="dark:bg-[linear-gradient(-61.7052625283178deg,rgba(40,49,216,0.35)_11.783%,rgba(1,5,38,0.5)_74.564%,rgba(186,37,240,0.5)_256.64%)]"
          ellipseSrc={ELLIPSE_WHATS_NEXT_SRC}
          ellipseOuterClassName="right-[-20px] top-[3px]"
        >
          {!isDark ? (
            <>
              <div
                className="pointer-events-none absolute left-[-789px] top-[calc(50%-157.92px)] z-0 flex h-[872.158px] w-[1169.703px] translate-y-[-50%] items-center justify-center"
                aria-hidden
              >
                <div className="flex-none rotate-[335.625deg]">
                  <div className="relative h-[472.707px] w-[1069.988px]">
                    <div className="absolute inset-[-63.46%_-28.04%]">
                      <img
                        src={FIGMA_WHATS_NEXT_ELLIPSE_6_LIGHT_URL}
                        alt=""
                        className="block h-full w-full max-w-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="pointer-events-none absolute left-[784px] top-[calc(50%+99.08px)] z-0 flex h-[986.166px] w-[1152.708px] translate-y-[-50%] items-center justify-center"
                aria-hidden
              >
                <div className="flex-none rotate-[326.371deg]">
                  <div className="relative h-[472.707px] w-[1069.988px]">
                    <div className="absolute inset-[-63.46%_-28.04%]">
                      <img
                        src={FIGMA_WHATS_NEXT_ELLIPSE_1256_LIGHT_URL}
                        alt=""
                        className="block h-full w-full max-w-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          <div className="relative z-10 flex flex-col gap-4">
            <h2 className="font-space-grotesk text-[26px] font-semibold leading-[34px] tracking-[-1px] text-[#020816] dark:text-white md:text-[36px] md:leading-[44px] lg:text-[42px] lg:leading-[50px]">
              What’s Next
            </h2>

            <p className="font-space-grotesk text-[16px] font-normal leading-[28px] tracking-[-0.4px] text-[#7D7D7D] dark:text-[#B9C2D5] md:text-[20px] md:leading-[32px] lg:text-[24px] lg:leading-[32px]">
              Sense PC is only the beginning. We’re building a future where
              computing is cloud-first, personal, and instantly accessible from
              any device.
            </p>

            <p className="font-inter text-[16px] font-normal leading-[28px] tracking-[-0.4px] text-[#7D7D7D] dark:text-[#B9C2D5] md:text-[20px] md:leading-[32px] lg:text-[24px] lg:leading-[40px]">
              <span className="font-space-grotesk font-semibold text-[#020816] dark:text-white">
                Next up:{" "}
              </span>
              smarter billing, AI-driven performance, and deeper integration
              across our platform.
            </p>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
