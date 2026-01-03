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
  { href: "/tutorials", text: "Tutorials", icon: "tutorials-icon" },
  { href: "/privacy", text: "Privacy Policy", icon: "privacy-policy-icon" },
  { href: "/terms", text: "Terms of Service", icon: "terms-icon" },
];

const product = [
  { icon: "computer1", text: "Sense PC", href: "/products/sensepc" },
  { icon: "storage", text: "Sense Cloud", href: "/products/sensecloud" },
];

// ✅ routes where we want the footer but WITHOUT the glow blobs
const noGlowRoutes = ["/build-sensepc", "/contact", "/tutorials"];

const Footer = () => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/pc-viewer")
  ) {
    return null;
  }

  const hideGlow = noGlowRoutes.some((route) => pathname?.startsWith(route));

  return (
    <footer
      className="relative overflow-visible min-h-[190px] font-['Inter'] text-white"
      aria-label="Site footer"
    >
      {/* Glow background layers (home only, disabled for some routes) */}
      {!hideGlow && (
        <>
          <div className="h-[150px] w-[400px] md:h-[248px] md:w-[995px] z-0 absolute -top-10 left-0 md:top-[-95px] md:left-48 bg-[#4027E5] rounded-[50%] blur-[160px] md:blur-[200px] opacity-40" />
          <div className="h-[150px] w-[400px] md:h-[248px] md:w-[995px] z-0 absolute -top-20 right-0 md:top-[-165px] md:right-48 bg-[#9C05BF] rounded-[50%] blur-[160px] md:blur-[200px] opacity-40" />
        </>
      )}

      {/* Background layer — same size in light/dark */}
      <div className="absolute inset-0 bg-[#020817] dark:bg-[#0208176E]" />

      {/* Content wrapper — unified spacing */}
      <div className="relative container pt-10 pb-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 items-start gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="space-y-3">
              <Image
                src="/sensepc-home-logo.png"
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
          <div className="w-full space-y-4">
            <div className="flex items-center gap-2">
              <Image
                src="/assets/svg/quick-links-icon.svg"
                alt="Quick Links"
                width={26}
                height={26}
                unoptimized
              />
              {/* ✅ heading font */}
              <h3
                className={`${HEADING_FONT} text-base font-semibold text-white`}
              >
                Quick Links
              </h3>
            </div>

            <ul className="flex flex-col gap-3 md:flex-col md:flex-nowrap">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-link font-['Inter']"
                  >
                    <Image
                      src={`/assets/svg/${link.icon}.svg`}
                      alt={link.text}
                      width={24}
                      height={24}
                      unoptimized
                    />
                    <span className="text-white/85 hover:text-white transition-colors">
                      {link.text}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product */}
          <div className="w-full space-y-4">
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
            © {currentYear} sensepc. All rights reserved.{" "}
            <span className="opacity-80">v1.9.0-beta</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
