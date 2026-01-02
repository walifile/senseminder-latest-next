"use client";

import type { Notification } from "@/types/notification";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
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

import { useNotifications } from "@/hooks/useNotifications";

// import { Logo } from "@/components/shared/layout/Logo";
import { useTheme } from "@/components/shared/layout/theme-provider";
import ProfileDropdown from "@/components/shared/layout/profile-dropdown";

const DashboardHeader = () => {
  // const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  const HEADER_ICON_BTN = "h-10 w-10 min-h-[40px] min-w-[40px] shrink-0";
  const HEADER_ICON_IMG = 18;  
  // useEffect(() => {
  //   // const handleSidebarCollapse = (event: CustomEvent) => {
  //   //   setSidebarCollapsed(event.detail.collapsed);
  //   // };

  //   // window.addEventListener(
  //   //   "sidebarCollapse",
  //   //   handleSidebarCollapse as EventListener
  //   // );
  //   // return () => {
  //   //   window.removeEventListener(
  //   //     "sidebarCollapse",
  //   //     handleSidebarCollapse as EventListener
  //   //   );
  //   // };
  // }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getBalanceColor = () => {
    if (balance === null) return "text-muted-foreground";
    return "text-[color:var(--Black,#020816)]";
  };

  return (
    <header
      data-testid="dashboard-header"
      className="sticky top-0 z-30 h-20 flex items-center justify-between px-4 md:px-6 backdrop-blur"
    >
      <div className="md:hidden w-10" />

      {/* {sidebarCollapsed && (
        <Link
          data-testid="dashboard-header-logo-link"
          href="/"
          className="flex items-center"
        >
          <Logo />
        </Link>
      )} */}

      <div className="flex-1" />

      <div
        data-testid="dashboard-header-actions"
        className="flex items-center gap-3 md:gap-5"
      >
        <div
          data-testid="dashboard-header-balance-card"
          className="rounded-full border border-[#A801BA] dark:border-fuchsia-700 bg-[rgba(37,48,240,0.07)] dark:bg-white/5 "
        >
          <div className="flex items-center gap-2 rounded-full p-[2px] pr-0 backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:supports-[backdrop-filter]:bg-white/5 dark:shadow-[6px_16px_50px_6px_rgba(38,57,136,0.06)]">
            <Link
              data-testid="dashboard-header-billing-link"
              href="/dashboard/billing"
              className="hidden sm:flex items-center gap-2 ml-4"
            >
              <div>
                {resolvedTheme === "dark" ? (
                  <Image src="/assets/icons/wallet-dark.svg" alt="Wallet Dark Icon" width={24} height={24} />
                ) : (
                  <Image src="/assets/icons/wallet.svg" alt="Wallet Icon" width={24} height={24} />
                )}
              </div>
              <div
                data-testid="dashboard-header-balance"
                className={cn(
                  "hidden sm:block text-base font-semibold dark:text-white",
                  getBalanceColor()
                )}
              >
                {balanceLoading || balance === null ? (
                  <div
                    data-testid="dashboard-header-balance-loading"
                    className="h-4 w-12 bg-muted animate-pulse rounded"
                  />
                ) : (
                  <span data-testid="dashboard-header-balance-value">
                    {`$${balance.toFixed(2)}`}
                  </span>
                )}
              </div>
            </Link>

            <div className="hidden sm:block h-7 w-px bg-[rgba(67,67,67,0.10)] dark:bg-white/10" />
              <div className="rounded-full bg-[rgba(37,48,240,0.07)] dark:bg-white/5 flex items-center p-[2px] -ml-1">
                <button
                  onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
                  data-testid="dashboard-header-theme-toggle"
                  className={cn(
                    HEADER_ICON_BTN,
                    "rounded-full flex items-center justify-center transition-colors",
                    "bg-[#2530f0] text-white",
                    "ring-1 ring-white/25 dark:ring-white/15",
                    "shadow-[0_10px_24px_-12px_rgba(37,48,240,0.65)]"
                  )}
                  aria-label={resolvedTheme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                >
                  {resolvedTheme === "dark" ? (
                    <Image src="/assets/icons/sun.svg" alt="Sun Icon" width={HEADER_ICON_IMG} height={HEADER_ICON_IMG} />
                  ) : (
                    <Image src="/assets/icons/moon.svg" alt="Moon Icon" width={HEADER_ICON_IMG} height={HEADER_ICON_IMG} />
                  )}
                </button>
              </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  data-testid="dashboard-header-notifications-trigger"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    HEADER_ICON_BTN,
                    "relative rounded-full mr-1",
                    "bg-gradient-to-b dark:bg-white/5 dark:from-white/5 dark:to-white/5 from-[#e9ecff] to-[#dfe5ff]",
                    "text-[#2530f0] dark:text-white hover:bg-[#d4d9ff] shadow-none",
                    "ring-1 ring-white/35 dark:ring-white/10"
                  )}
                >
                  {resolvedTheme === "dark" ? (
                    <Image src="/assets/icons/bell-dark.svg" alt="Notifications Dark Bell Icon" width={HEADER_ICON_IMG} height={HEADER_ICON_IMG} />
                  ) : (
                    <Image src="/assets/icons/bell.svg" alt="Notifications Bell Icon" width={HEADER_ICON_IMG} height={HEADER_ICON_IMG} />
                  )}

                  {hasUnread && (
                    <span className="absolute -top-1 -right-1 min-h-[16px] min-w-[16px] rounded-full bg-[#2f6bff] text-[10px] font-semibold flex items-center justify-center text-white px-[5px]">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                data-testid="dashboard-header-notifications-menu"
                align="end"
                className="relative w-80 pb-10 pr-0"
              >
                <DropdownMenuLabel data-testid="dashboard-header-notifications-title">
                  Notifications
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 && (
                  <p
                    data-testid="dashboard-header-notifications-empty"
                    className="text-xs px-4 py-2 text-muted-foreground"
                  >
                    No notifications
                  </p>
                )}
                <div
                  data-testid="dashboard-header-notifications-list"
                  className="space-y-1 max-h-72 overflow-y-auto"
                >
                  {notifications.map((n) => (
                    <button
                      key={n.timestamp}
                      data-testid={`dashboard-header-notification-${String(
                        n.timestamp
                      )}`}
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
                          {resolvedTheme === "dark" ? (
                            <Image src="/assets/icons/bell-dark.svg" alt="Notifications Dark Bell Icon" width={24} height={24} />
                          ) : (
                            <Image src="/assets/icons/bell.svg" alt="Notifications Bell Icon" width={24} height={24} />
                          )}
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
                </div>
                <div
                  data-testid="dashboard-header-notifications-footer"
                  className="fixed bottom-0 right-0 left-0 border-t border-[#7E808F] dark:border-[#2A2067] bg-[#F2EFFF] dark:bg-[#191748]"
                >
                  <Link
                    data-testid="dashboard-header-notifications-link"
                    href="/dashboard/notifications"
                    className="block text-sm text-center text-primary hover:underline py-2"
                  >
                    See all notifications
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div data-testid="dashboard-header-profile">
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
