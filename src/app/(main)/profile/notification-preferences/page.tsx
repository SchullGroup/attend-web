"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Mail, Smartphone, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  useGetNotificationPreferences,
  useSaveNotificationPreferences,
  useSubscribeDevice,
} from "@/api/notifications/hooks";

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

export default function NotificationPreferencesPage() {
  const router = useRouter();
  const { data: prefResp, isLoading } = useGetNotificationPreferences();
  const { mutate: savePreferences, isPending: savingPrefs } = useSaveNotificationPreferences();
  const { mutateAsync: subscribeDevice } = useSubscribeDevice();

  const [emailRsvp, setEmailRsvp] = useState(false);
  const [emailReminder, setEmailReminder] = useState(false);
  const [emailDoc, setEmailDoc] = useState(false);

  const [inAppRsvp, setInAppRsvp] = useState(false);
  const [inAppReminder, setInAppReminder] = useState(false);
  const [inAppDoc, setInAppDoc] = useState(false);

  const [pushEnabled, setPushEnabled] = useState(false);
  const [submittingPush, setSubmittingPush] = useState(false);

  useEffect(() => {
    if (prefResp?.data) {
      const p = prefResp.data;
      setEmailRsvp(p.emailRsvpConfirmation);
      setEmailReminder(p.emailEventReminder);
      setEmailDoc(p.emailNewDocument);
      setInAppRsvp(p.inAppRsvpConfirmation);
      setInAppReminder(p.inAppEventReminder);
      setInAppDoc(p.inAppNewDocument);
    }
  }, [prefResp]);

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

  function handleSave() {
    savePreferences({
      emailRsvpConfirmation: emailRsvp,
      emailEventReminder: emailReminder,
      emailNewDocument: emailDoc,
      inAppRsvpConfirmation: inAppRsvp,
      inAppEventReminder: inAppReminder,
      inAppNewDocument: inAppDoc,
    });
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Profile
      </button>

      <header>
        <h1 className="text-2xl font-bold text-foreground">Notification Preferences</h1>
        <p className="text-sm text-muted-foreground">
          Choose how you would like to be notified about meeting updates and documents.
        </p>
      </header>

      {/* Web Push Segment */}
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" /> Web Push Notifications
            </h3>
            <p className="text-xs text-muted-foreground">
              Receive instant alerts on your desktop or device when a vote opens or a meeting starts.
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
      </section>

      {/* Email Preferences */}
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-slate-100 pb-3">
          <Mail className="h-4 w-4 text-primary" /> Email Notifications
        </h3>
        <div className="space-y-3.5">
          <PreferenceToggle
            label="RSVP Confirmations"
            description="Receive an email receipt when you confirm your attendance at an event."
            checked={emailRsvp}
            onChange={setEmailRsvp}
          />
          <PreferenceToggle
            label="Event Reminders"
            description="Receive email alerts leading up to events you are registered for."
            checked={emailReminder}
            onChange={setEmailReminder}
          />
          <PreferenceToggle
            label="New Document Uploads"
            description="Receive an email when new brochures or materials are published."
            checked={emailDoc}
            onChange={setEmailDoc}
          />
        </div>
      </section>

      {/* In-App Notifications */}
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-slate-100 pb-3">
          <Bell className="h-4 w-4 text-primary" /> In-App Notifications
        </h3>
        <div className="space-y-3.5">
          <PreferenceToggle
            label="RSVP Confirmations"
            description="Display a notification in the app when your RSVP is successful."
            checked={inAppRsvp}
            onChange={setInAppRsvp}
          />
          <PreferenceToggle
            label="Event Reminders"
            description="Display inside the app reminders when a meeting is about to go live."
            checked={inAppReminder}
            onChange={setInAppReminder}
          />
          <PreferenceToggle
            label="New Document Uploads"
            description="Display a badge when new meeting materials are uploaded."
            checked={inAppDoc}
            onChange={setInAppDoc}
          />
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={savingPrefs} className="flex items-center gap-2 px-6">
          <Save className="h-4 w-4" /> Save Preferences
        </Button>
      </div>
    </div>
  );
}

function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (c: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-0.5 max-w-[80%]">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground leading-normal">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
