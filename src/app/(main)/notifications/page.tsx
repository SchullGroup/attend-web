"use client";
import { useState } from "react";
import { MOCK_NOTIFICATIONS } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import { formatRelativeTime } from "@/lib/utils";
import { Bell, FileText, Megaphone, CalendarClock, Vote, Sparkles } from "lucide-react";

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

export default function NotificationsPage() {
  const [items, setItems] = useState(MOCK_NOTIFICATIONS);

  const unread = items.filter((n) => !n.read);
  const read = items.filter((n) => n.read);

  function markAll() {
    setItems((xs) => xs.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unread.length} unread · {items.length} total
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={markAll} disabled={unread.length === 0}>
          Mark all as read
        </Button>
      </header>

      {unread.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Unread
          </h2>
          <ul className="space-y-2">
            {unread.map((n) => {
              const Icon = ICONS[n.type] || Bell;
              return (
                <li
                  key={n.id}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TYPE_COLOR[n.type] || "bg-muted text-muted-foreground"}`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{n.title}</p>
                      <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {read.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Earlier
          </h2>
          <ul className="space-y-2">
            {read.map((n) => {
              const Icon = ICONS[n.type] || Bell;
              return (
                <li
                  key={n.id}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-white/60 p-4"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TYPE_COLOR[n.type] || "bg-muted text-muted-foreground"}`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
