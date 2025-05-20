import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
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
            Terms of Service
          </h1>
          <p className="text-gray-400 mb-8">Last Updated: {lastUpdated}</p>

          <div className="glass-card p-8 rounded-xl space-y-6">
            <p className="text-gray-300">
              These Terms of Service ("Terms") govern your access to and use of
              SmartPC's services, website, and applications (collectively, the
              "Services"). Please read these Terms carefully before using our
              Services.
            </p>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
              <p className="text-gray-300">
                By accessing or using our Services, you agree to be bound by
                these Terms and our Privacy Policy. If you do not agree to these
                Terms, you may not access or use the Services.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">2. Changes to Terms</h2>
              <p className="text-gray-300">
                We may modify these Terms at any time. If we make changes, we
                will provide notice by posting the updated Terms on our website
                and updating the "Last Updated" date. Your continued use of the
                Services after any changes indicates your acceptance of the
                modified Terms.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                3. Account Registration
              </h2>
              <p className="text-gray-300">
                To use certain features of our Services, you may need to create
                an account. You agree to provide accurate, current, and complete
                information during the registration process and to update such
                information to keep it accurate, current, and complete.
              </p>
              <p className="text-gray-300">
                You are responsible for safeguarding your account credentials
                and for all activities that occur under your account. You agree
                to notify us immediately of any unauthorized use of your account
                or any other breach of security.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                4. Subscription and Billing
              </h2>
              <p className="text-gray-300">
                Some of our Services require payment of fees. When you subscribe
                to a paid Service, you agree to pay all fees in accordance with
                the pricing and payment terms presented to you for that Service.
              </p>
              <p className="text-gray-300">
                You authorize us to charge your designated payment method for
                these fees. If your payment method fails or your account is past
                due, we may collect fees using other collection mechanisms.
              </p>
              <p className="text-gray-300">
                All fees are exclusive of taxes, which we will charge as
                applicable. You are responsible for paying any taxes applicable
                to your use of the Services.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                5. Cancellation and Refunds
              </h2>
              <p className="text-gray-300">
                You may cancel your subscription at any time through your
                account settings or by contacting our customer support. If you
                cancel, you will not receive a refund for any fees paid, but you
                will continue to have access to the Services until the end of
                your current billing period.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">6. Acceptable Use</h2>
              <p className="text-gray-300">You agree not to:</p>

              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>
                  Use the Services in any manner that could disable, overburden,
                  damage, or impair the Services;
                </li>
                <li>
                  Use any robot, spider, or other automatic device, process, or
                  means to access the Services for any purpose;
                </li>
                <li>
                  Use the Services to transmit any material that is unlawful,
                  harmful, threatening, abusive, harassing, defamatory, obscene,
                  or otherwise objectionable;
                </li>
                <li>
                  Attempt to gain unauthorized access to, interfere with,
                  damage, or disrupt any parts of the Services, the server on
                  which the Services are stored, or any server, computer, or
                  database connected to the Services;
                </li>
                <li>
                  Attack the Services via a denial-of-service attack or a
                  distributed denial-of-service attack;
                </li>
                <li>
                  Use the Services to violate any applicable law or regulation.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                7. Intellectual Property Rights
              </h2>
              <p className="text-gray-300">
                The Services and all content, features, and functionality
                thereof are owned by SmartPC, its licensors, or other providers
                and are protected by copyright, trademark, patent, trade secret,
                and other intellectual property or proprietary rights laws.
              </p>
              <p className="text-gray-300">
                You are granted a limited, non-exclusive, non-transferable
                license to access and use the Services for personal,
                non-commercial purposes. You may not reproduce, distribute,
                modify, create derivative works of, publicly display, publicly
                perform, republish, download, store, or transmit any of the
                material on our Services, except as generally and ordinarily
                permitted through the Services according to these Terms.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                8. Disclaimer of Warranties
              </h2>
              <p className="text-gray-300">
                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE
                FULLEST EXTENT PERMISSIBLE UNDER APPLICABLE LAW, SMARTPC
                DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, BUT NOT
                LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                9. Limitation of Liability
              </h2>
              <p className="text-gray-300">
                TO THE FULLEST EXTENT PERMITTED BY LAW, SMARTPC SHALL NOT BE
                LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
                PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS,
                DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM
                YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE
                SERVICES.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">10. Indemnification</h2>
              <p className="text-gray-300">
                You agree to defend, indemnify, and hold harmless SmartPC, its
                affiliates, licensors, and service providers, and its and their
                respective officers, directors, employees, contractors, agents,
                licensors, suppliers, successors, and assigns from and against
                any claims, liabilities, damages, judgments, awards, losses,
                costs, expenses, or fees (including reasonable attorneys' fees)
                arising out of or relating to your violation of these Terms or
                your use of the Services.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                11. Governing Law and Jurisdiction
              </h2>
              <p className="text-gray-300">
                These Terms shall be governed by and construed in accordance
                with the laws of the State of California, without regard to its
                conflict of law provisions. Any legal action or proceeding
                arising out of or relating to these Terms or your use of the
                Services shall be brought exclusively in the federal or state
                courts located in San Francisco County, California, and you
                consent to the personal jurisdiction of such courts.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">12. Termination</h2>
              <p className="text-gray-300">
                We may terminate or suspend your access to the Services
                immediately, without prior notice or liability, for any reason
                whatsoever, including without limitation if you breach these
                Terms. Upon termination, your right to use the Services will
                immediately cease.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">13. Severability</h2>
              <p className="text-gray-300">
                If any provision of these Terms is held to be invalid, illegal,
                or unenforceable, such provision shall be struck from these
                Terms, and the remaining provisions shall remain in full force
                and effect.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">14. Entire Agreement</h2>
              <p className="text-gray-300">
                These Terms, together with our Privacy Policy, constitute the
                entire agreement between you and SmartPC regarding your use of
                the Services and supersede all prior agreements and
                understandings, whether written or oral.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                15. Contact Information
              </h2>
              <p className="text-gray-300">
                If you have any questions about these Terms, please contact us
                at{" "}
                <a
                  href="mailto:legal@smartpc.com"
                  className="text-primary hover:underline"
                >
                  legal@smartpc.com
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

export default Terms;
