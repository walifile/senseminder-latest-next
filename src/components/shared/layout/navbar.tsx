"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/shared/layout/theme-toggle";
import { Logo } from "@/components/shared/layout/Logo";
import { usePathname } from "next/navigation";
import ProfileDropdown from "./profile-dropdown";
import { useSelector } from "react-redux";
import { routes } from "@/constants/routes";
import { RootState } from "@/redux/store";

const Navbar = () => {
  const pathname = usePathname();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-effect shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <Logo />

          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated && (
              <Button variant="ghost" className="text-sm" asChild>
                <Link href={routes?.dashboard}>Home</Link>
              </Button>
            )}
            <Button variant="ghost" className="text-sm" asChild>
              <Link href={routes.smartStorage}>Smart Storage</Link>
            </Button>
            <Button variant="ghost" className="text-sm" asChild>
              <Link href={routes.buildPc}>Build SmartPC</Link>
            </Button>
            <ThemeToggle />
            {isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <Button variant="ghost" className="text-sm" asChild>
                <Link href="/auth">Sign in</Link>
              </Button>
            )}
          </div>

          <div className="md:hidden">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground focus:outline-none"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-1 pb-2 space-y-0.5 sm:px-3 glass-effect border-t border-border/5">
            <Button
              variant="ghost"
              className="text-sm w-full justify-start"
              asChild
            >
              <Link href={routes.smartStorage}>Smart Storage</Link>
            </Button>
            <Button
              variant="ghost"
              className="text-sm w-full justify-start"
              asChild
            >
              <Link href={routes.buildPc}>Build SmartPC</Link>
            </Button>
            <div className="px-3 py-1">
              <ThemeToggle />
            </div>
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
