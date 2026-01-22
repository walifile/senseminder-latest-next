
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useGetLegalDocumentsQuery } from "@/api/legalDocumentsAPI";

import { privacySections } from "../data/sections";
import { Breadcrumb } from "../../home/_components/breadcrumb";


type Section = {
  id: string;
  label: string;
};

const Privacy = () => {
  const { isLoading } = useGetLegalDocumentsQuery();

  const sections = useMemo(() => privacySections as Section[], []);

  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id ?? "");

  const baseLinkClasses =
    "relative pr-9 text-black hover:text-white dark:text-white dark:hover:text-white mx-6 p-4 rounded-lg border hover:bg-gradient-to-r hover:from-[#3A29E7] hover:to-[#A601BA]";

  const activeLinkClasses =
    "!border-0 text-white bg-gradient-to-r from-[#3A29E7] to-[#A601BA] " +
    "before:content-[''] before:absolute before:right-[-23px] before:bottom-0 " +
    "before:w-[10px] before:h-full before:bg-[#A601BA] before:rounded-l-[12px]";

  // ✅ Match Terms & Conditions text color (force override)
  const legalText = "!text-black dark:!text-white";
  const legalPara = `text-paragraph ${legalText}`;

  const lastUpdated = "January 6, 2026";

  // ✅ arrow-body-style: no block+return for simple arrow
  const linkClassName = (id: string) =>
    `${baseLinkClasses} ${activeSection === id ? activeLinkClasses : ""}`;

  // ✅ consistent-return: do NOT return anything
  const handleNavClick = (id: string) => {
    setActiveSection(id);
    requestAnimationFrame(() => {
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  // (optional but common) if you support #hash navigation on load/back/forward
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash?.replace("#", "");
    if (hash && sections.some((s) => s.id === hash)) {
      setActiveSection(hash);
    }
  }, [sections]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <main className="flex-grow pt-16 md:pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />

        {/* ✅ Fix awkward empty space: don't stretch cards to equal height */}
        <div className="flex flex-col md:flex-row gap-10 md:items-start">
          <div className="w-full md:w-1/3 lg:w-[35%]">
            <div className="glass-card !shadow-none gradient-outline-border !rounded-3xl !border-0">
              <div className="space-y-2 p-8">
                <p className="font-space-grotesk font-semibold text-2xl md:text-3xl">Privacy Policy</p>
                <p className="text-paragraph text-sm">Last Updated: {lastUpdated}</p>
              </div>
              <hr />
              <div className="space-y-3 py-6 flex flex-col">
                {sections.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={linkClassName(id)}
                    onClick={() => handleNavClick(id)}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full md:w-2/3 lg:w-[65%]">
            <div className="glass-card !shadow-none gradient-outline-border !rounded-3xl !border-0 space-y-6">
              {/* ✅ Fix readability: constrain text width inside the big card */}
              <div className="w-full max-w-[820px] mx-auto">
                {/* How we handle your data */}
                {activeSection === "how-we-handle-your-data" && (
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        How We Handle Your Data
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-4 p-8">
                      <p className={legalPara}>
                        Welcome to Senseminder. This Privacy Policy explains how Senseminder LLC ("Senseminder", "we",
                        "our", or "us") collects, uses, shares, and protects your personal information when you
                        interact with our services including Sense PC (virtual desktop computing) and Sense Cloud
                        (cloud-based file storage).
                      </p>
                      <p className={legalPara}>
                        Senseminder LLC is a U.S.-based company registered in the State of Georgia. All data handling
                        practices comply with applicable federal and state privacy laws including GDPR, CCPA/CPRA,
                        Virginia CDPA, Colorado CPA, Connecticut CTDPA, and other applicable regulations.
                      </p>
                      <p className={legalPara}>
                        By using our Services, you agree to this Privacy Policy. If you do not agree, please refrain
                        from using our Services.
                      </p>
                    </div>
                  </div>
                )}

                {/* Personal Information We Collect */}
                {activeSection === "personal-information" && (
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl text-black dark:text-white">
                        2. Personal Information We Collect
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-4 p-8">
                      <p className={legalPara}>
                        We collect various categories of personal information to deliver and improve our services.
                      </p>

                      <h3 className="text-xl font-medium text-black dark:text-white">
                        2.1 Information You Provide Directly
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>Full name, email address, phone number</li>
                        <li>Payment and billing information</li>
                        <li>Organization name (if applicable)</li>
                        <li>Profile image (optional)</li>
                        <li>Support communications and inquiries</li>
                      </ul>

                      <h3 className="text-xl font-medium text-black dark:text-white">
                        2.2 Information Collected Automatically
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>IP address and geolocation data</li>
                        <li>Device type, operating system, browser type</li>
                        <li>Activity logs (login timestamps, resource usage)</li>
                        <li>Clickstream data (navigation paths, session duration)</li>
                        <li>Connection status and service interactions</li>
                      </ul>

                      <h3 className="text-xl font-medium text-black dark:text-white">
                        2.3 Information From Third Parties
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>Authentication providers (Google, Microsoft, Discord)</li>
                        <li>Payment processors (e.g., Stripe)</li>
                        <li>Referral programs or marketing affiliates</li>
                      </ul>

                      <h3 className="text-xl font-medium text-black dark:text-white">
                        2.4 Usage &amp; Preferences Information
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>System configurations (CPU, RAM, storage selections)</li>
                        <li>Sense PC runtime history and uptime data</li>
                        <li>File upload/download behavior</li>
                        <li>Support interaction history</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* How We Use Your Information */}
                {activeSection === "how-we-use-your-information" && (
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl text-black dark:text-white">
                        3. How We Use Your Information
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-4 p-8">
                      <p className={legalPara}>
                        Senseminder collects and uses your personal information for a variety of business, legal,
                        and operational purposes, all aligned with our mission to provide secure and reliable Sense
                        PC and Sense Cloud services. Specifically, we use the information collected:
                      </p>

                      {/* 2.1 */}
                      <h3 className="text-xl font-medium text-black dark:text-white">
                        3.1 To Provide and Maintain services
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>Authenticate users and manage access</li>
                        <li>Deliver Sense PC and Sense Cloud functionality</li>
                        <li>Process billing and subscriptions</li>
                        <li>Provide technical support</li>
                        <li>Send system alerts and billing notices</li>
                      </ul>

                      {/* 2.2 */}
                      <h3 className="text-xl font-medium text-black dark:text-white">
                        3.2 To Improve User Experience
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>Enhance system stability and security</li>
                        <li>Identify and fix technical issues</li>
                        <li>Optimize performance and features</li>
                        <li>Conduct quality and satisfaction analysis</li>
                      </ul>

                      {/* 2.3 */}
                      <h3 className="text-xl font-medium text-black dark:text-white">
                        3.3 For Communications (With Consent)
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>Send product updates and feature announcements</li>
                        <li>Deliver promotional offers and usage tips</li>
                        <li>Request feedback or survey participation</li>
                        <li>
                          <span className="font-medium">Note:</span> You can opt out anytime via email or account settings
                        </li>
                      </ul>

                      {/* 2.4 */}
                      <h3 className="text-xl font-medium text-black dark:text-white">
                        3.4 For Legal and Security Purposes
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>Enforce Terms of Service and policies</li>
                        <li>Detect and prevent fraud and abuse</li>
                        <li>Maintain audit trails and investigate violations</li>
                        <li>Respond to legal requests and obligations</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* How We Share Your Information */}
                {activeSection === "how-we-share-your-information" && (
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl text-black dark:text-white">
                        4. How We Share Your Information
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-4 p-8">
                      <p className={legalPara}>
                        We do NOT sell your personal information. We only share data as necessary to deliver
                        services, comply with law, or protect our platform.
                      </p>

                      {/* 3.1 */}
                      <h3 className="text-xl font-medium text-black dark:text-white">
                        4.1 With Service Providers
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>Cloud infrastructure (AWS - EC2, S3)</li>
                        <li>Payment processors (Stripe)</li>
                        <li>Customer support systems</li>
                        <li>Security and monitoring providers</li>
                        <li>All providers are contractually bound to protect your data</li>
                      </ul>

                      {/* 3.2 */}
                      <h3 className="text-xl font-medium text-black dark:text-white">
                        4.2 For Legal Compliance
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>To comply with laws, subpoenas, court orders</li>
                        <li>To investigate fraud or Terms violations</li>
                        <li>To protect rights, safety, or property of Senseminder and users</li>
                      </ul>

                      {/* 3.3 */}
                      <h3 className="text-xl font-medium text-black dark:text-white">
                        4.3 Business Transfers
                      </h3>
                      <p className={legalPara}>
                        In mergers, acquisitions, or asset sales, user information may be transferred. We will
                        notify you and ensure the receiving party maintains equivalent privacy protections.
                      </p>

                      {/* 3.4 */}
                      <h3 className="text-xl font-medium text-black dark:text-white">
                        4.4 With Your Consent
                      </h3>
                      <p className={legalPara}>
                        We may share data for purposes you explicitly authorize (e.g., third-party app integrations).
                      </p>
                    </div>
                  </div>
                )}

                {/* Third-Party Service Providers and Subprocessors */}
                {activeSection === "third-party-service-providers-and-subprocessors" && (
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        5. Third-Party Service Providers and Subprocessors
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-4 p-8">
                      <p className={legalPara}>
                        We share personal information only with trusted providers contractually bound to protect your data.
                      </p>

                      {/* 4.1 With Service Providers and Contractors */}
                      <h3 className="text-xl font-medium text-black dark:text-white">
                        5.1 Current Subprocessors
                      </h3>

                      <div className="mt-4 overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
                        <table className="w-full border-collapse text-left text-sm">
                          <thead>
                            <tr className="bg-[#E7F0FF] dark:bg-white/5">
                              <th className="px-4 py-3 font-semibold text-black dark:text-white">
                                Provider
                              </th>
                              <th className="px-4 py-3 font-semibold text-black dark:text-white">
                                Service
                              </th>
                              <th className="px-4 py-3 font-semibold text-black dark:text-white">
                                Data Accessed
                              </th>
                              <th className="px-4 py-3 font-semibold text-black dark:text-white">
                                Location
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            <tr className="border-t border-black/10 dark:border-white/10">
                              <td className="px-4 py-3 text-black dark:text-white">
                                Amazon Web Services
                              </td>
                              <td className={`px-4 py-3 ${legalPara}`}>
                                Cloud infrastructure
                              </td>
                              <td className={`px-4 py-3 ${legalPara}`}>
                                All user data, content
                              </td>
                              <td className={`px-4 py-3 ${legalPara}`}>
                                USA, EU (as selected)
                              </td>
                            </tr>

                            <tr className="border-t border-black/10 dark:border-white/10">
                              <td className="px-4 py-3 text-black dark:text-white">
                                Stripe, Inc.
                              </td>
                              <td className={`px-4 py-3 ${legalPara}`}>
                                Payment processing
                              </td>
                              <td className={`px-4 py-3 ${legalPara}`}>
                                Payment card, billing info
                              </td>
                              <td className={`px-4 py-3 ${legalPara}`}>
                                USA
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* 4.2 For Legal Compliance and Protection */}
                      <h3 className="text-xl font-medium text-black dark:text-white">
                        5.2 Subprocessor Change Notification
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>
                          We notify customers of subprocessor changes:
                        </li>
                        <li>
                          Via email to registered address
                        </li>
                        <li>
                          Posted at: https://sensepc.com/subprocessors
                        </li>
                        <li>
                          At least 30 days advance notice for new subprocessors
                        </li>
                      </ul>
                      <p className={legalPara}>
                        Enterprise customers may object to new subprocessors on reasonable data protection grounds by contacting contact@sensepc.com within 30 days.
                      </p>
                    </div>
                  </div>
                )}

                {/* Data Retention */}
                {activeSection === "data-retention" && (
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl text-black dark:text-white">
                        6. Data Retention
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-4 p-8">
                      <p className={legalPara}>
                        We retain personal information only as long as necessary to fulfill purposes in this Policy,
                        unless longer retention is required by law.
                      </p>

                      {/* 5.1 Specific Retention Periods */}
                      <h3 className="text-xl font-medium text-black dark:text-white">
                        6.1 Specific Retention Periods
                      </h3>

                      <div className="mt-4 overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
                        <table className="w-full border-collapse text-left text-sm">
                          <thead>
                            <tr className="bg-[#E7F0FF] dark:bg-white/5">
                              <th className="px-4 py-3 font-semibold text-black dark:text-white">
                                Data Category
                              </th>
                              <th className="px-4 py-3 font-semibold text-black dark:text-white">
                                Retention Period
                              </th>
                              <th className="px-4 py-3 font-semibold text-black dark:text-white">
                                Legal Basis
                              </th>
                            </tr>
                          </thead>

                          <tbody className={legalPara}>
                            <tr className="border-t border-black/10 dark:border-white/10">
                              <td className="px-4 py-3 text-black dark:text-white">Active Account Data</td>
                              <td className="px-4 py-3">Duration of active account</td>
                              <td className="px-4 py-3">Contractual necessity</td>
                            </tr>

                            <tr className="border-t border-black/10 dark:border-white/10">
                              <td className="px-4 py-3 text-black dark:text-white">Closed Account Data</td>
                              <td className="px-4 py-3">90 days post-closure</td>
                              <td className="px-4 py-3">Service continuity</td>
                            </tr>

                            <tr className="border-t border-black/10 dark:border-white/10">
                              <td className="px-4 py-3 text-black dark:text-white">Payment/Billing Records</td>
                              <td className="px-4 py-3">7 years from transaction</td>
                              <td className="px-4 py-3">Tax law (26 USC § 6001)</td>
                            </tr>

                            <tr className="border-t border-black/10 dark:border-white/10">
                              <td className="px-4 py-3 text-black dark:text-white">Support Communications</td>
                              <td className="px-4 py-3">3 years from last contact</td>
                              <td className="px-4 py-3">Legitimate business interest</td>
                            </tr>

                            <tr className="border-t border-black/10 dark:border-white/10">
                              <td className="px-4 py-3 text-black dark:text-white">Usage Logs/Analytics</td>
                              <td className="px-4 py-3">18 months from collection</td>
                              <td className="px-4 py-3">Security/fraud prevention</td>
                            </tr>

                            <tr className="border-t border-black/10 dark:border-white/10">
                              <td className="px-4 py-3 text-black dark:text-white">Marketing Consent Records</td>
                              <td className="px-4 py-3">5 years from last interaction</td>
                              <td className="px-4 py-3">GDPR Art. 7 compliance</td>
                            </tr>

                            <tr className="border-t border-black/10 dark:border-white/10">
                              <td className="px-4 py-3 text-black dark:text-white">Sense PC Instance Data</td>
                              <td className="px-4 py-3">Until instance deletion by user</td>
                              <td className="px-4 py-3">User instruction</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* 5.2 */}
                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        6.2 Deletion Procedures
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>
                          After retention periods, we permanently delete data using secure methods preventing recovery.
                        </li>
                      </ul>

                      {/* 5.3 */}
                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        6.3 Legal Exceptions
                      </h3>
                      <ul className={`pl-6 space-y-2 ${legalPara}`}>
                        <li>
                          We may retain data beyond the stated periods when required for:
                          <ul className={`list-disc pl-6 mt-2 space-y-2 ${legalPara}`}>
                            <li>Legal obligations (litigation holds, government investigations)</li>
                            <li>Dispute resolution or enforcing our Terms</li>
                            <li>Fraud prevention or security purposes</li>
                          </ul>
                        </li>
                      </ul>

                      {/* 5.4 */}
                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        6.4 User-Initiated Deletion
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>
                          Users may request early deletion by contacting{" "}
                          <a
                            href="mailto:contact@sensepc.com"
                            className="underline underline-offset-2"
                          >
                            contact@sensepc.com
                          </a>
                          , subject to legal retention obligations.
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Data Breach Notification */}
                {activeSection === "data-breach-notification" && (
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl text-black dark:text-white">
                        7. Data Breach Notification
                      </h2>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        7.1 Our Commitment
                      </h3>

                      <p className={`mt-2 ${legalPara}`}>
                        In the event of a data breach affecting your personal information:
                      </p>

                      {/* Parent list (no bullets) + nested bullet lists (disc) */}
                      <ul className="pl-0 space-y-4 text-paragraph mt-3">
                        <li>
                          <span className="font-medium text-black dark:text-white">
                            Step 1: Internal Assessment (0–24 hours)
                          </span>
                          <ul className={`list-disc pl-6 mt-2 space-y-2 ${legalPara}`}>
                            <li>Contain and assess breach scope</li>
                            <li>Determine affected users and data types</li>
                            <li>Document incident details</li>
                          </ul>
                        </li>

                        <li>
                          <span className="font-medium text-black dark:text-white">
                            Step 2: User Notification (Within 72 hours)
                          </span>
                          <ul className={`list-disc pl-6 mt-2 space-y-2 ${legalPara}`}>
                            <li>Notify affected users via email</li>
                            <li>Describe the nature of the breach, data affected, and potential consequences</li>
                            <li>Explain measures taken and recommended user actions</li>
                            <li>Offer identity protection services if appropriate</li>
                          </ul>
                        </li>

                        <li>
                          <span className="font-medium text-black dark:text-white">
                            Step 3: Regulatory Notification
                          </span>
                          <ul className={`list-disc pl-6 mt-2 space-y-2 ${legalPara}`}>
                            <li>Report to supervisory authorities as required</li>
                            <li>
                              For USA users: Notify per applicable state breach notification laws (Cal. Civ. Code §
                              1798.82 and similar statutes in all 50 states) and federal requirements.
                            </li>
                            <li>For EU users: Notify within 72 hours per GDPR Art. 33.</li>
                          </ul>
                        </li>
                      </ul>

                      <h3 className="mt-8 text-xl font-medium text-black dark:text-white">
                        7.2 What Constitutes a Breach
                      </h3>
                      <p className={`mt-2 ${legalPara}`}>
                        A “data breach” means unauthorized access, disclosure, or acquisition of personal
                        information that compromises security, confidentiality, or integrity.
                      </p>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        7.3 Non-Reportable Incidents
                      </h3>

                      <ul className={`list-disc pl-6 space-y-2 ${legalPara} mt-3`}>
                        <li>Unsuccessful access attempts (blocked attacks)</li>
                        <li>Encrypted data incidents where keys are not compromised</li>
                        <li>Incidents where affected data was already public</li>
                      </ul>

                      <p className={`mt-6 ${legalPara}`}>
                        <span className="font-medium text-black dark:text-white">
                          Contact for Breach Inquiries:
                        </span>{" "}
                        <a
                          href="mailto:contact@sensepc.com"
                          className="underline underline-offset-2 text-black dark:text-white"
                        >
                          contact@sensepc.com
                        </a>{" "}
                        | 24/7 Incident Response
                      </p>
                    </div>
                  </div>
                )}

                {/* Your Rights & Choices */}
                {activeSection === "your-rights-choices" && (
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl text-black dark:text-white">
                        8. Your Rights &amp; Choices
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-4 p-8">
                      <p className={legalPara}>
                        Depending on your location and applicable law (GDPR, USA state privacy laws), you may have
                        the following rights:
                      </p>

                      <h3 className="text-xl font-medium text-black dark:text-white">8.1 Right to Access</h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>Request a copy of personal data we hold about you</li>
                      </ul>

                      <h3 className="text-xl font-medium text-black dark:text-white">8.2 Right to Rectification</h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>Request correction of inaccurate or incomplete data</li>
                      </ul>

                      <h3 className="text-xl font-medium text-black dark:text-white">
                        8.3 Right to Deletion (Right to Be Forgotten)
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>Request deletion of your personal information (subject to legal exceptions)</li>
                      </ul>

                      <h3 className="text-xl font-medium text-black dark:text-white">
                        8.4 Right to Restrict or Object to Processing
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>Request to pause or restrict data use, or object to specific processing</li>
                      </ul>

                      <h3 className="text-xl font-medium text-black dark:text-white">8.5 Right to Data Portability</h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>
                          Receive your data in structured, machine-readable format or have it transmitted to another
                          provider
                        </li>
                      </ul>

                      <h3 className="text-xl font-medium text-black dark:text-white">8.6 How to Exercise Your Rights</h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>
                          Email:{" "}
                          <a
                            href="mailto:contact@sensepc.com"
                            className="underline underline-offset-2 text-black dark:text-white"
                          >
                            contact@sensepc.com
                          </a>
                        </li>
                        <li>
                          Provide: Your name, email, account ID, and specify which right you wish to exercise
                        </li>
                        <li>Response time: Within 30 days (may extend to 45 days for complex requests)</li>
                      </ul>

                      <h3 className="text-xl font-medium text-black dark:text-white">8.7 Identity Verification</h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>
                          <span className="font-medium text-black dark:text-white">For Account Holders:</span> Email
                          from registered address OR login via dashboard OR use MFA
                        </li>
                        <li>
                          <span className="font-medium text-black dark:text-white">For Non-Account Holders:</span>{" "}
                          Provide name, email, approximate interaction date
                        </li>
                      </ul>

                      <h3 className="text-xl font-medium text-black dark:text-white">8.8 Data Portability Details</h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>
                          <span className="font-medium text-black dark:text-white">Portable data:</span> Account
                          profile, user content, Sense Cloud files, usage history, settings
                        </li>
                        <li>
                          <span className="font-medium text-black dark:text-white">Formats:</span> JSON, CSV, ZIP
                          archive
                        </li>
                        <li>
                          <span className="font-medium text-black dark:text-white">Processing time:</span> &lt;1GB
                          within 48 hours; larger datasets within 10 business days
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* USA Privacy Rights (State Privacy Laws) */}
                {activeSection === "usa-privacy-rights-state-privacy-laws" && (
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl text-black dark:text-white">
                        9. USA Privacy Rights (State Privacy Laws)
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-4 p-8">
                      <p className={legalPara}>
                        This section applies to USA residents under applicable state privacy laws including California
                        CCPA/CPRA, Virginia Consumer Data Protection Act (CDPA), Colorado Privacy Act (CPA), Connecticut
                        Data Privacy Act (CTDPA), Utah Consumer Privacy Act (UCPA), and other state privacy statutes.
                      </p>

                      <h3 className="text-xl font-medium text-black dark:text-white">
                        9.1 Information We Collect (Last 12 Months)
                      </h3>

                      <div className="mt-4 overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
                        <table className="w-full border-collapse text-left text-sm">
                          <thead>
                            <tr className="bg-[#E7F0FF] dark:bg-white/5">
                              <th className="px-4 py-3 font-semibold text-black dark:text-white">Category</th>
                              <th className="px-4 py-3 font-semibold text-black dark:text-white">Examples</th>
                              <th className="px-4 py-3 font-semibold text-black dark:text-white">Purpose</th>
                              <th className="px-4 py-3 font-semibold text-black dark:text-white">Sold?</th>
                              <th className="px-4 py-3 font-semibold text-black dark:text-white">Shared?</th>
                            </tr>
                          </thead>

                          <tbody>
                            <tr className="border-t border-black/10 dark:border-white/10">
                              <td className="px-4 py-3 text-black dark:text-white">Identifiers</td>
                              <td className={`px-4 py-3 ${legalPara}`}>Name, email, IP</td>
                              <td className={`px-4 py-3 ${legalPara}`}>Service delivery</td>
                              <td className={`px-4 py-3 ${legalPara}`}>No</td>
                              <td className={`px-4 py-3 ${legalPara}`}>No</td>
                            </tr>

                            <tr className="border-t border-black/10 dark:border-white/10">
                              <td className="px-4 py-3 text-black dark:text-white">Commercial Info</td>
                              <td className={`px-4 py-3 ${legalPara}`}>Billing, subscription</td>
                              <td className={`px-4 py-3 ${legalPara}`}>Billing/support</td>
                              <td className={`px-4 py-3 ${legalPara}`}>No</td>
                              <td className={`px-4 py-3 ${legalPara}`}>No</td>
                            </tr>

                            <tr className="border-t border-black/10 dark:border-white/10">
                              <td className="px-4 py-3 text-black dark:text-white">Internet Activity</td>
                              <td className={`px-4 py-3 ${legalPara}`}>Usage logs, clicks</td>
                              <td className={`px-4 py-3 ${legalPara}`}>Service improvement</td>
                              <td className={`px-4 py-3 ${legalPara}`}>No</td>
                              <td className={`px-4 py-3 ${legalPara}`}>No</td>
                            </tr>

                            <tr className="border-t border-black/10 dark:border-white/10">
                              <td className="px-4 py-3 text-black dark:text-white">Geolocation</td>
                              <td className={`px-4 py-3 ${legalPara}`}>IP-based location</td>
                              <td className={`px-4 py-3 ${legalPara}`}>Service delivery</td>
                              <td className={`px-4 py-3 ${legalPara}`}>No</td>
                              <td className={`px-4 py-3 ${legalPara}`}>No</td>
                            </tr>

                            <tr className="border-t border-black/10 dark:border-white/10">
                              <td className="px-4 py-3 text-black dark:text-white">Professional Info</td>
                              <td className={`px-4 py-3 ${legalPara}`}>Organization, job title</td>
                              <td className={`px-4 py-3 ${legalPara}`}>B2B services</td>
                              <td className={`px-4 py-3 ${legalPara}`}>No</td>
                              <td className={`px-4 py-3 ${legalPara}`}>No</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        9.2 Your USA Privacy Rights
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>
                          <span className="font-medium text-black dark:text-white">Right to Know</span> — Request disclosure of
                          personal information collected, used, or shared
                        </li>
                        <li>
                          <span className="font-medium text-black dark:text-white">Right to Delete</span> — Request deletion of
                          personal information (subject to exceptions)
                        </li>
                        <li>
                          <span className="font-medium text-black dark:text-white">Right to Correct</span> — Request correction of
                          inaccurate personal information
                        </li>
                        <li>
                          <span className="font-medium text-black dark:text-white">Right to Opt-Out</span> — We do NOT sell
                          personal information
                        </li>
                        <li>
                          <span className="font-medium text-black dark:text-white">Right to Non-Discrimination</span> — No
                          discrimination for exercising privacy rights
                        </li>
                        <li>
                          <span className="font-medium text-black dark:text-white">
                            Right to Limit Use of Sensitive Personal Information
                          </span>{" "}
                          (where applicable)
                        </li>
                      </ul>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        9.3 How to Exercise Your Rights
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>
                          Email:{" "}
                          <a
                            href="mailto:contact@sensepc.com"
                            className="underline underline-offset-2 text-black dark:text-white"
                          >
                            contact@sensepc.com
                          </a>
                        </li>
                        <li>
                          Subject Line: <span className="font-medium text-black dark:text-white">"USA Privacy Rights Request"</span>
                        </li>
                        <li>Include: Full name, email address, account ID (if applicable), state of residence</li>
                        <li>Response Time: Within 45 days (may extend to 90 days with notice)</li>
                      </ul>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        9.4 Do Not Sell My Personal Information
                      </h3>
                      <p className={`mt-2 ${legalPara}`}>
                        We do NOT sell personal information as defined by CCPA and other state privacy laws. We have
                        not sold personal information in the preceding 12 months.
                      </p>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        9.5 Authorized Agent Requests
                      </h3>

                      {/* Parent list (no bullets) + nested bullet list (disc) */}
                      <ul className="pl-0 space-y-2 text-paragraph">
                        <li>
                          <span className="text-black dark:text-white">
                            If submitting a request through an authorized agent, the agent must provide:
                          </span>
                          <ul className={`list-disc pl-6 mt-2 space-y-2 ${legalPara}`}>
                            <li>Written authorization signed by you</li>
                            <li>Proof of their identity</li>
                            <li>Verification that they are registered with appropriate state authority (if required)</li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Data Security */}
                {activeSection === "data-security" && (
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl text-black dark:text-white">
                        11. Data Security
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-4 p-8">
                      <p className={legalPara}>
                        We implement industry-standard security measures to protect your personal information from
                        unauthorized access, misuse, disclosure, alteration, or destruction.
                      </p>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        11.1 Security Measures
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>
                          <span className="font-medium text-black dark:text-white">Encryption:</span>{" "}
                          HTTPS (TLS) for data in transit; AWS KMS for sensitive data at rest
                        </li>
                        <li>
                          <span className="font-medium text-black dark:text-white">Access Controls:</span>{" "}
                          Role-based access controls (RBAC)
                        </li>
                        <li>
                          <span className="font-medium text-black dark:text-white">Secure Infrastructure:</span>{" "}
                          AWS security best practices, network isolation, and firewalls
                        </li>
                        <li>
                          <span className="font-medium text-black dark:text-white">Monitoring:</span>{" "}
                          Automated alerts for suspicious activity
                        </li>
                        <li>
                          <span className="font-medium text-black dark:text-white">Regular Assessments:</span>{" "}
                          Penetration tests and compliance audits
                        </li>
                      </ul>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        11.2 Your Role in Security
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>Use strong, unique passwords</li>
                        <li>Enable multi-factor authentication (MFA)</li>
                        <li>Keep login credentials confidential</li>
                        <li>Log out of shared or public devices</li>
                      </ul>

                      <p className={`mt-4 ${legalPara}`}>
                        Suspected unauthorized access? Contact{" "}
                        <a
                          href="mailto:contact@sensepc.com"
                          className="underline underline-offset-2 text-black dark:text-white"
                        >
                          contact@sensepc.com
                        </a>{" "}
                        immediately.
                      </p>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        11.3 Limitation of Liability
                      </h3>
                      <p className={`mt-2 ${legalPara}`}>
                        While we take reasonable security steps, no system is completely immune to breaches. We do
                        not accept liability for unauthorized access beyond our reasonable control, particularly if
                        caused by user negligence or third-party misuse.
                      </p>
                    </div>
                  </div>
                )}

                {/* Cookies & Tracking Technologies */}
                {activeSection === "cookies-tracking" && (
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl text-black dark:text-white">
                        13. Cookies &amp; Tracking Technologies
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-4 p-8">
                      <p className={legalPara}>
                        Senseminder does not use cookies or similar tracking technologies for behavioral advertising
                        or analytics. We are committed to a privacy-focused experience.
                      </p>

                      <p className={legalPara}>
                        While we may use limited local device storage (e.g., session memory for UI preferences), no
                        persistent identifiers or cross-site tracking mechanisms are utilized.
                      </p>

                      <p className={legalPara}>
                        If third-party services are integrated in the future (e.g., analytics), we will update this
                        policy and provide opt-in consent options.
                      </p>
                    </div>
                  </div>
                )}

                {/* Children's Privacy */}
                {activeSection === "childrens-privacy" && (
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl text-black dark:text-white">
                        10. Children&apos;s Privacy
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-4 p-8">
                      <p className={legalPara}>
                        Senseminder does not knowingly collect information from individuals under 16. Our services
                        are intended for users 16 years or older.
                      </p>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        10.1 Age Restriction
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>
                          If you are under 16, do not register for an account, use our services, or submit personal
                          information.
                        </li>
                      </ul>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        10.2 Parental Consent Requirement
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>
                          If under 16, you may ONLY use services if:
                          <ul className={`list-disc pl-6 mt-2 space-y-2 ${legalPara}`}>
                            <li>A parent/guardian creates and controls the account</li>
                            <li>Parent/guardian agrees to terms on your behalf</li>
                            <li>Parent/guardian supervises your use</li>
                          </ul>
                        </li>
                      </ul>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        10.3 Age Verification
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>
                          During registration, users must certify they are 16+. We reserve the right to:
                          <ul className={`list-disc pl-6 mt-2 space-y-2 ${legalPara}`}>
                            <li>Request additional age verification</li>
                            <li>Terminate accounts of suspected underage users</li>
                          </ul>
                        </li>
                      </ul>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        10.4 Discovery of Underage Users
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>
                          If we discover collection from a child under 16 without consent:
                          <ul className={`list-disc pl-6 mt-2 space-y-2 ${legalPara}`}>
                            <li>We promptly delete information within 30 days</li>
                            <li>We terminate the associated account</li>
                            <li>We notify the registered email address</li>
                          </ul>
                        </li>
                      </ul>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        10.5 Parental Rights
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>
                          Parents/guardians may:
                          <ul className={`list-disc pl-6 mt-2 space-y-2 ${legalPara}`}>
                            <li>Review their child&apos;s information</li>
                            <li>Request deletion of their child&apos;s information</li>
                            <li>Refuse further collection or use of their child&apos;s information</li>
                          </ul>
                        </li>
                      </ul>

                      <p className={`mt-4 ${legalPara}`}>
                        <span className="font-medium">To Exercise Parental Rights:</span>{" "}
                        <a
                          href="mailto:contact@sensepc.com"
                          className="underline underline-offset-2"
                        >
                          contact@sensepc.com
                        </a>
                      </p>

                      <p className={legalPara}>
                        Senseminder LLC, Attn: Privacy - Children&apos;s Inquiries, Atlanta, Georgia, USA
                      </p>

                      <p className={legalPara}>
                        Provide: Proof of parental relationship, child&apos;s account info, government ID for verification
                      </p>
                    </div>
                  </div>
                )}

                {/* International Transfers */}
                {activeSection === "international-transfers" && (
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl text-black dark:text-white">
                        12. International Transfers
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-4 p-8">
                      <p className={legalPara}>
                        Senseminder LLC is headquartered in the USA and uses cloud infrastructure (AWS) that may
                        process or store data in various global locations.
                      </p>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        12.1 Global Infrastructure
                      </h3>
                      <p className={`mt-2 ${legalPara}`}>
                        To provide high availability, we may store and process data in the USA or other countries
                        where our infrastructure operates, which may involve cross-border transfers.
                      </p>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        12.2 Data Protection Safeguards
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>
                          For international transfers, particularly from EEA/UK, we implement:
                          <ul className={`list-disc pl-6 mt-2 space-y-2 ${legalPara}`}>
                            <li>Standard Contractual Clauses (SCCs) approved by regulators</li>
                            <li>Data Processing Agreements with vendors</li>
                            <li>Security controls per industry best practices</li>
                          </ul>
                        </li>
                      </ul>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        12.3 EU-US Data Privacy Framework
                      </h3>
                      <p className={`mt-2 ${legalPara}`}>
                        Senseminder LLC complies with the EU-US Data Privacy Framework (DPF), UK Extension to EU-US
                        DPF, and Swiss-US DPF as set forth by the U.S. Department of Commerce.
                      </p>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        12.4 User Acknowledgement
                      </h3>
                      <p className={`mt-2 ${legalPara}`}>
                        By using our services, you acknowledge and agree to processing and transfer of your data
                        outside your jurisdiction as necessary to deliver the Senseminder platform.
                      </p>

                      <p className={`mt-4 ${legalPara}`}>
                        Questions about international transfers? Contact{" "}
                        <a
                          href="mailto:contact@sensepc.com"
                          className="underline underline-offset-2"
                        >
                          contact@sensepc.com
                        </a>
                      </p>
                    </div>
                  </div>
                )}

                {/* Notice to European Users (GDPR/UK) */}
                {activeSection === "notice-european-users" && (
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl text-black dark:text-white">
                        14. Notice to European Users (GDPR/UK)
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-4 p-8">
                      <p className={legalPara}>
                        If you are in the European Economic Area (EEA) or United Kingdom (UK), the following outlines
                        your data rights under GDPR and UK GDPR.
                      </p>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        14.1 Data Controller
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>Senseminder LLC</li>
                        <li>Registered in: Georgia, USA</li>
                        <li>
                          Email:{" "}
                          <a
                            href="mailto:contact@sensepc.com"
                            className="underline underline-offset-2"
                          >
                            contact@sensepc.com
                          </a>
                        </li>
                      </ul>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        14.2 Legal Bases for Processing
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>
                          <span className="font-medium">Contractual necessity</span> – to provide services and fulfill agreements
                        </li>
                        <li>
                          <span className="font-medium">Legitimate interests</span> – to improve services, ensure security, prevent fraud
                        </li>
                        <li>
                          <span className="font-medium">Consent</span> – for marketing, cookies, optional features
                        </li>
                        <li>
                          <span className="font-medium">Legal obligation</span> – to comply with laws and legal requests
                        </li>
                      </ul>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        14.3 Your GDPR Rights
                      </h3>
                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>
                          <span className="font-medium">Access</span> – Obtain confirmation and a copy of your data
                        </li>
                        <li>
                          <span className="font-medium">Rectification</span> – Correct inaccuracies or incomplete data
                        </li>
                        <li>
                          <span className="font-medium">Erasure</span> – Request deletion (right to be forgotten)
                        </li>
                        <li>
                          <span className="font-medium">Restriction</span> – Ask us to restrict processing in specific scenarios
                        </li>
                        <li>
                          <span className="font-medium">Portability</span> – Receive data in machine-readable format
                        </li>
                        <li>
                          <span className="font-medium">Objection</span> – Object to processing based on legitimate interest or for direct marketing
                        </li>
                        <li>
                          <span className="font-medium">Withdraw Consent</span> – Withdraw consent at any time where processing is based on consent
                        </li>
                      </ul>

                      <p className={`mt-4 ${legalPara}`}>
                        To exercise GDPR rights, contact{" "}
                        <a
                          href="mailto:contact@sensepc.com"
                          className="underline underline-offset-2"
                        >
                          contact@sensepc.com
                        </a>{" "}
                        (response within 30 days).
                      </p>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        14.4 Complaints
                      </h3>
                      <p className={`mt-2 ${legalPara}`}>
                        If you believe we have not handled your data appropriately, you have the right to lodge a
                        complaint with your local supervisory authority.
                      </p>

                      <p className={`mt-3 ${legalPara}`}>
                        Find contact details at:{" "}
                        <a
                          href="https://edpb.europa.eu/about-edpb/board/members_en"
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-2"
                        >
                          https://edpb.europa.eu/about-edpb/board/members_en
                        </a>
                      </p>
                    </div>
                  </div>
                )}

                {/* Changes to This Privacy Policy */}
                {activeSection === "privacy-policy-changes" && (
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl text-black dark:text-white">
                        15. Changes to This Privacy Policy
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-4 p-8">
                      <p className={legalPara}>
                        We may update this Privacy Policy to reflect changes in practices, technology, legal requirements,
                        or other factors.
                      </p>

                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>
                          When we make changes:
                          <ul className={`list-disc pl-6 mt-2 space-y-2 ${legalPara}`}>
                            <li>Update the “Last Updated” date at the top of this document</li>
                            <li>Notify you via email or a platform notice for material changes</li>
                            <li>Provide at least 30 days’ notice before material changes take effect</li>
                          </ul>
                        </li>
                      </ul>

                      <p className={legalPara}>
                        Your continued use after changes become effective constitutes acceptance of the updated Privacy Policy.
                        If you disagree, you may close your account.
                      </p>

                      <p className={legalPara}>
                        We encourage periodic review of this Privacy Policy to stay informed about data protection.
                      </p>
                    </div>
                  </div>
                )}

                {/* Contact Us */}
                {activeSection === "contact-us" && (
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl text-black dark:text-white">
                        16. Contact Us
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-4 p-8">
                      <p className={legalPara}>
                        If you have questions, concerns, or requests regarding this Privacy Policy or our data practices,
                        please contact us:
                      </p>

                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>
                          <span className="font-medium">Senseminder LLC</span>
                        </li>
                        <li>
                          <span className="font-medium">General Privacy:</span>{" "}
                          <a
                            href="mailto:contact@sensepc.com"
                            className="underline underline-offset-2"
                          >
                            contact@sensepc.com
                          </a>
                        </li>
                        <li>
                          <span className="font-medium">Security Issues:</span>{" "}
                          <a
                            href="mailto:contact@sensepc.com"
                            className="underline underline-offset-2"
                          >
                            contact@sensepc.com
                          </a>
                        </li>
                        <li>
                          <span className="font-medium">Legal Inquiries:</span>{" "}
                          <a
                            href="mailto:contact@sensepc.com"
                            className="underline underline-offset-2"
                          >
                            contact@sensepc.com
                          </a>
                        </li>
                        <li>
                          <span className="font-medium">Mailing Address:</span> Senseminder LLC, Attn: Privacy Officer,{" "}
                          1372 Peachtree, Atlanta, GA 30309, USA
                        </li>
                      </ul>

                      <h3 className="mt-6 text-xl font-medium text-black dark:text-white">
                        Additional Notes
                      </h3>

                      <ul className={`list-disc pl-6 space-y-2 ${legalPara}`}>
                        <li>
                          <span className="font-medium">For USA residents:</span> Exercise your state privacy law rights using
                          the contact information above with{" "}
                          <span className="font-medium">“USA Privacy Rights Request”</span> in the subject line.
                        </li>
                        <li>
                          <span className="font-medium">For European residents:</span> Contact your local Data Protection
                          Authority if you have concerns about our data handling practices.
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Privacy;
