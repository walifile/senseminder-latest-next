import Image from "next/image";

import { Button } from "@/components/ui/button";

import { ArrowUpRight } from "lucide-react"; // or your own SVG

import { useGetStartedNav } from "@/hooks/use-get-started";

import { GradientInfoCard } from "../../home/_components/gradient-info-card";

export function MissionCard() {
    const onGetStarted = useGetStartedNav();

    return (
        <section>
            <div className="container z-10 relative mb-16 md:mb-32">
                <div className="grid gap-8 md:grid-cols-2 items-stretch">
                    {/* Our Mission */}
                    <GradientInfoCard
                        title="Our Mission"
                        icon={
                            <Image
                                src="/assets/svg/about/our-mission.svg"
                                alt="Our Mission"
                                width={50}
                                height={50}
                                className="size-full"
                                priority
                            />
                        }
                    >
                        <p  className="self-stretch justify-start text-paragraph text-lg font-normal font-['Inter'] leading-8">
                            Senseminder was founded by Ashfak Ahmed, a senior developer and
                            operations engineer focused on cloud-native computing, and is proudly
                            headquartered in Georgia, USA.
                        </p>
                        <p  className="self-stretch justify-start text-paragraph text-lg font-normal font-['Inter'] leading-8">
                            Our mission is to democratize access to high-performance cloud
                            computing through Sense PC — your personal, scalable, on-demand desktop
                            that launches instantly from anywhere.
                        </p>
                        <p className="font-medium text-white">
                            And the best part?{" "}
                            <span className="text-[#7AA2FF]">You only pay for what you use.</span>
                        </p>
                    </GradientInfoCard>

                    <GradientInfoCard
                        title="Our Vision"
                        icon={
                            <Image
                                src="/assets/svg/about/our-vision.svg"
                                alt="Our Mission"
                                width={50}
                                height={50}
                                className="size-full"
                                priority
                            />
                        }
                    >
                        <ul className="list-disc ml-5 mb-5">
                            <li className="self-stretch justify-start text-paragraph text-lg font-normal font-['Inter'] leading-8">Your PC launches in seconds from any device.</li>
                            <li className="self-stretch justify-start text-paragraph text-lg font-normal font-['Inter'] leading-8">You never worry about upgrades or storage again.</li>
                            <li className="self-stretch justify-start text-paragraph text-lg font-normal font-['Inter'] leading-8">Your data is secure and your impact is sustainable.</li>
                            <li className="self-stretch justify-start text-paragraph text-lg font-normal font-['Inter'] leading-8">Your computing power scales instantly with your needs.</li>
                        </ul>

                        <p className="font-medium text-white">
                            We’re not patching old models —{" "}
                            <span className="text-[#7AA2FF]">You only pay for what you use.</span>
                        </p>
                    </GradientInfoCard>

                    <div className="md:col-span-2">
                        <GradientInfoCard
                            title="Our Story"
                            rightImage="/assets/svg/about/our-story.svg"
                        >
                            <p  className="self-stretch justify-start text-paragraph text-lg font-normal font-['Inter'] leading-8">
                                In 2020, I (Ashfak Ahmed) saw a frustrating truth: even the most talented users were still limited by their hardware.
                            </p>

                            <p  className="self-stretch justify-start text-paragraph text-lg font-normal font-['Inter'] leading-8">
                                So I built Senseminder — a platform designed from the cloud up to offer people what they truly need: flexibility, power, and freedom.
                            </p>

                            <div className="relative md:w-fit mt-12">
                                <div className="z-0 absolute left-1/2 top-2.5 -translate-x-1/2 w-[50%] h-[40px] blur-[35px] bg-[linear-gradient(270deg,_#A801BA_0%,_#2530F0_100%)]" />
                                <Button
                                    size="default"
                                    className="relative w-full z-10"
                                    onClick={onGetStarted}
                                >
                                    Learn More
                                    <ArrowUpRight />
                                </Button>
                            </div>
                        </GradientInfoCard>
                    </div>
                </div>
            </div>
        </section>
    );
}
