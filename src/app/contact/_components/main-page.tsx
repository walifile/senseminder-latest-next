import Image from "next/image";
import { MainLayout } from "@/app/home/_components/main-layout";

import ContactForm from "./contact-form";

const MainPage = () => (
  <MainLayout>
    <div className="flex-grow pt-24 pb-16 font-['Inter']">
      <div className="container mx-auto px-4 md:px-6">
        <div className="glass-card !shadow-none gradient-outline-border !rounded-3xl !border-0 px-0 md:px-12 py-12 w-full flex flex-col-reverse md:flex-row gap-8 md:gap-24">
            <div className="w-full md:w-3/4 px-6 md:px-0">
              {/* <Breadcrumb
                items={[{ label: "Home", href: "/" }, { label: "Contact" }]}
              /> */}

              <h1 className="justify-start text-black dark:text-white text-2xl md:text-[50px] font-bold font-['Space_Grotesk'] leading-[1] mb-6">
                Contact Us
              </h1>

              <p className="font-['Inter'] text-base md:text-lg text-[#454545] dark:text-[#B9C2D5] leading-relaxed font-light">
                Let&apos;s connect. Whether you have a question, need support, or
                want to explore a partnership, we&apos;re here for you. Our team is
                always ready to assist, collaborate, or simply hear your ideas.
                Reach out using any of the options below - we&apos;d love to hear
                from you.
              </p>
            </div>

            <div className="w-full md:w-1/4 content-center justify-items-center">
              <Image
                src="/assets/svg/contact-us.svg"
                alt="Contact Us"
                className="w-full md:w-auto px-6 md:px-0"
                width={312}
                height={205}
                priority
                sizes="(max-width: 768px) calc(100vw - 3rem), 312px"
              />
            </div>
          </div>

        <div className="glass-card !shadow-none gradient-outline-border !rounded-3xl !border-0 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 mt-8 px-6 md:px-12 py-12">
            <div className="flex h-full flex-col gap-8">
              <div className="space-y-8">
                <h2 className="justify-start text-black dark:text-white text-2xl md:text-3xl font-bold font-['Space_Grotesk'] leading-8 tracking-tight">
                  Contact Information
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="min-w-16 w-16 h-16 md:min-w-20 md:w-20 md:h-20 bg-[#F3DBF5] dark:bg-[#210E39] text-white rounded-full flex items-center justify-center">
                      <Image
                        src="/assets/svg/contact/email.svg"
                        alt="Email"
                        className="h-8 w-8 md:h-10 md:w-10"
                        width={34}
                        height={34}
                        sizes="(max-width: 768px) 32px, 40px"
                      />
                    </div>

                    <div>
                      <p className="font-['Inter'] text-foreground text-base md:text-lg font-medium leading-relaxed tracking-[-0.2px]">
                        <a
                          href="mailto:contact@sensepc.com"
                          className="hover:text-primary transition-colors underline-offset-4 hover:underline"
                        >
                          contact@sensepc.com
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="min-w-16 w-16 h-16 md:min-w-20 md:w-20 md:h-20 bg-[#F3DBF5] dark:bg-[#210E39] text-white rounded-full flex items-center justify-center">
                      <Image
                        src="/assets/svg/contact/location.svg"
                        alt="Location"
                        className="h-8 w-8 md:h-10 md:w-10"
                        width={34}
                        height={34}
                        sizes="(max-width: 768px) 32px, 40px"
                      />
                    </div>

                    <div>
                      <p className="font-['Inter'] text-foreground text-base md:text-lg font-medium leading-relaxed tracking-[-0.2px]">
                        1372 Peachtree
                        <br />
                        Atlanta, Georgia 30309
                        <br />
                        United States of America
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <div className="px-4 py-4 md:px-8 md:py-6 rounded-xl border bg-[#5220DE09] dark:bg-[#ffffff0a]">
                  <h2 className="justify-start text-black dark:text-white text-2xl md:text-2xl font-bold font-['Space_Grotesk'] leading-8 tracking-tight mb-5 flex items-center gap-3">
                    <Image
                      src="/assets/svg/contact/clock.svg"
                      alt="Business Hours"
                      className="h-6 w-6 md:h-7 md:w-7"
                      width={34}
                      height={34}
                      sizes="(max-width: 768px) 24px, 28px"
                    />
                    Business Hours
                  </h2>

                  <div className="space-y-3 font-['Inter']">
                    <div className="flex items-center justify-between gap-6">
                      <span className="text-sm md:text-base font-medium text-muted-foreground">
                        Monday - Friday
                      </span>
                      <span className="text-sm md:text-base font-semibold text-foreground">
                        10:00 AM - 4:00 PM
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-6">
                      <span className="text-sm md:text-base font-medium text-muted-foreground">
                        Saturday
                      </span>
                      <span className="text-sm md:text-base font-semibold text-foreground">
                        Closed
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-6">
                      <span className="text-sm md:text-base font-medium text-muted-foreground">
                        Sunday
                      </span>
                      <span className="text-sm md:text-base font-semibold text-foreground">
                        Closed
                      </span>
                    </div>

                    <p className="pt-3 text-xs md:text-sm text-muted-foreground">
                      * All times are in Eastern Standard Time (EST)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <ContactForm />
        </div>
      </div>
    </div>
  </MainLayout>
);

export default MainPage;
