import { tutorials } from "@/constants/tutorials";
import { MainLayout } from "@/app/home/_components/main-layout";
import TutorialFilters from "@/app/tutorials/_components/tutorial-filters";
import { TutorialDialog } from "@/app/tutorials/_components/tutorial-dialog";

type SearchParamValue = string | string[] | undefined;

type MainPageProps = {
  searchParams?: {
    q?: SearchParamValue;
    category?: SearchParamValue;
    difficulty?: SearchParamValue;
  };
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
  
const normalizeTag = (value: string) => value.trim().toLowerCase();

const firstValue = (value: SearchParamValue) =>
  Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

const MainPage = ({ searchParams }: MainPageProps) => {
  const searchQuery = firstValue(searchParams?.q).trim();
  const selectedCategory = normalizeTag(firstValue(searchParams?.category) || "all");
  const selectedDifficulty = normalizeTag(
    firstValue(searchParams?.difficulty) || "all",
  );

  const categories = Array.from(new Set(tutorials.map((item) => item.category)));
  const difficulties = Array.from(new Set(tutorials.map((item) => item.difficulty)));

  const filteredTutorials = tutorials.filter((tutorial) => {
    const matchesSearch =
      tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      normalizeTag(tutorial.category) === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "all" ||
      normalizeTag(tutorial.difficulty) === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <MainLayout>
      <div className="relative min-h-screen backdrop-blur-none md:backdrop-blur-[32px]">
        <div className="relative container pt-28 pb-14 md:pt-32 md:pb-16 space-y-10 font-['Space_Grotesk']">
          <div className="space-y-3">
            {/* <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground dark:text-white/70">
              Tutorials
            </p> */}
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              Learn Sense PC and Sense Cloud{" "}
              <span className="text-transparent bg-clip-text bg-[linear-gradient(290.5deg,#D971FF_-70.94%,#4C55F8_10.02%,#8086F3_115.42%)]">
                the fast way
              </span>
            </h1>
            <p className="max-w-2xl text-muted-foreground dark:text-white/70 text-base md:text-lg">
              Watch quick, practical walkthroughs and master the platform in
              minutes.
            </p>
          </div>

          <div className="rounded-3xl border border-[#2E3192] bg-[rgba(255,255,255,0.03)] p-6 md:p-8 backdrop-blur-none md:backdrop-blur-[28px]">
            <TutorialFilters
              categories={categories}
              difficulties={difficulties}
              initialSearchQuery={searchQuery}
              initialCategory={selectedCategory}
              initialDifficulty={selectedDifficulty}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTutorials.map((tutorial) => (
              <div
                key={tutorial.id}
                className="group relative overflow-hidden rounded-3xl border border-[#3037A8] bg-[rgba(255,255,255,0.02)] shadow-[0_0_24px_rgba(37,48,240,0.08)]"
              >
                <TutorialDialog tutorial={tutorial} />

                <div className="px-5 py-5 space-y-2">
                  <h3 className="text-lg md:text-xl font-semibold text-black dark:text-white">
                    {tutorial.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground dark:text-white/70 line-clamp-2">
                    {tutorial.description}
                  </p>
                </div>

                <div className="border-t border-[rgba(37,48,240,0.30)] dark:border-[rgba(255,255,255,0.10)] px-5 py-4 text-xs md:text-sm text-muted-foreground dark:text-white/60">
                  <div className="flex items-center justify-between">
                    <span>Uploaded: {formatDate(tutorial.uploadDate)}</span>
                    <span>Updated: {formatDate(tutorial.lastUpdated)}</span>
                  </div>
                </div>
              </div>
            ))}

            {filteredTutorials.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-[#3037A8] bg-[rgba(255,255,255,0.02)] px-6 py-8 text-center text-sm text-muted-foreground dark:text-white/70">
                No tutorials found for the selected filters.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MainPage;
