"use client";
import { useState, useEffect } from "react";
import { Bell, FileText, Megaphone, CalendarClock, Vote, Sparkles } from "lucide-react";
import { useGetNotifications, useMarkRead, useMarkAllRead, useSubscribeDevice } from "@/api/notifications/hooks";
import type { Notification } from "@/types";
import { Button } from "@/components/ui/Button";
import { formatRelativeTime, cn } from "@/lib/utils";

const ICONS: Record<string, typeof Bell> = {
  vote_open: Vote,
  event_reminder: CalendarClock,
  application_update: Sparkles,
  document: FileText,
  broadcast: Megaphone,
};

const TYPE_COLOR: Record<string, string> = {
  vote_open: "bg-red-50 text-red-600",
  event_reminder: "bg-amber-50 text-amber-600",
  application_update: "bg-emerald-50 text-emerald-600",
  document: "bg-blue-50 text-blue-600",
  broadcast: "bg-purple-50 text-purple-600",
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationsPage() {
  const { data, isLoading } = useGetNotifications({ size: 50 });
  const { mutate: markRead } = useMarkRead();
  const { mutate: markAllRead, isPending: markingAll } = useMarkAllRead();
  const { mutateAsync: subscribeDevice } = useSubscribeDevice();

  const [pushEnabled, setPushEnabled] = useState(false);
  const [submittingPush, setSubmittingPush] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setPushEnabled(!!subscription);
        });
      });
    }
  }, []);

  async function handleTogglePush(checked: boolean) {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Push notifications are not supported on this browser.");
      return;
    }

    setSubmittingPush(true);
    try {
      if (checked) {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          alert("Notification permission denied.");
          setSubmittingPush(false);
          return;
        }

        const registration = await navigator.serviceWorker.register("/sw.js");
        const activeRegistration = await navigator.serviceWorker.ready;

        const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
        if (!vapidKey) {
          console.error("VAPID key not configured.");
          setSubmittingPush(false);
          return;
        }

        const subscription = await activeRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });

        await subscribeDevice(subscription as any);
        setPushEnabled(true);
      } else {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
        setPushEnabled(false);
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to update push subscription.");
    } finally {
      setSubmittingPush(false);
    }
  }

  const notifications = data?.data?.notifications ?? [];
  const unreadCount = data?.data?.unreadCount ?? 0;
  const totalCount = data?.data?.totalCount ?? 0;

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-20 animate-pulse rounded-2xl border border-border bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount} unread · {totalCount} total
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAllRead()}
          loading={markingAll}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </Button>
      </header>

      <div className="flex items-center justify-between rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="space-y-0.5 pr-4">
          <h3 className="text-sm font-semibold text-foreground">Web Push Notifications</h3>
          <p className="text-xs text-muted-foreground leading-normal">
            Receive live meeting alerts, reminders, and vote opening broadcasts instantly.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={pushEnabled}
          disabled={submittingPush}
          onClick={() => handleTogglePush(!pushEnabled)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50",
            pushEnabled ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
              pushEnabled ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          You have no notifications yet.
        </div>
      ) : (
        <>
          {unread.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Unread
              </h2>
              <ul className="space-y-2">
                {unread.map((n) => (
                  <NotificationItem key={n.id} notification={n} onRead={() => markRead(n.id)} />
                ))}
              </ul>
            </section>
          )}

          {read.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Earlier
              </h2>
              <ul className="space-y-2">
                {read.map((n) => (
                  <NotificationItem key={n.id} notification={n} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function NotificationItem({
  notification: n,
  onRead,
}: {
  notification: Notification;
  onRead?: () => void;
}) {
  const Icon = ICONS[n.type] ?? Bell;
  const colorClass = TYPE_COLOR[n.type] ?? "bg-muted text-muted-foreground";

  return (
    <li
      onClick={() => !n.read && onRead?.()}
      className={`flex items-start gap-3 rounded-2xl border border-border p-4 transition-colors ${
        n.read ? "bg-white/60" : "cursor-pointer bg-white shadow-sm hover:bg-muted/20"
      }`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm ${n.read ? "font-medium" : "font-semibold"} text-foreground`}>
            {n.title}
          </p>
          {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{formatRelativeTime(n.createdAt)}</p>
      </div>
    </li>
  );
}
