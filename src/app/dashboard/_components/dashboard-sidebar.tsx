"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Monitor,
  HardDrive,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  Users,
  CreditCard,
  LifeBuoy,
  ArrowLeftToLine,
  ArrowRightToLine,
  Shield,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/layout/Logo";

const navItems = [
  {
    name: "SmartPC",
    path: "/dashboard/smart-pc",
    icon: Monitor,
  },
  {
    name: "Smart Storage",
    path: "/dashboard/storage",
    icon: HardDrive,
  },
  {
    name: "Users",
    path: "/dashboard/users",
    icon: Users,
  },
  {
    name: "Billing",
    path: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    name: "Support",
    path: "/dashboard/support",
    icon: LifeBuoy,
  },
  {
    name: "Profile",
    path: "/dashboard/profile",
    icon: User,
  },
  {
    name: "Notifications",
    path: "/dashboard/notifications",
    icon: Bell,
  },
  {
    name: "Tutorials",
    path: "/dashboard/tutorials",
    icon: GraduationCap,
  },
  {
    name: "Security & Privacy",
    path: "/dashboard/security",
    icon: Shield,
  },
];

const DashboardSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
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

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileSidebar}
          className="h-10 w-10 rounded-full"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 md:relative transition-all duration-300 bg-card border-r border-border",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="h-16 px-4 border-b border-border flex items-center justify-between">
            {!collapsed && (
              <Link href="/" className="flex items-center">
                <Logo />
              </Link>
            )}

            <div
              className={cn(
                "flex items-center",
                collapsed && "w-full justify-center"
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="hidden md:flex hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {collapsed ? (
                  <ArrowRightToLine className="h-5 w-5 transition-transform duration-200" />
                ) : (
                  <ArrowLeftToLine className="h-5 w-5 transition-transform duration-200" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileSidebar}
                className="md:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md transition-colors",
                  pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                <item.icon
                  className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")}
                />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                collapsed && "justify-center"
              )}
              asChild
            >
              <Link href="/auth">
                <LogOut className={cn("h-5 w-5", !collapsed && "mr-3")} />
                {!collapsed && <span>Logout</span>}
              </Link>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
