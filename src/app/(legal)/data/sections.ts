export type LegalSection = {
  id: string;
  label: string;
};

export const termsSections: LegalSection[] = [
  { id: "introduction", label: "Introduction" },
  { id: "definitions", label: "Definitions" },
  { id: "account-registration-security", label: "Account Registration & Security" },
  { id: "description-of-services", label: "Description of Services" },
  { id: "subscription-terms", label: "Subscription Terms" },
  { id: "fees-and-payment", label: "Fees & Payment" },
  { id: "upgrades-downgrades-add-ons", label: "Upgrades, Downgrades & Add-Ons" },
  { id: "software-license-usage", label: "Software License & Usage" },
  { id: "user-content-data", label: "User Content & Data" },
  { id: "acceptable-use-code-of-conduct", label: "Acceptable Use / Code of Conduct" },
  { id: "storage-and-os-licensing", label: "Storage & OS Licensing" },
  { id: "service-availability-maintenance", label: "Service Availability & Maintenance" },
  { id: "geographic-availability", label: "Geographic Availability" },
  { id: "third-party-services-and-dependencies", label: "Third-Party Services & Dependencies" },
  { id: "termination-and-suspension", label: "Termination & Suspension" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "limitation-of-liability", label: "Limitation of Liability" },
  { id: "indemnification", label: "Indemnification" },
  { id: "force-majeure", label: "Force Majeure" },
  { id: "arbitration-and-dispute-resolution", label: "Arbitration & Dispute Resolution" },
  { id: "modifications-to-terms", label: "Changes to the Terms" },
  { id: "communication-and-notices", label: "Communication & Notices" },
  { id: "miscellaneous", label: "Miscellaneous" },
];

export const privacySections: LegalSection[] = [
  { id: "how-we-handle-your-data", label: "How We Handle Your Data" },
  { id: "personal-information", label: "Personal Information We Collect" },
  { id: "how-we-use-your-information", label: "How We Use Your Information" },
  { id: "how-we-share-your-information", label: "How We Share Your Information" },
  { id: "your-rights-choices", label: "Your Rights & Choices" },
  { id: "data-security", label: "Data Security" },
  { id: "cookies-tracking", label: "Cookies & Tracking Technologies" },
  { id: "do-not-track", label: "Do Not Track (DNT) Signals" },
  { id: "childrens-privacy", label: "Children's Privacy" },
  { id: "international-transfers", label: "International Transfers" },
  { id: "notice-european-users", label: "Notice to European Users (GDPR/UK)" },
];
