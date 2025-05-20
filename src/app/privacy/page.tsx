import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  const lastUpdated = "April 1, 2025";

  return (
    <main className="flex-grow pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        {/* Breadcrumb */}
        <div className="mb-8 mt-4">
          <Link
            href="/"
            className="text-primary hover:text-primary/80 flex items-center text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Privacy Policy
          </h1>
          <p className="text-gray-400 mb-8">Last Updated: {lastUpdated}</p>

          <div className="glass-card p-8 rounded-xl space-y-6">
            <p className="text-gray-300">
              At SmartPC, we are committed to protecting your privacy and
              ensuring the security of your personal information. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you use our smart PC services and website.
            </p>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Information We Collect</h2>
              <p className="text-gray-300">
                We collect information that you provide directly to us,
                information we collect automatically when you use our services,
                and information from third-party sources.
              </p>

              <h3 className="text-xl font-medium">
                Information You Provide to Us
              </h3>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>
                  Account information: When you create an account, we collect
                  your name, email address, password, and payment information.
                </li>
                <li>
                  Profile information: You may choose to provide additional
                  information such as a profile picture, job title, and company
                  name.
                </li>
                <li>
                  Communications: When you contact us or respond to our
                  communications, we collect the content of your messages and
                  your contact information.
                </li>
                <li>
                  Survey responses: We may collect information you provide in
                  response to surveys or feedback requests.
                </li>
              </ul>

              <h3 className="text-xl font-medium">
                Information We Collect Automatically
              </h3>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>
                  Usage information: We collect information about how you use
                  our services, including the features you access, the time and
                  duration of your use, and your interactions with our platform.
                </li>
                <li>
                  Device information: We collect information about the devices
                  you use to access our services, including hardware model,
                  operating system, unique device identifiers, and network
                  information.
                </li>
                <li>
                  Log information: Our servers automatically record information
                  when you use our services, including your IP address, browser
                  type, referring/exit pages, and timestamps.
                </li>
                <li>
                  Cookies and similar technologies: We use cookies, web beacons,
                  and similar technologies to collect information about your
                  browsing behavior and preferences.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                How We Use Your Information
              </h2>
              <p className="text-gray-300">
                We use the information we collect for various purposes,
                including:
              </p>

              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Providing, maintaining, and improving our services</li>
                <li>Processing your payments and managing your account</li>
                <li>
                  Communicating with you about our services, updates, and
                  promotions
                </li>
                <li>
                  Personalizing your experience and providing tailored content
                </li>
                <li>
                  Analyzing usage patterns to enhance performance and user
                  experience
                </li>
                <li>
                  Detecting, investigating, and preventing fraudulent
                  transactions and unauthorized access
                </li>
                <li>
                  Complying with legal obligations and enforcing our terms of
                  service
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                Information Sharing and Disclosure
              </h2>
              <p className="text-gray-300">
                We may share your information in the following circumstances:
              </p>

              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>
                  With service providers who perform services on our behalf
                </li>
                <li>
                  With business partners with whom we jointly offer products or
                  services
                </li>
                <li>
                  In connection with a merger, sale, or acquisition of all or a
                  portion of our business
                </li>
                <li>When required by law or to respond to legal process</li>
                <li>
                  To protect the rights, property, and safety of SmartPC, our
                  users, and the public
                </li>
                <li>With your consent or at your direction</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                Your Rights and Choices
              </h2>
              <p className="text-gray-300">
                You have certain rights regarding your personal information:
              </p>

              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>
                  Access and update your information through your account
                  settings
                </li>
                <li>
                  Opt out of marketing communications by following the
                  unsubscribe instructions
                </li>
                <li>
                  Request deletion of your personal information, subject to
                  certain exceptions
                </li>
                <li>
                  Object to the processing of your information in certain
                  circumstances
                </li>
                <li>
                  Request data portability for information you have provided to
                  us
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Data Security</h2>
              <p className="text-gray-300">
                We implement appropriate technical and organizational measures
                to protect your personal information from unauthorized access,
                loss, misuse, and alteration. However, no security system is
                impenetrable, and we cannot guarantee the security of our
                systems or your information.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                International Data Transfers
              </h2>
              <p className="text-gray-300">
                We may transfer, store, and process your information in
                countries other than your country of residence. When we do so,
                we take appropriate measures to protect your information and
                comply with applicable data protection laws.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Children's Privacy</h2>
              <p className="text-gray-300">
                Our services are not directed to children under the age of 13,
                and we do not knowingly collect personal information from
                children under 13. If we learn that we have collected personal
                information from a child under 13, we will take steps to delete
                that information as soon as possible.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                Changes to This Privacy Policy
              </h2>
              <p className="text-gray-300">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last Updated" date. We encourage you
                to review this Privacy Policy periodically for any changes.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Contact Us</h2>
              <p className="text-gray-300">
                If you have any questions or concerns about this Privacy Policy
                or our data practices, please contact us at{" "}
                <a
                  href="mailto:privacy@smartpc.com"
                  className="text-primary hover:underline"
                >
                  privacy@smartpc.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Privacy;
