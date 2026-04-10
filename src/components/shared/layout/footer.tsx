"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import NewsletterForm from "@/components/shared/layout/newsletter-form";

const HEADING_FONT =
  "justify-start text-black dark:text-white text-2xl font-bold font-['Space_Grotesk'] leading-8";

const socialLinks = [
  { href: "https://www.facebook.com/officialsensepc/", icon: "facebook1" },
  { href: "https://www.instagram.com/sensepcofficial/", icon: "instagram1" },
  { href: "https://x.com/sensepcofficial/", icon: "twitter1" },
  {
    href: "https://www.linkedin.com/company/sensepcofficial/",
    icon: "linkedin1",
  },
];

const quickLinks = [
  { href: "/about", text: "About Us", icon: "about-us-icon" },
  { href: "/contact", text: "Contact", icon: "contact-icon" },
  { href: "/compare", text: "Comparisons", icon: "about-us-icon" },
  { href: "/faq", text: "FAQ", icon: "contact-icon" },
  { href: "/tutorials", text: "Tutorials", icon: "tutorials-icon", size: 16 },
  { href: "/pricing", text: "Pricing", icon: "billing", size: 14 },
  { href: "/security", text: "Security", icon: "privacy-policy-icon" },
  { href: "/privacy", text: "Privacy Policy", icon: "privacy-policy-icon" },
  { href: "/terms", text: "Terms of Service", icon: "terms-icon" },
];

const quickLinksSplitIndex = Math.ceil(quickLinks.length / 2);
const quickLinksColumns = [
  quickLinks.slice(0, quickLinksSplitIndex),
  quickLinks.slice(quickLinksSplitIndex),
];

const product = [
  { icon: "computer1", text: "Sense PC", href: "/products/sensepc" },
  {
    icon: "computer1",
    text: "Sense PC Pro",
    href: "/business/onboarding",
  },
  { icon: "storage", text: "Sense Cloud", href: "/products/sensecloud" },
];

const Footer = () => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/business/sign-up") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/pc-viewer")
  ) {
    return null;
  }

  return (
    <footer
      className="relative overflow-visible min-h-[190px] font-['Inter'] text-white"
      aria-label="Site footer"
    >
      <div className="absolute inset-0 bg-[#020817] dark:bg-[#0208176E]" />

      {/* Content wrapper — unified spacing */}
      <div className="relative container pt-10 pb-6 space-y-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_1.4fr_0.9fr_1.1fr] lg:gap-x-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="space-y-3">
              <Image
                src="/sensepc-logo-home-8.png"
                alt="SensePC logo"
                width={210}
                height={60}
                className="w-[210px] h-[60px] object-contain"
              />
              <p className="text-base max-w-sm text-white/85">
                Access your powerful PC from anywhere, with low latency and
                enterprise-grade security.
              </p>
            </div>

            <div className="flex items-center gap-3 -ml-1">
              {socialLinks.map((social, i) => (
                <a key={i} href={social.href} target="_blank" rel="noreferrer">
                  <Image
                    src={`/assets/svg/${social.icon}.svg`}
                    alt={social.icon}
                    width={28}
                    height={28}
                    unoptimized
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="w-full space-y-3 xl:pr-6 lg:-mt-1">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6 gap-y-3">
              {quickLinksColumns.map((column, columnIndex) => (
                <ul key={columnIndex} className="space-y-3">
                  {column.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-2 text-link font-['Inter']"
                      >
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center">
                          <Image
                            src={`/assets/svg/${link.icon}.svg`}
                            alt={link.text}
                            width={link.size ?? 24}
                            height={link.size ?? 24}
                            className="object-contain"
                            unoptimized
                          />
                        </span>
                        <span
                          className={`text-white/85 hover:text-white transition-colors ${
                            link.text === "Terms of Service" ||
                            link.text === "Privacy Policy"
                              ? "xl:whitespace-nowrap"
                              : ""
                          }`}
                        >
                          {link.text}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>

          {/* Product */}
          <div className="w-full space-y-4 lg:-mt-1">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/svg/product-icon.svg"
                alt="Product"
                width={26}
                height={26}
                unoptimized
              />
              {/* ✅ heading font */}
              <h3
                className={`${HEADING_FONT} text-base font-semibold text-white`}
              >
                Products
              </h3>
            </div>

            <ul className="space-y-3">
              {product.map((item, index) => (
                <li key={index} className="flex items-center gap-3 ml-0.5">
                  <Image
                    src={`/assets/svg/${item.icon}.svg`}
                    alt={item.text}
                    width={20}
                    height={20}
                    unoptimized
                  />
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-link font-['Inter'] text-white/85 hover:text-white transition-colors"
                    >
                      {item.text}
                    </Link>
                  ) : (
                    <span className="text-link font-['Inter'] text-white/85">
                      {item.text}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="w-full space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/svg/newsletter-icon.svg"
                alt="Newsletter"
                width={26}
                height={26}
                unoptimized
              />
              {/* ✅ heading font */}
              <h3
                className={`${HEADING_FONT} text-base font-semibold text-white`}
              >
                Newsletter
              </h3>
            </div>

            <div className="max-w-sm">
              <NewsletterForm variant="inline" source="footer" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#F8F8F8]/25">
          <p className="text-center text-[#F8F8F8] text-sm font-['Inter']">
            © {currentYear} SensePC® — a product of Senseminder LLC. All rights
            reserved.
            <br />
            {/* <span className="opacity-80">Cloud computing platform. Built in the USA.</span> */}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
