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

import { X, Bell, Settings, ChevronRight } from "lucide-react";

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

const colourBySeverity = (sev: Notification["severity"]) => {
  if (sev === "critical") return "bg-destructive/20 text-destructive";
  if (sev === "warning") return "bg-orange-500/20 text-orange-500";
  return "bg-primary/20 text-primary"; // info
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
  const unread = useMemo(() => notifications.filter((n) => !n.isRead), [notifications]);
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
      {/* ─── Page header ──────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>

        {/* Preferences modal */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Notification Preferences</DialogTitle>
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
                  onCheckedChange={() => togglePref(key as keyof typeof prefs)}
                />
              </div>
            ))}
          </DialogContent>
        </Dialog>
      </div>

      {/* ─── Tabs & list ──────────────────────────────── */}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>
          <Button variant="ghost" size="sm" onClick={handleMarkAll}>
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
    <div className="space-y-4">
      {items.map((n) => (
        <NotificationCard
          // timestamp can collide; use a composite fallback
          key={getNotificationId(n) ?? `${n.timestamp}::${n.title}`}
          n={n}
          onRead={onRead}
          onNavigate={onNavigate}
        />
      ))}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={onLoadMore} disabled={loadingMore}>
            {loadingMore ? "Loading more…" : "Load more"}
          </Button>
        </div>
      )}
    </div>
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
    <Card className={n.isRead ? "" : "border-primary/20 bg-primary/5"}>
      <CardContent className="p-4 md:p-6">
        <div className="flex gap-4">
          {/* icon circle */}
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center ${colourBySeverity(
              n.severity
            )}`}
          >
            <Bell className="h-5 w-5" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`font-medium ${n.isRead ? "" : "text-primary"}`}>
                {n.title}
              </h3>

              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {timeAgo(n.timestamp)}
                </span>
                {!n.isRead && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{n.content}</p>

            <div className="pt-2 flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={handleView}
              >
                <span>View Details</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsPage;
