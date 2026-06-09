"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BellRing, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGetNotificationPreferences,
  useSaveNotificationPreferences,
} from "@/api/notifications/hooks";
import { NotificationPreferences } from "@/types";

interface PrefRow {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
  icon: typeof BellRing;
}

const EMAIL_ROWS: PrefRow[] = [
  { key: "emailRsvpConfirmation", label: "RSVP confirmations", description: "When your event registration is confirmed.", icon: Mail },
  { key: "emailEventReminder", label: "Event reminders", description: "Reminders before events you've registered for.", icon: Mail },
  { key: "emailNewDocument", label: "New documents", description: "When a new document is shared with you.", icon: Mail },
];

const INAPP_ROWS: PrefRow[] = [
  { key: "inAppRsvpConfirmation", label: "RSVP confirmations", description: "In-app alert when your registration is confirmed.", icon: BellRing },
  { key: "inAppEventReminder", label: "Event reminders", description: "In-app reminders before your events.", icon: BellRing },
  { key: "inAppNewDocument", label: "New documents", description: "In-app alert when a new document is shared.", icon: BellRing },
];

const DEFAULT_PREFS: NotificationPreferences = {
  emailRsvpConfirmation: true,
  emailEventReminder: true,
  emailNewDocument: true,
  inAppRsvpConfirmation: true,
  inAppEventReminder: true,
  inAppNewDocument: true,
};

export default function NotificationPreferencesPage() {
  const { data, isLoading } = useGetNotificationPreferences();
  const { mutate: savePreferences, isPending: saving } = useSaveNotificationPreferences();
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);

  useEffect(() => {
    if (data?.data) setPrefs(data.data);
  }, [data]);

  function toggle(k: keyof NotificationPreferences) {
    const next = { ...prefs, [k]: !prefs[k] };
    setPrefs(next);
    savePreferences(next);
  }

  return (
    <div className="space-y-6">
      <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notification preferences</h1>
          <p className="text-sm text-muted-foreground">
            Choose how and when you&apos;d like to hear from Attend.
          </p>
        </div>
        {saving && <span className="text-xs text-muted-foreground">Saving…</span>}
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />
          ))}
        </div>
      ) : (
        <>
          <Section title="Email notifications" rows={EMAIL_ROWS} prefs={prefs} toggle={toggle} />
          <Section title="In-app notifications" rows={INAPP_ROWS} prefs={prefs} toggle={toggle} />
        </>
      )}
    </div>
  );
}

function Section({
  title,
  rows,
  prefs,
  toggle,
}: {
  title: string;
  rows: PrefRow[];
  prefs: NotificationPreferences;
  toggle: (k: keyof NotificationPreferences) => void;
}) {
  return (
    <section>
      <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <ul className="overflow-hidden rounded-2xl border border-border bg-white">
        {rows.map((r, i) => {
          const Icon = r.icon;
          const on = prefs[r.key];
          return (
            <li
              key={r.key}
              className={cn(
                "flex items-center justify-between gap-3 px-4 py-3",
                i > 0 && "border-t border-border",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                </div>
              </div>
              <button
                onClick={() => toggle(r.key)}
                role="switch"
                aria-checked={on}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  on ? "bg-primary" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                    on ? "translate-x-5" : "translate-x-0.5",
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
