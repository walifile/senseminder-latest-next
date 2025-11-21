"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useGetLegalDocumentsQuery } from "@/api/legalDocumentsAPI";

const Privacy = () => {
  const { isLoading } = useGetLegalDocumentsQuery();

  const [activeSection, setActiveSection] = useState<string>("how-we-handle-your-data");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  const lastUpdated = "July 22, 2025";

  return (
    <main className="flex-grow pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        {/* Breadcrumb */}
        <div className="my-8 flex items-center space-x-2 text-sm">
          <Link
            href="/"
            className="text-primary hover:text-primary/80"
          >
            Home
          </Link>
          <span>-</span>
          <span>Privacy Policy</span>
        </div>

        <div className="flex gap-5">
          <div className="w-1/3">
            <div className="glass-card gradient-outline-border !rounded-3xl !border-0">
              <div className="space-y-2 p-8">
                <p className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                  Privacy Policy
                </p>
                <p className="text-paragraph text-sm">
                  Last Updated: {lastUpdated}
                </p>
              </div>
              <hr />
              <div className="space-y-3 py-6 flex flex-col">
                <a href="#how-we-handle-your-data"
                  className={`text-primary hover:text-primary/80 dark:text-white dark:hover:text-white mx-6 p-4 rounded-lg border hover:bg-gradient-to-r hover:from-[#3A29E7] hover:to-[#A601BA] sidebar-navlink ${activeSection === "how-we-handle-your-data" ? "!border-0 bg-gradient-to-r from-[#3A29E7] to-[#A601BA] active" : ""}`}
                  onClick={() => setActiveSection("how-we-handle-your-data")}
                >
                  How We Handle Your Data
                </a>
                <a href="#personal-information"
                  className={`text-primary hover:text-primary/80 dark:text-white dark:hover:text-white mx-6 p-4 rounded-lg border hover:bg-gradient-to-r hover:from-[#3A29E7] hover:to-[#A601BA] sidebar-navlink ${activeSection === "personal-information" ? "!border-0 bg-gradient-to-r from-[#3A29E7] to-[#A601BA] active" : ""}`}
                  onClick={() => setActiveSection("personal-information")}
                >
                  Personal Information We Collect
                </a>
                <a href="#how-we-use-your-information"
                  className={`text-primary hover:text-primary/80 dark:text-white dark:hover:text-white mx-6 p-4 rounded-lg border hover:bg-gradient-to-r hover:from-[#3A29E7] hover:to-[#A601BA] sidebar-navlink ${activeSection === "how-we-use-your-information" ? "!border-0 bg-gradient-to-r from-[#3A29E7] to-[#A601BA] active" : ""}`}
                  onClick={() => setActiveSection("how-we-use-your-information")}
                >
                  How We Use Your Information
                </a>
                <a href="#how-we-share-your-information"
                  className={`text-primary hover:text-primary/80 dark:text-white dark:hover:text-white mx-6 p-4 rounded-lg border hover:bg-gradient-to-r hover:from-[#3A29E7] hover:to-[#A601BA] sidebar-navlink ${activeSection === "how-we-share-your-information" ? "!border-0 bg-gradient-to-r from-[#3A29E7] to-[#A601BA] active" : ""}`}
                  onClick={() => setActiveSection("how-we-share-your-information")}
                >
                  How We Share Your Information
                </a>
                <a href="#your-rights-choices"
                  className={`text-primary hover:text-primary/80 dark:text-white dark:hover:text-white mx-6 p-4 rounded-lg border hover:bg-gradient-to-r hover:from-[#3A29E7] hover:to-[#A601BA] sidebar-navlink ${activeSection === "your-rights-choices" ? "!border-0 bg-gradient-to-r from-[#3A29E7] to-[#A601BA] active" : ""}`}
                  onClick={() => setActiveSection("your-rights-choices")}
                >
                  Your Rights & Choices
                </a>
                <a href="#data-security"
                  className={`text-primary hover:text-primary/80 dark:text-white dark:hover:text-white mx-6 p-4 rounded-lg border hover:bg-gradient-to-r hover:from-[#3A29E7] hover:to-[#A601BA] sidebar-navlink ${activeSection === "data-security" ? "!border-0 bg-gradient-to-r from-[#3A29E7] to-[#A601BA] active" : ""}`}
                  onClick={() => setActiveSection("data-security")}
                >
                  Data Security
                </a>
                <a href="#cookies-tracking"
                  className={`text-primary hover:text-primary/80 dark:text-white dark:hover:text-white mx-6 p-4 rounded-lg border hover:bg-gradient-to-r hover:from-[#3A29E7] hover:to-[#A601BA] sidebar-navlink ${activeSection === "cookies-tracking" ? "!border-0 bg-gradient-to-r from-[#3A29E7] to-[#A601BA] active" : ""}`}
                  onClick={() => setActiveSection("cookies-tracking")}
                >
                  Cookies & Tracking Technologies
                </a>
                <a href="#do-not-track"
                  className={`text-primary hover:text-primary/80 dark:text-white dark:hover:text-white mx-6 p-4 rounded-lg border hover:bg-gradient-to-r hover:from-[#3A29E7] hover:to-[#A601BA] sidebar-navlink ${activeSection === "do-not-track" ? "!border-0 bg-gradient-to-r from-[#3A29E7] to-[#A601BA] active" : ""}`}
                  onClick={() => setActiveSection("do-not-track")}
                >
                  Do Not Track (DNT) Signals
                </a>
                <a href="#childrens-privacy"
                  className={`text-primary hover:text-primary/80 dark:text-white dark:hover:text-white mx-6 p-4 rounded-lg border hover:bg-gradient-to-r hover:from-[#3A29E7] hover:to-[#A601BA] sidebar-navlink ${activeSection === "childrens-privacy" ? "!border-0 bg-gradient-to-r from-[#3A29E7] to-[#A601BA] active" : ""}`}
                  onClick={() => setActiveSection("childrens-privacy")}
                >
                  Children's Privacy
                </a>
                <a href="#international-transfers"
                  className={`text-primary hover:text-primary/80 dark:text-white dark:hover:text-white mx-6 p-4 rounded-lg border hover:bg-gradient-to-r hover:from-[#3A29E7] hover:to-[#A601BA] sidebar-navlink ${activeSection === "international-transfers" ? "!border-0 bg-gradient-to-r from-[#3A29E7] to-[#A601BA] active" : ""}`}
                  onClick={() => setActiveSection("international-transfers")}
                >
                  International Transfers
                </a>
                <a href="#notice-european-users"
                  className={`text-primary hover:text-primary/80 dark:text-white dark:hover:text-white mx-6 p-4 rounded-lg border hover:bg-gradient-to-r hover:from-[#3A29E7] hover:to-[#A601BA] sidebar-navlink ${activeSection === "notice-european-users" ? "!border-0 bg-gradient-to-r from-[#3A29E7] to-[#A601BA] active" : ""}`}
                  onClick={() => setActiveSection("notice-european-users")}
                >
                  Notice to European Users (GDPR/UK)
                </a>
              </div>
            </div>
          </div>

          <div className="w-2/3">
            <div className="glass-card gradient-outline-border !rounded-3xl !border-0 space-y-6">
              {/* How We Handle Your Data */}
              {activeSection === "how-we-handle-your-data" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold text-black dark:text-white">
                      How We Handle Your Data
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-black dark:text-gray-300">
                      Welcome to Senseminder. This Privacy Policy explains how
                      Senseminder LLC (“Senseminder”, “we”, “our”, or “us”) collects,
                      uses, shares, and protects your personal information when you
                      interact with our services. These services include:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>SmartPC (virtual desktop computing),</li>
                      <li>SmartStorage (cloud-based personal file storage),</li>
                      <li>
                        Our website, platform dashboard, desktop applications, and
                        other related tools or communications (collectively, the
                        “Services”).
                      </li>
                    </ul>
                    <p className="text-black dark:text-gray-300">
                      Senseminder LLC is a U.S.-based company registered in the State
                      of Georgia, and all data handling practices comply with
                      applicable federal and state privacy laws. Where applicable, we
                      also adhere to international regulations such as the EU General
                      Data Protection Regulation (GDPR) and UK data protection laws.
                    </p>
                    <p className="text-black dark:text-gray-300">
                      This policy outlines:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>What personal data we collect</li>
                      <li>Why and how we use it</li>
                      <li>With whom we share it</li>
                      <li>Your privacy rights and choices</li>
                      <li>How we safeguard your data</li>
                    </ul>
                    <p className="text-black dark:text-gray-300">
                      By using our Services, creating an account, or communicating
                      with us, you agree to the collection and use of your information
                      as described in this Privacy Policy.
                    </p>
                    <p className="text-black dark:text-gray-300">
                      If you do not agree with this policy, please refrain from using
                      our Services.
                    </p>
                  </div>
                </div>
              )}

              {/* Personal Information We Collect */}
              {activeSection === "personal-information" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold text-black dark:text-white">
                      Personal Information We Collect
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-black dark:text-gray-300">
                      We collect and process various categories of personal
                      information in order to deliver and improve our SmartPC and
                      SmartStorage services. This information may be collected:
                    </p>

                    {/* 1. Information You Provide Directly */}
                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      1. Information You Provide Directly
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      This includes any personal data you voluntarily submit to us,
                      such as when you:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Create or manage a Senseminder account</li>
                      <li>Purchase or activate a subscription</li>
                      <li>Submit a support request or communicate with our team</li>
                      <li>
                        Fill out forms, surveys, or other fields on our website or
                        platform
                      </li>
                    </ul>
                    <p className="text-black dark:text-gray-300">
                      Examples of data collected:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Full name</li>
                      <li>Email address</li>
                      <li>Phone number</li>
                      <li>Payment and billing information</li>
                      <li>Organization name (if applicable)</li>
                      <li>Profile image (if uploaded)</li>
                    </ul>

                    {/* 2. Information Collected Automatically */}
                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      2. Information Collected Automatically
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      When you use our services, we may collect certain information
                      automatically through cookies, device analytics, and server
                      logs. This includes:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>IP address and geolocation</li>
                      <li>Device type, operating system, browser type</li>
                      <li>
                        Activity logs (e.g., login timestamps, resource usage)
                      </li>
                      <li>Clickstream data (navigation paths, session duration)</li>
                      <li>
                        Connection status and SmartPC/SmartStorage interactions
                      </li>
                    </ul>
                    <p className="text-black dark:text-gray-300">
                      We use this information to operate the service, detect
                      anomalies, and improve user experience.
                    </p>

                    {/* 3. Information from Third Parties */}
                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      3. Information from Third Parties
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      We may receive personal information about you from third-party
                      sources, including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Authentication providers (e.g., Google, Microsoft, Discord)
                      </li>
                      <li>Payment processors (e.g., Stripe)</li>
                      <li>Referral programs or marketing affiliates</li>
                      <li>
                        Public records or social profiles (when legally permitted)
                      </li>
                    </ul>
                    <p className="text-black dark:text-gray-300">
                      This information is combined with the data you provide to
                      enhance identity verification, support, and account
                      management.
                    </p>

                    {/* 4. Information on Usage & Preferences */}
                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      4. Information on Usage & Preferences
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      To better serve our users, we may collect metadata related to
                      how you use our SmartPC and SmartStorage services, including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        System configurations (e.g., selected CPU, RAM, storage)
                      </li>
                      <li>SmartPC runtime history (e.g., uptime, idle periods)</li>
                      <li>File upload/download behavior</li>
                      <li>Support history and in-app behavior</li>
                    </ul>
                    <p className="text-black dark:text-gray-300">
                      All such data is subject to this Privacy Policy and is used in
                      accordance with your consent or legitimate interests under
                      applicable law.
                    </p>
                  </div>
                </div>
              )}

              {/* How We Use Your Information */}
              {activeSection === "how-we-use-your-information" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold text-black dark:text-white">
                      How We Use Your Information
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-black dark:text-gray-300">
                      Senseminder collects and uses your personal information for a
                      variety of business, legal, and operational purposes, all
                      aligned with our mission to provide secure and reliable
                      SmartPC and SmartStorage services. Specifically, we use the
                      information collected:
                    </p>

                    {/* 1. To Provide and Maintain Our Services */}
                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      1. To Provide and Maintain Our Services
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      We use your information to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Authenticate users and manage access permissions</li>
                      <li>
                        Deliver SmartPC remote desktop access and storage
                        functionality
                      </li>
                      <li>Create, manage, and bill subscription plans</li>
                      <li>
                        Enable resource provisioning (e.g., CPU, RAM, storage, OS)
                      </li>
                      <li>Monitor performance, uptime, and service usage</li>
                      <li>Provide technical support and respond to inquiries</li>
                      <li>
                        Send system alerts, status updates, and billing notices
                      </li>
                    </ul>

                    {/* 2. To Improve and Personalize User Experience */}
                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      2. To Improve and Personalize User Experience
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      We analyze usage patterns and platform interactions to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Enhance the stability and security of our systems</li>
                      <li>Identify technical issues and optimize performance</li>
                      <li>Tailor settings, recommendations, or system behaviors</li>
                      <li>
                        Conduct service quality checks and user satisfaction
                        analysis
                      </li>
                    </ul>

                    {/* 3. For Communications and Marketing */}
                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      3. For Communications and Marketing (With Your Consent)
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      If you opt in, we may use your information to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Send product updates, feature announcements, and newsletters
                      </li>
                      <li>Deliver targeted promotions, offers, or usage tips</li>
                      <li>
                        Invite you to provide feedback or participate in surveys
                      </li>
                    </ul>
                    <p className="text-black dark:text-gray-300">
                      You can opt out of marketing communications at any time by
                      following the unsubscribe link in emails or adjusting your
                      notification settings.
                    </p>

                    {/* 4. For Legal, Security, and Compliance Purposes */}
                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      4. For Legal, Security, and Compliance Purposes
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      We may process your personal information to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Enforce our Terms of Service and other policies</li>
                      <li>
                        Detect and prevent fraud, abuse, or unauthorized access
                      </li>
                      <li>Maintain audit trails and investigate violations</li>
                      <li>
                        Respond to valid law enforcement requests or legal
                        obligations
                      </li>
                    </ul>

                    {/* 5. To Support Research and Development */}
                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      5. To Support Research and Development
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      De-identified and aggregated data may be used to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Analyze usage trends and infrastructure demand</li>
                      <li>Develop new features, products, or services</li>
                      <li>
                        Improve AI models used for performance recommendations or
                        chat assistance (never using identifiable data without
                        consent)
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* How We Share Your Information */}
              {activeSection === "how-we-share-your-information" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold text-black dark:text-white">
                      How We Share Your Information
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-black dark:text-gray-300">
                      Senseminder does not sell your personal information. We only
                      share your information in specific cases that are necessary
                      to deliver services, comply with legal obligations, or
                      protect our platform and users. We carefully select trusted
                      partners and limit sharing to what’s required for each
                      purpose.
                    </p>

                    {/* 1. With Service Providers and Contractors */}
                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      1. With Service Providers and Contractors
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      We share personal information with third-party vendors who
                      help us operate Senseminder services. These include:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Cloud infrastructure providers (e.g., AWS – for EC2 and
                        S3)
                      </li>
                      <li>
                        Payment processors (e.g., Stripe – for billing, wallets)
                      </li>
                      <li>
                        Customer support systems (e.g., helpdesk and messaging
                        tools)
                      </li>
                      <li>
                        Security and analytics providers (e.g., logging,
                        monitoring, DDoS protection)
                      </li>
                    </ul>
                    <p className="text-black dark:text-gray-300">
                      These providers are contractually bound to only use your
                      data to deliver the contracted services, and not for their
                      own purposes.
                    </p>

                    {/* 2. With Business Partners */}
                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      2. With Business Partners (If Applicable)
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      We may share limited information with:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Joint service providers (e.g., educational or enterprise
                        integrations)
                      </li>
                      <li>
                        Partners assisting with onboarding, support, or referral
                        programs
                      </li>
                    </ul>
                    <p className="text-black dark:text-gray-300">
                      Sharing with partners is governed by contractual agreements
                      and always aligned with your usage or consent.
                    </p>

                    {/* 3. For Legal Compliance and Protection */}
                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      3. For Legal Compliance and Protection
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      We may disclose information if required to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Comply with applicable laws, subpoenas, court orders, or
                        government requests
                      </li>
                      <li>
                        Investigate and prevent fraud, abuse, or violations of our
                        Terms of Service
                      </li>
                      <li>
                        Protect the rights, safety, or property of Senseminder,
                        our users, or others
                      </li>
                    </ul>
                    <p className="text-black dark:text-gray-300">
                      We will notify you of such disclosures when legally
                      permitted.
                    </p>

                    {/* 4. Business Transfers */}
                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      4. Business Transfers
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      In the event of a merger, acquisition, restructuring, or
                      sale of assets, user information may be part of the
                      transferred assets. We will ensure the receiving party
                      adheres to privacy commitments no less protective than this
                      policy, and notify you where legally required.
                    </p>

                    {/* 5. With Your Consent */}
                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      5. With Your Consent
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      In specific cases, we may ask for your consent to share your
                      information outside of the scenarios above — for example, to
                      connect with a third-party app or service you authorize. You
                      will always have the option to review and revoke such
                      permissions.
                    </p>
                  </div>
                </div>
              )}

              {/* Your Rights & Choices */}
              {activeSection === "your-rights-choices" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold text-black dark:text-white">
                      Your Rights & Choices
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-black dark:text-gray-300">
                      At Senseminder, we are committed to providing transparency
                      and control over your personal information. Depending on
                      your region and applicable law (such as the General Data
                      Protection Regulation (GDPR), the UK GDPR, or U.S. state
                      laws), you may have the following rights:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        <strong>Right to Access</strong> – You may request a copy
                        of the personal data we hold about you, including
                        information about how it is used and shared.
                      </li>
                      <li>
                        <strong>Right to Rectification</strong> – You have the
                        right to request correction of any inaccurate or
                        incomplete personal data we hold about you.
                      </li>
                      <li>
                        <strong>Right to Deletion (Right to Be Forgotten)</strong>{" "}
                        – You may request that we delete your personal
                        information, subject to certain exceptions (e.g., legal
                        retention requirements, active billing obligations).
                      </li>
                      <li>
                        <strong>Right to Restrict or Object to Processing</strong>{" "}
                        – You can ask us to pause or restrict our use of your
                        personal data, or object to specific types of processing,
                        such as direct marketing.
                      </li>
                      <li>
                        <strong>Right to Data Portability</strong> – You may
                        request to receive your personal data in a structured,
                        machine-readable format or have it transmitted directly to
                        another service provider where technically feasible.
                      </li>
                      <li>
                        <strong>Right to Withdraw Consent</strong> – Where we rely
                        on your consent to process data (e.g., marketing), you can
                        withdraw that consent at any time.
                      </li>
                      <li>
                        <strong>Right to Lodge a Complaint</strong> – You have the
                        right to lodge a complaint with a supervisory data
                        protection authority in your region (such as the Georgia
                        Attorney General or, for EU/UK users, your local Data
                        Protection Authority).
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* How to Exercise Your Rights */}
              {activeSection === "your-rights-choices" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      How to Exercise Your Rights
                    </h3>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-black dark:text-gray-300">
                      To submit a privacy-related request or inquiry:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Email us at{" "}
                        <a
                          href="mailto:privacy@senseminder.com"
                          className="underline"
                        >
                          privacy@senseminder.com
                        </a>
                      </li>
                      <li>
                        Provide sufficient information to verify your identity
                        (e.g., registered email and account identifier)
                      </li>
                      <li>Specify which right you wish to exercise</li>
                    </ul>
                    <p className="text-black dark:text-gray-300">
                      We will respond within the timeframe required by law,
                      typically within 30 days. In rare cases, an extension may be
                      required due to request complexity.
                    </p>
                  </div>

                  {/* Marketing & Communication Preferences */}
                  <div className="space-y-4 p-8">
                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      Marketing & Communication Preferences
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      You can opt out of promotional emails at any time by
                      clicking the "unsubscribe" link included in our emails.
                    </p>
                    <p className="text-black dark:text-gray-300">
                      Even after opting out, you may still receive essential
                      service notifications (e.g., security alerts, billing
                      notices, account updates).
                    </p>
                  </div>
                </div>
              )}

              {/* Data Security */}
              {activeSection === "data-security" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold text-black dark:text-white">
                      Data Security
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-black dark:text-gray-300">
                      At Senseminder, safeguarding your personal information is a
                      top priority. We implement industry-standard technical,
                      administrative, and physical security measures designed to
                      protect your data from unauthorized access, misuse,
                      disclosure, alteration, or destruction.
                    </p>

                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      1. Security Measures Include:
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        <strong>Encryption:</strong> All data transmitted between
                        users and our services is encrypted using HTTPS (TLS).
                        Sensitive data stored at rest may also be encrypted using
                        AWS KMS.
                      </li>
                      <li>
                        <strong>Access Controls:</strong> We employ strict
                        role-based access controls (RBAC) to ensure only
                        authorized personnel can access your personal information.
                      </li>
                      <li>
                        <strong>Secure Infrastructure:</strong> Senseminder
                        services are hosted on Amazon Web Services (AWS),
                        leveraging AWS security best practices for network
                        isolation, firewalls, and continuous monitoring.
                      </li>
                      <li>
                        <strong>Audit Logging & Monitoring:</strong> We monitor
                        our systems and use automated alerts to detect and respond
                        to suspicious activity.
                      </li>
                      <li>
                        <strong>Regular Assessments:</strong> Security procedures
                        and systems are regularly reviewed and tested, including
                        penetration tests and compliance audits.
                      </li>
                    </ul>
                  </div>

                  {/* Your Role in Security */}
                  <div className="space-y-4 p-8">
                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      2. Your Role in Security
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      While we do our part to protect your data, you also share
                      responsibility for securing your account. We recommend:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Using strong, unique passwords</li>
                      <li>Enabling multi-factor authentication (MFA)</li>
                      <li>Keeping your login credentials confidential</li>
                      <li>Logging out of shared or public devices</li>
                    </ul>
                    <p className="text-black dark:text-gray-300">
                      If you suspect unauthorized access or believe your account
                      has been compromised, contact us immediately at{" "}
                      <a
                        href="mailto:security@senseminder.com"
                        className="underline text-blue-600 dark:text-blue-400"
                      >
                        security@senseminder.com
                      </a>
                      .
                    </p>
                  </div>

                  {/* Limitation of Liability */}
                  <div className="space-y-4 p-8">
                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      3. Limitation of Liability
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      Although we take reasonable steps to secure your
                      information, no system is completely immune to breaches. We
                      do not accept liability for unauthorized access, loss, or
                      corruption of data beyond our reasonable control,
                      particularly if caused by user negligence or third-party
                      misuse.
                    </p>
                  </div>
                </div>
              )}
              {/* Cookies & Tracking Technologies */}
              {activeSection === "cookies-tracking" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold text-black dark:text-white">
                      Cookies & Tracking Technologies
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-black dark:text-gray-300">
                      Senseminder does <strong>not use cookies</strong> or similar
                      tracking technologies for behavioral advertising or
                      analytics. We are committed to delivering a privacy-focused
                      experience and do not deploy browser cookies on our core
                      platform or website.
                    </p>

                    <p className="text-black dark:text-gray-300">
                      While we may use limited forms of local device storage
                      (e.g., session memory for UI preferences), no persistent
                      identifiers or cross-site tracking mechanisms are utilized.
                    </p>

                    <p className="text-black dark:text-gray-300">
                      If third-party services are integrated in the future (e.g.,
                      analytics or embedded tools), we will update this policy and
                      allow users to opt in through a visible consent banner.
                    </p>

                    <p className="text-black dark:text-gray-300">
                      For questions about privacy practices, contact us at{" "}
                      <a
                        href="mailto:privacy@senseminder.com"
                        className="underline text-blue-600 dark:text-blue-400"
                      >
                        privacy@senseminder.com
                      </a>
                      .
                    </p>
                  </div>
                </div>
              )}

              {/* Do Not Track (DNT) Signals */}
              {activeSection === "do-not-track" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold text-black dark:text-white">
                      Do Not Track (DNT) Signals
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-black dark:text-gray-300">
                      Some web browsers offer a "Do Not Track" (DNT) setting,
                      which signals to websites and online services that you do
                      not wish to be tracked across different websites over time.
                    </p>

                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      1. Our Current Response
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      At this time, Senseminder does not respond to DNT signals
                      sent by browsers. This is because there is currently no
                      uniform industry standard for how to interpret or act on DNT
                      signals.
                    </p>

                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      2. Alternatives for Managing Tracking
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      While we do not respond to DNT signals, you may still manage
                      or limit tracking in the following ways:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Adjust cookie preferences using our in-platform Cookie
                        Settings.
                      </li>
                      <li>
                        Configure browser-level cookie and tracker settings to
                        block third-party cookies or clear stored data.
                      </li>
                      <li>
                        Opt out of targeted advertising through industry-supported
                        tools like:
                      </li>
                      <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                        <li>Network Advertising Initiative</li>
                        <li>Digital Advertising Alliance</li>
                      </ul>
                    </ul>
                    <p className="text-black dark:text-gray-300">
                      We remain committed to respecting your privacy and will
                      continue to evaluate evolving standards for user tracking
                      preferences.
                    </p>
                  </div>
                </div>
              )}
              {/* Children’s Privacy */}
              {activeSection === "childrens-privacy" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold text-black dark:text-white">
                      Children’s Privacy
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-black dark:text-gray-300">
                      Senseminder does not knowingly collect or solicit personal
                      information from individuals under the age of 16. Our
                      services, including SmartPC and SmartStorage, are intended
                      for use only by individuals who are 16 years of age or
                      older, or by those who have obtained the consent of a legal
                      guardian.
                    </p>

                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      1. No Use by Minors
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      If you are under 16, or under the age of majority in your
                      jurisdiction without proper guardian consent, please do not
                      register for a Senseminder account, use our services, or
                      submit any personal information.
                    </p>

                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      2. Account Closure for Minors
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      If we become aware that we have collected personal data from
                      a minor without verifiable parental or guardian consent, we
                      will promptly delete the information and take steps to
                      deactivate the associated account.
                    </p>

                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      3. Parental Inquiries
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      If you believe that your child may have submitted personal
                      data to Senseminder without your consent, you may contact us
                      at:
                    </p>
                    <ul className="pl-6 text-black dark:text-gray-300 space-y-1">
                      <li>
                        📧{" "}
                        <a
                          href="mailto:privacy@senseminder.com"
                          className="underline text-blue-600 dark:text-blue-400"
                        >
                          privacy@senseminder.com
                        </a>
                      </li>
                      <li>📬 Senseminder LLC, Atlanta, Georgia, USA</li>
                    </ul>
                    <p className="text-black dark:text-gray-300">
                      We will investigate and take appropriate actions in
                      accordance with applicable laws.
                    </p>
                  </div>
                </div>
              )}
              {/* International Transfers */}
              {activeSection === "international-transfers" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold text-black dark:text-white">
                      International Transfers
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-black dark:text-gray-300">
                      Senseminder LLC is headquartered in the United States and
                      operates its services through cloud infrastructure
                      providers, including Amazon Web Services (AWS), which may
                      process or store your personal information in various
                      geographic locations.
                    </p>

                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      1. Global Infrastructure
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      To provide our SmartPC and SmartStorage services with high
                      availability and performance, we may store and process your
                      data in the United States or other countries where our cloud
                      infrastructure or partners operate. This may involve
                      transferring your information across national borders,
                      including outside of your country or region of residence.
                    </p>

                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      2. Data Protection Safeguards
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      When transferring data internationally, particularly from
                      regions like the European Economic Area (EEA), the United
                      Kingdom (UK), or other jurisdictions with data export
                      restrictions, we implement appropriate legal safeguards,
                      including but not limited to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Standard Contractual Clauses (SCCs) approved by relevant
                        regulators
                      </li>
                      <li>Data Processing Agreements with third-party vendors</li>
                      <li>
                        Security controls in accordance with industry best
                        practices
                      </li>
                    </ul>
                    <p className="text-black dark:text-gray-300">
                      These measures are in place to ensure your personal data
                      continues to be protected under equivalent legal standards.
                    </p>

                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      3. User Acknowledgement
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      By using our services, you acknowledge and agree to the
                      processing and transfer of your data outside of your
                      jurisdiction, as necessary to deliver the Senseminder
                      platform and fulfill our contractual obligations to you.
                    </p>
                    <p className="text-black dark:text-gray-300">
                      If you have any concerns or questions about international
                      data transfers, please contact:
                    </p>
                    <p className="text-black dark:text-gray-300">
                      📧{" "}
                      <a
                        href="mailto:privacy@senseminder.com"
                        className="underline text-blue-600 dark:text-blue-400"
                      >
                        privacy@senseminder.com
                      </a>
                    </p>
                  </div>
                </div>
              )}
              {/* Notice to European Users (GDPR/UK) */}
              {activeSection === "notice-european-users" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold text-black dark:text-white">
                      Notice to European Users (GDPR/UK)
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-black dark:text-gray-300">
                      If you are located in the European Economic Area (EEA) or
                      the United Kingdom (UK), the following section outlines your
                      data rights and the lawful basis under which we process your
                      personal information in accordance with the General Data
                      Protection Regulation (GDPR) and the UK GDPR.
                    </p>

                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      1. Data Controller
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      The data controller responsible for processing your personal
                      information under this Privacy Policy is:
                    </p>
                    <ul className="pl-6 text-black dark:text-gray-300 space-y-1">
                      <li>Senseminder LLC</li>
                      <li>Registered in the State of Georgia, USA</li>
                      <li>
                        📧 Email:{" "}
                        <a
                          href="mailto:privacy@senseminder.com"
                          className="underline text-blue-600 dark:text-blue-400"
                        >
                          privacy@senseminder.com
                        </a>
                      </li>
                    </ul>

                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      2. Legal Bases for Processing
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        <strong>Contractual necessity</strong> – to provide and
                        operate our services and fulfill agreements with you
                        (e.g., SmartPC subscriptions, user account access).
                      </li>
                      <li>
                        <strong>Legitimate interests</strong> – to improve our
                        services, ensure platform security, prevent fraud, and
                        perform analytics, provided these interests are not
                        overridden by your fundamental rights.
                      </li>
                      <li>
                        <strong>Consent</strong> – for certain marketing
                        activities, use of cookies, or optional features where
                        consent is required.
                      </li>
                      <li>
                        <strong>Legal obligation</strong> – to comply with laws,
                        respond to legal requests, and maintain regulatory
                        compliance.
                      </li>
                    </ul>

                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      3. Your Data Rights
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        <strong>Access</strong> – Obtain confirmation and a copy
                        of your personal data held by us.
                      </li>
                      <li>
                        <strong>Rectification</strong> – Correct any inaccuracies
                        or incomplete data.
                      </li>
                      <li>
                        <strong>Erasure</strong> – Request deletion of your data
                        under certain conditions (the "right to be forgotten").
                      </li>
                      <li>
                        <strong>Restriction</strong> – Ask us to restrict the
                        processing of your data in specific scenarios.
                      </li>
                      <li>
                        <strong>Portability</strong> – Receive your personal data
                        in a structured, machine-readable format or have it
                        transferred to another controller.
                      </li>
                      <li>
                        <strong>Objection</strong> – Object to processing based on
                        legitimate interest or for direct marketing purposes.
                      </li>
                      <li>
                        <strong>Withdraw Consent</strong> – Withdraw your consent
                        at any time, where processing is based on consent.
                      </li>
                    </ul>
                    <p className="text-black dark:text-gray-300">
                      To exercise any of these rights, please contact us at:{" "}
                      <a
                        href="mailto:privacy@senseminder.com"
                        className="underline text-blue-600 dark:text-blue-400"
                      >
                        privacy@senseminder.com
                      </a>
                    </p>
                    <p className="text-black dark:text-gray-300">
                      We may request verification of your identity before
                      fulfilling your request. Responses will be provided within
                      one month unless an extension is legally permitted.
                    </p>

                    <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      4. Complaints
                    </h3>
                    <p className="text-black dark:text-gray-300">
                      If you believe we have not handled your personal data
                      appropriately, you have the right to lodge a complaint with
                      your local supervisory authority. You can find contact
                      details at:{" "}
                      <a
                        href="https://edpb.europa.eu/about-edpb/board/members_en"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-600 dark:text-blue-400"
                      >
                        https://edpb.europa.eu/about-edpb/board/members_en
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Privacy;
