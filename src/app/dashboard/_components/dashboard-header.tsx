"use client";

import type { Notification } from "@/types/notification";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useGetCurrentBalanceQuery } from "@/api/billing";
import { markNotificationsAsRead } from "@/api/notification";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Bell, Wallet, Moon, Sun } from "lucide-react";

import { useNotifications } from "@/hooks/useNotifications";

import { Logo } from "@/components/shared/layout/Logo";
import { useTheme } from "@/components/shared/layout/theme-provider";
import ProfileDropdown from "@/components/shared/layout/profile-dropdown";

const DashboardHeader = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { notifications, hasUnread, fetchNotifications } = useNotifications();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  const { data, isLoading: balanceLoading } = useGetCurrentBalanceQuery();

  const balance = data?.balance ?? null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const colourBySeverity = (sev: Notification["severity"]) => {
    if (sev === "critical") return "bg-destructive/20 text-destructive";
    if (sev === "warning") return "bg-orange-500/20 text-orange-500";
    return "bg-primary/20 text-primary"; // info
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const min = 60_000,
      hr = 60 * min,
      day = 24 * hr;
    if (diff < hr) return `${Math.round(diff / min)}m ago`;
    if (diff < day) return `${Math.round(diff / hr)}h ago`;
    return `${Math.round(diff / day)}d ago`;
  };

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      await markNotificationsAsRead(n.timestamp);
      await fetchNotifications();
    }
    if (n.route) router.push(n.route);
  };

  useEffect(() => {
    const handleSidebarCollapse = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener(
      "sidebarCollapse",
      handleSidebarCollapse as EventListener
    );
    return () => {
      window.removeEventListener(
        "sidebarCollapse",
        handleSidebarCollapse as EventListener
      );
    };
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getBalanceColor = () => {
    if (balance === null) return "text-muted-foreground";
    return "text-[color:var(--Black,#020816)]";
  };

  return (
    <header className="sticky top-0 z-40  flex items-center justify-between px-4 md:px-6 ">
      <div className="md:hidden w-10" />

      {sidebarCollapsed && (
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-3 md:gap-5 py-7">
        <div className="rounded-full border border-[#A801BA] bg-[rgba(37,48,240,0.07)] px-5 py-1">
          <div className="flex items-center gap-3 rounded-full">
            <Link href="/dashboard/billing" className="flex items-center gap-2">
              <div>
                <Wallet className="h-6 w-6 text-black" />
              </div>
              <div className={cn("text-base font-semibold", getBalanceColor())}>
                {balanceLoading || balance === null ? (
                  <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                ) : (
                  `$${balance.toFixed(2)}`
                )}
              </div>
            </Link>

            <div className="h-7 w-px bg-[rgba(67,67,67,0.10)]" />
            <div className="rounded-full bg-[rgba(37,48,240,0.07)] flex items-center gap-3 px-3 py-2">
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                  resolvedTheme === "dark"
                    ? "bg-[#2530f0] text-[#ffb703] shadow-[0_10px_24px_-12px_rgba(37,48,240,0.65)]"
                    : "text-[#2f3a50] hover:bg-slate-100/70"
                )}
                aria-label="Switch to dark mode"
              >
                <Moon className="h-5 w-5" />
              </button>

              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                  resolvedTheme === "light"
                    ? "bg-[#2530f0] text-[#ffb703] shadow-[0_10px_24px_-12px_rgba(37,48,240,0.65)]"
                    : "text-[#2f3a50] hover:bg-slate-100/70"
                )}
                aria-label="Switch to light mode"
              >
                <Sun className="h-5 w-5" strokeWidth={2.4} />
              </button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative">
                  <button className="relative rounded-full bg-[#DBDBFC] text-[#2530f0] hover:bg-[#d4d9ff] shadow-none p-3">
                    <Bell className="h-6 w-6" fill="currentColor" />
                    {/* {hasUnread && (
                      <span className="absolute -top-1 -right-1 min-h-[16px] min-w-[16px] rounded-full bg-[#2f6bff] text-[10px] font-semibold flex items-center justify-center text-white px-[5px]">
                        {unreadCount}
                      </span>
                    )} */}
                  </button>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-80 max-h-96 overflow-auto"
              >
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 && (
                  <p className="text-xs px-4 py-2 text-muted-foreground">
                    No notifications
                  </p>
                )}
                {notifications.map((n) => (
                  <button
                    key={n.timestamp}
                    onClick={() => handleClick(n)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-sm hover:bg-muted",
                      !n.isRead && "bg-muted/40"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "h-8 w-8 flex items-center justify-center rounded-full",
                          colourBySeverity(n.severity)
                        )}
                      >
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "font-medium text-sm",
                              !n.isRead && "text-primary"
                            )}
                          >
                            {n.title}
                          </span>
                          {!n.isRead && (
                            <span className="h-2 w-2 rounded-full bg-primary mt-1" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {n.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {timeAgo(n.timestamp)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
                <DropdownMenuSeparator />
                <Link
                  href="/dashboard/notifications"
                  className="block text-sm text-center text-primary hover:underline py-2"
                >
                  See all notifications
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <ProfileDropdown />
      </div>
    </header>
  );
};

export default DashboardHeader;
