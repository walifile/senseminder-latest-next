export const aboutJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://sensepc.com/#organization",
      name: "Sense PC",
      legalName: "Sense PC",
      url: "https://sensepc.com/",
      logo: "https://sensepc.com/sensepc-logo.png",
      foundingDate: "2020",
      founder: {
        "@type": "Person",
        "@id": "https://sensepc.com/about#founder",
      },
      slogan: "Your Computer, Now in the Cloud",
      description:
        "Sense PC is a cloud-native platform providing high-performance virtual desktops. We eliminate the need for physical hardware maintenance by offering scalable, secure, and low-latency cloud computing.",
      sameAs: [
        "https://www.linkedin.com/company/sensepcofficial/",
        "https://x.com/sensepcofficial/",
        "https://www.instagram.com/sensepcofficial/",
        "https://www.facebook.com/officialsensepc/",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: "https://sensepc.com/contact",
      },
    },
    {
      "@type": "Person",
      "@id": "https://sensepc.com/about#founder",
      name: "Ashfak Ahmed",
      jobTitle: "Founder & CEO",
      worksFor: { "@id": "https://sensepc.com/#organization" },
      description:
        "Ashfak Ahmed founded Sense PC in 2020 to solve hardware limitations by building a high-performance, cloud-native desktop environment.",
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://sensepc.com/#software",
      name: "Sense PC Virtual Desktop",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Windows 10, Windows 11, Linux",
      description:
        "A powerful cloud computer accessible from any browser. Features ultra-low latency, enterprise-grade security, and proprietary technology for professional responsiveness.",
      softwareHelp: "https://sensepc.com/tutorials",
      offers: [
        {
          "@type": "Offer",
          name: "Hourly Plan",
          url: "https://sensepc.com/products/sensepc",
          description: "Usage-based pricing while instance is running.",
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          name: "Daily Plan",
          url: "https://sensepc.com/products/sensepc",
          description: "Usage-based pricing based on selected configuration and runtime.",
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          name: "Monthly Plan",
          url: "https://sensepc.com/products/sensepc",
          description: "Usage-based pricing based on selected configuration and runtime.",
          availability: "https://schema.org/InStock",
        },
      ],
      featureList: [
        "No hardware needed",
        "Scalable CPU, RAM, and SSD (220GB to 1000GB)",
        "East Coast Server Region",
        "99.9% Uptime SLA",
        "Built-in Encryption",
        "Zero E-waste & Energy Efficient",
      ],
    },
    {
      "@type": "Service",
      name: "Sense Cloud Storage",
      provider: { "@id": "https://sensepc.com/#organization" },
      description:
        "Secure cloud storage that stays synced across all devices with smart organization and file preview features.",
      audience: {
        "@type": "Audience",
        audienceType: "Developers, Remote Workers, Creators, and Researchers",
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://sensepc.com/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a Cloud PC?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "A powerful cloud computer accessible from any browser, on any device, from anywhere - no hardware needed.",
          },
        },
        {
          "@type": "Question",
          name: "What makes Sense PC different?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Unlike other cloud desktops, Sense PC uses proprietary technology to offer ultra-low latency, visual quality, and responsiveness designed for professionals.",
          },
        },
        {
          "@type": "Question",
          name: "Can I install my own software on Sense PC?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Yes, Sense PC allows users to run demanding applications and install their own software on a fast, reliable cloud desktop.",
          },
        },
      ],
    },
    {
      "@type": "WebSite",
      name: "Sense PC",
      url: "https://sensepc.com/",
      publisher: { "@id": "https://sensepc.com/#organization" },
    },
  ],
};
