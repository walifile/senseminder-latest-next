export default function LoginPage() {
  return (
    <div
      className="bg-white dark:bg-gray-950 relative w-full min-h-screen overflow-hidden"
      data-name="Login Page"
    >
      {/* Right side blur - Desktop: right side, Mobile: top right */}
      <div
        className="absolute flex h-[400px] md:h-[600px] lg:h-[740.395px] items-center justify-center right-[-100px] md:right-[100px] lg:right-auto lg:left-[1245px] top-[50px] md:top-[150px] lg:top-[260px] w-[300px] md:w-[400px] lg:w-[501.295px] opacity-80 dark:opacity-60"
        style={
          {
            "--transform-inner-width": "375.140625",
            "--transform-inner-height": "680",
          } as React.CSSProperties
        }
      >
        <div className="flex-none rotate-[191.316deg] scale-y-[-100%]">
          <div className="h-[400px] md:h-[550px] lg:h-[680px] relative w-[220px] md:w-[300px] lg:w-[375.156px]">
            <div
              className="absolute inset-[-75.15%_-136.21%]"
              style={
                { "--fill-0": "rgba(37, 48, 240, 1)" } as React.CSSProperties
              }
            >
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 1398 1702"
              >
                <g filter="url(#filter0_f_1_59)" id="Ellipse 12" opacity="0.25">
                  <ellipse
                    cx="698.578"
                    cy="851"
                    fill="var(--fill-0, #2530F0)"
                    rx="187.578"
                    ry="340"
                  />
                </g>
                <defs>
                  <filter
                    colorInterpolationFilters="sRGB"
                    filterUnits="userSpaceOnUse"
                    height="1702"
                    id="filter0_f_1_59"
                    width="1397.16"
                    x="0"
                    y="0"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      mode="normal"
                      result="shape"
                    />
                    <feGaussianBlur
                      result="effect1_foregroundBlur_1_59"
                      stdDeviation="255.5"
                    />
                  </filter>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Center blur */}
      <div className="absolute left-1/2 size-[300px] md:size-[400px] lg:size-[520px] top-[50%] md:top-[calc(50%+100px)] lg:top-[calc(50%+205.5px)] translate-x-[-50%] translate-y-[-50%] opacity-80 dark:opacity-50">
        <div className="absolute inset-[-96.15%]">
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 1520 1520"
          >
            <g filter="url(#filter0_f_1_57)" id="Ellipse 5" opacity="0.1">
              <circle
                cx="760"
                cy="760"
                fill="url(#paint0_linear_1_57)"
                r="260"
              />
            </g>
            <defs>
              <filter
                colorInterpolationFilters="sRGB"
                filterUnits="userSpaceOnUse"
                height="1520"
                id="filter0_f_1_57"
                width="1520"
                x="0"
                y="0"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  mode="normal"
                  result="shape"
                />
                <feGaussianBlur
                  result="effect1_foregroundBlur_1_57"
                  stdDeviation="250"
                />
              </filter>
              <linearGradient
                gradientUnits="userSpaceOnUse"
                id="paint0_linear_1_57"
                x1="1020"
                x2="500"
                y1="760"
                y2="760"
              >
                <stop stopColor="#A801BA" />
                <stop offset="1" stopColor="#2530F0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Top left blur - Hidden on mobile, visible on larger screens */}
      <div className="hidden md:block absolute h-[250px] lg:h-[403px] left-[-100px] lg:right-[1489px] lg:left-auto top-[10px] lg:top-[22px] w-[150px] lg:w-[247px] opacity-80 dark:opacity-60">
        <div className="absolute inset-[-30.91%_-50.43%]">
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 497 653"
          >
            <g filter="url(#filter0_f_1_55)" id="Ellipse 10">
              <ellipse
                cx="248.056"
                cy="326.056"
                fill="var(--fill-0, #2530F0)"
                fillOpacity="0.2"
                rx="123.5"
                ry="201.5"
              />
            </g>
            <defs>
              <filter
                colorInterpolationFilters="sRGB"
                filterUnits="userSpaceOnUse"
                height="652.113"
                id="filter0_f_1_55"
                width="496.113"
                x="0"
                y="0"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  mode="normal"
                  result="shape"
                />
                <feGaussianBlur
                  result="effect1_foregroundBlur_1_55"
                  stdDeviation="62.2781"
                />
              </filter>
            </defs>
          </svg>
        </div>
      </div>

      {/* Top horizontal blur */}
      <div
        className="absolute flex h-[300px] md:h-[500px] lg:h-[665.503px] items-center justify-center left-[-200px] md:left-[-300px] lg:left-[-403px] top-[-50px] md:top-[-80px] lg:top-[-109px] w-[800px] md:w-[1400px] lg:w-[1886.49px] opacity-80 dark:opacity-50"
        style={
          {
            "--transform-inner-width": "1862.640625",
            "--transform-inner-height": "305.9375",
          } as React.CSSProperties
        }
      >
        <div className="flex-none rotate-[348.684deg]">
          <div className="h-[150px] md:h-[250px] lg:h-[305.951px] relative w-[800px] md:w-[1400px] lg:w-[1862.66px]">
            <div className="absolute inset-[-98.05%_-16.11%]">
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 2463 906"
              >
                <g filter="url(#filter0_f_1_43)" id="Ellipse 6" opacity="0.1">
                  <ellipse
                    cx="1231.33"
                    cy="452.976"
                    fill="url(#paint0_linear_1_43)"
                    rx="931.332"
                    ry="152.976"
                  />
                </g>
                <defs>
                  <filter
                    colorInterpolationFilters="sRGB"
                    filterUnits="userSpaceOnUse"
                    height="905.951"
                    id="filter0_f_1_43"
                    width="2462.66"
                    x="0"
                    y="0"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      mode="normal"
                      result="shape"
                    />
                    <feGaussianBlur
                      result="effect1_foregroundBlur_1_43"
                      stdDeviation="150"
                    />
                  </filter>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="paint0_linear_1_43"
                    x1="2162.66"
                    x2="300"
                    y1="452.976"
                    y2="452.976"
                  >
                    <stop offset="0.0479769" stopColor="#BA25F0" />
                    <stop offset="0.461538" stopColor="#2530F0" />
                    <stop offset="1" stopColor="#8086F3" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom left blur - Hidden on mobile and tablet */}
      <div className="hidden lg:block absolute h-[403px] left-[-100px] bottom-[100px] w-[247px] opacity-80 dark:opacity-60">
        <div className="absolute inset-[-30.91%_-50.43%]">
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 497 653"
          >
            <g filter="url(#filter0_f_1_55_2)" id="Ellipse 10-2">
              <ellipse
                cx="248.056"
                cy="326.056"
                fill="var(--fill-0, #2530F0)"
                fillOpacity="0.2"
                rx="123.5"
                ry="201.5"
              />
            </g>
            <defs>
              <filter
                colorInterpolationFilters="sRGB"
                filterUnits="userSpaceOnUse"
                height="652.113"
                id="filter0_f_1_55_2"
                width="496.113"
                x="0"
                y="0"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  mode="normal"
                  result="shape"
                />
                <feGaussianBlur
                  result="effect1_foregroundBlur_1_55_2"
                  stdDeviation="62.2781"
                />
              </filter>
            </defs>
          </svg>
        </div>
      </div>

      {/* Bottom right blur */}
      <div className="absolute h-[300px] md:h-[450px] lg:h-[561px] right-[-50px] md:right-[-70px] lg:right-[-85px] bottom-[50px] md:bottom-[100px] lg:bottom-auto lg:top-[1557px] w-[150px] md:w-[200px] lg:w-[247px] opacity-80 dark:opacity-60">
        <div className="absolute inset-[-22.2%_-50.43%]">
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 497 811"
          >
            <g filter="url(#filter0_f_1_35)" id="Ellipse 11">
              <ellipse
                cx="248.056"
                cy="405.056"
                fill="var(--fill-0, #2530F0)"
                fillOpacity="0.1"
                rx="123.5"
                ry="280.5"
              />
            </g>
            <defs>
              <filter
                colorInterpolationFilters="sRGB"
                filterUnits="userSpaceOnUse"
                height="810.113"
                id="filter0_f_1_35"
                width="496.113"
                x="0"
                y="0"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  mode="normal"
                  result="shape"
                />
                <feGaussianBlur
                  result="effect1_foregroundBlur_1_35"
                  stdDeviation="62.2781"
                />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
