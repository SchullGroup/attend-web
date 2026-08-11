# Push Notifications — Parked

**Status: descoped for this sprint. Not blocked on backend, not blocked on frontend — blocked on a
decision and an owner.**

Split out of `BACKEND_ASKS.md` on 10 Aug 2026 so that document stays actionable. Nothing here needs
an answer from the backend team; it needs somebody to own a setup task.

---

## The situation

Backend said they never received Firebase credentials. Confirmed from our side: there is no Firebase
package and no Firebase or VAPID key in the web repo either.

**Nobody has created the Firebase project.** It isn't that credentials were sent and lost — they
don't exist yet.

## Why one missing project blocks both teams

A single Firebase project produces two different things, and neither side can move without its half:

- **Backend needs** the service account JSON — this is what lets them *send* a push.
- **Web needs** the web app config plus the Web Push certificate key — this is what lets a browser
  *generate a device token*, which we then POST to `/api/v1/device-tokens` so backend knows where to
  send.

Backend can't send without a token from us. We can't produce a token without the config.

## Check the mobile app first

Mobile push on Android and iOS also runs through Firebase — the same `/api/v1/device-tokens`
endpoint takes `platform: IOS | ANDROID | WEB`.

**So if the mobile team already has push working, the Firebase project already exists** and the
config we need is already in someone's hands. That would turn this from a sprint of work into about
a day.

Worth asking before anyone creates a new project — and it would also explain backend's "we never
received credentials" as a handover gap between two teams rather than a missing project.

## What it would take once the config exists

Roughly an hour of web work, all of it straightforward:

1. Install the `firebase` package.
2. Get a device token via FCM instead of the current raw `pushManager.subscribe` + VAPID approach.
3. POST it to `/api/v1/device-tokens` as `{platform: "WEB", token}`. Our current code posts a raw
   subscription object to `/api/v1/devices/subscribe`, which has never existed on the API.
4. Call `DELETE /api/v1/device-tokens?token=` when the user switches push off, so backend actually
   stops sending.
5. Test end to end. Nothing in this path has ever been tested against a real send.

`public/sw.js` is already written and handles displaying the notification and opening the right page
on click, so the display side needs no work.

## Current state in the app

The push toggle appears on both `/notifications` and `/profile/notification-preferences`. It cannot
work — there is no key configured — so it shows an explanatory message rather than failing silently.

**Recommended while parked: remove the toggle from the UI.** A switch for a feature that has never
worked is worse than no switch. The `pushEnabled` preference still saves to the backend, so nothing
is lost when push comes back — the user's stored choice survives.

## What to flag upward

**Push notifications do not currently work on any platform.** If the launch plan assumes they do,
that assumption needs correcting now.

The question that decides whether this matters for launch: **is real-time voting in scope?**

If a resolution opens for a few minutes during a live AGM and a shareholder has stepped away from
their laptop, push is the only thing that reaches them in time. Email is too slow and the in-app bell
only helps someone already looking at the page.

If launch is event listings, RSVPs and documents, email covers it and this can wait.

Note that mobile push doesn't substitute for web here even if it works — retail shareholders joining
an AGM from a laptop link won't have installed an app.

## To restart this

1. Ask the mobile team whether a Firebase project already exists.
2. If not, decide who creates it.
3. Share the service account JSON with backend and the web config + Web Push certificate key with us.
4. Re-open this document.
