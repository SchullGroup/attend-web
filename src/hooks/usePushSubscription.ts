"use client";
import { useState, useEffect } from "react";
import { useSubscribeDevice } from "@/api/notifications/hooks";

// This lived twice, near-verbatim, in /notifications and /profile/notification-preferences.
// Both copies failed the same way: when anything went wrong the toggle simply refused to
// move and the reason went to console.error, which is invisible to the person using the app.
// One implementation, and every refusal now returns a message the UI can show.

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const supportsPush = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;

export function usePushSubscription() {
  const { mutateAsync: subscribeDevice } = useSubscribeDevice();

  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // Rendered server-side and on the first client pass as "supported" so the toggle doesn't
  // flash a disabled state before the capability check has run.
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!supportsPush()) {
      setSupported(false);
      return;
    }
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((subscription) => {
        setEnabled(!!subscription);
      });
    });
  }, []);

  async function toggle(checked: boolean) {
    setMessage(null);

    if (!supportsPush()) {
      setSupported(false);
      setMessage(
        "This browser doesn't support push notifications. Email and in-app alerts still work.",
      );
      return;
    }

    setBusy(true);
    try {
      if (!checked) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) await subscription.unsubscribe();
        setEnabled(false);
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage(
          permission === "denied"
            ? "Notifications are blocked for this site. Allow them in your browser settings, then try again."
            : "We need notification permission before push alerts can be switched on.",
        );
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
      if (!vapidKey) {
        // The key isn't configured in any environment file yet, so this is the branch that
        // actually runs today — which is why the switch appeared to do nothing at all.
        setMessage(
          "Push notifications aren't available on this environment yet. Your email and in-app alerts are unaffected.",
        );
        return;
      }

      await navigator.serviceWorker.register("/sw.js");
      const activeRegistration = await navigator.serviceWorker.ready;
      const subscription = await activeRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      await subscribeDevice(subscription as any);
      setEnabled(true);
    } catch (e: any) {
      console.error(e);
      setMessage(
        e?.response?.data?.message ||
          e?.message ||
          "We couldn't update your push subscription. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return { enabled, busy, message, supported, toggle };
}
