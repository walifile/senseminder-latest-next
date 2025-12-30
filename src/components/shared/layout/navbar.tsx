

"use client";

import type { RootState } from "@/redux/store";

import Link from "next/link";
import { routes } from "@/constants/routes";
import { usePathname } from "next/navigation";
import React, { useRef, useState, useEffect } from "react";

import { Button } from "@/components/ui/button";

import { useSelector } from "react-redux";

import { X, Menu, CircleUserRound } from "lucide-react";

import { Logo } from "@/components/shared/layout/Logo";
import { ThemeToggle } from "@/components/shared/layout/theme-toggle";

import ProfileDropdown from "./profile-dropdown";

const Navbar = () => {
  const pathname = usePathname();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
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

  // Hide navbar for app-shell pages
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/pc-viewer")) {
    return null;
  }

  if (!mounted) {
    // keep layout height so page doesn't jump
    return <nav className="fixed top-0 left-0 right-0 z-50 h-[72px]" />;
  }

  return (
    <nav
      className="
        fixed top-0 left-0 right-0 z-50
        flex items-center
        backdrop-blur-[17px] backdrop-filter
        bg-white
        dark:bg-[rgba(255,255,255,0.04)]
        border-b border-[rgba(255,255,255,0.1)]
        transition-all duration-300
      "
    >
      <div className="container mx-auto py-4">
        <div className="flex items-center justify-between gap-2">
          <Logo />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-8">
            <ThemeToggle />
            {isAuthenticated && (
              <Link href={routes.dashboard} className="nav-text-link">
                Home
              </Link>
            )}
            <Link
              href={isAuthenticated ? routes.storage : routes.smartStorage}
              className="nav-text-link"
            >
              Sense Cloud
            </Link>
            <Link
              href={isAuthenticated ? routes.dashboard : routes.buildPc}
              className="nav-text-link"
            >
              Build Sense PC
            </Link>
            {isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <Button asChild className="rounded-full px-7 py-3">
                <Link
                  href="/auth"
                  className="space-x-1.5"
                  data-testid="home-sign-in-link"
                >
                  <CircleUserRound className="h-5 w-5" />
                  <span>Login</span>
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile top bar */}
          <div className="flex items-center space-x-2 md:hidden relative">
            <ThemeToggle />
            {isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <Button asChild size="icon" className="rounded-full">
                <Link
                  href="/auth"
                  aria-label="Sign in"
                  data-testid="home-sign-in-link"
                >
                  <CircleUserRound className="h-6 w-6" />
                </Link>
              </Button>
            )}
            <Button
              size="icon"
              className="rounded-full"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              ref={buttonRef}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            {/* Mobile menu */}
            {mobileMenuOpen && (
              <div className="md:hidden absolute top-full right-0 mt-2 border rounded">
                <div
                  className="
                    pt-1 pb-2 space-y-0.5
                    backdrop-blur-[17px] backdrop-filter
                    bg-white
                    dark:bg-[#010526]
                    border-t border-[rgba(255,255,255,0.1)]
                  "
                >
                  {isAuthenticated && (
                    <Button variant="ghost" className="text-sm w-full justify-start rounded-none" asChild>
                      <Link href={routes.dashboard} className="nav-text-link">
                        Home
                      </Link>
                    </Button>
                  )}
                  <Button variant="ghost" className="text-sm w-full justify-start rounded-none" asChild>
                    <Link
                      href={isAuthenticated ? routes.storage : routes.smartStorage}
                      className="nav-text-link"
                    >
                      Sense Cloud
                    </Link>
                  </Button>
                  <Button variant="ghost" className="text-sm w-full justify-start rounded-none" asChild>
                    <Link
                      href={isAuthenticated ? routes.dashboard : routes.buildPc}
                      className="nav-text-link"
                    >
                      Build Sense PC
                    </Link>
                  </Button>
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



