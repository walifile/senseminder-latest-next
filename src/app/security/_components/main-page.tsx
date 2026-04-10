import Link from "next/link";
import FAQ from "@/app/home/_components/faq";
import { MainLayout } from "@/app/home/_components/main-layout";

import { Button } from "@/components/ui/button";

const securityPillars = [
  {
    title: "Data Protection",
    points: [
      "Controls are applied to help protect data in transit and at rest.",
      "Desktop and storage workflows include access and data safeguards.",
      "Account and file access operations use security-focused protections.",
    ],
  },
  {
    title: "Access and Identity",
    points: [
      "Authentication and session controls are applied across core account flows.",
      "Role-based access patterns help teams limit permissions by responsibility.",
      "Account security settings help reduce unauthorized access risk.",
    ],
  },
  {
    title: "Monitoring and Response",
    points: [
      "Platform monitoring helps identify unusual activity patterns.",
      "Operational logs support review and incident investigation.",
      "Response workflows are used for security-related operational events.",
    ],
  },
];

const workflowControls = [
  {
    phase: "Before Access",
    control: "Identity verification and account security controls",
    outcome: "Access is limited to authorized users and approved sessions",
  },
  {
    phase: "During Sessions",
    control: "Session controls, monitored activity, and secure access paths",
    outcome: "Operational risk is reduced during daily desktop usage",
  },
  {
    phase: "After Activity",
    control: "Audit visibility and retained operational logs",
    outcome: "Teams can investigate incidents and review activity history",
  },
];

const sharedResponsibility = [
  {
    title: "What Sense PC handles",
    items: [
      "Platform-level security operations and managed infrastructure controls.",
      "Core safeguards across compute, storage, and access pathways.",
      "Monitoring and operational response processes for platform events.",
    ],
  },
  {
    title: "What customers handle",
    items: [
      "Credential hygiene, trusted endpoint usage, and account protection.",
      "Team access governance and internal permission management.",
      "Secure handling of data and applications inside customer workloads.",
    ],
  },
];

const incidentSteps = [
  "Detection: monitoring helps identify suspicious behavior or risk signals.",
  "Containment: security controls are applied based on incident scope.",
  "Investigation: relevant logs and telemetry are reviewed for impact analysis.",
  "Communication: affected customers are informed when required under applicable obligations.",
  "Recovery: services are restored and controls are reviewed for improvement.",
];

const securityFaqItems = [
  {
    question: "How is data protected on Sense PC?",
    answer:
      "Sense PC uses layered controls designed to help protect data in transit and at rest across desktop and storage workflows.",
  },
  {
    question: "Can I manage team access securely?",
    answer:
      "Yes. You can manage account-level access and user permissions to align with your internal security policies.",
  },
  {
    question: "Do you monitor for suspicious activity?",
    answer:
      "Yes. Sense PC uses platform monitoring and logs to help identify unusual behavior and support response workflows.",
  },
  {
    question: "Where can I report a security concern?",
    answer:
      "Please contact our team through the Contact page and include relevant details so we can review the issue quickly.",
  },
];

const MainPage = () => (
  <MainLayout>
    <div className="flex-grow pt-28 md:pt-32 pb-16 font-['Inter']">
      <div className="container mx-auto px-4 md:px-6 space-y-10 md:space-y-14">
      <section className="glass-card !shadow-none gradient-outline-border !rounded-3xl !border-0 px-6 md:px-12 py-10 md:py-12">
        {/* <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Security & Trust" }]}
        /> */}

        <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h1 className="text-black dark:text-white text-3xl md:text-[52px] font-bold font-['Space_Grotesk'] leading-[1.02]">
              Security and Trust
            </h1>
            <p className="mt-5 max-w-3xl text-base md:text-lg text-[#454545] dark:text-[#B9C2D5] leading-relaxed">
              Sense PC applies layered security controls across identity, access,
              data handling, and operational monitoring to support secure cloud
              desktop and storage workflows.
            </p>

            <nav
              className="mt-7 flex flex-wrap gap-2"
              aria-label="Security page sections"
            >
              <a
                href="#security-controls"
                className="rounded-full border border-[#2530F033] dark:border-white/20 px-4 py-2 text-sm text-[#2530F0] dark:text-[#13E1EA] transition-colors hover:bg-[#2530F014] dark:hover:bg-white/10"
              >
                Security Controls
              </a>
              <a
                href="#secure-workflow"
                className="rounded-full border border-[#2530F033] dark:border-white/20 px-4 py-2 text-sm text-[#2530F0] dark:text-[#13E1EA] transition-colors hover:bg-[#2530F014] dark:hover:bg-white/10"
              >
                Secure Workflow
              </a>
              <a
                href="#shared-responsibility"
                className="rounded-full border border-[#2530F033] dark:border-white/20 px-4 py-2 text-sm text-[#2530F0] dark:text-[#13E1EA] transition-colors hover:bg-[#2530F014] dark:hover:bg-white/10"
              >
                Shared Responsibility
              </a>
              <a
                href="#incident-response"
                className="rounded-full border border-[#2530F033] dark:border-white/20 px-4 py-2 text-sm text-[#2530F0] dark:text-[#13E1EA] transition-colors hover:bg-[#2530F014] dark:hover:bg-white/10"
              >
                Incident Response
              </a>
            </nav>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild className="rounded-full px-7 py-3 w-full sm:w-auto">
                <Link href="/contact">Talk to Security Team</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full px-7 py-3 w-full sm:w-auto"
              >
                <Link href="/terms">Review Terms</Link>
              </Button>
            </div>
          </div>

          <aside className="rounded-2xl border border-[#2530F033] dark:border-white/15 bg-[#2530F00A] dark:bg-white/[0.03] p-5 md:p-6">
            <h2 className="text-black dark:text-white text-xl font-semibold font-['Space_Grotesk']">
              Security priorities
            </h2>
            <ul className="mt-4 list-disc pl-5 space-y-3 text-sm md:text-base text-[#454545] dark:text-[#B9C2D5]">
              <li>Access control and identity protection</li>
              <li>Data safeguards across desktop and storage layers</li>
              <li>Monitoring and incident response processes</li>
              <li>Operational controls for service reliability</li>
            </ul>
          </aside>
        </div>
      </section>

      <section
        id="security-controls"
        className="grid gap-4 md:grid-cols-3"
        aria-label="Core security controls"
      >
        {securityPillars.map((pillar) => (
          <article
            key={pillar.title}
            className="rounded-2xl border border-[#2530F022] dark:border-white/10 bg-[#5220DE08] dark:bg-white/[0.03] p-5"
          >
            <h2 className="text-black dark:text-white text-lg font-semibold font-['Space_Grotesk']">
              {pillar.title}
            </h2>
            <ul className="mt-3 list-disc pl-5 space-y-2 text-sm md:text-base text-[#454545] dark:text-[#B9C2D5]">
              {pillar.points.map((point) => (
                <li key={point} className="leading-relaxed">
                  {point}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section
        id="secure-workflow"
        className="glass-card !shadow-none gradient-outline-border !rounded-3xl !border-0 px-6 md:px-12 py-8"
        aria-label="Secure workflow lifecycle"
      >
        <h2 className="text-black dark:text-white text-2xl md:text-3xl font-bold font-['Space_Grotesk'] leading-8 tracking-tight">
          Secure workflow lifecycle
        </h2>
        <p className="mt-3 text-[#454545] dark:text-[#B9C2D5]">
          Security controls are applied across the full lifecycle of user access
          and daily operations.
        </p>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#2530F022] dark:border-white/10">
          <table className="min-w-[760px] w-full text-left">
            <thead className="bg-[#2530F00D] dark:bg-white/5">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-black dark:text-white">
                  Phase
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-black dark:text-white">
                  Control Focus
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-black dark:text-white">
                  Security Outcome
                </th>
              </tr>
            </thead>
            <tbody>
              {workflowControls.map((row) => (
                <tr
                  key={row.phase}
                  className="border-t border-[#2530F018] dark:border-white/10"
                >
                  <td className="px-4 py-3 text-sm md:text-base text-black dark:text-white font-medium">
                    {row.phase}
                  </td>
                  <td className="px-4 py-3 text-sm md:text-base text-[#454545] dark:text-[#B9C2D5]">
                    {row.control}
                  </td>
                  <td className="px-4 py-3 text-sm md:text-base text-[#454545] dark:text-[#B9C2D5]">
                    {row.outcome}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        id="shared-responsibility"
        className="grid gap-4 md:grid-cols-2"
        aria-label="Shared security responsibility"
      >
        {sharedResponsibility.map((group) => (
          <article
            key={group.title}
            className="rounded-2xl border border-[#2530F022] dark:border-white/10 bg-white/70 dark:bg-white/[0.03] p-6"
          >
            <h2 className="text-black dark:text-white text-xl font-semibold font-['Space_Grotesk']">
              {group.title}
            </h2>
            <ul className="mt-4 list-disc pl-5 space-y-3 text-sm md:text-base text-[#454545] dark:text-[#B9C2D5]">
              {group.items.map((item) => (
                <li key={item} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section
        id="incident-response"
        className="glass-card !shadow-none gradient-outline-border !rounded-3xl !border-0 px-6 md:px-12 py-8"
        aria-label="Incident response process"
      >
        <h2 className="text-black dark:text-white text-2xl md:text-3xl font-bold font-['Space_Grotesk'] leading-8 tracking-tight">
          Incident response approach
        </h2>
        <ol className="mt-5 list-disc pl-5 space-y-3 text-[#454545] dark:text-[#B9C2D5]">
          {incidentSteps.map((step) => (
            <li key={step} className="leading-relaxed">
              {step}
            </li>
          ))}
        </ol>
      </section>

        <FAQ
          items={securityFaqItems}
          subtitle="Everything you need to know about Sense PC security practices"
        />
      </div>
    </div>
  </MainLayout>
);

export default MainPage;
