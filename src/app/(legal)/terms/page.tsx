"use client";

import React, { useState } from "react";

import { termsSections } from "../data/sections";
import { Breadcrumb } from "../../home/_components/breadcrumb";

// import { useGetLegalDocumentsQuery } from "@/api/legalDocumentsAPI";

const Terms = () => {
  const [activeSection, setActiveSection] = useState<string>(
    termsSections[0].id
  );

  const baseLinkClasses =
    "relative pr-9 text-black hover:text-white dark:text-white dark:hover:text-white mx-6 p-4 rounded-lg border hover:bg-gradient-to-r hover:from-[#3A29E7] hover:to-[#A601BA]";

  const activeLinkClasses =
    "!border-0 text-white bg-gradient-to-r from-[#3A29E7] to-[#A601BA] " +
    "before:content-[''] before:absolute before:right-[-23px] before:bottom-0 " +
    "before:w-[10px] before:h-full before:bg-[#A601BA] before:rounded-l-[12px]";

  // const { data, error, isLoading } = useGetLegalDocumentsQuery();

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-[50vh]">
  //       <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
  //     </div>
  //   );
  // }

  const lastUpdated = "July 22, 2025";

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    requestAnimationFrame(() => {
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  return (
    <main className="flex-grow pt-16 md:pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Terms of Service" },
          ]}
          className="mt-0 mb-6 text-sm text-muted-foreground dark:text-muted-foreground [&_a]:text-muted-foreground [&_a]:hover:text-foreground [&_a]:transition-colors [&_span]:text-foreground"
        />

        <div className="flex flex-col md:flex-row gap-10 md:items-stretch">
          <div className="w-full md:w-1/3 lg:w-[35%] flex">
            <div className="glass-card !shadow-none gradient-outline-border !rounded-3xl !border-0 h-full w-full bg-white dark:bg-[#0B0C12]">
              <div className="space-y-2 p-8">
                <p className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                  Terms of Service
                </p>
                <p className="text-paragraph text-sm">
                  Last Updated: {lastUpdated}
                </p>
              </div>
              <hr />
              <div className="space-y-3 py-6 flex flex-col">
                {termsSections.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={`${baseLinkClasses} ${
                      activeSection === id ? activeLinkClasses : ""
                    }`}
                    onClick={() => handleNavClick(id)}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full md:w-2/3 lg:w-[65%] flex">
            <div className="glass-card !shadow-none gradient-outline-border !rounded-3xl !border-0 space-y-6 h-full w-full bg-white dark:bg-[#0B0C12]">
              {activeSection === "introduction" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      Introduction
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      Welcome to Senseminder.
                    </p>
                    <p className="text-paragraph dark:text-gray-300">
                      These Terms of Service ("Terms") govern your access to and
                      use of the Senseminder platform, including our SmartPC
                      virtual desktop services, cloud-based storage features,
                      and any related applications, software, websites, or
                      offerings (collectively, the "Services"). Senseminder LLC
                      (“Senseminder,” “we,” “our,” or “us”) provides these
                      Services subject to your compliance with these Terms.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Scope of the Agreement
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      By accessing, purchasing, registering for, or using the
                      Services, you acknowledge and agree to be legally bound by
                      these Terms. These Terms form a binding legal agreement
                      between you (whether as an individual or as a
                      representative of a legal entity) and Senseminder.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Binding Effect of Terms
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      This Agreement applies to all users of the Services,
                      including account holders, trial users, and visitors to
                      any part of the Senseminder platform. If you do not agree
                      to these Terms, do not access or use the Services.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Acceptance of Terms
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      You accept these Terms when you:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        (a) click “I Agree,” “Accept,” or any similar button
                        when presented;
                      </li>
                      <li>(b) create or access a Senseminder account; or</li>
                      <li>(c) use any part of the Services.</li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300">
                      Your continued use constitutes ongoing acceptance of the
                      most current version of these Terms.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Agreement Includes Additional Documents
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      These Terms incorporate and include the following
                      additional documents, all of which form part of this
                      Agreement:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        <a
                          href="https://smartpc.cloud/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 dark:text-blue-400 underline"
                        >
                          Privacy Policy
                        </a>{" "}
                        — How we collect, use, and protect your personal data
                      </li>
                      <li>
                        Any active subscription plans, pricing schedules, or
                        product-specific addendums that apply to your selected
                        Services
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300">
                      Please review each of these documents carefully.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Modifications to the Terms
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      We reserve the right to update or modify these Terms at
                      any time in our sole discretion. We will provide notice of
                      material changes by posting an updated version with a new
                      effective date on our website or via in-app notification.
                      Your continued use of the Services after such changes
                      constitutes your acceptance of the revised Terms.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Arbitration and Class Action Waiver
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      To the fullest extent permitted by applicable law, any
                      disputes arising out of or relating to these Terms will be
                      resolved through binding arbitration on an individual
                      basis, and you waive your right to participate in a class
                      action or class-wide arbitration. More information is
                      provided in Section 20.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Age and Legal Capacity
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      You must be at least 18 years of age, or the legal age of
                      majority in your jurisdiction, to use the Services. By
                      accessing or using the Services, you represent and warrant
                      that you have the legal capacity to enter into this
                      Agreement, or that you are doing so with the supervision
                      and consent of a parent or legal guardian.
                    </p>
                  </div>
                </div>
              )}
              {activeSection === "definitions" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      Definitions
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      For the purposes of these Terms of Service, the following
                      capitalized terms shall have the meanings set forth below.
                      These definitions apply whether they are used in the
                      singular or plural form.
                    </p>
                    <p className="text-paragraph dark:text-gray-300">
                      <strong className="text-xl font-semibold text-black dark:text-white mt-6">
                        "Senseminder"
                      </strong>
                      <br />
                      Refers to Senseminder LLC, a company incorporated under
                      the laws of the State of Georgia, United States, and its
                      affiliates, successors, and assigns.
                    </p>
                    <p className="text-paragraph dark:text-gray-300">
                      <strong className="text-xl font-semibold text-black dark:text-white mt-6">
                        "SmartPC"
                      </strong>
                      <br />
                      Means the virtual desktop product offered by Senseminder
                      that provides the user with remote access to a
                      cloud-hosted computing environment. A SmartPC typically
                      includes a preconfigured operating system, assigned
                      computing resources (CPU, RAM, GPU), storage, and software
                      utilities, accessible over the internet through supported
                      devices.
                    </p>
                    <p className="text-paragraph dark:text-gray-300">
                      <strong className="text-xl font-semibold text-black dark:text-white mt-6">
                        "SmartStorage"
                      </strong>
                      <br />
                      Refers to Senseminder's cloud-based storage service that
                      allows users to upload, store, manage, and retrieve
                      personal or business files. SmartStorage may be used
                      independently or in conjunction with a SmartPC instance.
                    </p>
                    <p className="text-paragraph dark:text-gray-300">
                      <strong className="text-xl font-semibold text-black dark:text-white mt-6">
                        "User" or "You"
                      </strong>
                      <br />
                      Means the individual or legal entity who accesses,
                      registers for, subscribes to, or otherwise uses the
                      Services, whether for personal or business purposes.
                    </p>
                    <p className="text-paragraph dark:text-gray-300">
                      <strong className="text-xl font-semibold text-black dark:text-white mt-6">
                        "Services"
                      </strong>
                      <br />
                      Refers collectively to all offerings provided by
                      Senseminder, including but not limited to SmartPC,
                      SmartStorage, associated APIs, software tools,
                      applications, customer support, and any other products,
                      content, or functionality offered under the Senseminder
                      brand.
                    </p>
                    <p className="text-paragraph dark:text-gray-300">
                      <strong className="text-xl font-semibold text-black dark:text-white mt-6">
                        "Subscription"
                      </strong>
                      <br />
                      Denotes the paid plan(s) selected by the User to access
                      and use certain Services, whether on an hourly, daily,
                      monthly, or other billing cycle, as defined on the
                      Senseminder website or platform.
                    </p>
                    <p className="text-paragraph dark:text-gray-300">
                      <strong className="text-xl font-semibold text-black dark:text-white mt-6">
                        "Instance" or "Remote Desktop"
                      </strong>
                      <br />
                      Means a dedicated virtual machine or session assigned to
                      the User as part of the SmartPC Service, which may be
                      customized based on selected configuration parameters such
                      as location, OS, memory, or CPU cores.
                    </p>
                    <p className="text-paragraph dark:text-gray-300">
                      <strong className="text-xl font-semibold text-black dark:text-white mt-6">
                        "Third-Party Terminal"
                      </strong>
                      <br />
                      Refers to any hardware or software not developed or owned
                      by Senseminder that is used to access the Services,
                      including web browsers, client applications, mobile
                      devices, or operating systems.
                    </p>
                    <p className="text-paragraph dark:text-gray-300">
                      <strong className="text-xl font-semibold text-black dark:text-white mt-6">
                        "Software"
                      </strong>
                      <br />
                      Means any downloadable or web-based applications, scripts,
                      system images, or tools provided by Senseminder to
                      facilitate access to or interaction with the Services.
                      This includes proprietary software and may incorporate
                      open-source components subject to separate licenses.
                    </p>
                    <p className="text-paragraph dark:text-gray-300">
                      <strong className="text-xl font-semibold text-black dark:text-white mt-6">
                        "User Account"
                      </strong>
                      <br />
                      Refers to the unique registered profile created by or for
                      the User on the Senseminder platform, used to manage
                      access to the Services, billing, identity verification,
                      and service configurations.
                    </p>
                    <p className="text-paragraph dark:text-gray-300">
                      <strong className="text-xl font-semibold text-black dark:text-white mt-6">
                        "Main Disk" and "Additional Disk"
                      </strong>
                      <br />
                      <em>Main Disk:</em> The primary storage volume associated
                      with a SmartPC instance. It includes the operating system,
                      preinstalled applications, and serves as the user's main
                      data storage. The size of the Main Disk is provisioned
                      based on the user's selected configuration during
                      subscription or setup. It is a required component of every
                      SmartPC.
                      <br />
                      <em>Additional Disk:</em> An optional storage volume that
                      Users may choose to attach for extra capacity, workload
                      separation, or data backup. Additional Disks are not
                      included by default and are only provisioned upon user
                      request. They are billed separately from the Main Disk.
                    </p>
                    <p className="text-paragraph dark:text-gray-300">
                      <strong className="text-xl font-semibold text-black dark:text-white mt-6">
                        "Data" and "User Content"
                      </strong>
                      <br />
                      <em>Data:</em> Includes all digital information created,
                      uploaded, processed, or stored by the User through the
                      Services.
                      <br />
                      <em>User Content:</em> A subset of Data that includes but
                      is not limited to files, documents, software, settings,
                      media, and any other digital materials generated,
                      imported, or transmitted by the User.
                    </p>
                  </div>
                </div>
              )}
              {activeSection === "account-registration-security" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      Account Registration & Security
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      To access and use the Senseminder Services, you must
                      create and maintain a valid user account. You agree to
                      comply with the following requirements in connection with
                      your account.
                    </p>
                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Account Creation Requirements
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      You must register for an account through the Senseminder
                      platform to access SmartPC, SmartStorage, or any other
                      subscribed services. As part of the registration process,
                      you may be required to provide certain information such as
                      your name, email address, billing details, and service
                      preferences. Senseminder reserves the right to deny
                      account creation in its sole discretion, including for
                      suspected fraudulent activity, policy violations, or
                      jurisdictional restrictions.
                    </p>
                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Age Requirement
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      You must be at least 18 years old, or the legal age of
                      majority in your jurisdiction, to register for a
                      Senseminder account. If you are under 18, you may only use
                      the Services under the supervision of a parent or legal
                      guardian who agrees to be bound by these Terms. By
                      creating an account, you represent and warrant that you
                      meet this requirement.
                    </p>
                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Accurate Information & Updates
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      You agree to provide accurate, current, and complete
                      information during registration and to keep your account
                      details updated at all times. You are responsible for
                      ensuring your contact and billing information remains
                      valid. Senseminder is not liable for any issues arising
                      from inaccurate or outdated information provided by you.
                    </p>
                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Password Confidentiality and Multi-Factor Authentication
                      (MFA)
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      You are solely responsible for maintaining the
                      confidentiality and security of your account credentials,
                      including your password and any authentication methods you
                      use. You agree not to share your login credentials with
                      any other person. We strongly recommend enabling
                      multi-factor authentication (MFA) if offered, to add an
                      additional layer of security to your account. You
                      acknowledge that failure to secure your account may result
                      in unauthorized access or data loss.
                    </p>
                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Account Activity Responsibility
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      You are fully responsible for all activity that occurs
                      under your account, whether or not you authorized such
                      activity. This includes any actions taken from devices
                      where your session is active or from third-party terminals
                      using your credentials. You agree to immediately notify
                      Senseminder of any suspected unauthorized use or security
                      breach.
                    </p>
                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Account Suspension for Fraud or Abuse
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      Senseminder reserves the right to suspend or terminate
                      your account without prior notice if we suspect, in our
                      sole discretion, that your account is associated with
                      fraud, abuse, unauthorized access, or activity that
                      violates these Terms or any applicable laws. In such
                      cases, you may lose access to your SmartPC instance,
                      SmartStorage content, or any related data, without refund.
                    </p>
                  </div>
                </div>
              )}
              {activeSection === "description-of-services" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      Description of Services
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      Senseminder provides secure, cloud-based computing and
                      storage solutions designed to deliver scalable virtual
                      desktop environments and on-demand storage to users and
                      organizations. The two primary components of the Services
                      are SmartPC and SmartStorage.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      SmartPC Remote Desktop Access
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      SmartPC is a virtual desktop infrastructure (VDI) service
                      that provides users with remote access to a cloud-hosted
                      computing environment. Each instance is provisioned with
                      dedicated system resources and is accessible through
                      supported internet-connected devices.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      SmartPC Features
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Depending on your subscription tier and configuration,
                      your SmartPC instance may include the following
                      capabilities:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        <strong>Create / Start / Stop / Delete:</strong> Full
                        lifecycle management of SmartPC instances via the user
                        dashboard.
                      </li>
                      <li>
                        <strong>Resize:</strong> Ability to modify system
                        resources (CPU, RAM, and storage) directly through the
                        dashboard.
                        <br />
                        <span className="text-yellow-700 dark:text-yellow-400">
                          ⚠️ Storage downgrade (i.e., reducing allocated disk
                          size) is not supported.
                        </span>
                      </li>
                      <li>
                        <strong>OS Access:</strong> Secure login to a
                        pre-configured operating system. Supported options
                        include:
                        <ul className="list-disc pl-6 mt-1">
                          <li>Microsoft Windows</li>
                          <li>Linux (Ubuntu)</li>
                        </ul>
                        The selected OS is installed during provisioning and may
                        vary by configuration.
                      </li>
                      <li>
                        <strong>Storage:</strong> Integrated storage is provided
                        via the Main Disk and, optionally, Additional Disks. The
                        Main Disk includes user data and system files;
                        Additional Disks can be attached for expanded capacity.
                      </li>
                      <li>
                        <strong>Monitoring:</strong> Real-time monitoring tools
                        display usage statistics including CPU usage, memory
                        load, and instance uptime via the dashboard.
                      </li>
                      <li>
                        <strong>User Management:</strong> Role-based user
                        control for SmartPC access and administration. Supported
                        roles include:
                        <ul className="list-disc pl-6 mt-1">
                          <li>
                            Owners – Can manage all users and administrators,
                            modify permissions, and assign SmartPCs.
                          </li>
                          <li>
                            Administrators – Can manage users and other admins
                            within their organization scope (if designated).
                          </li>
                        </ul>
                        These roles help ensure secure, scalable management of
                        access across teams and departments.
                      </li>
                      <li>
                        <strong>Invite User:</strong> Only the account owner or
                        assigned administrators can invite new users to the
                        platform. Invitations are typically sent via email and
                        require acceptance before access is granted.
                      </li>
                      <li>
                        <strong>Assign/Remove SmartPC to/from Users:</strong>{" "}
                        SmartPCs can be flexibly allocated to a single user.
                        <br />
                        <span className="text-yellow-700 dark:text-yellow-400">
                          ⚠️ Each SmartPC can only be assigned to one user at a
                          time.
                        </span>
                      </li>
                      <li>
                        <strong>Auto Start/Stop Scheduling:</strong> Configure
                        instances to automatically power on or off based on
                        custom time schedules to optimize cost and performance.
                      </li>
                      <li>
                        <strong>Idle Timeout:</strong> SmartPCs will
                        automatically shut down after 6 hours of inactivity by
                        default. This setting is configurable by the owner or
                        admin.
                      </li>
                      <li>
                        <strong>Support:</strong> Support is available via email
                        or through our in-app support ticket system. Response
                        times may vary by plan tier.
                      </li>
                      <li>
                        <strong>Notifications:</strong> Users may receive
                        system-generated alerts regarding usage, billing,
                        performance, or scheduling via the dashboard and/or
                        email.
                      </li>
                    </ul>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Access Methods
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      SmartPCs can be accessed through the following interfaces:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Modern web browsers</li>
                      <li>
                        Official Senseminder desktop client applications
                        (Windows/macOS)
                      </li>
                      <li>Mobile applications (if available and supported)</li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Users are responsible for maintaining their own internet
                      connectivity and compatible access devices.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Internet Connectivity Requirement
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      All Senseminder services, including SmartPC, require a
                      stable and active internet connection. We are not
                      responsible for degraded performance, latency, or access
                      interruptions caused by user-side network issues.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Hardware Optimization and Resource Scaling
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Senseminder may implement backend optimization measures to
                      ensure platform stability and resource efficiency. These
                      measures may include auto-scaling or reallocation of
                      unused resources. Inactive or underutilized SmartPCs may
                      be paused temporarily with advance notice where
                      applicable.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Infrastructure & Third-Party Hosting Providers
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Senseminder operates using trusted third-party cloud
                      infrastructure providers. Specifically:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Amazon EC2 (Elastic Compute Cloud) is used to provision,
                        host, and manage SmartPC virtual desktop instances.
                      </li>
                      <li>
                        Amazon S3 (Simple Storage Service) is used for secure
                        file storage, snapshots, and backup operations for
                        SmartStorage.
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      By using our Services, you consent to your data and
                      compute workloads being processed and stored in AWS data
                      centers. Your use of the Services is also subject to
                      compliance with applicable AWS legal frameworks, including
                      their{" "}
                      <a
                        href="https://aws.amazon.com/terms/?nc1=f_pr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 underline"
                      >
                        Service Terms
                      </a>{" "}
                      and{" "}
                      <a
                        href="https://aws.amazon.com/aup/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 underline"
                      >
                        Acceptable Use Policy
                      </a>
                      . Senseminder ensures that all infrastructure partners
                      meet security, availability, and compliance standards.
                    </p>
                  </div>
                </div>
              )}
              {activeSection === "subscription-terms" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      Subscription Terms
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      Senseminder operates on a subscription-based billing
                      model, allowing users to select service plans based on
                      their computing and storage needs. This section outlines
                      the terms governing subscription plans, billing triggers,
                      renewals, and the integrated wallet system.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Plan Types: Hourly, Daily, Monthly
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Senseminder offers the following SmartPC subscription
                      plans:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white mt-2">
                      <li>
                        <strong>Hourly Plan:</strong> Charges for compute
                        resources are incurred only when the SmartPC is in a
                        running state, calculated in one-hour increments. Usage
                        of less than 60 minutes is rounded up to a full hour.
                        <br />
                        <span className="text-yellow-700 dark:text-yellow-400">
                          ⚠️ SSD storage charges (Main Disk and any Additional
                          Disks) continue to apply even when the SmartPC is
                          stopped, as these volumes remain allocated and
                          reserved for your use.
                        </span>
                      </li>
                      <li>
                        <strong>Daily Plan:</strong> A flat daily rate is
                        charged upfront upon SmartPC creation and every 24 hours
                        thereafter, regardless of whether the SmartPC is running
                        or stopped.
                      </li>
                      <li>
                        <strong>Monthly Plan:</strong> A flat monthly fee is
                        charged in advance and renews every 30 days, covering
                        SmartPC usage for the entire term, regardless of
                        instance state (running or stopped).
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Users may select their preferred plan during SmartPC setup
                      or change it later through the dashboard, subject to
                      upgrade/downgrade rules.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Subscription Start Date
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Your subscription period begins upon one of the following
                      events:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Successful each SmartPC creation (for Hourly, Daily, or
                        Monthly plans)
                      </li>
                      <li>
                        Initiating any upload or activity in SmartStorage (e.g.,
                        uploading files or generating storage usage)
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      This marks the start of your billing obligations under the
                      selected plan(s), regardless of actual usage thereafter.
                      Billing will follow the terms applicable to the chosen
                      plan (hourly, daily, monthly, or tiered).
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Upfront Billing Policy
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      All subscription fees, including those for SmartPC usage
                      (Hourly, Daily, Monthly) and SmartStorage, are charged
                      upfront at the beginning of each billing cycle:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Hourly Plan: Charges are applied immediately upon
                        starting a SmartPC.
                      </li>
                      <li>
                        Daily Plan: Charges are applied when a new daily cycle
                        begins.
                      </li>
                      <li>
                        Monthly Plan: Charges are applied on the first day of
                        the monthly term.
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      This also applies to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        SmartStorage intelligent tier billing (on cycle start or
                        tier change)
                      </li>
                      <li>Additional disk volumes (when provisioned)</li>
                    </ul>
                    <p className="text-yellow-700 dark:text-yellow-400 mt-2">
                      ⚠️ No proration or postpaid billing is supported. You are
                      solely responsible for maintaining a sufficient wallet
                      balance to avoid service interruptions.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Activation & Billing Triggers
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Billing may be triggered by the following:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>SmartPC instance creation or resumption</li>
                      <li>Instance remains running</li>
                      <li>Billing cycle auto-renews</li>
                      <li>Additional Disks are provisioned</li>
                      <li>Instance is resized</li>
                      <li>SmartStorage tier thresholds are crossed</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Automatic Renewal
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      All plans are set to auto-renew by default at the end of
                      their respective billing cycles. You may change or cancel
                      your plan prior to renewal. Changes take effect at the end
                      of the current billing period.
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-400 mt-2">
                      ⚠️ No refunds will be issued for unused time once a
                      billing cycle begins.
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-400 mt-2">
                      ⚠️ If you’re on the Hourly Plan and the instance remains
                      stopped, compute charges will not apply — but SSD storage
                      costs will still be billed hourly.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Trial Period (If Applicable)
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Senseminder may, at its discretion, offer limited-time
                      free trials or promotional credits. Trial terms will be
                      disclosed at the time of offer and are subject to change
                      or discontinuation without notice.
                    </p>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      If your wallet balance becomes insufficient during a
                      trial:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Your SmartPC will be automatically stopped.</li>
                      <li>
                        Billing from wallet will begin immediately once the
                        trial ends (if not canceled in time and funds are
                        available).
                      </li>
                    </ul>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Wallet System
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      All billing charges are deducted from your Senseminder
                      Wallet, a prepaid digital balance associated with your
                      user account. Wallets can be topped up via accepted
                      payment methods (e.g., credit/debit card).
                    </p>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      If your wallet balance becomes insufficient:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Your SmartPC may be automatically stopped</li>
                      <li>Storage services may be paused or suspended</li>
                      <li>You will receive low balance notifications</li>
                      <li>
                        Auto-recharge (if enabled) will attempt to refill your
                        wallet
                      </li>
                      <li>
                        Storage resumes automatically upon wallet recharge
                      </li>
                    </ul>
                    <p className="text-yellow-700 dark:text-yellow-400 mt-2">
                      ⚠️ Stopped SmartPCs will not automatically resume upon
                      recharge.
                    </p>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Wallet activity, including recharges, deductions, and
                      refunds (if any), will be visible in your billing history.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Intelligent Tier for SmartStorage
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      SmartStorage follows a dynamic, auto-tiered billing model
                      based on total storage usage across a 30-day cycle. Key
                      terms:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Tier 1 (0–20GB): Free of charge</li>
                      <li>
                        Tier 2 and above: Charges apply based on highest usage
                        observed during the billing cycle
                      </li>
                      <li>
                        Tiers increase in 20GB increments up to a system-defined
                        maximum
                      </li>
                      <li>
                        Usage reductions do not lower the active tier mid-cycle
                      </li>
                      <li>
                        Billing resets at the start of each new 30-day cycle
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      You cannot manually upgrade or downgrade your SmartStorage
                      tier. The system will automatically adjust billing based
                      on observed usage.
                    </p>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      If your usage exceeds 1,000 GB, you must contact support
                      to request higher storage allocation.
                    </p>
                  </div>
                </div>
              )}
              {activeSection === "fees-and-payment" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      Fees & Payment
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      This section outlines how payments are processed for
                      Senseminder Services, including SmartPC and SmartStorage.
                      All fees are governed by your selected subscription plan
                      and usage activity, and are payable via the integrated
                      wallet system.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Subscription Fee Explanation
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      Fees are determined based on:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        The selected SmartPC plan (Hourly, Daily, Monthly)
                      </li>
                      <li>SmartStorage intelligent tier usage</li>
                      <li>
                        Any additional services, such as Additional Disk
                        provisioning, instance resizing, or premium features
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300">
                      All fees are clearly displayed at the time of selection
                      and may vary based on configuration, duration, or usage
                      thresholds. By using the Services, you agree to pay all
                      applicable fees in accordance with the billing terms
                      presented.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Accepted Payment Methods
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      Payments to your Senseminder Wallet can be made using:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Major credit and debit cards (e.g., Visa, MasterCard,
                        American Express)
                      </li>
                      <li>
                        Other payment options (e.g., bank transfers) are
                        currently not supported
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300">
                      All payments are processed securely through Stripe, a
                      trusted third-party payment processor. By submitting
                      payment information, you authorize Stripe and Senseminder
                      to process and store your payment credentials in
                      accordance with their respective privacy and security
                      policies.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Authorization to Charge
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      By adding a payment method and using the Services, you
                      authorize Senseminder to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Charge your selected payment method for any wallet
                        recharge initiated by you
                      </li>
                      <li>
                        Initiate auto-recharge (if enabled by you) when your
                        wallet balance falls below the minimum threshold
                      </li>
                      <li>
                        Deduct applicable service fees from your wallet balance
                        automatically and continuously, as per your selected
                        subscription or usage activity
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300">
                      You are responsible for ensuring that your payment method
                      remains valid and that sufficient funds are available.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Payment Schedule
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      All billing is upfront, as outlined in Section 5:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        SmartPC charges (hourly, daily, monthly) are deducted at
                        the start of each cycle
                      </li>
                      <li>
                        SmartStorage billing is triggered at the start of the
                        storage billing cycle, based on tier
                      </li>
                      <li>
                        Additional Disk fees are applied immediately upon
                        provisioning
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300">
                      Wallet deductions occur in real-time or at the start of
                      each respective billing cycle.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Failed Payment Handling
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      If a payment attempt fails or your wallet has insufficient
                      funds:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>SmartPC instances may be automatically stopped</li>
                      <li>SmartStorage access may be suspended</li>
                      <li>
                        Auto-recharge (if configured) will attempt to restore
                        the balance
                      </li>
                      <li>
                        SmartStorage access will resume only after successful
                        payment or recharge
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300">
                      You are responsible for monitoring your wallet balance and
                      resolving payment issues promptly.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Late Fees & Interest
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      Senseminder does not charge any late fees or interest for
                      failed or delayed payments. However, access to services
                      may be suspended until the issue is resolved.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Refunds & Credit Policy
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      All charges are non-refundable once a billing cycle has
                      started, including but not limited to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Early termination of subscription</li>
                      <li>Downgrades during an active billing period</li>
                      <li>Failure to use services after activation</li>
                      <li>Auto-renewals not canceled on time</li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300">
                      Refunds may be issued only in cases of verified billing
                      errors, double charges, or unresolved service disruptions,
                      subject to review and approval by our support team.
                    </p>
                    <p className="text-paragraph dark:text-gray-300">
                      If a refund is approved:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        It will be processed either as a credit to your
                        Senseminder Wallet or returned to your original payment
                        method via Stripe
                      </li>
                      <li>
                        Stripe's refund processing times may apply and can take
                        5–10 business days depending on your card issuer or bank
                      </li>
                    </ul>
                    <p className="text-yellow-700 dark:text-yellow-400 mt-2">
                      ⚠️ Promotional credits and bonus wallet amounts have no
                      cash value and are non-refundable.
                    </p>
                  </div>
                </div>
              )}
              {activeSection === "upgrades-downgrades-add-ons" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      Upgrades, Downgrades & Add-ons
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      Senseminder allows users to modify their subscriptions and
                      allocated resources based on changing needs. This section
                      explains the policies regarding subscription changes,
                      storage allocation, and effective billing transitions.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Changing Subscription Plans
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      You may change your SmartPC subscription plan (Hourly,
                      Daily, Monthly) at any time from your dashboard. Each
                      SmartPC is treated as a separate, individually billed
                      instance. Changes made to one SmartPC will not affect
                      others under your account.
                    </p>
                    <p className="text-paragraph dark:text-gray-300">
                      The following rules apply:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        <strong>Upgrades</strong> (e.g., Hourly → Daily or
                        Monthly, or Daily → Monthly): The new plan will take
                        effect at the start of the next billing cycle. You will
                        be charged the full amount of the new plan at that time.
                      </li>
                      <li>
                        <strong>Downgrades</strong> (e.g., Monthly → Daily or
                        Hourly): Also take effect at the start of the next
                        billing cycle. You may not downgrade if your current
                        usage exceeds the limits of the lower plan.
                      </li>
                    </ul>
                    <p className="text-yellow-700 dark:text-yellow-400 mt-2">
                      ⚠️ No refunds or credits are provided for unused time when
                      switching plans mid-cycle.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Adding Storage Disks
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      Additional Disks can be added to your SmartPC instance for
                      increased capacity (if applicable). Charges are applied
                      upfront at the start of the next billing cycle. Additional
                      Disks <strong>cannot be removed</strong> once provisioned.
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-400 mt-2">
                      ⚠️ Storage downgrade is not supported. Once storage is
                      allocated, disk size cannot be reduced.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Pro-rata Billing on Upgrade
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      Senseminder does not support prorated billing. Any plan or
                      resource change will apply to the next billing cycle in
                      full. The current plan will continue uninterrupted until
                      the cycle ends.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Effective Date of Changes
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      All subscription changes and add-ons will take effect at
                      the beginning of the next billing cycle, regardless of
                      when the request is submitted.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Responsibility to Backup Before Downgrade
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      Before initiating a downgrade, resource change, or
                      instance deletion, you are solely responsible for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Backing up all relevant data and files</li>
                      <li>
                        Ensuring no critical files are dependent on resources
                        scheduled to be removed or reduced
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300">
                      Senseminder is not liable for any data loss,
                      unavailability, or incompatibility resulting from
                      user-initiated changes.
                    </p>
                  </div>
                </div>
              )}
              {activeSection === "software-license-usage" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      Software License & Usage
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      When you access and use SmartPC or any Senseminder
                      software or platform service, you are granted a limited
                      license to use our system under the following terms and
                      conditions.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Non-Exclusive, Non-Transferable License
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      Senseminder grants you a personal, limited, revocable,
                      non-exclusive, non-sublicensable, and non-transferable
                      license to access and use its software and virtual desktop
                      environments solely in accordance with these Terms of
                      Service and your active subscription.
                    </p>
                    <p className="text-paragraph dark:text-gray-300">
                      You may use the Services only for lawful purposes and
                      within the intended scope of your subscription plan.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Use Restrictions
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      You agree not to engage in any of the following prohibited
                      activities while using Senseminder Services:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Reverse engineering, modifying, decompiling, or
                        disassembling any part of the Senseminder platform or
                        SmartPC software
                      </li>
                      <li>
                        Reproducing, distributing, selling, sublicensing,
                        renting, leasing, or otherwise commercializing the
                        platform or its components
                      </li>
                      <li>
                        Using SmartPC for unauthorized or resource-intensive
                        activities, including but not limited to:
                        <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                          <li>
                            Cryptocurrency mining or blockchain validation
                          </li>
                          <li>
                            Server hosting (e.g., web servers, game servers, VPN
                            endpoints)
                          </li>
                          <li>Mass automation or bot farms</li>
                          <li>
                            Stress testing, network flooding, or penetration
                            testing
                          </li>
                        </ul>
                      </li>
                      <li>
                        Using the Services in any manner that violates
                        applicable laws, including export restrictions, data
                        privacy regulations, or intellectual property rights
                      </li>
                    </ul>
                    <p className="text-yellow-700 dark:text-yellow-400 mt-2">
                      ⚠️ Violation of these restrictions may result in immediate
                      suspension or termination of your account, with or without
                      notice, and without refund.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Open Source Licenses (If Applicable)
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      Certain software or components used within SmartPC or
                      Senseminder may be governed by open source licenses. Any
                      use of such components is subject to the license terms
                      provided with the software. These licenses may override
                      some of the restrictions in this section as explicitly
                      permitted by applicable terms.
                    </p>
                    <p className="text-paragraph dark:text-gray-300">
                      Senseminder makes such licenses available upon request
                      where applicable.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Device Limitations
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      Your use of SmartPC and Senseminder software may be
                      subject to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Concurrent session limits</li>
                      <li>Device access restrictions</li>
                      <li>
                        Region-based limitations based on your subscription or
                        system configuration
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300">
                      You may only access SmartPC instances through approved
                      access methods (web, desktop client, or mobile app) and
                      may not bypass security protocols to run unauthorized
                      connections.
                    </p>
                  </div>
                </div>
              )}
              {activeSection === "user-content-data" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      User Content & Data
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      As a Senseminder user, you may upload, store, and manage
                      your files, documents, and other digital content through
                      SmartPC and SmartStorage. This section outlines how your
                      data is handled and your responsibilities regarding that
                      data.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Data Ownership Retained by User
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      All content you create, upload, store, or transmit through
                      Senseminder (“User Content”) remains your sole property.
                      Senseminder does not claim ownership over your data.
                    </p>
                    <p className="text-paragraph dark:text-gray-300">
                      However, by using our services, you grant Senseminder and
                      its infrastructure providers a limited license to store,
                      process, and transmit your content solely for the purpose
                      of delivering the services to you.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Backup Responsibility
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      Senseminder does not guarantee backups of any user content
                      or system state. You are solely responsible for
                      maintaining independent backups of important files and
                      system configurations stored within:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Your SmartPC instance (including Main and Additional
                        Disks)
                      </li>
                      <li>SmartStorage volumes</li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300">
                      We strongly recommend users back up any critical content
                      before:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Making changes to disk configuration</li>
                      <li>Performing system-level operations</li>
                      <li>Downgrading or deleting instances</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Deletion Upon Termination
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      When a SmartPC instance is deleted:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        All associated disks (Main Disk and any Additional
                        Disks) are permanently deleted
                      </li>
                      <li>
                        Data stored in the SmartPC is immediately and
                        irreversibly lost
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300">
                      Senseminder is not liable for any loss of data caused by:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>User-initiated deletion</li>
                      <li>Billing failure</li>
                      <li>Policy violations</li>
                      <li>Inactivity</li>
                      <li>Cloud provider disruptions</li>
                      <li>System-level failures</li>
                    </ul>
                    <p className="text-yellow-700 dark:text-yellow-400 mt-2">
                      ⚠️ Deleting a SmartPC does not affect your SmartStorage
                      content. SmartStorage and SmartPC are independent services
                      with separate data lifecycles.
                    </p>
                    <p className="text-paragraph dark:text-gray-300">
                      When your entire Senseminder account is closed (whether by
                      user request or administrative action):
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        All SmartPC instances and all SmartStorage volumes
                        linked to the account will be permanently deleted
                      </li>
                      <li>
                        All associated data (disks, files, settings, user
                        content) will be irreversibly removed
                      </li>
                    </ul>
                    <p className="text-yellow-700 dark:text-yellow-400 mt-2">
                      ⚠️ Users are responsible for exporting or backing up all
                      necessary data before requesting account closure or
                      allowing the account to lapse due to unresolved billing or
                      violations.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Sharing Content with Others (User Risk)
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      If you choose to share files, folders, or SmartPC access
                      with others (e.g., via collaboration tools, file links, or
                      user invitations), you do so at your own risk.
                    </p>
                    <p className="text-paragraph dark:text-gray-300">
                      Senseminder is not responsible for any:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Unauthorized access resulting from shared links, weak
                        passwords, or misconfigured sharing permissions
                      </li>
                      <li>
                        Consequences of others modifying or deleting your
                        content once shared
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300">
                      Always verify access controls and recipients before
                      sharing sensitive data.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Storage Disk Responsibility (Main vs Additional)
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      Your SmartPC may include:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        A Main Disk, which is automatically provisioned and used
                        to store both system files and user content
                      </li>
                      <li>
                        Additional Disks (if provisioned), which are
                        user-initiated and designed to expand storage capacity
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300">
                      You are responsible for managing, securing, and
                      maintaining both disk types.
                      <br />
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-400 mt-2">
                      ⚠️ Main Disk size cannot be downgraded after provisioning.
                      Additional Disks cannot be removed once created.
                    </p>
                  </div>
                </div>
              )}
              {activeSection === "acceptable-use-code-of-conduct" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      Acceptable Use / Code of Conduct
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      To ensure fair access, platform integrity, and user
                      safety, all users must adhere to the following acceptable
                      use standards. Violations of this policy may result in
                      suspension or termination of services, without refund, and
                      possible legal action where required.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      No Harmful, Illegal, or Abusive Use
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Illegal, fraudulent, or deceptive activity</li>
                      <li>Abusive, harassing, or threatening behavior</li>
                      <li>Harm to minors or vulnerable groups</li>
                      <li>Violation of laws, including Georgia state law</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      No Interference with Platform
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Attempting to disrupt, degrade, or impair Senseminder
                        systems
                      </li>
                      <li>
                        Running load tests, DoS attacks, or automated tools
                      </li>
                      <li>Bypassing system controls or metering</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      No Sharing of Accounts
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      Each user account is intended for individual use only. You
                      may not:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Share login credentials</li>
                      <li>Allow unauthorized access to your resources</li>
                      <li>Create multiple accounts to bypass restrictions</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      No Resource Exhaustion or Exploits
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Overloading system capacity or bandwidth</li>
                      <li>
                        Participating in mining, bot farms, or mass automation
                      </li>
                      <li>Running scans, exploits, brute-force tools</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      No Unauthorized Access
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Accessing other users’ SmartPCs or data</li>
                      <li>Probing Senseminder APIs or infrastructure</li>
                      <li>Circumventing access controls or monitoring tools</li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300">
                      All access attempts are logged and may be reported to law
                      enforcement.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      No Criminal Content or Harassment
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Child exploitation or abuse</li>
                      <li>Hate speech, extremism, or incitement</li>
                      <li>Stalking, harassment, or threats</li>
                      <li>Hosting fraud, extortion, or surveillance tools</li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300">
                      Senseminder will cooperate with law enforcement for any
                      lawful investigation.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      User Roles & Account Access
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      The account owner has full administrative control and may
                      invite users as:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        <strong>Admin:</strong> Full access to SmartPCs,
                        billing, users, storage, and support tools
                      </li>
                      <li>
                        <strong>Member:</strong> Limited access. Cannot manage
                        users or billing.
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300">
                      New users must accept their invitation and update
                      temporary credentials after first login.
                      <br />
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-400 mt-2">
                      ⚠️ Account owners are responsible for all actions taken by
                      invited users.
                    </p>
                  </div>
                </div>
              )}
              {activeSection === "storage-and-os-licensing" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      Storage & OS Licensing
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      This section defines how SmartPC SSD disks are
                      provisioned, how SmartStorage differs, and how operating
                      system licenses are handled within the Senseminder
                      platform.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Default Storage Limits by Plan
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      Each SmartPC includes a Main Disk (SSD), which serves as
                      the system drive and includes:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>The operating system (Windows or Linux)</li>
                      <li>Preinstalled tools and applications</li>
                      <li>
                        A user-selected amount of SSD storage provisioned at
                        creation
                      </li>
                    </ul>
                    <p className="text-yellow-700 dark:text-yellow-400 mt-2">
                      ⚠️ The Main Disk is fixed in size once provisioned and
                      cannot be downgraded after creation.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Optional Add-on SSD (SmartPC)
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      Users may attach Additional SSD Disks to their SmartPC to
                      expand performance storage capacity. These disks are used
                      exclusively within the SmartPC environment (not for
                      long-term user file storage).
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Billed separately, and charged upfront at the beginning
                        of each billing cycle
                      </li>
                      <li>
                        Permanent once provisioned — Additional SSD Disks cannot
                        be removed or downgraded
                      </li>
                      <li>
                        SSD usage does not contribute to SmartStorage billing
                        tiers
                      </li>
                    </ul>
                    <p className="text-yellow-700 dark:text-yellow-400 mt-2">
                      ⚠️ These SSD disks are part of the SmartPC compute
                      infrastructure and are not designed for backup or
                      archiving purposes.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      SmartStorage vs SmartPC Storage
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        <strong>SmartStorage</strong> refers to long-term user
                        file storage, billed under an intelligent tier system
                        based on usage across your entire account
                      </li>
                      <li>
                        <strong>SmartPC SSD</strong> (Main + Additional Disks)
                        is ephemeral system storage, tied to specific SmartPC
                        instances and reset upon deletion
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300">
                      The two are billed and managed separately and operate
                      independently.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      Operating System Licensing
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      SmartPC instances may be provisioned with Windows or Linux
                      operating systems, based on your selected configuration:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Linux OS (e.g., Ubuntu) is provided under open-source
                        licenses and requires no activation
                      </li>
                      <li>
                        Windows OS is delivered in an unactivated state by
                        default
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300">
                      Senseminder does not supply or resell Windows licenses.
                      Users must:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Bring their own valid license key (BYOL) to activate
                        Windows, or
                      </li>
                      <li>
                        Use a Microsoft account to activate via digital
                        entitlement (if supported)
                      </li>
                    </ul>
                    <p className="text-yellow-700 dark:text-yellow-400 mt-2">
                      ⚠️ You are solely responsible for ensuring the legality
                      and validity of any license you apply.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      License Reclamation on Termination
                    </h3>
                    <p className="text-paragraph dark:text-gray-300">
                      Upon SmartPC deletion or account termination:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        All OS configurations and installed software (including
                        licenses) are permanently erased
                      </li>
                      <li>
                        Senseminder does not retain, reuse, or transfer any
                        software licenses or activation data
                      </li>
                      <li>
                        You are responsible for removing or deactivating any
                        licenses before deletion
                      </li>
                    </ul>
                  </div>
                </div>
              )}
              {activeSection === "service-availability-maintenance" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      Service Availability & Maintenance
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      Senseminder aims to provide reliable and consistent access
                      to its SmartPC and SmartStorage services. However, certain
                      limitations, maintenance activities, and external
                      dependencies may impact service availability. This section
                      outlines our commitments and disclaimers related to uptime
                      and access.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Best Effort Uptime
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Senseminder will make commercially reasonable efforts to
                      maintain high availability of its services. Our
                      infrastructure is hosted on reputable cloud providers,
                      primarily Amazon Web Services (AWS), and benefits from
                      their resilient architecture and global infrastructure.
                    </p>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      We follow the AWS Service Level Agreements, and as such,
                      we aim to deliver approximately 99% uptime on a monthly
                      basis for both SmartPC and SmartStorage services.
                    </p>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      However, you acknowledge and agree that:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>100% uninterrupted service is not guaranteed</li>
                      <li>
                        The 99% uptime target is based on AWS’s published SLAs
                        and is not separately guaranteed by Senseminder
                      </li>
                      <li>
                        This uptime target does not include scheduled
                        maintenance, user-side issues, or external disruptions
                        beyond our control
                      </li>
                    </ul>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Scheduled Maintenance Windows
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      From time to time, we may perform scheduled maintenance to
                      improve or upgrade infrastructure. During these windows:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Services may be temporarily unavailable or degraded
                      </li>
                      <li>
                        We will provide advance notice via dashboard alerts,
                        email, or status pages when feasible
                      </li>
                      <li>
                        Maintenance is typically scheduled during low-traffic
                        periods to minimize user impact
                      </li>
                    </ul>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Emergency Downtime
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      In rare circumstances, we may need to take services
                      offline immediately and without notice to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Address critical vulnerabilities or security threats
                      </li>
                      <li>Prevent service-wide disruptions</li>
                      <li>Respond to cloud provider-level outages</li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      We will make every effort to restore service promptly and
                      provide follow-up communication after the event.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      No Guarantees on Internet Performance
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Senseminder is a cloud-based service and requires a stable
                      internet connection for access. We are not responsible for
                      degraded performance, disconnections, or inability to
                      access services resulting from:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Your local network, device, or ISP</li>
                      <li>
                        High latency, packet loss, or bandwidth throttling
                      </li>
                      <li>Regional outages or internet backbone issues</li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      It is your responsibility to maintain a reliable
                      connection to use Senseminder services effectively.
                    </p>
                  </div>
                </div>
              )}
              {activeSection === "geographic-availability" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      Geographic Availability
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      Senseminder is currently optimized for use in specific
                      geographic regions. This section outlines the availability
                      of services, performance limitations, and restrictions
                      based on your location.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Supported Regions/States
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Senseminder primarily serves users within the United
                      States, with data centers located in approved AWS regions.
                      The platform is legally registered and operated under the
                      jurisdiction of the State of Georgia, USA.
                    </p>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Services are available to users in:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        All U.S. states that do not prohibit cloud-based remote
                        desktop or storage services
                      </li>
                      <li>
                        Other countries or territories where permitted by local
                        laws and AWS infrastructure is supported
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      We may limit or restrict access to the Services in certain
                      jurisdictions to comply with regulatory requirements,
                      sanctions, or technical constraints.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Right to Suspend Use Outside Permitted Zones
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Senseminder reserves the right to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Restrict or suspend access to users operating from
                        unsupported regions or jurisdictions
                      </li>
                      <li>
                        Prevent usage in countries prohibited by U.S. export
                        laws, sanctions, or embargoes
                      </li>
                      <li>
                        Require users to verify their geographic location when
                        legally or technically necessary
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Attempting to bypass location restrictions (e.g., using
                      VPNs or proxies) may result in suspension or termination
                      of your account.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      No Guarantees on Performance When Used Outside Proximity
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Senseminder is optimized for low-latency access within
                      supported AWS zones. If you use the Services:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>From a distant geographic location, or</li>
                      <li>In a region with limited network infrastructure</li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      … you may experience delays, degraded performance, or
                      connectivity issues. We provide no guarantees regarding
                      service quality, response times, or feature access outside
                      supported geographic zones.
                    </p>
                  </div>
                </div>
              )}
              {activeSection === "third-party-services-and-dependencies" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      Third-Party Services & Dependencies
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      Senseminder relies on various third-party providers and
                      services to deliver the functionality, performance, and
                      reliability of its platform. This section explains how
                      those integrations work and clarifies your rights and
                      responsibilities regarding external services.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Use of Integrated Apps/Services
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Senseminder services may include integrations with or
                      dependencies on third-party technologies and platforms,
                      including but not limited to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Amazon Web Services (AWS) – for infrastructure (SmartPC,
                        SmartStorage)
                      </li>
                      <li>Stripe – for secure payment processing</li>
                      <li>
                        Email and notification providers – for alerts and
                        communication
                      </li>
                      <li>
                        Open-source software or operating systems (e.g., Linux)
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      These third-party tools are necessary for the proper
                      operation of the platform and may include both embedded
                      functionality and external API interactions.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Third-Party Terms & Conditions Apply
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Your use of any third-party services through Senseminder
                      is also governed by the terms, policies, and licensing
                      agreements of those providers.
                    </p>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      You are responsible for reviewing and complying with any
                      applicable third-party terms when using services that rely
                      on or integrate with:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        AWS Terms of Service:{" "}
                        <a
                          href="https://aws.amazon.com/service-terms/"
                          className="text-blue-600 underline"
                        >
                          AWS Service Terms
                        </a>
                      </li>
                      <li>
                        Stripe Services Agreement:{" "}
                        <a
                          href="https://stripe.com/legal/ssa"
                          className="text-blue-600 underline"
                        >
                          Stripe Services Agreement - United States
                        </a>
                      </li>
                      <li>
                        Microsoft License Terms (if BYOL):{" "}
                        <a
                          href="https://www.microsoft.com/licensing/"
                          className="text-blue-600 underline"
                        >
                          Microsoft Licensing Resources
                        </a>
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Senseminder does not control or modify the terms imposed
                      by these providers.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Senseminder Not Liable for Third-Party Failures
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Senseminder is not responsible or liable for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Service outages, data loss, or performance issues caused
                        by third-party vendors
                      </li>
                      <li>
                        Failures in upstream infrastructure (e.g., AWS region
                        downtime)
                      </li>
                      <li>
                        Payment or processing delays caused by external gateways
                        (e.g., Stripe API issues)
                      </li>
                      <li>
                        Licensing or support delays associated with third-party
                        OS/software tools
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      While we make best efforts to maintain service continuity,
                      you acknowledge that some dependencies are outside of
                      Senseminder’s direct control.
                    </p>
                  </div>
                </div>
              )}
              {activeSection === "termination-and-suspension" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      Termination & Suspension
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      This section outlines how your account or access to
                      services may be terminated or suspended, either by you or
                      Senseminder, and what happens to your data afterward.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      User-Initiated Cancellation
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      You may cancel your Senseminder account at any time by:
                    </p>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Submitting a formal request to our support team
                    </p>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Upon cancellation:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        All active SmartPC instances and SmartStorage data will
                        be permanently deleted
                      </li>
                      <li>
                        All future subscription charges will be stopped (no
                        refunds for remaining cycle time)
                      </li>
                      <li>
                        It is your responsibility to back up any critical data
                        prior to closure
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Account deletion is irreversible, and data cannot be
                      recovered once removal is complete.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Provider-Initiated Termination
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Senseminder reserves the right to terminate or suspend
                      your access with or without notice if:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        You breach these Terms of Service or Acceptable Use
                        Policy
                      </li>
                      <li>
                        We detect fraudulent activity, abuse, or attempts to
                        bypass system controls
                      </li>
                      <li>
                        Your wallet or billing account remains unpaid or
                        insufficient beyond our grace period
                      </li>
                      <li>
                        Your usage violates legal, regulatory, or compliance
                        obligations
                      </li>
                    </ul>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Immediate Suspension Rights
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      In cases of suspected fraud, abuse, security risk, or
                      policy violation, we may:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Immediately suspend your account or service access
                      </li>
                      <li>Block access to SmartPCs or SmartStorage</li>
                      <li>
                        Begin a review or investigation into your activity
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Suspension may occur without prior warning and does not
                      entitle you to compensation.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      No Refunds After Breach-Based Termination
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      If your account is suspended or terminated due to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>A confirmed violation of the Terms</li>
                      <li>Fraud, illegal activity, or system abuse</li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      … you will not be eligible for any refunds, credits, or
                      recovery of unused wallet balance.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Data Deletion Policy & Timeline
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Upon account termination (user-initiated or
                      provider-initiated):
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        All associated SmartPCs, disks, and SmartStorage data
                        will be permanently deleted
                      </li>
                      <li>
                        Data deletion may occur immediately or within 24–72
                        hours, depending on the system
                      </li>
                      <li>
                        No retention or recovery is available beyond this point
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      You are solely responsible for exporting any personal
                      content, licenses, or backups before your account is
                      closed or services are suspended.
                    </p>
                  </div>
                </div>
              )}
              {activeSection === "intellectual-property" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      Intellectual Property
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      All intellectual property rights related to the
                      Senseminder platform, services, and associated materials
                      are protected under applicable law. This section outlines
                      your rights and restrictions regarding the use of our
                      proprietary assets.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Ownership of Platform, Software, and Brand
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      The entire Senseminder platform — including its code,
                      design, content, and system architecture — is the
                      exclusive property of Senseminder LLC, a registered
                      business in the State of Georgia, USA.
                    </p>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      All rights, title, and interest in and to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>SmartPC and SmartStorage technologies</li>
                      <li>Backend systems and APIs</li>
                      <li>Web, desktop app, and mobile interfaces</li>
                      <li>Business processes and workflows</li>
                      <li>
                        Any improvements, customizations, or derivative works
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      … remain the sole and exclusive property of Senseminder
                      LLC. Nothing in this Agreement grants you any ownership or
                      right to use our intellectual property except as expressly
                      permitted by us.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Restrictions on Copying or Reuse
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      You agree not to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Copy, reproduce, license, sublicense, distribute, sell,
                        or commercially exploit any portion of the Senseminder
                        platform
                      </li>
                      <li>
                        Reverse engineer, decompile, or disassemble platform
                        software
                      </li>
                      <li>
                        Use the platform for benchmarking, scraping, or building
                        competitive services
                      </li>
                      <li>
                        Modify, adapt, or create derivative works based on any
                        component of the service
                      </li>
                      <li>
                        Use content from the service for public display,
                        training AI models, or advertising without prior written
                        consent
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Violations may result in immediate termination and legal
                      action.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Trademarks and Copyright
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      All logos, graphics, product names, and branding elements
                      associated with Senseminder are trademarks or registered
                      trademarks of Senseminder LLC
                    </p>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      You may not use any such marks in a manner that:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Creates confusion about affiliation or endorsement
                      </li>
                      <li>Dilutes or misrepresents the brand</li>
                      <li>Violates trademark or publicity rights</li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      All platform code and creative content are protected by
                      U.S. and international copyright laws. Unauthorized use is
                      strictly prohibited and may result in enforcement
                      measures.
                    </p>
                  </div>
                </div>
              )}
              {activeSection === "limitation-of-liability" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      Limitation of Liability
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      The Senseminder platform is provided with reasonable care
                      and effort, but certain limitations of liability apply to
                      your use of the services. This section outlines
                      disclaimers, risk assumptions, and financial limits on
                      liability.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      “As-Is” and “As-Available” Disclaimer
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      The Senseminder platform, including SmartPC, SmartStorage,
                      dashboards, apps, and APIs, is provided on an “as-is” and
                      “as-available” basis, without warranties of any kind,
                      either express or implied.
                    </p>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      We do not guarantee that:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        The service will meet your specific needs or
                        expectations
                      </li>
                      <li>
                        Access will be uninterrupted, timely, secure, or
                        error-free
                      </li>
                      <li>Data will remain available indefinitely</li>
                      <li>
                        Issues will be resolved without potential delay or
                        impact
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      You use the service at your own risk, and assume full
                      responsibility for any outcomes or losses resulting from
                      usage.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      No Guarantee of Uninterrupted Access
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      While we strive to maintain high uptime, temporary
                      interruptions may occur due to maintenance, upgrades,
                      outages, or third-party failures (e.g., AWS, Stripe).
                    </p>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Senseminder shall not be liable for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Service interruptions, delays, or access issues</li>
                      <li>Data loss due to system error or termination</li>
                      <li>Impacts caused by your device, network, or ISP</li>
                      <li>
                        Unavailability during scheduled or emergency maintenance
                      </li>
                    </ul>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Liability Cap
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      To the maximum extent permitted by law, Senseminder’s
                      total cumulative liability for any claim, damage, or loss
                      arising from or related to the use of the platform shall
                      not exceed the greater of:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        The total fees you paid to Senseminder in the six (6)
                        months prior to the event giving rise to the claim, or
                      </li>
                      <li>One hundred U.S. dollars (USD $100)</li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      This limitation applies regardless of the cause of action,
                      including contract, tort (negligence), strict liability,
                      or otherwise — even if we have been advised of the
                      possibility of such damages.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      No Indirect or Consequential Damages
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      In no event shall Senseminder be liable for any:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Indirect, incidental, special, punitive, or
                        consequential damages
                      </li>
                      <li>
                        Loss of profits, business interruption, or loss of
                        business opportunities
                      </li>
                      <li>Cost of substitute products or services</li>
                      <li>
                        Damages resulting from system misuse, data corruption,
                        or unauthorized access
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      These exclusions apply even if any remedy fails of its
                      essential purpose.
                    </p>
                  </div>
                </div>
              )}
              {activeSection === "indemnification" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      Indemnification
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      You agree to protect, defend, and hold Senseminder
                      harmless from claims and liabilities that arise as a
                      result of your use of the platform. This section outlines
                      your legal responsibility for any harm caused to others or
                      to the company through misuse or violation of these terms.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Indemnification by User
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      You agree to indemnify, defend, and hold harmless
                      Senseminder LLC, its affiliates, officers, directors,
                      employees, contractors, and agents (collectively,
                      “Senseminder Parties”) from and against any and all:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Claims, demands, damages, losses, liabilities, costs,
                        and expenses (including reasonable attorney’s fees)
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      That arise out of or relate to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Your violation of these Terms of Service</li>
                      <li>
                        Your abuse or unauthorized use of the platform or
                        services
                      </li>
                      <li>
                        Any breach of law or infringement of third-party rights
                      </li>
                      <li>
                        Your content or data, including how it is used, shared,
                        or stored
                      </li>
                      <li>
                        Your use of the services in violation of applicable laws
                        or regulations
                      </li>
                    </ul>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Third-Party Claims
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      This indemnification also applies to any claim made by a
                      third party as a result of:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Content you upload, store, or distribute through
                        SmartStorage or SmartPC
                      </li>
                      <li>
                        Software or licenses you install or use within SmartPC
                      </li>
                      <li>
                        Illegal, fraudulent, harmful, or negligent activity
                        performed through your account
                      </li>
                      <li>
                        A third party’s use of the services through your
                        credentials, even if unauthorized
                      </li>
                    </ul>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Your Responsibilities
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        You agree to cooperate fully in the defense of any claim
                        we may be involved in under this clause
                      </li>
                      <li>
                        We reserve the right to assume the exclusive defense and
                        control of any matter otherwise subject to
                        indemnification by you
                      </li>
                      <li>
                        You may not settle any matter without our prior written
                        consent
                      </li>
                    </ul>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Shared Responsibility for Account and Platform Security
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Senseminder follows industry best practices to maintain a
                      secure infrastructure, including the use of encrypted
                      storage, firewalls, access controls, and monitoring.
                      However, platform security is a shared responsibility
                      between Senseminder and the user.
                    </p>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      You agree that:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        You are responsible for maintaining the confidentiality
                        of your login credentials, including enabling
                        multi-factor authentication (MFA) when available
                      </li>
                      <li>
                        You will not share your account or passwords with
                        unauthorized individuals
                      </li>
                      <li>
                        You are accountable for all actions taken under your
                        account, including actions by admins or invited users or
                        members
                      </li>
                      <li>
                        You will use up-to-date software and secure devices to
                        access the platform
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Senseminder is not responsible for unauthorized access or
                      data loss resulting from weak passwords, phishing attacks,
                      malware, or negligence on the user’s part.
                    </p>
                  </div>
                </div>
              )}
              {activeSection === "force-majeure" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      Force Majeure
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      Senseminder shall not be held liable for any delay,
                      interruption, or failure to perform its obligations under
                      these Terms due to events or circumstances beyond its
                      reasonable control. This includes, but is not limited to,
                      disruptions that could not have been anticipated or
                      prevented despite best efforts.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Exclusion of Liability for Events Outside Control
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      We are not responsible for failure to perform, or delay in
                      performance, that results directly or indirectly from:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Natural disasters (e.g., earthquakes, floods, storms,
                        fires)
                      </li>
                      <li>Acts of war, terrorism, sabotage, or civil unrest</li>
                      <li>
                        Internet backbone failures, power outages, DNS issues,
                        or ISP disruptions
                      </li>
                      <li>
                        Cyberattacks, ransomware, or system-wide security
                        breaches beyond our control
                      </li>
                      <li>
                        Pandemics, health emergencies, or quarantine
                        restrictions
                      </li>
                      <li>
                        Government actions, embargoes, export restrictions, or
                        regulatory shutdowns
                      </li>
                      <li>
                        Cloud provider failures or outages (e.g., AWS service
                        disruptions)
                      </li>
                      <li>Labor strikes or supply chain interruptions</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Effect of Force Majeure
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Senseminder’s obligations will be suspended for the
                        duration of the event
                      </li>
                      <li>
                        We will make reasonable efforts to mitigate the impact
                        and restore normal operations
                      </li>
                      <li>
                        No breach of contract will be deemed to occur due to
                        such failure or delay
                      </li>
                    </ul>
                  </div>
                </div>
              )}
              {activeSection === "arbitration-and-dispute-resolution" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      Arbitration & Dispute Resolution
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      This section explains how disputes between you and
                      Senseminder will be handled. By using the platform, you
                      agree to resolve most legal disputes through binding
                      arbitration, rather than in court, with limited
                      exceptions.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Mandatory Arbitration Clause
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      You agree that any dispute, claim, or controversy arising
                      out of or relating to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>These Terms of Service</li>
                      <li>Your use of the Senseminder platform</li>
                      <li>Our services, billing, or privacy practices</li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      … shall be resolved exclusively through final and binding
                      arbitration, rather than in court, except as otherwise
                      provided in this section.
                    </p>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      This agreement to arbitrate includes any claims based on
                      contract, tort, statute, fraud, misrepresentation, or any
                      other legal theory.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Location of Arbitration
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Unless otherwise agreed in writing:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Arbitration shall be conducted in the State of Georgia,
                        USA
                      </li>
                      <li>
                        Proceedings will follow the rules of the American
                        Arbitration Association (AAA) or a comparable service
                      </li>
                      <li>
                        The arbitrator will be a neutral third party, and their
                        decision will be final and enforceable in any court of
                        competent jurisdiction
                      </li>
                    </ul>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Small Claims Court Exception
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Either party may choose to bring an eligible dispute in
                      small claims court instead of arbitration, provided:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        The claim remains within the jurisdictional limits of
                        that court
                      </li>
                      <li>
                        The matter is pursued on an individual (not class or
                        group) basis
                      </li>
                    </ul>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Opt-Out Mechanism
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      You may opt out of this arbitration agreement within 30
                      days of first accepting these Terms by sending written
                      notice to:
                    </p>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      <strong>
                        Senseminder LLC
                        <br />
                        Attn: Legal Department
                        <br />
                        [Insert Legal Address in Georgia]
                        <br />
                        Email:
                      </strong>{" "}
                      <a
                        href="mailto:legal@senseminder.com"
                        className="text-blue-600 dark:text-blue-400 underline"
                      >
                        legal@senseminder.com
                      </a>
                      <br />
                      <strong>Subject:</strong> Arbitration Opt-Out
                    </p>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Your opt-out notice must include your full name, email
                      address associated with your account, and an unambiguous
                      statement that you wish to opt out of arbitration.
                    </p>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      If you opt out, all disputes will be handled in the state
                      or federal courts located in Georgia, USA.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      No Class Actions
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      You agree to bring any claims only in your individual
                      capacity, and not as a plaintiff or class member in any
                      purported:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>Class action</li>
                      <li>Consolidated action</li>
                      <li>Representative proceeding</li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      The arbitrator may not consolidate multiple parties’
                      claims or preside over any form of a representative or
                      class proceeding.
                    </p>
                  </div>
                </div>
              )}
              {activeSection === "modifications-to-terms" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      Changes to the Terms
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      Senseminder may update these Terms of Service periodically
                      to reflect changes in legal requirements, business
                      practices, or service offerings. This section explains how
                      such changes will be communicated and your rights in
                      response.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Notification of Changes
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      We reserve the right to modify or update these Terms at
                      any time. When changes are made, we will:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Update the “Last Modified” date at the top of the
                        document
                      </li>
                      <li>
                        Provide notice of material changes through email,
                        dashboard notifications, or our website
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      You are responsible for reviewing these Terms regularly.
                      Continued use of the platform after changes are posted
                      constitutes acceptance.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      30-Day Window to Accept or Reject
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      If we make material changes to these Terms:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        We will provide at least 30 days' advance notice before
                        the changes take effect
                      </li>
                      <li>
                        During this period, you may review and decide whether to
                        continue using the platform under the new terms
                      </li>
                    </ul>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      User Rights on Change Refusal
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      If you do not agree to the revised Terms:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        You may choose to close your account before the
                        effective date
                      </li>
                      <li>
                        If you continue using Senseminder services after the new
                        Terms become effective, your usage will be deemed as
                        acceptance of the changes
                      </li>
                    </ul>
                    <p className="text-yellow-700 dark:text-yellow-400 mt-2">
                      ⚠️ We do not offer refunds for prepaid subscriptions in
                      cases where you reject updated terms unless required by
                      law.
                    </p>
                  </div>
                </div>
              )}
              {activeSection === "communication-and-notices" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      Communication & Notices
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      This section outlines how official communications between
                      you and Senseminder will be handled and what methods are
                      considered valid for delivering important notices.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Official Channels of Communication
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Senseminder may deliver legal, billing, technical, or
                      account-related notices using one or more of the following
                      methods:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Email sent to the address associated with your user
                        account
                      </li>
                      <li>In-app or dashboard notifications</li>
                      <li>
                        Updates posted to our official website or status page
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      These communications will be considered received and
                      effective upon transmission, regardless of whether you
                      read or acknowledge them.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      User’s Responsibility to Maintain Contact Information
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      You are responsible for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black dark:text-white">
                      <li>
                        Maintaining a valid and accessible email address
                        associated with your account
                      </li>
                      <li>
                        Monitoring your inbox and Senseminder dashboard for
                        important notices or service alerts
                      </li>
                      <li>
                        Updating your contact information in the event of any
                        changes
                      </li>
                    </ul>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Failure to receive notices due to an outdated or inactive
                      email address does not relieve you of your
                      responsibilities under these Terms.
                    </p>
                  </div>
                </div>
              )}
              {activeSection === "miscellaneous" && (
                <div>
                  <div className="space-y-4 p-8">
                    <h2 className="font-space-grotesk font-semibold text-2xl md:text-3xl">
                      Miscellaneous
                    </h2>
                  </div>
                  <hr />
                  <div className="space-y-4 p-8">
                    <p className="text-paragraph dark:text-gray-300">
                      This section contains general legal provisions that apply
                      to the Terms of Service as a whole and help clarify how
                      the agreement operates in various situations.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Entire Agreement
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      These Terms of Service, together with the Privacy Policy,
                      Cookie Policy, Subscription Plans, and any applicable
                      addendums or legal notices, constitute the entire
                      agreement between you and Senseminder regarding your use
                      of the platform and services. They supersede all prior
                      agreements or understandings, whether written or oral.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      No Waiver
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Our failure to enforce any provision of these Terms shall
                      not be construed as a waiver of that provision or any
                      other rights we may have. Any waiver must be in writing
                      and signed by an authorized representative of Senseminder.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Severability
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      If any provision of these Terms is found to be invalid,
                      illegal, or unenforceable by a court of competent
                      jurisdiction, the remaining provisions shall remain in
                      full force and effect. That portion will be modified as
                      necessary to reflect the original intent in a legally
                      valid manner.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Assignment Restrictions
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      You may not assign, transfer, or sublicense your rights or
                      obligations under these Terms without our prior written
                      consent. Any attempted assignment without permission is
                      null and void.
                    </p>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      Senseminder may freely assign or transfer these Terms to
                      an affiliate or in connection with a merger, acquisition,
                      corporate reorganization, or sale of assets.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Governing Law & Jurisdiction
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      These Terms are governed by and construed in accordance
                      with the laws of the State of Georgia, USA, without regard
                      to its conflict of law principles. Except for disputes
                      resolved via arbitration, you agree to submit to the
                      exclusive jurisdiction of the courts located in Georgia
                      for any legal action relating to these Terms.
                    </p>

                    <h3 className="text-xl font-semibold text-black dark:text-white mt-6">
                      Language Control Clause
                    </h3>
                    <p className="text-paragraph dark:text-gray-300 mt-2">
                      These Terms are provided in English. In the event of any
                      discrepancy or conflict between translated versions and
                      the English version, the English version shall control.
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

export default Terms;
