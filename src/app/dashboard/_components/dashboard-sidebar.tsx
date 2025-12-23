"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { routes } from "@/constants/routes";
import { useRouter, usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import {
  X,
  Menu,
  Users,
  LogOut,
  Shield,
  Monitor,
  LifeBuoy,
  HardDrive,
  CreditCard,
  GraduationCap,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import { handleSignOut } from "@/lib/services/auth";

import { Logo } from "@/components/shared/layout/Logo";

const navItems = [
  {
    name: "Sense PC",
    path: routes.dashboard,
    icon: Monitor,
  },
  {
    name: "Sense Cloud",
    path: routes.storage,
    icon: HardDrive,
  },
  {
    name: "Users",
    path: routes.users,
    icon: Users,
  },
  {
    name: "Billing",
    path: routes.billing,
    icon: CreditCard,
  },
  {
    name: "Support",
    path: routes.support,
    icon: LifeBuoy,
  },

  {
    name: "Tutorials",
    path: routes.tutorials,
    icon: GraduationCap,
  },
  {
    name: "Security & Privacy",
    path: routes.profileSecurity,
    icon: Shield,
  },
];

const DashboardSidebar = () => {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    if (window) {
      window.dispatchEvent(
        new CustomEvent("sidebarCollapse", {
          detail: { collapsed: !collapsed },
        })
      );
    }
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      const response = await handleSignOut();
      if (response.success) {
        toast({
          title: "Success",
          description: "Logged out successfully!",
        });
        router.push(routes?.home);
      } else {
        toast({
          title: "Logout Failed",
          description: response.error || "Logout failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong during logout.";

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="fixed top-4 left-4 z-50 flex gap-4 md:hidden">
        <Button
          data-testid="dashboard-sidebar-mobile-toggle"
          variant="outline"
          size="icon"
          onClick={toggleMobileSidebar}
          className="h-10 w-10 rounded-full"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link
          data-testid="dashboard-header-logo-link"
          href="/"
          className="flex items-center"
        >
          <Logo />
        </Link>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          data-testid="dashboard-sidebar-mobile-overlay"
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        data-testid="dashboard-sidebar"
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 md:relative transition-all duration-300 bg-blue-700/5 dark:bg-[#010526] border-r-[1px]",
          collapsed ? "w-20" : "w-64 p-7",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        style={{ borderImage: "linear-gradient(to right, #A801BA, #2530F0) 1" }}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div
            data-testid="dashboard-sidebar-header"
            className={cn("relative h-[90px] px-4 flex items-center"
              , collapsed ? "my-3.5 justify-center" : "mb-7 justify-between"
            )}
          >
            {/* Centered logo when expanded */}
            {/* {!collapsed && ( */}
              <div data-testid="dashboard-sidebar-logo" className="mx-auto">
                <Logo sign={collapsed} />
              </div>
            {/* )} */}

            {/* Right-side controls (collapse + mobile close) */}
            <div
              data-testid="dashboard-sidebar-controls"
              className={cn(
                "absolute inset-y-0 right-0 flex items-center pr-0.5 md:pr-1",
                collapsed ? "translate-x-[25px] translate-y-2/3 transition-transform duration-200" : "translate-x-[50px] transition-transform duration-200"
              )}
            >
              <Button
                data-testid="dashboard-sidebar-collapse-toggle"
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="hidden md:flex hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {/* {collapsed ? (
                  <ArrowRightToLine className="h-5 w-5 transition-transform duration-200" />
                ) : (
                  <ArrowLeftToLine className="h-5 w-5 transition-transform duration-200" />
                )} */}
                <div className="w-[50px] h-[50px] relative rounded-[25px] [background:linear-gradient(270deg,_#a801ba,_#2530f0)] flex items-center justify-center p-2.5 box-border">
                  <div className="h-[30px] w-[30px] relative overflow-hidden shrink-0">
                    <Image
                      src="/sidebar-toggle.svg"
                      alt="Sidebar Toggle"
                      fill
                      priority
                    />
                  </div>
                </div>
              </Button>
              <div
                data-testid="dashboard-sidebar-mobile-close"
                onClick={toggleMobileSidebar}
                className={cn(
                  "md:hidden h-10 w-10 rounded-full [background:linear-gradient(270deg,_#a801ba,_#2530f0)] items-center justify-center box-border",
                  !mobileOpen ? "hidden" : "flex"
                )}
              >
                <X className="h-5 w-5" />
              </div>
            </div>
          </div>
          <hr className="border-t dark:border-white/10 border-neutral-900/30" />
          {/* Navigation Links */}
          <div
            data-testid="dashboard-sidebar-nav"
            className="flex-1 py-8 space-y-[10px] overflow-y-auto"
          >
            {navItems.map((item) => {
              const defaultTestId = `dashboard-sidebar-link-${item.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "")}`;
              const testId =
                item.name === "Sense PC"
                  ? "sensepc-sidebar-link"
                  : item.name === "Sense Cloud"
                    ? "sensepc-storage-sidebar-link"
                    : item.name === "Users"
                      ? "sensepc-users-sidebar-link"
                      : item.name === "Security & Privacy"
                        ? "dashboard-security-privacy-link"
                        : item.name === "Support"
                          ? "support-sidebar-link"
                          : defaultTestId;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  data-testid={testId}
                  className={cn(
                    "flex items-center px-4 py-[10px] rounded-full transition-colors",
                    pathname === item.path
                      ? "bg-blue-700 text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-0 w-[50%] mx-auto"
                  )}
                >
                  <item.icon
                    className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-[6px]")}
                  />
                  {!collapsed && (
                    <span
                      data-testid={
                        item.name === "Billing" ? "sensepc-wallet-icon" : undefined
                      }
                    >
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div
            data-testid="dashboard-sidebar-footer"
            className={cn(
              "pt-3 border-t dark:border-white/10 border-neutral-900/30",
              collapsed ? "text-center pb-3" : ""
            )}
          >
            <Button
              data-testid="dashboard-sidebar-logout"
              variant="ghost"
              className={cn(
                "w-full justify-start text-[#454545] dark:text-white",
                collapsed && "justify-center px-0 w-[50%] mx-auto"
              )}
              // asChild
              onClick={handleLogout}
            >
              <LogOut className={cn("h-5 w-5", !collapsed && "mr-[6px]")} />
              {!collapsed && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
