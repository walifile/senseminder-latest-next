import type { Metadata } from "next";

import { homeMeta } from "./seo/metadata";
import { homeJsonLd } from "./seo/schema/home";
import Home from "../app/home/_components/main-page";

export const metadata: Metadata = {
  title: homeMeta.title,
  description: homeMeta.description,
  keywords: homeMeta.keywords,
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <Home />
      {/* {isDev ? (
        <Home />
      ) : (
        <main className="relative min-h-screen text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-300 via-purple-400 to-indigo-400" />
          <div className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-white/20 blur-3xl opacity-35 animate-float-slow" />
          <div className="pointer-events-none absolute top-24 right-10 h-72 w-72 rounded-full bg-white/20 blur-3xl opacity-30 animate-float" />
          <svg
            className="pointer-events-none absolute bottom-0 left-0 w-full"
            viewBox="0 0 1440 320"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="wave" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.20)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
              </linearGradient>
            </defs>
            <path
              fill="url(#wave)"
              d="M0,192L40,165.3C80,139,160,85,240,74.7C320,64,400,96,480,106.7C560,117,640,107,720,133.3C800,160,880,224,960,224C1040,224,1120,160,1200,133.3C1280,107,1360,117,1400,122.7L1440,128V320H0Z"
            />
          </svg>
          <svg
            className="pointer-events-none absolute top-8 left-6 w-40 sm:w-56 opacity-35 sm:opacity-45 blur-[1.1px] sm:blur-[1.3px] animate-cloud-left"
            viewBox="0 0 300 120"
            aria-hidden="true"
          >
            <path
              d="M60 90c-18 0-32-12-32-28 0-14 10-26 24-28 4-14 18-24 34-24 18 0 33 12 36 28h3c14 0 25 11 25 24s-11 24-25 24H60z"
              fill="white"
            />
          </svg>
          <svg
            className="pointer-events-none absolute top-14 right-3 sm:right-8 w-40 sm:w-60 opacity-35 blur-[1px] animate-cloud-right"
            viewBox="0 0 360 140"
            aria-hidden="true"
          >
            <path
              d="M90 100c-24 0-44-16-44-36 0-18 14-33 31-36 6-18 24-32 46-32 24 0 44 16 48 36h4c18 0 32 14 32 31s-14 31-32 31H90z"
              fill="white"
            />
          </svg>
          <svg
            className="pointer-events-none absolute top-40 right-8 hidden md:block w-44 opacity-35 blur-[1px] animate-cloud-left"
            viewBox="0 0 300 120"
            aria-hidden="true"
          >
            <path
              d="M60 90c-18 0-32-12-32-28 0-14 10-26 24-28 4-14 18-24 34-24 18 0 33 12 36 28h3c14 0 25 11 25 24s-11 24-25 24H60z"
              fill="white"
            />
          </svg>
          <svg
            className="pointer-events-none absolute bottom-28 right-6 hidden md:block w-72 opacity-30 blur-[1.2px] animate-cloud-right"
            viewBox="0 0 420 180"
            aria-hidden="true"
          >
            <path
              d="M110 130c-28 0-50-19-50-42 0-21 16-38 35-41 6-19 26-33 49-33 26 0 47 17 51 39h4c19 0 34 15 34 33s-15 33-34 33H110z"
              fill="white"
            />
          </svg>
          <section className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6">
            <div className="relative inline-block text-center">
              <div className="relative z-20 rounded-3xl border border-white/20 bg-white/15 p-6 sm:p-8 md:p-10 backdrop-blur-xl shadow-[0_16px_60px_rgba(0,0,0,0.18)]">
                <img
                  src="/sensepc-home-logo.png"
                  alt="SensePC logo"
                  className="mx-auto h-16 md:h-20 w-auto"
                />
                <p className="mt-5 sm:mt-6 text-sm md:text-lg text-white/90">
                  A new way to experience your computer — in the cloud.
                </p>
                <h1 className="mt-2 md:mt-3 text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-white via-fuchsia-100 to-blue-100 bg-clip-text text-transparent">
                    COMING&nbsp;SOON&nbsp;...
                  </span>
                </h1>
                <div className="mt-6 md:mt-9 flex flex-wrap items-center justify-center gap-2.5 md:gap-3">
                  <a
                    href="https://www.linkedin.com/company/sensepcofficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 md:px-4 py-1.5 md:py-2 text-xs md:text-sm ring-1 ring-white/25 backdrop-blur hover:bg-white/25 transition"
                  >
                    LinkedIn
                  </a>
                  <a
                    href="https://www.facebook.com/sensepcofficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 md:px-4 py-1.5 md:py-2 text-xs md:text-sm ring-1 ring-white/25 backdrop-blur hover:bg-white/25 transition"
                  >
                    Facebook
                  </a>
                  <a
                    href="https://www.instagram.com/sensepcofficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 md:px-4 py-1.5 md:py-2 text-xs md:text-sm ring-1 ring-white/25 backdrop-blur hover:bg-white/25 transition"
                  >
                    Instagram
                  </a>
                  <a
                    href="https://www.tiktok.com/@sensepcofficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 md:px-4 py-1.5 md:py-2 text-xs md:text-sm ring-1 ring-white/25 backdrop-blur hover:bg-white/25 transition"
                  >
                    TikTok
                  </a>
                  <a
                    href="https://x.com/sensepcofficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 md:px-4 py-1.5 md:py-2 text-xs md:text-sm ring-1 ring-white/25 backdrop-blur hover:bg-white/25 transition"
                  >
                    X
                  </a>
                </div>
                <div className="mt-4 flex justify-center">
                  <Link
                    href="/home"
                    className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 md:px-4 py-1.5 md:py-2 text-xs md:text-sm ring-1 ring-white/25 backdrop-blur hover:bg-white/25 transition"
                  >
                    Early Access
                  </Link>
                </div>
                <p className="mt-5 md:mt-6 text-[10px] sm:text-xs text-white/75">
                  sensepc.com
                </p>
              </div>
              <svg
                viewBox="0 0 520 220"
                className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 translate-x-[-100px] -translate-y-[22px] w-[19rem] sm:w-[22rem] opacity-60 z-10 md:hidden"
                aria-hidden="true"
              >
                <defs>
                  <clipPath id="monitor-cloud-cut-m">
                    <rect x="0" y="22" width="520" height="198" />
                  </clipPath>
                </defs>
                <g clipPath="url(#monitor-cloud-cut-m)">
                  <path
                    d="M140 160c-32 0-58-22-58-48 0-24 19-43 44-47 8-23 34-41 64-41 32 0 59 19 65 45h6c26 0 46 18 46 41s-20 41-46 41H140z"
                    fill="rgba(255,255,255,0.55)"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="2"
                  />
                  <rect
                    x="238"
                    y="162"
                    width="44"
                    height="16"
                    rx="8"
                    fill="rgba(255,255,255,0.85)"
                  />
                  <rect
                    x="195"
                    y="180"
                    width="130"
                    height="14"
                    rx="7"
                    fill="rgba(255,255,255,0.75)"
                  />
                </g>
              </svg>
              <svg
                viewBox="0 0 520 220"
                className="pointer-events-none absolute hidden md:block left-[62%] top-full -translate-x-1/2 -translate-y-[35px] w-[28rem] md:w-[34rem] opacity-60 z-10"
                aria-hidden="true"
              >
                <defs>
                  <clipPath id="monitor-cloud-cut-d">
                    <rect x="0" y="33" width="520" height="196" />
                  </clipPath>
                </defs>
                <g clipPath="url(#monitor-cloud-cut-d)">
                  <path
                    d="M140 160c-32 0-58-22-58-48 0-24 19-43 44-47 8-23 34-41 64-41 32 0 59 19 65 45h6c26 0 46 18 46 41s-20 41-46 41H140z"
                    fill="rgba(255,255,255,0.55)"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="2"
                  />
                  <rect
                    x="238"
                    y="162"
                    width="44"
                    height="16"
                    rx="8"
                    fill="rgba(255,255,255,0.85)"
                  />
                  <rect
                    x="195"
                    y="180"
                    width="130"
                    height="14"
                    rx="7"
                    fill="rgba(255,255,255,0.75)"
                  />
                </g>
              </svg>
            </div>
          </section>
          <footer aria-label="SensePC footer note" className="z-20">
            <div
              className="rounded-full bg-white/20 px-3.5 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-white/90 backdrop-blur ring-1 ring-white/25 shadow-sm"
              style={{
                position: "fixed",
                right: "calc(env(safe-area-inset-right, 0px) + 0.75rem)",
                bottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)",
              }}
            >
              We’re building a new and safe home for your computer.
            </div>
          </footer>
        </main>
      )} */}
    </>
  );
}
