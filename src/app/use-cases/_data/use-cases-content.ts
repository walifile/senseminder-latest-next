import type { FAQItem } from "@/app/home/data/faq-data";

export type UseCaseSlug =
  | "remote-work"
  | "developers"
  | "education"
  | "creative"
  | "gaming";

type UseCaseStep = {
  copy: string;
  title: string;
};

type UseCasePageContent = {
  canonicalPath: string;
  description: string;
  faqItems: FAQItem[];
  heroDescription: string;
  heroTitle: string;
  keywords: string[];
  label: string;
  problemPoints: string[];
  recommendedPlan: {
    bullets: string[];
    summary: string;
    title: string;
  };
  sectionIntro: string;
  sectionTitle: string;
  setupSteps: UseCaseStep[];
  slug: UseCaseSlug;
  summaryCards: Array<{
    body: string;
    title: string;
  }>;
  title: string;
  whySensePc: string[];
};

export const useCasesContent: Record<UseCaseSlug, UseCasePageContent> = {
  creative: {
    canonicalPath: "/use-cases/creative",
    description:
      "See how SensePC supports creative teams with cloud workstations for design reviews, remote collaboration, and high-performance app access.",
    faqItems: [
      {
        answer:
          "Creative teams usually start by identifying which tools need the most resources, then choosing a SensePC configuration that fits those workflows. Many teams begin with a smaller group first, then expand once the setup is working well.",
        question: "How should creative teams start with SensePC?",
      },
      {
        answer:
          "SensePC helps by keeping creative apps and project files in a managed cloud environment, so contributors can connect from different locations without depending on identical local hardware.",
        question:
          "Can SensePC support distributed review and production workflows?",
      },
      {
        answer:
          "The right setup depends on the applications, file sizes, and rendering needs involved. Teams with heavier visual workloads should review configuration options before choosing a standard setup.",
        question: "Do creative workloads need a higher configuration?",
      },
    ],
    heroDescription:
      "Support design, video, and visual production teams with cloud desktops that make creative software easier to access, review, and manage across locations.",
    heroTitle: "Cloud workstations for creative teams and visual workflows",
    keywords: [
      "cloud workstation for designers",
      "remote creative workstation",
      "cloud desktop for video editing",
      "design team cloud pc",
      "SensePC creative workflows",
    ],
    label: "Creative teams",
    problemPoints: [
      "Large design files and demanding apps can create uneven performance across personal laptops.",
      "Remote review cycles slow down when contributors rely on different local environments.",
      "IT teams need a cleaner way to standardize creative tools without shipping workstations.",
    ],
    recommendedPlan: {
      bullets: [
        "Start with the workflows that need predictable app performance.",
        "Match configurations to design, editing, or rendering requirements.",
        "Review billing options before expanding access to larger teams.",
      ],
      summary:
        "Creative teams should begin with a configuration that aligns to the applications and media workloads they use most often, then expand once daily usage is clear.",
      title: "Recommended starting point",
    },
    sectionIntro:
      "These pages focus on the issues creative teams usually face first: app access, shared review cycles, and keeping workstations consistent across contributors.",
    sectionTitle: "What SensePC helps creative teams solve",
    setupSteps: [
      {
        copy:
          "List the creative apps and production workflows that need the most consistent performance.",
        title: "1. Define priority workloads",
      },
      {
        copy:
          "Select a starting configuration for the pilot group based on editing, design, or visual review needs.",
        title: "2. Match the environment to the workflow",
      },
      {
        copy:
          "Invite a small group, review responsiveness, and adjust the setup before expanding more broadly.",
        title: "3. Expand once the setup is stable",
      },
    ],
    slug: "creative",
    summaryCards: [
      {
        body:
          "Reduce the gap between high-demand creative apps and the hardware people happen to own locally.",
        title: "Consistent workstation access",
      },
      {
        body:
          "Keep project contributors aligned on a managed desktop environment instead of patching setups machine by machine.",
        title: "Simpler remote collaboration",
      },
      {
        body:
          "Review usage and billing in one place when teams need to scale access or adjust configurations.",
        title: "Operational visibility",
      },
    ],
    title: "Creative Cloud Workstations | SensePC Use Case",
    whySensePc: [
      "Access demanding apps without relying on identical local hardware.",
      "Keep remote reviewers and contributors closer to the same environment.",
      "Standardize creative workstation access with cleaner billing and setup planning.",
    ],
  },
  developers: {
    canonicalPath: "/use-cases/developers",
    description:
      "Explore how developers and engineering teams can use SensePC for cloud development environments, remote access, and standardized setups.",
    faqItems: [
      {
        answer:
          "Development teams usually start by identifying the environments that are hardest to maintain locally, then use SensePC to standardize access for those workflows first.",
        question: "How do engineering teams usually adopt SensePC?",
      },
      {
        answer:
          "SensePC can simplify environment consistency by giving developers access to a managed cloud desktop instead of relying entirely on local machine setup.",
        question:
          "Can SensePC reduce local setup friction for developers?",
      },
      {
        answer:
          "Configuration depends on the tools, repositories, and workloads involved. Teams with heavier build or tooling requirements should review plan options before selecting a starting setup.",
        question: "What configuration should developers start with?",
      },
    ],
    heroDescription:
      "Give engineering teams a cleaner way to access development environments, standardize setup expectations, and support remote contributors without relying on identical local machines.",
    heroTitle: "Cloud development environments for engineering teams",
    keywords: [
      "cloud desktop for developers",
      "developer cloud workstation",
      "remote engineering workstation",
      "standardized dev environments",
      "SensePC for developers",
    ],
    label: "Developers",
    problemPoints: [
      "Local setup drift can slow onboarding and create inconsistent build or tooling expectations.",
      "Distributed teams need a better way to access managed development environments remotely.",
      "Engineering leads often need to balance flexibility with a repeatable setup process.",
    ],
    recommendedPlan: {
      bullets: [
        "Begin with teams that need the most consistent environment setup.",
        "Review resource needs for builds, IDEs, and development tooling.",
        "Use the first launch phase to define a baseline workstation profile.",
      ],
      summary:
        "A good starting point for developers is the plan that supports core IDE, browser, and build-tool workflows without overcommitting resources before real usage is understood.",
      title: "Recommended starting point",
    },
    sectionIntro:
      "This use case is built around real engineering concerns: setup drift, remote access, and keeping environments easier to support across a team.",
    sectionTitle: "What SensePC helps development teams solve",
    setupSteps: [
      {
        copy:
          "Identify the development workflows that are hardest to support across local machines.",
        title: "1. Choose the first engineering use case",
      },
      {
        copy:
          "Create a baseline environment profile that matches your core IDE and browser requirements.",
        title: "2. Standardize the starting environment",
      },
      {
        copy:
          "Start with a small group, review adoption, and refine the plan before expanding to more contributors.",
        title: "3. Scale once the workflow is working well",
      },
    ],
    slug: "developers",
    summaryCards: [
      {
        body:
          "Keep engineering teams closer to the same environment instead of relying on local setup variance.",
        title: "Cleaner environment consistency",
      },
      {
        body:
          "Support remote contributors with access to the same managed desktop experience from different locations.",
        title: "Remote-friendly development access",
      },
      {
        body:
          "Make onboarding easier by reducing avoidable local setup and workstation planning issues.",
        title: "Faster team onboarding",
      },
    ],
    title: "Cloud Desktops for Developers | SensePC Use Case",
    whySensePc: [
      "Standardize development access without forcing every contributor onto the same local hardware.",
      "Support onboarding with a managed starting point for tools and workflows.",
      "Give engineering teams a clearer path from pilot to wider rollout.",
    ],
  },
  education: {
    canonicalPath: "/use-cases/education",
    description:
      "Learn how SensePC can support students, educators, and training programs with cloud desktops for labs, coursework, and remote access.",
    faqItems: [
      {
        answer:
          "Education teams usually begin with the courses or labs that have the most software requirements, then start with a smaller group before expanding to additional classes.",
        question: "How can schools start using SensePC?",
      },
      {
        answer:
          "SensePC can help by giving students and instructors access to the same managed environment from different locations, which reduces the need to depend on equally powerful personal devices.",
        question:
          "Can students access coursework without high-end local devices?",
      },
      {
        answer:
          "The right starting plan depends on the software, expected session length, and lab requirements involved. Schools should review usage and billing needs before expanding to more classes or labs.",
        question: "What should educators review before selecting a plan?",
      },
    ],
    heroDescription:
      "Give students, educators, and training programs access to managed cloud desktops that simplify lab access, support remote coursework, and reduce local device pressure.",
    heroTitle: "Cloud desktops for students, educators, and training labs",
    keywords: [
      "cloud desktops for education",
      "virtual lab for students",
      "remote coursework workstation",
      "education cloud pc",
      "SensePC education use case",
    ],
    label: "Education",
    problemPoints: [
      "Coursework can become harder to support when students depend on different personal devices.",
      "Instructors need a more consistent way to provide access to required applications and labs.",
      "Programs with remote or hybrid learning need cleaner access to managed desktop environments.",
    ],
    recommendedPlan: {
      bullets: [
        "Start with the courses that rely on specialized software or lab access.",
        "Review browser, connectivity, and session needs for the student group.",
        "Start with one program before extending to more classrooms or cohorts.",
      ],
      summary:
        "Education teams should start with the course or lab environment that is hardest to support with mixed personal devices, then expand once the access model is working smoothly.",
      title: "Recommended starting point",
    },
    sectionIntro:
      "These pages focus on what education teams care about most: reliable access, simpler lab delivery, and more consistent software availability for learners.",
    sectionTitle: "What SensePC helps education teams solve",
    setupSteps: [
      {
        copy:
          "Choose the lab, course, or training workflow that currently causes the most device inconsistency.",
        title: "1. Identify the highest-friction course",
      },
      {
        copy:
          "Define the environment students need and match that to an initial configuration.",
        title: "2. Prepare the teaching environment",
      },
      {
        copy:
          "Start with one class or cohort, gather feedback, and refine the setup before broader adoption.",
        title: "3. Expand from a tested learning workflow",
      },
    ],
    slug: "education",
    summaryCards: [
      {
        body:
          "Reduce the mismatch between course requirements and the devices students bring to class or use from home.",
        title: "More consistent student access",
      },
      {
        body:
          "Support instructors with a clearer path to deliver the same environment across labs and remote sessions.",
        title: "Simpler lab delivery",
      },
      {
        body:
          "Start with one program first, then expand once the learning workflow is validated.",
        title: "Practical adoption path",
      },
    ],
    title: "Cloud Desktops for Education | SensePC Use Case",
    whySensePc: [
      "Help students connect to the same managed environment from more places.",
      "Reduce the operational overhead of supporting uneven personal devices.",
      "Give educators a practical path to standardize access for lab-heavy courses.",
    ],
  },
  gaming: {
    canonicalPath: "/use-cases/gaming",
    description:
      "Discover how SensePC delivers cloud gaming desktops with high-performance compute, low-latency access, and flexible pay-as-you-go billing — no expensive hardware required.",
    faqItems: [
      {
        question: "Can I play AAA games on SensePC?",
        answer:
          "SensePC provides a full cloud desktop environment where you can install and run games from platforms like Steam, Epic Games, and others. Performance depends on the configuration you choose and your network connection quality.",
      },
      {
        question: "Do I need a high-end PC to use SensePC for gaming?",
        answer:
          "No. SensePC runs compute in the cloud, so your local device only needs to handle the display stream. A modern browser or lightweight client is enough to connect and play.",
      },
      {
        question: "How does billing work for gaming sessions?",
        answer:
          "SensePC uses pay-as-you-go billing. You only pay for the time your cloud desktop is active, and you can stop the session when you are done playing. There is no fixed monthly fee tied to a machine you are not using.",
      },
      {
        question: "How can I reduce input latency for gaming on SensePC?",
        answer:
          "SensePC includes a native client connection option inside the PC Viewer. Switching to the NICE DCV native client bypasses browser overhead and uses a more direct protocol — delivering lower input latency, higher max FPS, and a smoother session compared to the browser viewer. The client is available for Windows, macOS, and Linux.",
      },
    ],
    heroDescription:
      "Access high-performance cloud gaming desktops from any device. No expensive rig required — just connect, install your games, and play with the compute power you actually need.",
    heroTitle: "Cloud gaming desktops — play anywhere, pay for what you use",
    keywords: [
      "cloud gaming desktop",
      "cloud PC for gaming",
      "play games without gaming PC",
      "cloud gaming pay as you go",
      "SensePC gaming use case",
    ],
    label: "Gaming",
    problemPoints: [
      "High-end gaming hardware is expensive to buy, maintain, and upgrade every few years.",
      "Gamers traveling or away from their rig have no good way to access their setup remotely.",
      "Fixed gaming subscriptions charge the same rate whether you play daily or once a month.",
    ],
    recommendedPlan: {
      bullets: [
        "Start with the configuration that matches the GPU and CPU demands of your most-played titles.",
        "Use pay-as-you-go billing to avoid paying for compute time when you are not gaming.",
        "Review session performance during a short trial before committing to longer sessions.",
      ],
      summary:
        "Gamers should start with a mid-to-high configuration to cover most modern titles, then adjust based on the games they actually play and how often sessions run.",
      title: "Recommended starting point",
    },
    sectionIntro:
      "This use case focuses on what gamers care about most: access without a dedicated rig, flexible billing that matches real play patterns, and performance that keeps up with modern titles — including a native client option for lower latency when every millisecond counts.",
    sectionTitle: "What SensePC helps gamers solve",
    setupSteps: [
      {
        title: "1. Choose your configuration",
        copy: "Pick a compute configuration that matches the performance requirements of the games you play most often.",
      },
      {
        title: "2. Install your games and platforms",
        copy: "Log into Steam, Epic Games, or any other platform directly inside your SensePC desktop and install your library.",
      },
      {
        title: "3. Switch to the native client for best performance",
        copy: "Inside the PC Viewer, use the native client option to switch from the browser stream to the NICE DCV desktop app. This reduces input latency and raises your maximum FPS for a smoother gaming experience.",
      },
      {
        title: "4. Play and stop when you are done",
        copy: "Start a session when you want to play and stop it when you are finished. You are only billed for active compute time.",
      },
    ],
    slug: "gaming",
    summaryCards: [
      {
        title: "No hardware purchase required",
        body: "Access powerful cloud compute without buying or maintaining a dedicated gaming rig.",
      },
      {
        title: "Play from any device",
        body: "Connect from a laptop, thin client, or any device with a browser — your full gaming desktop is in the cloud.",
      },
      {
        title: "Native client for lower latency",
        body: "Switch to the NICE DCV native client inside the PC Viewer to reduce input latency and increase max FPS beyond what the browser viewer can deliver.",
      },
      {
        title: "Pay only when you play",
        body: "Usage-based billing means you are not paying for a powerful machine that sits idle when you are not gaming.",
      },
    ],
    title: "Cloud Gaming Desktops | SensePC Use Case",
    whySensePc: [
      "Access a high-performance gaming desktop without buying expensive local hardware.",
      "Connect from any device — laptop, thin client, or even a tablet — and keep playing.",
      "Switch to the native client inside the PC Viewer for lower input latency and higher max FPS.",
      "Pay only for active gaming sessions instead of a fixed monthly subscription.",
    ],
  },
  "remote-work": {
    canonicalPath: "/use-cases/remote-work",
    description:
      "Discover how remote teams and distributed businesses can use SensePC to standardize secure desktop access, onboarding, and day-to-day work.",
    faqItems: [
      {
        answer:
          "Remote teams usually begin with a smaller group, define a starting desktop profile, and confirm the billing model before expanding access to more roles.",
        question: "How do remote teams usually get started with SensePC?",
      },
      {
        answer:
          "SensePC can help by giving people access to a managed cloud desktop from more locations instead of depending on a specific office machine or local device setup.",
        question:
          "Can SensePC support distributed teams working from different locations?",
      },
      {
        answer:
          "The best starting plan depends on the applications, users, and working patterns involved. Teams should review expected usage before standardizing on one configuration.",
        question: "Which plan fits remote-work teams best?",
      },
    ],
    heroDescription:
      "Support distributed teams with managed cloud desktops that simplify onboarding, improve consistency, and make secure work access easier from different locations.",
    heroTitle: "Cloud desktops for remote teams and distributed work",
    keywords: [
      "remote work cloud desktop",
      "cloud pc for remote teams",
      "distributed team workstation",
      "secure cloud desktop access",
      "SensePC remote work",
    ],
    label: "Remote work",
    problemPoints: [
      "Distributed teams often rely on a mix of devices and local setups that are harder to support consistently.",
      "Onboarding remote hires takes longer when every workstation is prepared differently.",
      "Leaders need a clearer way to balance secure access, performance, and billing visibility.",
    ],
    recommendedPlan: {
      bullets: [
        "Start with one team or role that needs the most predictable desktop access.",
        "Review billing cadence and device expectations before inviting more users.",
        "Use the first launch phase to define the standard environment for future hires.",
      ],
      summary:
        "Most remote teams should begin with the configuration that supports their common tools and access needs, then scale after early usage shows how the team actually uses the service.",
      title: "Recommended starting point",
    },
    sectionIntro:
      "This page is built around what remote teams usually need first: reliable access, simpler onboarding, and a more consistent environment for day-to-day work.",
    sectionTitle: "What SensePC helps remote teams solve",
    setupSteps: [
      {
        copy:
          "Choose the first team or role that needs reliable managed desktop access.",
        title: "1. Start with one remote workflow",
      },
      {
        copy:
          "Define the baseline environment, billing model, and access expectations for that group.",
        title: "2. Standardize the first desktop profile",
      },
      {
        copy:
          "Start with a smaller group, review adoption, and adjust before expanding further.",
        title: "3. Expand from a tested setup",
      },
    ],
    slug: "remote-work",
    summaryCards: [
      {
        body:
          "Give remote teams access to a consistent managed desktop instead of relying on uneven local machine setups.",
        title: "Consistent work access",
      },
      {
        body:
          "Reduce friction for new hires by preparing a standard environment that can be reused across roles.",
        title: "Cleaner onboarding",
      },
      {
        body:
          "Keep billing and service planning easier to review as distributed teams grow.",
        title: "Simpler operations",
      },
    ],
    title: "Remote Work Cloud Desktops | SensePC Use Case",
    whySensePc: [
      "Support remote contributors with a managed desktop environment that is easier to standardize.",
      "Make onboarding less dependent on local hardware preparation.",
      "Give teams a practical way to introduce and scale cloud desktop access.",
    ],
  },
};

export function getUseCaseContent(slug: UseCaseSlug): UseCasePageContent {
  return useCasesContent[slug];
}
