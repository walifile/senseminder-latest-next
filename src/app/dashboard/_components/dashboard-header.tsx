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

import { Bell, Wallet } from "lucide-react";

import { useNotifications } from "@/hooks/useNotifications";

import { Logo } from "@/components/shared/layout/Logo";
import { ThemeToggle } from "@/components/shared/layout/theme-toggle";
import ProfileDropdown from "@/components/shared/layout/profile-dropdown";

const DashboardHeader = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { notifications, hasUnread, fetchNotifications } = useNotifications();
  const router = useRouter();

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
  }, []);

  const getBalanceColor = () => {
    if (balance === null) return "bg-muted text-muted-foreground";
    if (balance >= 50)
      return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
    if (balance > 10)
      return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
    return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
  };

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="md:hidden w-10" />

      {sidebarCollapsed && (
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <Link href="/dashboard/billing">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
              getBalanceColor()
            )}
          >
            <Wallet className="h-4 w-4" />
            {balanceLoading || balance === null ? (
              <div className="h-4 w-10 bg-muted animate-pulse rounded" />
            ) : (
              `$${balance.toFixed(2)}`
            )}
          </Button>
        </Link>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium flex items-center justify-center text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
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

        <ProfileDropdown />
      </div>
    </header>
  );
};

export default DashboardHeader;
