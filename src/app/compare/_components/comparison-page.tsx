import { MainLayout } from "@/app/home/_components/main-layout";
import { type ComparisonData } from "@/app/compare/_data/comparisons";
import ComparisonContent from "@/app/compare/_components/comparison-content";

type Props = {
  data: ComparisonData;
};

const ComparisonPage = ({ data }: Props) => (
  <MainLayout>
    <div className="flex-grow pb-16 pt-28 font-['Inter'] md:pt-32">
      <div className="container mx-auto px-4 md:px-6">
        <ComparisonContent data={data} />
      </div>
    </div>
  </MainLayout>
);

export default ComparisonPage;
