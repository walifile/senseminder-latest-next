export type LegalSection = {
  id: string;
  label: string;
};

export const termsSections: LegalSection[] = [
  { id: "introduction", label: "1. Introduction" },
  { id: "definitions", label: "2. Definitions" },
  { id: "account-registration-security", label: "3. Account Registration & Security" },
  { id: "description-of-services", label: "4. Description of Services" },
  { id: "subscription-terms", label: "5. Subscription Terms" },
  { id: "fees-and-payment", label: "6. Fees & Payment" },
  { id: "upgrades-downgrades-add-ons", label: "7. Upgrades, Downgrades & Add-Ons" },
  { id: "software-license-usage", label: "8. Software License & Usage" },
  { id: "user-content-data", label: "9. User Content & Data" },
  { id: "acceptable-use-code-of-conduct", label: "10. Acceptable Use / Code of Conduct" },
  { id: "storage-and-os-licensing", label: "11. Storage & OS Licensing" },
  { id: "service-availability-maintenance", label: "12. Service Availability & Maintenance" },
  { id: "geographic-availability", label: "13. Geographic Availability" },
  { id: "third-party-services-and-dependencies", label: "14. Third-Party Services & Dependencies" },
  { id: "termination-and-suspension", label: "15. Termination & Suspension" },
  { id: "intellectual-property", label: "16. Intellectual Property" },
  { id: "limitation-of-liability", label: "17. Limitation of Liability" },
  { id: "indemnification", label: "18. Indemnification" },
  { id: "force-majeure", label: "19. Force Majeure" },
  { id: "arbitration-and-dispute-resolution", label: "20. Arbitration & Dispute Resolution" },
  { id: "modifications-to-terms", label: "21. Changes to the Terms" },
  { id: "communication-and-notices", label: "22. Communication & Notices" },
  { id: "miscellaneous", label: "23. Miscellaneous" },
];

export const privacySections: LegalSection[] = [
  { id: "how-we-handle-your-data", label: "1. How We Handle Your Data" },
  { id: "personal-information", label: "2. Personal Information We Collect" },
  { id: "how-we-use-your-information", label: "3. How We Use Your Information" },
  { id: "how-we-share-your-information", label: "4. How We Share Your Information" },
  { id: "third-party-service-providers-and-subprocessors", label: "5. Third-Party Service Providers and Subprocessors" },
  { id: "data-retention", label: "6. Data Retention" },
  { id: "data-breach-notification", label: "7. Data Breach Notification" },
  { id: "your-rights-choices", label: "8. Your Rights & Choices" },
  { id: "usa-privacy-rights-state-privacy-laws", label: "9. USA Privacy Rights (State Privacy Laws)" },
  { id: "childrens-privacy", label: "10. Children's Privacy" },
  { id: "data-security", label: "11. Data Security" },
  { id: "international-transfers", label: "12. International Transfers" },
  { id: "cookies-tracking", label: "13. Cookies & Tracking Technologies" },
  { id: "notice-european-users", label: "14. Notice to European Users (GDPR/UK)" },
  { id: "privacy-policy-changes", label: "15. Changes to This Privacy Policy" },
  { id: "contact-us", label: "16. Contact Us" },
];
