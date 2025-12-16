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

// Helper function for generating random color
const randColor = (...colors: string[]): string => {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
};

// const colourBySeverity = (sev: Notification["severity"]) => {
//   if (sev === "critical") return "bg-destructive/20 text-destructive";
//   if (sev === "warning") return "bg-orange-500/20 text-orange-500";
//   return "bg-primary/20 text-primary"; // info
// };

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
    <div className="space-y-6">
      <Card className="relative !border-0 gradient-outline-border bg-[rgba(37,48,240,0.07)] dark:bg-[rgba(255,255,255,0.03)]">
        <CardContent className="p-0 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-black/10 dark:border-border">
            <div className="flex flex-col items-left gap-2">
              <h1 className="justify-start text-black dark:text-white text-3xl font-semibold font-['Space_Grotesk'] leading-10">
                Notifications
              </h1>
              <p className="text-muted-foreground">
                Manage your Cloud Computer
              </p>
            </div>
            <div className="flex space-x-2">
              {/* Preferences modal */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Preferences
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-2xl border border-border/40 bg-gradient-to-b from-background/90 to-muted/40 shadow-2xl backdrop-blur-xl transition-all">
                  <DialogHeader className="space-y-2 pb-2">
                    <DialogTitle className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                      Notification Preferences
                    </DialogTitle>
                    <DialogDescription>
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
                      className="flex items-center justify-between space-x-4 py-2"
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

          <div className="p-6 pt-0">
            {/* ─── Tabs & list ──────────────────────────────── */}
            <Tabs defaultValue="all" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList className="inline-flex justify-start items-center bg-transparent gap-2">
                  <TabsTrigger value="all" variant="gradient">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="unread" variant="gradient">
                    Unread
                  </TabsTrigger>
                  <TabsTrigger value="alerts" variant="gradient">
                    Alerts
                  </TabsTrigger>
                </TabsList>
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleMarkAll}
                  className="text-black dark:text-white hover:text-secondary-foreground underline"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

  const randomColor = randColor("green", "red", "yellow");
  const randomBgColor =
    randomColor === "green"
      ? "bg-green-400"
      : randomColor === "red"
      ? "bg-red-500"
      : randomColor === "yellow"
      ? "bg-[#F39C12]"
      : "";

  return (
    <Card
      className={
        n.isRead
          ? "relative bg-[rgba(255,255,255,0.30)] dark:bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(37,48,240,0.10)] dark:hover:bg-[rgba(128,134,243,0.20)] border-blue-700/20 md:rounded-[10px]"
          : "relative bg-[rgba(255,255,255,0.30)] dark:bg-[rgba(128,134,243,0.20)] hover:bg-[rgba(37,48,240,0.10)] dark:hover:bg-[rgba(128,134,243,0.20)] border-blue-700 md:rounded-[10px]"
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
      <CardContent className="p-4 md:p-6">
        <div className="flex gap-3">
          {/* icon circle */}
          <div
            className={`w-7 h-7 p-1.5 rounded-full flex items-center justify-center ${randomBgColor}`}
          >
            <Bell className="w-4 h-4 text-white" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`text-lg font-medium font-['Inter'] leading-7 ${
                  n.isRead ? "" : "text-primary"
                }`}
              >
                {n.title}
              </h3>
            </div>

            <p className="text-[#454545] dark:text-[#A3A3A3] text-sm font-normal font-['Inter'] leading-5">
              {n.content}
            </p>

            <div className="pt-2 flex justify-between">
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
                  className={`px-4 py-1.5 bg-${randomColor}-500/10 rounded-[60px] inline-flex justify-center items-center gap-2.5`}
                >
                  <div
                    className={`justify-start ${
                      randomColor === "yellow"
                        ? "text-[#F39C12]"
                        : `text-${randomColor}-500`
                    } text-base font-normal font-['Inter'] leading-6`}
                  >
                    {timeAgo(n.timestamp)}
                  </div>
                </div>
                {!n.isRead && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsPage;
