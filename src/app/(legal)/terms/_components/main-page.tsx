import { MainLayout } from "@/app/home/_components/main-layout";

import TermsSidebar from "./terms-sidebar";
import { termsSections } from "../../data/sections";

const TermsMainPage = () => {
  const lastUpdated = "January 06, 2026";

  return (
    <MainLayout>
      <div className="flex-grow pt-20 md:pt-28 pb-16">
        <div className="container mx-auto px-4 md:px-6">
        {/* <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]}
        /> */}

        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-start">
          <div className="w-full min-w-0 md:col-span-4 self-start md:sticky md:top-24">
            <TermsSidebar sections={termsSections} lastUpdated={lastUpdated} />
          </div>

          <div className="w-full min-w-0 md:col-span-8">
            <div className="glass-card !shadow-none gradient-outline-border !rounded-3xl !border-0 space-y-6 overflow-x-hidden">
              <div className="w-full max-w-[820px] mx-auto leading-relaxed break-words">

                <section id="introduction" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        1. Introduction
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-4 p-8">
                      <p className="text-black dark:text-white">
                        These Terms of Service (&quot;Terms&quot;) govern your
                        use of the SensePC platform (&quot;SensePC&quot;) and
                        related services (collectively, the
                        &quot;Services&quot;), which are provided by Senseminder
                        LLC (&quot;Senseminder&quot;, &quot;we&quot;,
                        &quot;our&quot;). SensePC includes Sense PC (virtual
                        desktop) and Sense Cloud (cloud storage).
                      </p>

                      <p className="text-black dark:text-white">
                        <strong>
                          By creating an Account or using the Services, you
                          agree to these Terms.
                        </strong>{" "}
                        If you disagree, do not use the Services.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        1.1 Modifications to Terms
                      </h3>

                      <p className="text-black dark:text-white">
                        We may modify these Terms. Material changes require 30
                        days&apos; notice via email. Continued use after changes
                        constitutes acceptance.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="definitions" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        2. Definitions
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-4 p-8">
                      <p className="text-black dark:text-white">
                        For purposes of these Terms of Service, the following
                        definitions apply:
                      </p>

                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          <span className="font-semibold">
                            &quot;Services&quot;
                          </span>{" "}
                          — Sense PC, Sense Cloud, website, platform, and
                          related tools.
                        </li>
                        <li>
                          <span className="font-semibold">
                            &quot;User&quot;
                          </span>{" "}
                          or{" "}
                          <span className="font-semibold">&quot;You&quot;</span>{" "}
                          — The individual or entity using the Services.
                        </li>
                        <li>
                          <span className="font-semibold">
                            &quot;Account&quot;
                          </span>{" "}
                          — Your registered SensePC account.
                        </li>
                        <li>
                          <span className="font-semibold">
                            &quot;Content&quot;
                          </span>{" "}
                          — Data, files, or other information you upload,
                          submit, store, transmit, or create through the
                          Services.
                        </li>
                        <li>
                          <span className="font-semibold">
                            &quot;Subscription&quot;
                          </span>{" "}
                          — A paid access plan for the Services.
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="account-registration-security" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        3. Account Registration &amp; Security
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-6 p-8">
                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        3.1 Account Creation
                      </h3>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          Provide accurate, current, and complete information
                          when creating or updating your Account.
                        </li>
                        <li>
                          You must be at least 16 years old to use the Services,
                          or have the consent and supervision of a parent or
                          legal guardian.
                        </li>
                        <li>
                          One Account is permitted per person or legal entity,
                          unless we approve otherwise in writing.
                        </li>
                      </ul>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        3.2 Password Security
                      </h3>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          Maintain the confidentiality of your login credentials
                          and do not share them with any third party.
                        </li>
                        <li>
                          Enabling multi-factor authentication (MFA) is strongly
                          recommended to help protect your Account.
                        </li>
                        <li>
                          You are responsible for all activity that occurs under
                          your Account, including any actions taken by
                          authorized users or anyone who accesses your Account
                          using your credentials.
                        </li>
                      </ul>

                      <p className="text-black dark:text-white">
                        If you believe your Account has been compromised, you
                        must notify us promptly and take steps to secure your
                        Account, including changing your password and enabling
                        MFA where available.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="description-of-services" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        4. Description of Services
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-6 p-8">
                      <p className="text-black dark:text-white">
                        Senseminder LLC (&quot;Senseminder&quot;,
                        &quot;we&quot;, &quot;our&quot;) provides cloud-based
                        Services through the SensePC platform
                        (&quot;SensePC&quot;). The Services include Sense PC
                        (virtual desktop) and Sense Cloud (cloud storage), along
                        with our website, applications, dashboards, and related
                        tools.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        4.1 Sense PC (Virtual Desktop)
                      </h3>
                      <p className="text-black dark:text-white">
                        Sense PC provides remote access to a cloud-hosted
                        desktop environment that you can use from supported
                        internet-connected devices. Your Sense PC is provisioned
                        based on your selected configuration and Subscription,
                        and may include dedicated resources such as CPU, memory,
                        and storage.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        4.2 Sense PC Lifecycle Controls
                      </h3>
                      <p className="text-black dark:text-white">
                        Sense PC instances are managed through the SensePC
                        dashboard. Depending on availability and your
                        Subscription, you may be able to create, start, stop,
                        connect, resize, and delete a Sense PC.
                      </p>
                      <p className="text-black dark:text-white">
                        <span className="text-yellow-700 dark:text-yellow-400">
                          ⚠️ Storage downgrade (reducing allocated disk size) is
                          not supported.
                        </span>
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        4.3 Operating System Options
                      </h3>
                      <p className="text-black dark:text-white">
                        Your Sense PC may include access to a pre-configured
                        operating system installed during provisioning.
                        Supported options may include Microsoft Windows and
                        Linux (such as Ubuntu), depending on your configuration
                        and region.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        4.4 Storage Within Sense PC
                      </h3>
                      <p className="text-black dark:text-white">
                        Sense PC storage may include a primary disk used for
                        system files and user data, and may support additional
                        disks for expanded capacity depending on your plan or
                        configuration.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        4.5 Monitoring, Scheduling, Idle Timeout, and
                        Notifications
                      </h3>
                      <p className="text-black dark:text-white">
                        The dashboard may display usage and performance
                        indicators such as CPU utilization, memory load, and
                        instance uptime. Senseminder may also provide scheduling
                        features that allow automatic start and stop times.
                        Sense PCs may automatically stop after inactivity; by
                        default, idle timeout may be set to 6 hours and may be
                        configurable by the Owner or Administrator. We may send
                        system notifications related to usage, billing,
                        performance, scheduling, security, or Service updates
                        via the dashboard and/or email.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        4.6 User Management and Access Controls
                      </h3>
                      <p className="text-black dark:text-white">
                        Senseminder supports role-based controls to help manage
                        access to Sense PC within an organization or household.
                        Roles may include account Owner and Administrator, each
                        with different permissions. Owners and designated
                        Administrators may invite new Users to the platform and
                        assign access as allowed by the Services.
                      </p>
                      <p className="text-black dark:text-white">
                        A Sense PC can be assigned to only one User at a time.
                        Assignment or removal rules may require that the Sense
                        PC be stopped.
                      </p>
                      <p className="text-black dark:text-white">
                        <span className="text-yellow-700 dark:text-yellow-400">
                          ⚠️ Each Sense PC can only be assigned to one User at a
                          time.
                        </span>
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        4.7 Support
                      </h3>
                      <p className="text-black dark:text-white">
                        Support may be provided through email and/or an in-app
                        support ticket system. Response times and available
                        support options may vary by Subscription tier.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        4.8 Access Methods and Connectivity Requirements
                      </h3>
                      <p className="text-black dark:text-white">
                        You may be able to access Sense PC through supported
                        interfaces, which may include modern web browsers,
                        official desktop client applications (Windows/macOS),
                        and mobile applications where available. Use of the
                        Services requires a compatible device and a stable
                        internet connection. You are responsible for your
                        devices, local configuration, and connectivity.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        4.9 Sense Cloud (Cloud Storage)
                      </h3>
                      <p className="text-black dark:text-white">
                        Sense Cloud is a cloud storage Service that allows you
                        to store, organize, and manage Content in your Account.
                        Sense Cloud may include features such as uploading and
                        downloading files, browsing and searching files,
                        organizing files into folders, and viewing file
                        metadata.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        4.10 Sharing, Links, and Collaboration (If Available)
                      </h3>
                      <p className="text-black dark:text-white">
                        Sense Cloud may allow you to share Content using links
                        or other sharing controls, depending on the features
                        made available in your Account. If you share Content,
                        you are responsible for selecting the correct
                        recipients, configuring permissions appropriately, and
                        ensuring you have the right to share the Content. We are
                        not responsible for disclosures caused by your sharing
                        settings or actions.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        4.11 Duplicate Detection and File Management
                      </h3>
                      <p className="text-black dark:text-white">
                        Sense Cloud may provide duplicate detection or file
                        management tools designed to help identify or manage
                        duplicate files. These tools are provided for
                        convenience and may not detect every duplicate or
                        instance. You are responsible for reviewing results
                        before deleting or modifying Content.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        4.12 Relationship Between Sense PC and Sense Cloud
                      </h3>
                      <p className="text-black dark:text-white">
                        Sense Cloud is a standalone cloud storage system and is
                        not an attached drive or automatic extension of Sense
                        PC. Any transfer or backup of Content between Sense PC
                        and Sense Cloud is performed manually by you through the
                        available user interface features.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        4.13 Platform Optimization and Resource Management
                      </h3>
                      <p className="text-black dark:text-white">
                        To maintain stability, security, and performance, we may
                        apply operational measures such as capacity management,
                        backend optimization, or resource allocation changes. In
                        certain cases, inactive or underutilized Sense PCs may
                        be paused or restricted, and we will provide advance
                        notice where reasonably practicable.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        4.14 Infrastructure &amp; Hosting Providers (AWS)
                      </h3>
                      <p className="text-black dark:text-white">
                        Senseminder uses trusted third-party cloud
                        infrastructure providers to operate the Services. Sense
                        PC is provisioned and hosted using Amazon Web Services
                        (&quot;AWS&quot;), including Amazon EC2 (Elastic Compute
                        Cloud) for compute resources. Sense Cloud uses AWS
                        services including Amazon S3 (Simple Storage Service)
                        for storing Content and related storage operations.
                      </p>
                      <p className="text-black dark:text-white">
                        By using the Services, you understand that Content and
                        workloads may be processed and stored in AWS data
                        centers. Your use of the Services is also subject to
                        compliance with applicable third-party terms and
                        policies, including AWS terms and acceptable use
                        requirements.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="subscription-terms" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        5. Subscription Terms
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-6 p-8">
                      <p className="text-black dark:text-white">
                        Senseminder LLC (&quot;Senseminder&quot;,
                        &quot;we&quot;, &quot;our&quot;) offers
                        subscription-based billing for Services provided through
                        the SensePC platform (&quot;SensePC&quot;). This section
                        outlines plan types, billing triggers, renewals, and the
                        prepaid wallet system used to pay for Sense PC and Sense
                        Cloud.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        5.1 Plan Types: Hourly, Daily, Monthly
                      </h3>
                      <p className="text-black dark:text-white">
                        SensePC offers the following Sense PC subscription
                        plans:
                      </p>

                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          <strong>Hourly Plan:</strong> Compute charges apply
                          when the Sense PC is running, calculated in one-hour
                          increments. Usage of less than 60 minutes may be
                          rounded up to a full hour. <br />
                          <span>
                            ⚠️ SSD storage charges (Main Disk and any Additional
                            Disks) may continue to apply even when the Sense PC
                            is stopped, as these volumes remain allocated for
                            your use.
                          </span>
                        </li>

                        <li>
                          <strong>Daily Plan:</strong> A flat daily rate is
                          charged upfront upon Sense PC creation and every 24
                          hours thereafter, regardless of whether the Sense PC
                          is running or stopped. Daily plans include up to{" "}
                          <strong>10 total hours of Sense PC runtime</strong>{" "}
                          per 24-hour cycle (the &quot;Daily Usage Limit&quot;).
                          If you reach the Daily Usage Limit, your Sense PC will
                          be automatically stopped within{" "}
                          <strong>one (1) hour</strong>, and you may not be able
                          to start it again until the next daily cycle begins.
                        </li>

                        <li>
                          <strong>Monthly Plan:</strong> A flat monthly fee is
                          charged in advance and renews every 30 days, covering
                          Sense PC usage for the entire term, regardless of
                          instance state (running or stopped). Monthly plans
                          include up to{" "}
                          <strong>180 total hours of Sense PC runtime</strong>{" "}
                          per 30-day term (the &quot;Monthly Usage Limit&quot;).
                          If you reach the Monthly Usage Limit, your Sense PC
                          will be automatically stopped within{" "}
                          <strong>one (1) hour</strong>, and you may not be able
                          to start it again until the next monthly term begins.
                        </li>
                      </ul>

                      <p className="text-black dark:text-white">
                        You may select a plan during Sense PC setup or change it
                        later through the SensePC dashboard, subject to any
                        upgrade/downgrade rules shown in the dashboard.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        5.2 Subscription Start Date
                      </h3>
                      <p className="text-black dark:text-white">
                        Your subscription period begins upon one of the
                        following events:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          Successful Sense PC creation (for Hourly, Daily, or
                          Monthly plans)
                        </li>
                        <li>
                          Initiating any upload or activity in Sense Cloud
                          (e.g., uploading files or generating storage usage)
                        </li>
                      </ul>
                      <p className="text-black dark:text-white">
                        This marks the start of your billing obligations under
                        the selected plan(s), regardless of actual usage
                        thereafter. Billing follows the terms applicable to the
                        plan(s) and any usage-based or tiered pricing shown in
                        the SensePC dashboard.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        5.3 Upfront Billing Policy
                      </h3>
                      <p className="text-black dark:text-white">
                        Subscription fees for Sense PC (Hourly, Daily, Monthly)
                        and Sense Cloud are charged upfront at the beginning of
                        each billing cycle or billing unit, as applicable:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          Hourly Plan: Charges are applied when a billable
                          hourly unit begins (such as when you start a Sense
                          PC).
                        </li>
                        <li>
                          Daily Plan: Charges are applied when a new 24-hour
                          cycle begins.
                        </li>
                        <li>
                          Monthly Plan: Charges are applied at the start of each
                          30-day term.
                        </li>
                      </ul>

                      <p className="text-black dark:text-white">
                        This may also apply to:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          Sense Cloud tier billing (at cycle start and/or when a
                          tier threshold is crossed)
                        </li>
                        <li>Additional disk volumes (when provisioned)</li>
                      </ul>

                      <p className="text-black dark:text-white">
                        ⚠️ No proration or postpaid billing is supported. You
                        are responsible for maintaining a sufficient wallet
                        balance to avoid service interruptions.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        5.4 Activation &amp; Billing Triggers
                      </h3>
                      <p className="text-black dark:text-white">
                        Billing may be triggered by the following:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>Sense PC instance creation or resumption</li>
                        <li>Instance remains running</li>
                        <li>Billing cycle auto-renews</li>
                        <li>Additional Disks are provisioned</li>
                        <li>Instance is resized</li>
                        <li>Sense Cloud tier thresholds are crossed</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        5.5 Automatic Renewal
                      </h3>
                      <p className="text-black dark:text-white">
                        Plans may be set to auto-renew by default at the end of
                        their respective billing cycles. You may change or
                        cancel your plan prior to renewal through the SensePC
                        dashboard. Unless otherwise stated, changes take effect
                        at the end of the current billing period.
                      </p>
                      <p className="text-black dark:text-white">
                        ⚠️ No refunds will be issued for unused time once a
                        billing cycle begins.
                      </p>
                      <p className="text-black dark:text-white">
                        ⚠️ If you’re on the Hourly Plan and the instance remains
                        stopped, compute charges will not apply — but SSD
                        storage costs may still be billed hourly.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        5.6 Trial Period (If Applicable)
                      </h3>
                      <p className="text-black dark:text-white">
                        Senseminder may, at its discretion, offer limited-time
                        free trials or promotional credits. Trial terms will be
                        disclosed at the time of offer and are subject to change
                        or discontinuation.
                      </p>
                      <p className="text-black dark:text-white">
                        If your wallet balance becomes insufficient during a
                        trial:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>Your Sense PC may be automatically stopped.</li>
                        <li>
                          Billing from your wallet may begin once the trial ends
                          if the Service remains active and funds are available.
                        </li>
                      </ul>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        5.7 Wallet System
                      </h3>
                      <p className="text-black dark:text-white">
                        All charges are deducted from your Senseminder Wallet, a
                        prepaid digital balance associated with your Account.
                        Wallets can be topped up via accepted payment methods
                        (e.g., credit/debit card).
                      </p>
                      <p className="text-black dark:text-white">
                        If your wallet balance becomes insufficient:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>Your Sense PC may be automatically stopped</li>
                        <li>Sense Cloud services may be paused or suspended</li>
                        <li>You may receive low-balance notifications</li>
                        <li>
                          Auto-recharge (if enabled) may attempt to refill your
                          wallet
                        </li>
                        <li>
                          Sense Cloud may resume automatically upon wallet
                          recharge
                        </li>
                      </ul>
                      <p className="text-black dark:text-white">
                        ⚠️ Stopped Sense PCs will not automatically resume upon
                        recharge.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        5.8 Intelligent Tier for Sense Cloud
                      </h3>
                      <p className="text-black dark:text-white">
                        Sense Cloud uses an auto-tiered billing model based on
                        total storage usage across a 30-day cycle. Tiers
                        increase in <strong>20GB increments</strong>. Charges
                        may be based on the highest usage observed during the
                        cycle. Usage reductions may not lower the active tier
                        mid-cycle, and billing resets at the start of each new
                        30-day cycle.
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          Tier thresholds are calculated in 20GB increments.
                        </li>
                        <li>
                          Charges apply based on storage usage during the
                          billing cycle.
                        </li>
                        <li>
                          The tier may be determined by the highest usage
                          observed during the cycle.
                        </li>
                        <li>
                          Reducing usage may not reduce your tier until the next
                          30-day cycle.
                        </li>
                        <li>
                          Billing resets at the start of each new 30-day cycle.
                        </li>
                      </ul>
                      <p className="text-black dark:text-white">
                        You cannot manually upgrade or downgrade your tier. The
                        system may automatically adjust billing based on
                        observed usage.
                      </p>
                      <p className="text-black dark:text-white">
                        If your usage exceeds 1,000 GB, you may need to contact
                        support to request higher storage allocation.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="fees-and-payment" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        6. Fees &amp; Payment
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-6 p-8">
                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        6.1 Subscription Fees
                      </h3>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          Fees are displayed on the SensePC website and/or in
                          the dashboard at the time of purchase.
                        </li>
                        <li>
                          Subscription charges are billed in advance (upfront
                          billing).
                        </li>
                        <li>All prices are in USD unless stated otherwise.</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        6.2 Payment Methods
                      </h3>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>Credit/debit cards processed via Stripe.</li>
                        <li>
                          Wallet balance (prepaid credits), where available.
                        </li>
                      </ul>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        6.3 Authorization to Charge
                      </h3>
                      <p className="text-black dark:text-white">
                        You authorize Senseminder to charge your selected
                        payment method for all fees incurred, including
                        recurring subscription charges, usage-based charges (if
                        applicable), taxes, and any other amounts you authorize
                        at the time of purchase.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        6.4 Failed Payments
                      </h3>
                      <p className="text-black dark:text-white">
                        If a payment fails, we may attempt to process the
                        payment again and will notify you using the contact
                        information associated with your Account.
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>We will notify you via email.</li>
                        <li>
                          Service may be suspended after 7 days of non-payment.
                        </li>
                        <li>
                          Your Account may be terminated after 30 days of
                          non-payment.
                        </li>
                      </ul>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        6.5 Refunds &amp; Credit Policy
                      </h3>
                      <p className="text-black dark:text-white">
                        Subscription fees are non-refundable except in the
                        following situations:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          <strong>Service unavailability:</strong> If the
                          Services are unavailable for more than{" "}
                          <strong>48 consecutive hours</strong>, we may issue a
                          prorated service credit for the affected period.
                        </li>
                        <li>
                          <strong>Duplicate charges:</strong> If you are charged
                          twice for the same subscription or transaction, you
                          must notify us within <strong>30 days</strong> and we
                          will issue a refund or credit after verification.
                        </li>
                        <li>
                          <strong>Legal requirements:</strong> Refunds may be
                          provided where required by applicable law.
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="upgrades-downgrades-add-ons" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        7. Upgrades, Downgrades &amp; Add-ons
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-6 p-8">
                      <p className="text-black dark:text-white">
                        You may be able to change your subscription plan and
                        adjust certain resources through the SensePC dashboard,
                        subject to availability, your Subscription, and any
                        limits shown in your Account.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        7.1 Changing Subscription Plans
                      </h3>
                      <p className="text-black dark:text-white">
                        You may change your Sense PC subscription plan (Hourly,
                        Daily, Monthly) from your dashboard. Each Sense PC is
                        billed separately. Changes to one Sense PC do not affect
                        other Sense PCs under your Account.
                      </p>

                      <p className="text-black dark:text-white">
                        The following rules apply:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          <strong>Upgrades</strong> (e.g., Hourly → Daily or
                          Monthly, or Daily → Monthly): Upgrades take effect{" "}
                          <strong>immediately</strong> after the upgrade is
                          confirmed and payment is successfully processed. You
                          will be charged the applicable upgrade amount at the
                          time of upgrade.
                        </li>
                        <li>
                          <strong>Downgrades</strong> (e.g., Monthly → Daily or
                          Hourly, or Daily → Hourly): Downgrades take effect at
                          the <strong>start of the next billing cycle</strong>.
                          A downgrade may be restricted if your current
                          configuration or usage would exceed the limits of the
                          lower plan.
                        </li>
                      </ul>

                      <p className="text-black dark:text-white">
                        Senseminder does not provide prorated refunds for unused
                        time on your prior plan when you upgrade or switch
                        plans, except where required by applicable law or as
                        explicitly stated in these Terms.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        7.2 Adding Storage Disks
                      </h3>
                      <p className="text-black dark:text-white">
                        Additional Disks may be added to your Sense PC for
                        increased capacity (if available). Charges may be
                        applied at the time the add-on is confirmed (or as shown
                        in the dashboard). Additional Disks may not be removable
                        once provisioned.
                      </p>
                      <p className="text-black dark:text-white">
                        ⚠️ Storage downgrade is not supported. Once storage is
                        allocated, disk size cannot be reduced.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        7.3 Effective Date of Changes
                      </h3>
                      <p className="text-black dark:text-white">
                        Upgrades take effect immediately upon confirmation and
                        successful payment. Downgrades and certain reductions
                        may take effect at the start of the next billing cycle,
                        unless we explicitly state otherwise in writing.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        7.4 Your Responsibility to Backup
                      </h3>
                      <p className="text-black dark:text-white">
                        Before initiating a downgrade, resource change, or
                        instance deletion, you are responsible for backing up
                        your Content and confirming that you will not lose
                        access to any data or files you need.
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>Backing up all relevant data and files</li>
                        <li>
                          Ensuring no critical files depend on resources
                          scheduled to be removed, reduced, or changed
                        </li>
                      </ul>
                      <p className="text-black dark:text-white">
                        Senseminder is not liable for data loss, unavailability,
                        or incompatibility resulting from user-initiated
                        changes, including downgrades, deletions, or resource
                        modifications.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="software-license-usage" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        8. Software License &amp; Usage
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-6 p-8">
                      <p className="text-black dark:text-white">
                        When you access or use SensePC, including Sense PC and
                        Sense Cloud, we grant you a limited license to use the
                        Services subject to these Terms.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        8.1 Non-Exclusive, Non-Transferable License
                      </h3>
                      <p className="text-black dark:text-white">
                        Senseminder grants you a limited, revocable,
                        non-exclusive, non-transferable, and non-sublicensable
                        license to access and use the Services for your internal
                        and lawful purposes, only as permitted by these Terms
                        and your active Subscription.
                      </p>
                      <p className="text-black dark:text-white">
                        You may use the Services only within the intended scope
                        of your plan, configuration, and any limits shown in
                        your Account or dashboard.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        8.2 Use Restrictions
                      </h3>
                      <p className="text-black dark:text-white">
                        You agree not to engage in any of the following
                        prohibited activities:
                      </p>

                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          Reverse engineering, modifying, decompiling,
                          disassembling, or attempting to discover the source
                          code of any part of SensePC, including any client
                          applications, SDKs, or related components, except to
                          the extent such a restriction is prohibited by
                          applicable law.
                        </li>
                        <li>
                          Copying, reproducing, distributing, selling,
                          sublicensing, renting, leasing, or otherwise
                          commercializing the Services or any portion of them,
                          except as expressly permitted by Senseminder in
                          writing.
                        </li>
                        <li>
                          Using Sense PC or Sense Cloud for unauthorized,
                          abusive, or resource-intensive activities, including:
                          <ul className="list-disc pl-6 mt-3 space-y-3 text-black dark:text-white">
                            <li>
                              Cryptocurrency mining or blockchain validation
                            </li>
                            <li>
                              Server hosting (e.g., web servers, game servers,
                              VPN endpoints)
                            </li>
                            <li>
                              Mass automation, bot farms, scraping, or
                              coordinated inauthentic behavior
                            </li>
                            <li>
                              Stress testing, network flooding,
                              denial-of-service activity, or unauthorized
                              scanning
                            </li>
                            <li>
                              Penetration testing or vulnerability testing
                              without written authorization
                            </li>
                          </ul>
                        </li>
                        <li>
                          Using the Services in a way that violates applicable
                          laws or regulations, including export controls, data
                          privacy requirements, or intellectual property laws.
                        </li>
                        <li>
                          Bypassing, disabling, or interfering with
                          security-related features, access controls,
                          authentication, usage limits, or other mechanisms
                          designed to restrict or monitor use of the Services.
                        </li>
                      </ul>

                      <p className="text-black dark:text-white">
                        ⚠️ Violations of these restrictions may result in
                        suspension or termination of your Account and access to
                        the Services, with or without notice, and without refund
                        to the extent permitted by applicable law.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        8.3 Open Source Licenses (If Applicable)
                      </h3>
                      <p className="text-black dark:text-white">
                        Certain components of the Services may include open
                        source software subject to applicable open source
                        licenses. Your use of those components is governed by
                        the relevant license terms. To the extent a license
                        requires, those terms may control over parts of these
                        Terms.
                      </p>
                      <p className="text-black dark:text-white">
                        Where required or applicable, we may make relevant open
                        source notices available through the Services or upon
                        request.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        8.4 Device and Access Limitations
                      </h3>
                      <p className="text-black dark:text-white">
                        Your use of the Services may be subject to limits based
                        on your Subscription, configuration, and availability,
                        including:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>Concurrent session limits</li>
                        <li>Device access restrictions</li>
                        <li>Region-based limitations</li>
                      </ul>
                      <p className="text-black dark:text-white">
                        You may access Sense PC only through approved methods
                        (such as supported web, desktop, or mobile applications)
                        and may not bypass security protocols or use
                        unauthorized connection methods.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="user-content-data" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        9. User Content &amp; Data
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-6 p-8">
                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        9.1 Data Ownership
                      </h3>
                      <p className="text-black dark:text-white">
                        You retain ownership of all Content you upload, create,
                        or store using the Services.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        9.2 Backup Responsibility
                      </h3>
                      <p className="text-black dark:text-white">
                        You are responsible for maintaining backups of your
                        Content. While we may implement redundancy and
                        operational safeguards, we do not guarantee that Content
                        will be recoverable in all circumstances, and we are not
                        liable for data loss except where required by applicable
                        law.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        9.3 Post-Termination Data Handling
                      </h3>
                      <p className="text-black dark:text-white">
                        If your Account is terminated or closed, we may handle
                        data as follows:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          <strong>30-day grace period:</strong> Your data may
                          remain accessible for retrieval, subject to Service
                          availability and any legal or security requirements.
                        </li>
                        <li>
                          <strong>After 31 days:</strong> Sense PC instances and
                          Sense Cloud files may be permanently deleted.
                        </li>
                        <li>
                          <strong>After 90 days:</strong> Your Account profile
                          information and related metadata may be permanently
                          deleted, except where retention is required by law or
                          for legitimate business purposes.
                        </li>
                        <li>
                          <strong>Billing records:</strong> Billing and payment
                          records may be retained for up to{" "}
                          <strong>7 years</strong> to comply with tax and
                          accounting obligations (including 26 U.S.C. § 6001,
                          where applicable).
                        </li>
                      </ul>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        9.4 Data Retrieval During Grace Period
                      </h3>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          Email <strong>support@sensepc.com</strong> to request
                          a data export.
                        </li>
                        <li>
                          Available formats may include{" "}
                          <strong>ZIP archive</strong>, <strong>JSON</strong>,
                          or <strong>CSV</strong>, depending on the data type.
                        </li>
                        <li>
                          Requests for datasets under <strong>10GB</strong> may
                          be processed within <strong>72 hours</strong>.
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="acceptable-use-code-of-conduct" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        10. Acceptable Use / Code of Conduct
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-6 p-8">
                      <p className="text-black dark:text-white">
                        You agree to use the Services responsibly and in
                        compliance with applicable laws. You agree{" "}
                        <strong>not</strong> to:
                      </p>

                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          Engage in illegal activities or otherwise violate
                          applicable laws or regulations.
                        </li>
                        <li>
                          Upload, transmit, or store malware, viruses,
                          ransomware, or other harmful code or content.
                        </li>
                        <li>
                          Interfere with or disrupt the security, integrity, or
                          performance of the Services or other users.
                        </li>
                        <li>
                          Use the Services for cryptocurrency mining or
                          blockchain validation without authorization.
                        </li>
                        <li>
                          Circumvent, disable, or bypass usage limits, rate
                          limits, access controls, authentication, or security
                          measures.
                        </li>
                        <li>
                          Share your login credentials with unauthorized third
                          parties or allow others to access your Account without
                          permission.
                        </li>
                      </ul>

                      <p className="text-black dark:text-white">
                        We may investigate suspected violations and may suspend
                        or terminate access to the Services as permitted by
                        these Terms and applicable law.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="storage-and-os-licensing" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        11. Storage &amp; OS Licensing
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-6 p-8">
                      <p className="text-black dark:text-white">
                        This section explains how Sense PC SSD disks are
                        provisioned, how Sense Cloud differs from Sense PC
                        storage, and how operating system licensing is handled.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        11.1 Sense PC Storage
                      </h3>
                      <p className="text-black dark:text-white">
                        Each Sense PC includes a primary SSD disk (the “Main
                        Disk”). The Main Disk is used for system files and user
                        data, and may include:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          The operating system (Windows or Linux, depending on
                          your configuration)
                        </li>
                        <li>
                          Preinstalled tools and applications (if provided with
                          your selected image/configuration)
                        </li>
                        <li>
                          The SSD storage size selected at creation (subject to
                          plan/config limits shown in the dashboard)
                        </li>
                      </ul>
                      <p className="text-black dark:text-white">
                        ⚠️ The Main Disk is fixed in size once provisioned and
                        cannot be downgraded after creation.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        11.2 Additional SSD Disks (If Available)
                      </h3>
                      <p className="text-black dark:text-white">
                        You may be able to attach additional SSD disks to a
                        Sense PC for expanded capacity, depending on
                        availability and your Subscription. These disks are
                        associated with the specific Sense PC instance.
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          Additional disks may be billed separately and charged
                          in advance as shown in the dashboard.
                        </li>
                        <li>
                          Once provisioned, additional disks may not be
                          removable or downgradable.
                        </li>
                        <li>
                          Sense PC SSD usage is separate from Sense Cloud usage
                          and billing.
                        </li>
                      </ul>
                      <p className="text-black dark:text-white">
                        ⚠️ Sense PC SSD disks are part of the compute
                        environment and are not intended to serve as a
                        guaranteed backup or archiving solution.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        11.3 Sense Cloud vs Sense PC Storage
                      </h3>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          <strong>Sense Cloud</strong> is long-term cloud file
                          storage associated with your Account and billed
                          according to the pricing and tier rules shown in the
                          dashboard.
                        </li>
                        <li>
                          <strong>Sense PC storage</strong> (Main Disk and any
                          additional SSD disks) is tied to a specific Sense PC
                          instance and may be deleted when that Sense PC is
                          deleted.
                        </li>
                      </ul>
                      <p className="text-black dark:text-white">
                        These storage systems are managed separately and billed
                        separately.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        11.4 Operating System Licensing
                      </h3>
                      <p className="text-black dark:text-white">
                        Sense PC instances may be provisioned with Windows or
                        Linux depending on the configuration you select.
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          Linux (such as Ubuntu) is typically provided under
                          open-source licenses and generally does not require
                          activation.
                        </li>
                        <li>
                          Windows images may be delivered in an unactivated
                          state by default unless stated otherwise in the
                          dashboard.
                        </li>
                      </ul>
                      <p className="text-black dark:text-white">
                        Senseminder does not provide or resell Windows license
                        keys unless explicitly stated. If Windows activation is
                        required, you are responsible for obtaining and applying
                        a valid license (BYOL) and ensuring your use complies
                        with Microsoft licensing requirements.
                      </p>
                      <p className="text-black dark:text-white">
                        ⚠️ You are solely responsible for the legality,
                        validity, and compliance of any licenses you apply.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        11.5 Deletion and Termination Effects
                      </h3>
                      <p className="text-black dark:text-white">
                        When a Sense PC is deleted (or your Account is
                        terminated), the instance and its disks may be
                        permanently deleted. This may remove operating system
                        configurations, installed software, and activation data.
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          Installed software and configuration data on the Sense
                          PC may be permanently erased.
                        </li>
                        <li>
                          Senseminder does not retain, reuse, or transfer your
                          software license keys or activation data.
                        </li>
                        <li>
                          You are responsible for deactivating or removing any
                          licenses you applied before deletion, where required
                          by the license terms.
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="service-availability-maintenance" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        12. Service Availability &amp; Maintenance
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-6 p-8">
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          Services are provided “AS-IS” with no uptime
                          guarantee.
                        </li>
                        <li>
                          Scheduled maintenance may occur, with advance notice
                          when reasonably possible.
                        </li>
                        <li>Emergency maintenance may occur without notice.</li>
                        <li>
                          We are not liable for temporary unavailability except
                          as stated in Section 17 (Limitation of Liability) and
                          as required by applicable law.
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="geographic-availability" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        13. Geographic Availability
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-6 p-8">
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>Services may not be available in all countries.</li>
                        <li>Performance may vary by location.</li>
                        <li>
                          Certain features may be restricted based on
                          jurisdiction.
                        </li>
                        <li>
                          You are responsible for compliance with local laws.
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="third-party-services-and-dependencies" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        14. Third-Party Services &amp; Dependencies
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-6 p-8">
                      <p className="text-black dark:text-white">
                        Our Services rely on third-party providers and
                        dependencies, which may affect availability and
                        performance.
                      </p>

                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          <strong>AWS</strong> (cloud infrastructure and
                          hosting)
                        </li>
                        <li>
                          <strong>Stripe</strong> (payment processing)
                        </li>
                        <li>
                          <strong>Internet service providers</strong> and
                          network operators
                        </li>
                      </ul>

                      <p className="text-black dark:text-white">
                        We are not liable for disruptions, outages, delays, or
                        failures caused by third-party services that are beyond
                        our reasonable control.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="termination-and-suspension" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        15. Termination &amp; Suspension
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-6 p-8">
                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        15.1 User-Initiated Termination
                      </h3>
                      <p className="text-black dark:text-white">
                        You may terminate your Account at any time through your
                        account settings or by emailing{" "}
                        <strong>support@sensepc.com</strong>.
                      </p>
                      <p className="text-black dark:text-white">
                        No refunds will be provided for any remaining
                        subscription period except where required by applicable
                        law.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        15.2 Provider-Initiated Termination
                      </h3>
                      <p className="text-black dark:text-white">
                        We may suspend or terminate your access to the Services,
                        in whole or in part, if we reasonably determine that:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          You violated these Terms or the Acceptable Use / Code
                          of Conduct section.
                        </li>
                        <li>
                          Payment is not received after <strong>30 days</strong>
                          .
                        </li>
                        <li>
                          We detect or reasonably suspect fraudulent activity or
                          a security threat.
                        </li>
                        <li>
                          Suspension or termination is required to comply with
                          legal or regulatory requirements.
                        </li>
                      </ul>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        15.3 Notice &amp; Cure Period
                      </h3>
                      <p className="text-black dark:text-white">
                        For non-emergency violations, we may provide:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          A written notice via email at least{" "}
                          <strong>7 days</strong> in advance.
                        </li>
                        <li>
                          An opportunity to cure the violation where reasonably
                          possible.
                        </li>
                        <li>
                          A brief explanation of the reason for the action.
                        </li>
                      </ul>
                      <p className="text-black dark:text-white">
                        For emergency situations (including security threats or
                        suspected fraud), we may suspend access immediately and
                        without prior notice.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="intellectual-property" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        16. Intellectual Property
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-6 p-8">
                      <p className="text-black dark:text-white">
                        All intellectual property rights related to SensePC, the
                        Services, and related materials are protected under
                        applicable law. This section explains ownership and the
                        limits on how you may use our proprietary assets.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        16.1 Ownership of the Services and Brand
                      </h3>
                      <p className="text-black dark:text-white">
                        As between you and Senseminder, Senseminder owns and
                        retains all rights, title, and interest in and to the
                        Services and all related technology, software,
                        interfaces, designs, and documentation, including any
                        improvements, updates, and derivative works, except for
                        your Content.
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>Sense PC and Sense Cloud technologies</li>
                        <li>
                          Web, desktop, and mobile applications and user
                          interfaces
                        </li>
                        <li>
                          Backend systems, workflows, and service operations
                        </li>
                        <li>Documentation, templates, and related materials</li>
                      </ul>
                      <p className="text-black dark:text-white">
                        Nothing in these Terms grants you any ownership rights
                        in the Services. You receive only the limited rights
                        necessary to use the Services as permitted by these
                        Terms and your Subscription.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        16.2 Restrictions on Copying, Reverse Engineering, and
                        Competitive Use
                      </h3>
                      <p className="text-black dark:text-white">
                        You agree not to, and not to allow others to:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          Copy, reproduce, distribute, sell, rent, lease,
                          sublicense, or otherwise commercially exploit any
                          portion of the Services, except as expressly permitted
                          by Senseminder in writing.
                        </li>
                        <li>
                          Reverse engineer, decompile, disassemble, or attempt
                          to discover the source code of the Services, except to
                          the extent such restriction is prohibited by
                          applicable law.
                        </li>
                        <li>
                          Use the Services for benchmarking, scraping, or
                          competitive analysis intended to build or offer a
                          competing product or service.
                        </li>
                        <li>
                          Modify, adapt, or create derivative works based on the
                          Services, except as enabled through supported features
                          and APIs (if any) provided by Senseminder.
                        </li>
                        <li>
                          Use content or outputs from the Services to train
                          AI/ML models without prior written consent, to the
                          extent permitted by applicable law.
                        </li>
                      </ul>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        16.3 Trademarks and Copyright
                      </h3>
                      <p className="text-black dark:text-white">
                        Senseminder, SensePC, and related names, logos, and
                        branding elements are trademarks or trade dress of
                        Senseminder (or its licensors). You may not use these
                        marks without prior written permission, except as
                        necessary to identify the Services in a truthful and
                        non-misleading manner.
                      </p>
                      <p className="text-black dark:text-white">
                        The Services, including software, user interface, and
                        platform content, are protected by copyright and other
                        intellectual property laws. Unauthorized use is
                        prohibited.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        16.4 Feedback
                      </h3>
                      <p className="text-black dark:text-white">
                        If you provide suggestions, ideas, or feedback about the
                        Services (“Feedback”), you grant Senseminder a
                        worldwide, perpetual, irrevocable, royalty-free license
                        to use, modify, and incorporate that Feedback without
                        restriction or compensation.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="limitation-of-liability" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        17. Limitation of Liability
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-6 p-8">
                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        17.1 Liability Caps
                      </h3>
                      <p className="text-black dark:text-white">
                        To the maximum extent permitted by applicable law, our
                        total liability to you for any claims arising from or
                        related to the Services is limited to the greater of:
                        (a) the fees paid by you in the twelve (12) months
                        preceding the event giving rise to the claim, or (b){" "}
                        <strong>$500 USD</strong>.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        17.2 Jurisdictional Exceptions
                      </h3>
                      <p className="text-black dark:text-white">
                        The above limitations may not apply where prohibited by
                        law, including:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          <strong>European Union &amp; United Kingdom:</strong>{" "}
                          Consumer rights under EU Directive 93/13/EEC and UK
                          Consumer Rights Act 2015 cannot be limited.
                        </li>
                        <li>
                          <strong>USA - Consumer Protection:</strong> State
                          consumer protection laws in California, Virginia,
                          Colorado, Connecticut, and other states may limit
                          liability waivers.
                        </li>
                        <li>
                          <strong>Australia:</strong> Consumer guarantees under
                          Australian Consumer Law (ACL) cannot be excluded.
                        </li>
                      </ul>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        17.3 Excluded Liabilities
                      </h3>
                      <p className="text-black dark:text-white">
                        Nothing in these Terms limits or excludes liability that
                        cannot be limited or excluded under applicable law. In
                        particular, the limitations in this section do not apply
                        to liability for:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          Death or personal injury caused by our negligence.
                        </li>
                        <li>Fraud or fraudulent misrepresentation.</li>
                        <li>Gross negligence or willful misconduct.</li>
                        <li>
                          A data breach caused by a failure to implement
                          reasonable security measures, to the extent required
                          by applicable law.
                        </li>
                        <li>
                          Violations of applicable privacy laws where liability
                          cannot be limited (including GDPR, CCPA, and similar
                          laws).
                        </li>
                      </ul>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        17.4 Statute of Limitations
                      </h3>
                      <p className="text-black dark:text-white">
                        To the extent permitted by applicable law, any claim
                        must be brought within <strong>one (1) year</strong> of
                        the event giving rise to the claim. If applicable law
                        does not allow a one-year limitation period, the claim
                        must be brought within the shortest period permitted by
                        law.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        17.5 Exclusion of Consequential Damages
                      </h3>
                      <p className="text-black dark:text-white">
                        We are not liable for any indirect, incidental, special,
                        consequential, exemplary, or punitive damages, or for
                        any loss of profits, loss of data, loss of business
                        opportunities, or reputational harm.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="indemnification" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        18. Indemnification
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-6 p-8">
                      <p className="text-black dark:text-white">
                        You agree to indemnify, defend, and hold harmless
                        Senseminder, and its officers, employees, and agents,
                        from and against any claims, liabilities, damages,
                        losses, and expenses (including reasonable attorneys’
                        fees) arising out of or relating to:
                      </p>

                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>Your use or misuse of the Services.</li>
                        <li>Your violation of these Terms.</li>
                        <li>
                          Your violation of any third-party rights (including
                          intellectual property or privacy rights).
                        </li>
                        <li>
                          Your Content, data, or materials uploaded, stored,
                          transmitted, or created through the Services.
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="force-majeure" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        19. Force Majeure
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-6 p-8">
                      <p className="text-black dark:text-white">
                        We are not liable for any failure or delay in performing
                        our obligations to the extent caused by events beyond
                        our reasonable control, including:
                      </p>

                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>Natural disasters (earthquakes, floods, fires)</li>
                        <li>Acts of war, terrorism, or civil unrest</li>
                        <li>Government actions or regulatory changes</li>
                        <li>Pandemics or public health emergencies</li>
                        <li>Cyberattacks or DDoS attacks</li>
                        <li>Cloud provider infrastructure failures</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="arbitration-and-dispute-resolution" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        20. Arbitration &amp; Dispute Resolution
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-6 p-8">
                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        20.1 Mandatory Arbitration
                      </h3>
                      <p className="text-black dark:text-white">
                        Except as described in Section 20.3, any dispute, claim,
                        or controversy arising out of or relating to these Terms
                        or the Services will be resolved through binding
                        arbitration administered by the American Arbitration
                        Association (&quot;AAA&quot;) under its Commercial
                        Arbitration Rules.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        20.2 Location
                      </h3>
                      <p className="text-black dark:text-white">
                        Arbitration will be conducted in{" "}
                        <strong>Atlanta, Georgia, USA</strong>, or by video
                        conference, at the election of the party initiating
                        arbitration, unless the arbitrator determines another
                        format is required by applicable law.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        20.3 Exceptions
                      </h3>
                      <p className="text-black dark:text-white">
                        The following disputes are not required to be resolved
                        through arbitration:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          Claims that may be brought in small claims court, if
                          eligible, including claims under{" "}
                          <strong>$10,000</strong>.
                        </li>
                        <li>
                          Requests for injunctive or other equitable relief to
                          prevent or address alleged infringement or misuse of
                          intellectual property rights.
                        </li>
                      </ul>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        20.4 No Class Actions
                      </h3>
                      <p className="text-black dark:text-white">
                        You and Senseminder agree that disputes will be resolved
                        only on an individual basis. There will be no class
                        action or class-wide arbitration, and you waive any
                        right to participate in a class proceeding.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        20.5 Opt-Out
                      </h3>
                      <p className="text-black dark:text-white">
                        You may opt out of this arbitration provision within{" "}
                        <strong>30 days</strong> of Account creation by emailing{" "}
                        <strong>legal@sensepc.com</strong> with{" "}
                        <strong>&quot;Arbitration Opt-Out&quot;</strong> in the
                        subject line.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="modifications-to-terms" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        21. Changes to the Terms
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-6 p-8">
                      <p className="text-black dark:text-white">
                        We may update these Terms from time to time to reflect
                        changes in the Services, legal requirements, or business
                        practices. This section explains how we provide notice
                        and what happens if you do not agree to an update.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        21.1 Notification of Changes
                      </h3>
                      <p className="text-black dark:text-white">
                        When we update these Terms, we will update the “Last
                        Updated” date. For material changes, we may also provide
                        notice through one or more of the following: email,
                        in-dashboard notifications, or notices posted on our
                        website.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        21.2 Effective Date and Your Acceptance
                      </h3>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          Material changes will generally take effect no earlier
                          than <strong>30 days</strong> after we provide notice
                          (unless a shorter period is required for security,
                          legal compliance, or operational reasons).
                        </li>
                        <li>
                          Continued use of the Services after the effective date
                          of updated Terms constitutes acceptance of the updated
                          Terms.
                        </li>
                      </ul>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        21.3 If You Do Not Agree
                      </h3>
                      <p className="text-black dark:text-white">
                        If you do not agree to updated Terms, you must stop
                        using the Services and may close your Account before the
                        updated Terms take effect.
                      </p>
                      <p className="text-black dark:text-white">
                        ⚠️ Except where required by applicable law or as
                        explicitly stated in these Terms, we do not provide
                        refunds for prepaid subscription periods due to changes
                        in Terms.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="communication-and-notices" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        22. Communication &amp; Notices
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-6 p-8">
                      <p className="text-black dark:text-white">
                        This section explains how we deliver official notices
                        and how you can contact us for support or legal
                        communications.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        22.1 How We Send Notices
                      </h3>
                      <p className="text-black dark:text-white">
                        We may send legal, billing, technical, security, or
                        account-related notices using one or more of the
                        following methods:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          Email sent to the address associated with your
                          Account.
                        </li>
                        <li>In-app or dashboard notifications.</li>
                        <li>
                          Notices posted on our website or status page (if
                          available).
                        </li>
                      </ul>
                      <p className="text-black dark:text-white">
                        Notices are considered delivered when sent or posted,
                        even if you do not read them.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        22.2 Your Responsibility to Keep Contact Information
                        Current
                      </h3>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          Maintain an accurate, accessible email address on your
                          Account.
                        </li>
                        <li>
                          Monitor your email and dashboard for important
                          messages.
                        </li>
                        <li>
                          Promptly update your contact information if it
                          changes.
                        </li>
                      </ul>
                      <p className="text-black dark:text-white">
                        If you fail to receive notices due to outdated contact
                        information or delivery issues outside our control, that
                        does not change your obligations under these Terms.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="miscellaneous" className="scroll-mt-28">
                  <div>
                    <div className="space-y-4 p-8">
                      <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                        23. Miscellaneous
                      </h2>
                    </div>
                    <hr />
                    <div className="space-y-6 p-8">
                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        23.1 Entire Agreement
                      </h3>
                      <p className="text-black dark:text-white">
                        These Terms, the Privacy Policy, and any referenced
                        policies or addenda constitute the entire agreement
                        between you and Senseminder regarding the Services and
                        supersede any prior or contemporaneous agreements or
                        understandings.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        23.2 Severability
                      </h3>
                      <p className="text-black dark:text-white">
                        If any provision of these Terms is held to be invalid or
                        unenforceable, the remaining provisions will remain in
                        full force and effect.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        23.3 Assignment
                      </h3>
                      <p className="text-black dark:text-white">
                        You may not assign or transfer these Terms or any rights
                        or obligations under them without our prior written
                        consent. We may assign these Terms to an affiliate,
                        successor, or acquirer in connection with a merger,
                        acquisition, reorganization, or sale of assets.
                      </p>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        23.4 Governing Law
                      </h3>
                      <p className="text-black dark:text-white">
                        These Terms are governed by the laws of the State of
                        Georgia, USA, without regard to conflict of law
                        principles.
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          <strong>United States residents:</strong> Applicable
                          state consumer protection laws may apply and may
                          provide additional rights.
                        </li>
                        <li>
                          <strong>EU/UK residents:</strong> Applicable EU/UK
                          consumer protection laws apply and cannot be waived.
                        </li>
                      </ul>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        23.5 Auto-Renewal Disclosures (USA State Laws)
                      </h3>
                      <p className="text-black dark:text-white">
                        The following disclosures apply to residents of
                        California, New York, Illinois, Colorado, Connecticut,
                        the District of Columbia, Minnesota, North Carolina,
                        Ohio, Oregon, Vermont, Virginia, and Washington:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          Subscriptions auto-renew at the end of each billing
                          period unless canceled.
                        </li>
                        <li>
                          You will be charged automatically at renewal using
                          your selected payment method or wallet balance.
                        </li>
                        <li>
                          You may cancel at any time through account settings or
                          by emailing <strong>support@senseminder.com</strong>.
                        </li>
                        <li>
                          For monthly renewals, renewal notices may be sent
                          approximately 7 days before renewal.
                        </li>
                        <li>
                          Clear cancellation instructions are provided in the
                          account dashboard.
                        </li>
                      </ul>

                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        23.6 EU Consumer Rights
                      </h3>
                      <p className="text-black dark:text-white">
                        If you are a consumer located in the European Union, you
                        may have a statutory right to cancel certain purchases
                        within <strong>14 days</strong> (the “cooling-off
                        period”) without giving any reason, unless an exception
                        applies under applicable law.
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-black dark:text-white">
                        <li>
                          You may have the right to cancel within 14 days of
                          purchase.
                        </li>
                        <li>
                          Where applicable, refunds will be processed within 14
                          days of receiving your cancellation notice.
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </MainLayout>
  );
};

export default TermsMainPage;
