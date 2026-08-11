# What We Need From Backend

Updated 10 Aug 2026, after your reply of 8 Aug.

Everything you answered has been removed and applied on our side — the notification `type` list,
`pushEnabled`, `DELETE /device-tokens`, and the stable `code` field. Thank you, that was useful and
saved us guessing.

**Push/Firebase has moved to [PARKED_PUSH_NOTIFICATIONS.md](./PARKED_PUSH_NOTIFICATIONS.md)** — it is
descoped for this sprint and needs an owner rather than an answer from you. Below is only what is
still open and still live.

---

### 1. The preference flags are stored but never applied

You confirmed the six flags are read and written but never consulted before sending. So our
Notification Preferences screen currently shows six switches that save correctly, confirm
"Preferences saved.", and change nothing about what the user actually receives.

We have told QA this so it isn't retested as working.

**The ask: is honouring them scheduled, and roughly when?** This is the one item on this list that
users can already see is wrong.

One related judgement call we can't make for you:

**Should an organiser-composed notice respect these flags, or override them?**
`POST /client/events/{id}/notify` is manual — a person types the message and sends it. If an
organiser sends "the venue has changed", arguably that should reach everyone regardless of
preference. If they send "don't forget Thursday", it probably shouldn't. Our read is that manual
notices should **override** preferences and only automated sends should respect them — but it's your
call, and it decides where the check goes.

---

### 2. Automated event reminders don't exist

We searched all 305 endpoints for anything scheduling-related — nothing in paths or schemas — which
matches your note that no scheduled job sends reminders.

To be precise about what is and isn't there: `POST /client/events/{id}/notify` works, so an organiser
**can** send "the AGM starts tomorrow" today. What's missing is anything that fires on its own.

For automated reminders to work, we think you'd need:

1. A scheduled job that finds events starting soon and sends.
2. The `emailEventReminder` / `inAppEventReminder` flags checked before each send (same fix as
   item 1 — shared work, not extra).
3. A record that a reminder was sent, so a restart doesn't re-fire it.
4. **An in-app notification row with a type name we can map** — something like `EVENT_REMINDER`.
   Without this, reminders go out by email/SMS only and never appear in the bell.
5. A decision on offsets — 24h before? 1h? Both?

**The ask: is this in scope, and should the offsets be fixed platform-wide or configurable per
event?** Fixed is simpler for everyone and we'd recommend it for v1 — configurable means new fields
on the event plus new UI in the admin app.

---

### 3. Split the two ambiguous `referenceId` types

Yes please, to the split you offered.

`PROXY_VOTE_CAST` and `HACKATHON_APPLIED` each carry a different kind of ID depending on how they
were triggered, so we can't route a tap without guessing what the ID points at. Splitting them now —
while nothing depends on them yet — is cheaper than versioning it later.

---

### 4. Do organiser broadcasts reach the in-app bell?

Your type list has no `BROADCAST` entry, and `BroadcastRequest.channel` offers only `EMAIL`, `SMS`,
`PUSH`, `ALL` — no `IN_APP`.

Reading those together: **an organiser broadcast never appears in the participant's in-app
notification feed.** Please confirm that's correct and intended.

If a broadcast *should* show up in the bell, it needs a notification row written and a type name we
can map — same as item 2.4 above.

---

### 5. One decision for you

There is **no error tracking** on the web app — no Sentry, nothing server-side. When a user hits a
failure, nobody finds out unless they tell us.

Not a bug and not yours to fix — flagging it because it's worth deciding before launch rather than
after.
