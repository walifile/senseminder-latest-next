"use client";

import type { Notification } from "@/types/notification";

import { useRouter } from "next/navigation";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { getNotifications, markNotificationsAsRead } from "@/api/notification";

import { Logger } from "@/lib/utils/logger";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

import { X, Bell, Settings } from "lucide-react";

// ─────────────────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────────────────
function getNotificationId(n: Notification): string | undefined {
  const maybe = n as unknown as { id?: unknown };
  return typeof maybe.id === "string" && maybe.id.trim().length > 0
    ? maybe.id
    : undefined;
}

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const min = 60_000;
  const hr = 60 * min;
  const day = 24 * hr;
  if (diff < hr) return `${Math.round(diff / min)} minute(s) ago`;
  if (diff < day) return `${Math.round(diff / hr)} hour(s) ago`;
  return `${Math.round(diff / day)} day(s) ago`;
};

const bgIconColor = (sev: Notification["severity"]) => {
  if (sev === "critical") return "bg-red-500";
  if (sev === "warning") return "bg-[#F39C12]";
  if (sev === "info") return "bg-green-400";
  return "bg-green-400"; // info
};

const bgDateColor = (sev: Notification["severity"]) => {
  if (sev === "critical") return "red";
  if (sev === "warning") return "yellow";
  if (sev === "info") return "green";
  return "green"; // info
};

const PAGE_SIZE = 30;

// ─────────────────────────────────────────────────────────

const NotificationsPage = () => {
  const { toast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nextToken, setNextToken] = useState<string | null>(null);

  // optional preference toggles (pure UI for now)
  const [prefs, setPrefs] = useState({
    email: true,
    push: true,
    system: true,
    marketing: true,
  });

  const makeKey = useCallback(
    (n: Notification) =>
      getNotificationId(n) ?? `${n.timestamp}::${n.title}::${n.content}`,
    []
  );

  const dedupeMerge = useCallback(
    (prev: Notification[], next: Notification[]) => {
      const seen = new Set<string>();
      const out: Notification[] = [];
      for (const n of [...prev, ...next]) {
        const k = makeKey(n);
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(n);
      }
      return out;
    },
    [makeKey]
  );

  const fetchFirstPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotifications({ limit: PAGE_SIZE, nextToken: null });
      setNotifications(res.notifications);
      setNextToken(res.nextToken ?? null);
    } catch (e) {
      Logger.error(e);
      toast({
        title: "Failed to load notifications",
        description: String(e),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchNextPage = useCallback(async () => {
    if (!nextToken || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await getNotifications({ limit: PAGE_SIZE, nextToken });
      setNotifications((prev) => dedupeMerge(prev, res.notifications));
      setNextToken(res.nextToken ?? null);
    } catch (e) {
      Logger.error(e);
      toast({
        title: "Failed to load more notifications",
        description: String(e),
        variant: "destructive",
      });
    } finally {
      setLoadingMore(false);
    }
  }, [nextToken, loadingMore, toast, dedupeMerge]);

  /*  GET notifications on mount  */
  useEffect(() => {
    fetchFirstPage();
  }, [fetchFirstPage]);

  /*  Helpers  */
  const unread = useMemo(
    () => notifications.filter((n) => !n.isRead),
    [notifications]
  );
  const alerts = useMemo(
    () => notifications.filter((n) => n.severity !== "info"),
    [notifications]
  );

  const handleMarkAll = async () => {
    if (unread.length === 0) return;
    const timestamps = unread.map((n) => n.timestamp);
    await markNotificationsAsRead(timestamps);
    setNotifications((prev) =>
      prev.map((n) =>
        timestamps.includes(n.timestamp) ? { ...n, isRead: true } : n
      )
    );
  };

  const markSingle = async (ts: string) => {
    await markNotificationsAsRead(ts);
    setNotifications((prev) =>
      prev.map((n) => (n.timestamp === ts ? { ...n, isRead: true } : n))
    );
  };

  // preference toggle stub
  const togglePref = (key: keyof typeof prefs) =>
    setPrefs((p) => {
      const next = { ...p, [key]: !p[key] };
      toast({
        title: "Preferences updated",
        description: `${key} ${next[key] ? "enabled" : "disabled"}`,
      });
      return next;
    });

  /*  UI lists  */
  const listAll = notifications;
  const listUnread = unread;
  const listAlerts = alerts;

  return (
    <div data-testid="dashboard-notifications-page" className="space-y-6">
      <Card
        data-testid="dashboard-notifications-card"
        className="relative !border-0 gradient-outline-border bg-[rgba(37,48,240,0.07)] dark:bg-[rgba(255,255,255,0.03)]"
      >
        <CardContent className="p-0 space-y-6">
          {/* Header */}
          <div className="relative flex flex-col items-start gap-4 border-b border-black/10 p-4 dark:border-border md:flex-row md:items-center md:justify-between md:p-6">
            <div className="flex flex-col items-left gap-2 pr-12 md:pr-0">
              <h1 className="justify-start text-2xl font-semibold leading-8 text-black font-['Space_Grotesk'] dark:text-white md:text-3xl md:leading-10">
                Notifications
              </h1>
              <p className="text-muted-foreground">
                Manage your notifications
              </p>
            </div>
            <div className="absolute top-4 right-4 md:static md:flex md:w-auto md:space-x-2">
              {/* Preferences modal */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-10 w-10 gap-0 rounded-full p-0 md:h-14 md:w-auto md:gap-2 md:px-7"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden md:inline">Preferences</span>
                  </Button>
                </DialogTrigger>
                <DialogContent
                  data-testid="dashboard-notifications-preferences-dialog"
                  className="w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] gap-5 rounded-2xl border border-border/40 bg-gradient-to-b from-background/90 to-muted/40 p-6 shadow-2xl backdrop-blur-xl transition-all sm:max-w-[425px] sm:p-8"
                >
                  <DialogHeader className="space-y-2 pb-1 text-center sm:pb-2">
                    <DialogTitle className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-center text-xl font-semibold text-transparent sm:text-left sm:text-2xl">
                      Notification Preferences
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                      Toggle channels you’d like to receive.
                    </DialogDescription>
                  </DialogHeader>

                  {[
                    ["email", "Email Notifications"],
                    ["push", "Push Notifications"],
                    ["system", "System Alerts"],
                    ["marketing", "Marketing Updates"],
                  ].map(([key, label]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between space-x-4 py-1.5 sm:py-2"
                    >
                      <div className="flex-1 space-y-1">
                        <Label htmlFor={key}>{label}</Label>
                      </div>
                      <Switch
                        id={key}
                        checked={prefs[key as keyof typeof prefs]}
                        onCheckedChange={() =>
                          togglePref(key as keyof typeof prefs)
                        }
                      />
                    </div>
                  ))}
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="p-4 pt-0 md:p-6 md:pt-0">
            {/* ─── Tabs & list ──────────────────────────────── */}
            <Tabs defaultValue="all" className="w-full">
              <div className="mb-4 flex flex-col items-stretch gap-3 md:flex-row md:items-center md:justify-between">
                <TabsList className="flex w-full flex-wrap items-center justify-start gap-2 bg-transparent md:w-auto">
                  <TabsTrigger
                    value="all"
                    variant="gradient"
                    className="px-3 text-sm md:px-4 md:text-base"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    variant="gradient"
                    className="px-3 text-sm md:px-4 md:text-base"
                  >
                    Unread
                  </TabsTrigger>
                  <TabsTrigger
                    value="alerts"
                    variant="gradient"
                    className="px-3 text-sm md:px-4 md:text-base"
                  >
                    Alerts
                  </TabsTrigger>
                </TabsList>
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleMarkAll}
                  className="self-start px-0 text-black underline hover:text-secondary-foreground dark:text-white md:self-auto"
                >
                  Mark all as read
                </Button>
              </div>

              <TabsContent value="all">
                <NotificationList
                  items={listAll}
                  loading={loading}
                  onRead={markSingle}
                  onNavigate={(route) => router.push(route)}
                  hasMore={!!nextToken}
                  loadingMore={loadingMore}
                  onLoadMore={fetchNextPage}
                />
              </TabsContent>

              <TabsContent value="unread">
                <NotificationList
                  items={listUnread}
                  loading={loading}
                  onRead={markSingle}
                  onNavigate={(route) => router.push(route)}
                  hasMore={!!nextToken}
                  loadingMore={loadingMore}
                  onLoadMore={fetchNextPage}
                />
              </TabsContent>

              <TabsContent value="alerts">
                <NotificationList
                  items={listAlerts}
                  loading={loading}
                  onRead={markSingle}
                  onNavigate={(route) => router.push(route)}
                  hasMore={!!nextToken}
                  loadingMore={loadingMore}
                  onLoadMore={fetchNextPage}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Child components
───────────────────────────────────────────────────────── */

interface ListProps {
  items: Notification[];
  loading: boolean;
  onRead: (ts: string) => Promise<void>;
  onNavigate: (route: string) => void;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

const NotificationList: React.FC<ListProps> = ({
  items,
  loading,
  onRead,
  onNavigate,
  hasMore,
  loadingMore,
  onLoadMore,
}) => {
  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (items.length === 0)
    return <p className="text-sm text-muted-foreground">No notifications.</p>;

  return (
    <>
      <div
        data-testid="dashboard-notifications-list"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5"
      >
        {items.map((n) => (
          <NotificationCard
            // timestamp can collide; use a composite fallback
            key={getNotificationId(n) ?? `${n.timestamp}::${n.title}`}
            n={n}
            onRead={onRead}
            onNavigate={onNavigate}
          />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center pt-5">
          <Button onClick={onLoadMore} disabled={loadingMore}>
            {loadingMore ? "Loading more…" : "Load more"}
          </Button>
        </div>
      )}
    </>
  );
};

interface CardProps {
  n: Notification;
  onRead: (ts: string) => Promise<void>;
  onNavigate: (route: string) => void;
}

const NotificationCard: React.FC<CardProps> = ({ n, onRead, onNavigate }) => {
  const handleView = async () => {
    if (!n.isRead) await onRead(n.timestamp);
    if (n.route) onNavigate(n.route);
  };

  const handleDismiss = async () => {
    if (!n.isRead) await onRead(n.timestamp);
  };

  return (
    <Card
      data-testid={`dashboard-notification-card-${n.timestamp}`}
      className={
        n.isRead
          ? "relative bg-[rgba(255,255,255,0.30)] dark:bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(37,48,240,0.10)] dark:hover:bg-[rgba(128,134,243,0.20)] border-blue-700/20 md:rounded-[10px]"
          : "relative bg-[rgba(37,48,240,0.10)] dark:bg-[rgba(128,134,243,0.20)] hover:bg-[rgba(37,48,240,0.10)] dark:hover:bg-[rgba(128,134,243,0.20)] border-blue-700 md:rounded-[10px]"
      }
    >
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-3.5 right-3.5 h-auto p-0"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
      <CardContent className="p-4 pr-12 md:p-6 md:pr-14">
        <div className="flex min-w-0 gap-3">
          {/* icon circle */}
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full p-1.5 ${bgIconColor(n.severity)}`}
          >
            <Bell className="w-4 h-4 text-white" />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`pr-2 text-lg font-medium leading-7 font-['Inter'] ${
                  n.isRead ? "" : "text-primary"
                }`}
              >
                {n.title}
              </h3>
            </div>

            <p className="break-words text-sm font-normal leading-5 text-[#454545] font-['Inter'] dark:text-[#A3A3A3]">
              {n.content}
            </p>

            <div className="flex flex-col items-start gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant="link"
                size="sm"
                className="h-8 px-0 text-[#454545] dark:text-[#A3A3A3] hover:text-muted-foreground underline"
                onClick={handleView}
              >
                <span>View Details</span>
              </Button>

              <div className="flex items-center gap-1">
                <div
                  className={`inline-flex items-center justify-center gap-2.5 rounded-[60px] px-3 py-1.5 md:px-4 bg-${bgDateColor(n.severity)}-500/10`}
                >
                  <div
                    className={`justify-start ${
                      bgDateColor(n.severity) === "yellow"
                        ? "text-[#F39C12]"
                        : `text-${bgDateColor(n.severity)}-500`
                    } text-sm font-normal leading-5 font-['Inter'] md:text-base md:leading-6`}
                  >
                    {timeAgo(n.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsPage;
