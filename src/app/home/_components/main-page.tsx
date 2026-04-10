import FAQ from "./faq";
import HomeHero from "./home-hero";
import SensePCCost from "./sensepc-cost";
import RentSmarter from "./rent-smarter";
import { MainLayout } from "./main-layout";
import WayWeCompute from "./way-we-compute";
import GetStartedCTA from "./get-started-cta";
import TutorialSection from "./tutorial-section";
import ProductHighlights from "./product-highlights";
import FutureOfComputing from "./future-of-computing";
import HomeClientEffects from "./home-client-effects";
import RentSmarterProcess from "./rent-smarter-process";
import GetStartedCTAButton from "./get-started-cta-button";

export default function HomePage() {
  return (
    <MainLayout>
      <div className="home-safari-render-fix">
        <HomeClientEffects />
        <HomeHero
          imageSrc="/assets/svg/hero-img-dark.svg"
          imageWidth={600}
          imageHeight={400}
          imageAlt="Cloud infrastructure illustration"
        >
          <h1 className="font-space-grotesk font-bold text-2xl md:text-[65px] leading-[1.10] w-full md:w-[85%]">
            <span className="text-transparent bg-clip-text bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)]">
              Your Computer,
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)]">
              Now in the Cloud
            </span>
          </h1>
          <p className="text-paragraph text-base md:text-2xl w-full md:w-[85%]">
            Build a high-performing cloud computer in minutes with Sense PC. No
            hardware. No security threat. No overpaying.
          </p>
          <p className="animate-promo-wave font-space-grotesk font-semibold text-base md:text-2xl w-full md:w-[85%] text-transparent bg-clip-text bg-[linear-gradient(270deg,_#BA25F0_4.8%,_#2530F0_46.15%,_#8086F3_100%)]">
            Redeem your promo and build your first Sense PC free today — no card required.
        </p>
        </HomeHero>
        <FutureOfComputing />
        <WayWeCompute />
        <ProductHighlights />
        <TutorialSection />
        <RentSmarter />
        <GetStartedCTA>
          <h2 className="font-space-grotesk font-semibold text-2xl md:text-5xl">
            Join The New Cloud Computing Movement
            <br />
          </h2>

          <GetStartedCTAButton />
        </GetStartedCTA>
        <RentSmarterProcess />
        <SensePCCost />
        <FAQ />
      </div>
    </MainLayout>
  );
}
