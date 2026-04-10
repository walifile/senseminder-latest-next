import LegalSidebar from "../../_components/legal-sidebar";

import type { LegalSection } from "../../data/sections";

type PrivacySidebarProps = {
  sections: LegalSection[];
  lastUpdated: string;
};

const PrivacySidebar = ({ sections, lastUpdated }: PrivacySidebarProps) => (
  <LegalSidebar
    title="Privacy Policy"
    sections={sections}
    lastUpdated={lastUpdated}
    trackingMode="intersection"
  />
);

export default PrivacySidebar;
