"use client";

import type { RootState } from "@/redux/store";

import Link from "next/link";
import dynamic from "next/dynamic";
import { routes } from "@/constants/routes";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";

import { Button } from "@/components/ui/button";

import { useSelector } from "react-redux";

import { X, Menu, ChevronDown, CircleUserRound } from "lucide-react";

import { Logo } from "@/components/shared/layout/Logo";
import { ThemeToggle } from "@/components/shared/layout/theme-toggle";

const ProfileDropdown = dynamic(() => import("./profile-dropdown"), {
  ssr: false,
  loading: () => null,
});

const desktopLinkClassName =
  "nav-text-link inline-flex items-center !text-[13px] leading-none transition-all duration-200 hover:text-black hover:[text-shadow:0_1px_0_rgba(255,255,255,0.45),0_2px_6px_rgba(0,0,0,0.16)] focus-visible:outline-none focus-visible:text-black focus-visible:[text-shadow:0_1px_0_rgba(255,255,255,0.45),0_2px_6px_rgba(0,0,0,0.16)] dark:hover:text-white dark:hover:[text-shadow:0_1px_0_rgba(255,255,255,0.28),0_2px_8px_rgba(255,255,255,0.22)] dark:focus-visible:text-white dark:focus-visible:[text-shadow:0_1px_0_rgba(255,255,255,0.28),0_2px_8px_rgba(255,255,255,0.22)]";

const mobileLinkClassName =
  "w-full justify-start rounded-none text-sm hover:bg-black/5 focus-visible:bg-black/5 dark:hover:bg-white/10 dark:focus-visible:bg-white/10";

function getMarketingNavLinks(isAuthenticated: boolean) {
  return [
    { href: routes.businessOnboarding, label: "Sense PC Pro" },
    { href: routes.pricing, label: "Pricing" },
    {
      href: isAuthenticated ? routes.storage : routes.smartStorage,
      label: "Sense Cloud",
    },
    {
      href: isAuthenticated ? routes.dashboard : routes.buildPc,
      label: "Build Sense PC",
    },
  ];
}

const useCaseLinks = [
  { href: routes.useCasesRemoteWork, label: "Remote Work" },
  { href: routes.useCasesDevelopers, label: "Developers" },
  { href: routes.useCasesEducation, label: "Education" },
  { href: routes.useCasesCreative, label: "Creative Teams" },
  { href: routes.useCasesGaming, label: "Gaming" },
];

type NavbarProps = {
  seoMode?: boolean;
};

const Navbar = ({ seoMode = false }: NavbarProps) => {
  const pathname = usePathname();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [useCasesOpen, setUseCasesOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const desktopUseCasesRef = useRef<HTMLDivElement | null>(null);
  const navLinks = getMarketingNavLinks(isAuthenticated);
  const useFixedNavbar =
    pathname === routes.auth ||
    pathname === routes.signUp ||
    pathname === routes.businessSignUp;

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }

      if (
        desktopUseCasesRef.current &&
        !desktopUseCasesRef.current.contains(event.target as Node)
      ) {
        setUseCasesOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (
    !seoMode &&
    (pathname?.startsWith("/dashboard") || pathname?.startsWith("/pc-viewer"))
  ) {
    return null;
  }

  if (!seoMode && !mounted) {
    return (
      <nav
        className={
          useFixedNavbar
            ? "fixed left-0 right-0 top-0 z-50 h-[56px]"
            : "sticky top-0 z-50 h-[56px]"
        }
      />
    );
  }

  return (
    <nav
      className={`${
        useFixedNavbar ? "fixed left-0 right-0 top-0 z-50" : "sticky top-0 z-50"
      } flex items-center border-b border-slate-200/70 bg-white/95 backdrop-blur-[17px] backdrop-filter transition-all duration-300 dark:border-white/10 dark:bg-[rgba(255,255,255,0.04)]`}
    >
      <div className="container mx-auto py-2">
        <div className="flex items-center justify-between gap-2">
          <Logo />

          <div className="hidden items-center space-x-6 leading-none md:flex">
            <ThemeToggle />

            {isAuthenticated && (
              <Link href={routes.dashboard} className={desktopLinkClassName}>
                Dashboard
              </Link>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={desktopLinkClassName}
              >
                {link.label}
              </Link>
            ))}

            <div
              className="relative flex items-center"
              ref={desktopUseCasesRef}
              onMouseEnter={() => setUseCasesOpen(true)}
              onMouseLeave={() => setUseCasesOpen(false)}
            >
              <button
                type="button"
                className={`${desktopLinkClassName} relative inline-flex items-center justify-center`}
                aria-expanded={useCasesOpen}
                aria-haspopup="menu"
              >
                <span>Use Cases</span>

                <ChevronDown
                  className={`pointer-events-none absolute left-1/2 top-[calc(100%+2px)] h-3.5 w-3.5 -translate-x-1/2 transition-all duration-200 ${
                    useCasesOpen ? "opacity-100" : "opacity-0"
                  }`}
                />
              </button>

              {useCasesOpen && (
                <div className="absolute left-1/2 top-full z-20 -translate-x-1/2 pt-1">
                  <div className="min-w-[200px] overflow-hidden rounded-xl border border-slate-200/70 bg-white/95 p-1 shadow-[0_14px_36px_rgba(15,23,42,0.12)] backdrop-blur-[17px] dark:border-white/10 dark:bg-[#010526]">
                    <div className="space-y-0">
                      {useCaseLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="flex items-center justify-center rounded-lg px-3 py-1.5 text-xs leading-none text-[#1D2144] transition-all duration-150 hover:bg-[#2530F014] hover:text-black dark:text-white dark:hover:bg-white/10"
                          onClick={() => setUseCasesOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <Button asChild className="h-6 rounded-full px-4 py-0 text-xs">
                <Link
                  href="/auth"
                  className="inline-flex items-center justify-center gap-1.5"
                  data-testid="home-sign-in-link"
                >
                  <CircleUserRound className="h-3.5 w-3.5" />
                  <span>Login</span>
                </Link>
              </Button>
            )}
          </div>

          <div className="relative flex items-center space-x-2 md:hidden">
            <ThemeToggle />

            {isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <Button asChild size="icon" className="size-8 rounded-full">
                <Link
                  href="/auth"
                  aria-label="Sign in"
                  data-testid="home-sign-in-link"
                >
                  <CircleUserRound className="h-4 w-4" />
                </Link>
              </Button>
            )}

            <Button
              size="icon"
              className="size-8 rounded-full"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              ref={buttonRef}
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>

            {mobileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 rounded border md:hidden">
                <div
                  className="
                    space-y-0.5
                    border-t border-[rgba(255,255,255,0.1)]
                    bg-white
                    pb-2 pt-1
                    backdrop-blur-[17px] backdrop-filter
                    dark:bg-[#010526]
                  "
                >
                  {isAuthenticated && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-none text-sm"
                      asChild
                    >
                      <Link
                        href={routes.dashboard}
                        className="nav-text-link"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </Button>
                  )}

                  {navLinks.map((link) => (
                    <Button
                      key={link.href}
                      variant="ghost"
                      className={mobileLinkClassName}
                      asChild
                    >
                      <Link
                        href={link.href}
                        className="nav-text-link"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </Button>
                  ))}

                  <div className="border-t border-slate-200/70 pt-1 dark:border-white/10">
                    <div className="px-4 py-2 text-sm font-medium text-[#1D2144] dark:text-white">
                      Use Cases
                    </div>

                    <div className="pb-1">
                      {useCaseLinks.map((link) => (
                        <Button
                          key={link.href}
                          variant="ghost"
                          className="w-full justify-start rounded-none pl-6 text-sm hover:bg-black/5 focus-visible:bg-black/5 dark:hover:bg-white/10 dark:focus-visible:bg-white/10"
                          asChild
                        >
                          <Link
                            href={link.href}
                            className="nav-text-link"
                            onClick={() => {
                              setMobileMenuOpen(false);
                            }}
                          >
                            {link.label}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
