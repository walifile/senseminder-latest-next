"use client";

import type { RootState } from "@/redux/store";

import Link from "next/link";
import React, { useState } from "react";
import { routes } from "@/constants/routes";
import { usePathname } from "next/navigation";

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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  if (
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/pc-viewer")
  ) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass-effect">
      <div className="container mx-auto py-2.5 md:py-4">
        <div className="flex items-center justify-between gap-2">
          <Logo />

          <div className="hidden md:flex items-center space-x-8">
            <ThemeToggle />
            {isAuthenticated && (
              <Link href={routes?.dashboard} className="nav-text-link">
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
              <Button asChild>
                <Link href="/auth" className="space-x-1.5">
                  <CircleUserRound />
                  Login
                </Link>
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-4 md:hidden">
            <ThemeToggle />
            <Button
              size="icon"
              className="rounded-full"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-1 pb-2 space-y-0.5 sm:px-3 glass-effect border-t border-border/5">
            {isAuthenticated && (
              <Button
                variant="ghost"
                className="text-sm w-full justify-start"
                asChild
              >
                <Link href={routes.dashboard} className="nav-text-link">
                  Home
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              className="text-sm w-full justify-start"
              asChild
            >
              <Link
                href={isAuthenticated ? routes.storage : routes.smartStorage}
                className="nav-text-link"
              >
                Sense Cloud
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="text-sm w-full justify-start"
              asChild
            >
              <Link
                href={isAuthenticated ? routes.dashboard : routes.buildPc}
                className="nav-text-link"
              >
                Build Sense PC
              </Link>
            </Button>
            {isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <Button variant="ghost" className="text-sm" asChild>
                <Link href="/auth">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
