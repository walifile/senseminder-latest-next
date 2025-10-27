"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const socialLinks = [
  {
    href: "#",
    icon: "linkedin",
  },
  {
    href: "#",
    icon: "whatsapp-business",
  },
  {
    href: "#",
    icon: "twitter",
  },
  {
    href: "#",
    icon: "facebook",
  },
  {
    href: "#",
    icon: "instagram",
  },
  {
    href: "#",
    icon: "youtube",
  },
];

const contactInfo = [
  {
    icon: "marker-pin",
    text: "Elan Satellite Place, 3100 Commerce Avenue NW, Duluth, GA 30096, USA",
    href: null,
  },
  {
    icon: "phone-call",
    text: "+1 (646) 226-5995",
    href: "tel:+16462265995",
  },
  {
    icon: "email",
    text: "info@sensepc.com",
    href: "mailto:info@sensepc.com",
  },
];

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

  return (
    <footer
      className="relative text-white overflow-visible"
      aria-label="Site footer"
    >
      {/* Glow background layers */}
      <div className="z-0 absolute -top-10 left-1/2 -translate-x-1/2 md:-top-16 md:left-[10%] blur-[160px] md:blur-[200px] size-1/2 opacity-40 bg-[#4027E5]" />
      <div className="z-0 absolute -top-10 left-1/2 -translate-x-1/2 md:-top-20 md:right-[10%] blur-[160px] md:blur-[200px] size-1/2 opacity-40 bg-[#9C05BF]" />

      {/* Background layer */}
      <div className="absolute inset-0 bg-[#020817] dark:bg-[#0208176E]" />

      <div className="relative container pt-14 pb-6 space-y-8 md:pt-24 md:pb-5 md:space-y-12">
        <div className="grid lg:grid-cols-2 items-center gap-10 md:gap-24">
          <div className="space-y-4">
            <div className="space-y-5">
              <Image
                src="/sensepc-home-logo.png"
                alt="SensePC logo"
                width={210}
                height={60}
                className="w-[210px] h-[60px] object-contain"
              />

              <p className="text-base max-w-sm">
                Access your powerful PC from anywhere, with low latency and
                enterprise-grade security.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <a key={index} href={social.href} aria-label="Social link">
                  <Image
                    src={`/assets/svg/${social.icon}.svg`}
                    alt={`${social.icon} icon`}
                    width={20}
                    height={20}
                    unoptimized
                  />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8 md:flex-row md:justify-center md:gap-24">
            {/* Quick Links */}
            <div className="w-full space-y-4 md:w-1/2 lg:w-[35%] xl:w-[23%] md:space-y-6">
              <h3 className="font-semibold text-base">Quick Links</h3>

              <ul className="flex md:flex-col gap-3 flex-wrap">
                {[
                  { href: "/about", text: "About Us" },
                  { href: "/contact", text: "Contact" },
                  { href: "/privacy", text: "Privacy Policy" },
                  { href: "/terms", text: "Terms of Service" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-link">
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="w-full space-y-4 md:w-1/2 lg:w-[65%] xl:w-[47%] md:space-y-6">
              <h3 className="font-semibold text-base">Contact Us</h3>

              <ul className="space-y-4 md:space-y-6">
                {contactInfo.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Image
                      src={`/assets/svg/${item.icon}.svg`}
                      alt={`${item.icon} icon`}
                      width={24}
                      height={24}
                      unoptimized
                    />
                    {item.href ? (
                      <a href={item.href} className="text-link">
                        {item.text}
                      </a>
                    ) : (
                      <span className="text-link">{item.text}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 md:pt-8 border-t border-[#F8F8F8]">
          <p className="text-center text-[#F8F8F8] text-sm font-poppins">
            © {currentYear} smartpc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
