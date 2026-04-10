import LegalSidebar from "../../_components/legal-sidebar";

import type { LegalSection } from "../../data/sections";

type TermsSidebarProps = {
  sections: LegalSection[];
  lastUpdated: string;
};

const TermsSidebar = ({ sections, lastUpdated }: TermsSidebarProps) => (
  <LegalSidebar
    title="Terms of Service"
    sections={sections}
    lastUpdated={lastUpdated}
    trackingMode="scroll"
  />
);

export default TermsSidebar;
