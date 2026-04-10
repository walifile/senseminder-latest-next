import FaqSections from "@/app/faq/_components/faq-sections";
import { MainLayout } from "@/app/home/_components/main-layout";

const MainPage = () => (
  <MainLayout>
    <main className="flex-grow pt-10 pb-16 font-['Inter'] md:pt-12">
      <FaqSections />
    </main>
  </MainLayout>
);

export default MainPage;
