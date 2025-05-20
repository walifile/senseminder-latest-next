import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const Cookies = () => {
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
            Cookie Policy
          </h1>
          <p className="text-gray-400 mb-8">Last Updated: {lastUpdated}</p>

          <div className="glass-card p-8 rounded-xl space-y-6">
            <p className="text-gray-300">
              This Cookie Policy explains how SmartPC ("we", "us", or "our")
              uses cookies and similar technologies to recognize you when you
              visit our website and use our services. It explains what these
              technologies are and why we use them, as well as your rights to
              control our use of them.
            </p>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">What Are Cookies?</h2>
              <p className="text-gray-300">
                Cookies are small data files that are placed on your computer or
                mobile device when you visit a website. Cookies are widely used
                by website owners to make their websites work, or to work more
                efficiently, as well as to provide reporting information.
              </p>
              <p className="text-gray-300">
                Cookies set by the website owner (in this case, SmartPC) are
                called "first-party cookies". Cookies set by parties other than
                the website owner are called "third-party cookies". Third-party
                cookies enable third-party features or functionality to be
                provided on or through the website (e.g., advertising,
                interactive content, and analytics). The parties that set these
                third-party cookies can recognize your computer both when it
                visits the website in question and also when it visits certain
                other websites.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Why Do We Use Cookies?</h2>
              <p className="text-gray-300">
                We use first-party and third-party cookies for several reasons.
                Some cookies are required for technical reasons in order for our
                websites to operate, and we refer to these as "essential" or
                "strictly necessary" cookies. Other cookies also enable us to
                track and target the interests of our users to enhance the
                experience on our websites and services. Third parties serve
                cookies through our websites for advertising, analytics, and
                other purposes.
              </p>

              <h3 className="text-xl font-medium">Types of Cookies We Use</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-primary">
                    Essential Cookies
                  </h4>
                  <p className="text-gray-300">
                    These cookies are strictly necessary to provide you with
                    services available through our website and to use some of
                    its features, such as access to secure areas. Because these
                    cookies are strictly necessary to deliver the website, you
                    cannot refuse them without impacting how our website
                    functions.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-primary">
                    Performance and Functionality Cookies
                  </h4>
                  <p className="text-gray-300">
                    These cookies are used to enhance the performance and
                    functionality of our website but are non-essential to its
                    use. However, without these cookies, certain functionality
                    may become unavailable.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-primary">
                    Analytics and Customization Cookies
                  </h4>
                  <p className="text-gray-300">
                    These cookies collect information that is used either in
                    aggregate form to help us understand how our website is
                    being used or how effective our marketing campaigns are, or
                    to help us customize our website for you.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-primary">
                    Advertising Cookies
                  </h4>
                  <p className="text-gray-300">
                    These cookies are used to make advertising messages more
                    relevant to you. They perform functions like preventing the
                    same ad from continuously reappearing, ensuring that ads are
                    properly displayed, and in some cases selecting
                    advertisements that are based on your interests.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-primary">
                    Social Media Cookies
                  </h4>
                  <p className="text-gray-300">
                    These cookies are used to enable you to share pages and
                    content that you find interesting on our website through
                    third-party social networking and other websites. These
                    cookies may also be used for advertising purposes.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                How Can You Control Cookies?
              </h2>
              <p className="text-gray-300">
                You have the right to decide whether to accept or reject
                cookies. You can exercise your cookie preferences by clicking on
                the appropriate opt-out links provided in the cookie table
                above.
              </p>
              <p className="text-gray-300">
                You can also set or amend your web browser controls to accept or
                refuse cookies. If you choose to reject cookies, you may still
                use our website though your access to some functionality and
                areas of our website may be restricted. As the means by which
                you can refuse cookies through your web browser controls vary
                from browser to browser, you should visit your browser's help
                menu for more information.
              </p>
              <p className="text-gray-300">
                In addition, most advertising networks offer you a way to opt
                out of targeted advertising. If you would like to find out more
                information, please visit{" "}
                <a
                  href="http://www.aboutads.info/choices/"
                  className="text-primary hover:underline"
                >
                  http://www.aboutads.info/choices/
                </a>{" "}
                or{" "}
                <a
                  href="http://www.youronlinechoices.com"
                  className="text-primary hover:underline"
                >
                  http://www.youronlinechoices.com
                </a>
                .
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Do Not Track</h2>
              <p className="text-gray-300">
                Some browsers have a "Do Not Track" feature that lets you tell
                websites that you do not want to have your online activities
                tracked. These features are not yet uniform, so we are currently
                not set up to respond to those signals.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Cookie List</h2>
              <p className="text-gray-300">
                Here is a list of the cookies that we use. We've listed them
                here so you can choose if you want to opt-out of cookies or not.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="uppercase bg-white/5 text-gray-200">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Purpose</th>
                      <th className="px-6 py-3">Duration</th>
                      <th className="px-6 py-3">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/10">
                      <td className="px-6 py-4">_ga</td>
                      <td className="px-6 py-4">Used to distinguish users.</td>
                      <td className="px-6 py-4">2 years</td>
                      <td className="px-6 py-4">Analytics</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-6 py-4">_gid</td>
                      <td className="px-6 py-4">Used to distinguish users.</td>
                      <td className="px-6 py-4">24 hours</td>
                      <td className="px-6 py-4">Analytics</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-6 py-4">_gat</td>
                      <td className="px-6 py-4">
                        Used to throttle request rate.
                      </td>
                      <td className="px-6 py-4">1 minute</td>
                      <td className="px-6 py-4">Analytics</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-6 py-4">session_id</td>
                      <td className="px-6 py-4">
                        Used to maintain session state.
                      </td>
                      <td className="px-6 py-4">Session</td>
                      <td className="px-6 py-4">Essential</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-6 py-4">auth_token</td>
                      <td className="px-6 py-4">Used for authentication.</td>
                      <td className="px-6 py-4">30 days</td>
                      <td className="px-6 py-4">Essential</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                Changes to This Cookie Policy
              </h2>
              <p className="text-gray-300">
                We may update this Cookie Policy from time to time in order to
                reflect, for example, changes to the cookies we use or for other
                operational, legal, or regulatory reasons. Please therefore
                re-visit this Cookie Policy regularly to stay informed about our
                use of cookies and related technologies.
              </p>
              <p className="text-gray-300">
                The date at the top of this Cookie Policy indicates when it was
                last updated.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Contact Us</h2>
              <p className="text-gray-300">
                If you have any questions about our use of cookies or other
                technologies, please email us at{" "}
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

export default Cookies;
