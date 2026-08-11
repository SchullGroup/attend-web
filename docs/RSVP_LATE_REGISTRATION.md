# Late registration on LIVE events

**Date:** 2026-08-11
**Reported from:** QA — "QA Fresh AGM Test – August 2026" went LIVE, participant could not join
**Symptom:** *"This event is not accepting registrations."*

**Agreed behaviour (PM, 2026-08-11):** a participant may RSVP and join up to **30 minutes after**
an event starts.

**Status:** frontend done. Backend contract updated 2026-08-11 — **pending behavioural
confirmation**, see §4.

---

## 1. What went wrong

The event was started manually and the participant, who had not registered in advance, saw an
enabled **"RSVP & Join"** button plus a badge reading *"Late Registration Open (closes 02:10 PM)"* —
then got *"This event is not accepting registrations."* on clicking.

That error is the backend's own `message`, rendered in our `rsvpError` banner. Two causes:

**The 30-minute grace period was never implemented server-side.** The contract for
`POST /api/v1/participant/events/{id}/rsvp` reads:

> **"Registers the current participant for an event. Event must be PUBLISHED or UPCOMING."**

`LIVE` is not on that list, so the RSVP was refused the moment the organiser started the event. The
window existed only on our side — `lateRsvpMinutes` came from our own commit `a3a6ac1` and the
backend never sent it. Searching the spec for `lateRsvpMinutes`, `graceMinutes`, `lateRegistration`,
`registrationDeadline` returns no matches, and there is no late-join endpoint.

**Our window was also an hour late.** The badge said 02:10 PM for a 12:40 event — 90 minutes, not 30.
`startTime` is documented as *"HH:mm 24-hour format"* and `date` as a bare `date`, neither carrying a
zone, but the page passed the combined string through `parseApiDate`, which appends `Z`:

```ts
// src/lib/utils.ts
return new Date(isDateTime && !hasTz ? `${d}Z` : d);
```

`12:40` was read as 12:40 UTC = 13:40 WAT, +30 min = 14:10. `parseApiDate` is correct for the real
`date-time` fields (`createdAt`, `requestTime`); the bug was routing a naive wall-clock through it.

## 2. No existing endpoint can substitute

Checked before raising §4, to be sure the capability is genuinely missing:

| Endpoint | Verdict |
|---|---|
| `POST /events/{id}/check-in` | Records attendance; does not create a registration. |
| `GET /events/{id}/stream` | *"403 if not registered."* |
| `POST /events/{id}/waitlist` | Accepts LIVE, but needs organiser approval. Not self-service. |
| `GET /events/{id}/my-ticket` | Requires registration. |

## 3. Frontend changes (done)

### [`src/lib/rsvp.ts`](../src/lib/rsvp.ts) — rewritten

- `LATE_RSVP_MINUTES = 30` — one exported constant, replacing the field the backend never sent.
- `parseEventStart(date, startTime)` — parses the bare date + `HH:mm` as **local** time, fixing the
  hour skew. Only defers to `parseApiDate` when `startTime` carries a full ISO timestamp.
- `getRsvpEligibility(event, now?)` → `{allowed, reason, lateWindowClosesAt}`. A LIVE event is
  allowed until `start + 30min`. Non-live events are decided by status and `rsvpEnabled`, never by
  the clock — which also fixed a second defect where the old clock-only gate disabled the button on
  still-`PUBLISHED` events past their start time, blocking RSVPs the backend would have accepted.

Verified at `TZ = UTC+1` for a 12:40 event: window closes **13:10** (was 14:10). 13:09 allowed,
13:11 refused.

### [`src/app/(main)/events/[id]/page.tsx`](<../src/app/(main)/events/[id]/page.tsx>)

- LIVE, unregistered, inside the window → *"Late registration open — closes 13:10"* + enabled
  **RSVP & Join**.
- Past the window → *"Registration closed 30 minutes after this event started. It started at 12:40."*
- Removed the *"Late Registration Re-opened (Live Room Access)"* badge, which appeared precisely when
  the window had closed.

Removed `lateRsvpMinutes` from [`src/types/events.ts`](../src/types/events.ts) — confirmed absent
from the backend. `npx tsc --noEmit` clean.

**Known limitation:** the window closes on the next render, not on a timer, so someone who loaded the
page at 13:09 could still click at 13:12 and be rejected. Left as-is rather than re-rendering every
second; easy to add if QA finds it material.

---

## 4. Backend change — reported done, how to confirm

The ask was that `POST /api/v1/participant/events/{id}/rsvp` accept a `LIVE` event within 30 minutes
of its start. As of **2026-08-11** the published contract says it does:

> "Registers the current participant for an event. Event must be PUBLISHED or UPCOMING, **or LIVE
> within 30 minutes of its scheduled start time (late registration)**."

Two things that resolves:

- `LIVE` is accepted, so the frontend already built for this needs no change.
- It is measured from the **scheduled** start, which is the same basis
  `getRsvpEligibility` uses (`date` + `startTime`). The one detail we flagged as
  needing to match, matches. There is still no go-live timestamp anywhere in the
  spec, and `ParticipantEventDetailResponse` exposes only `status`, `date`, `startTime`
  and `rsvpEnabled` — consistent with scheduled-start being the only available basis.

**That text is a hand-written Swagger annotation, not evidence of behaviour.** It is the intended
rule and it confirms the endpoint was touched, but an annotation can be edited without the logic
changing. Confirming needs a real request, and the test must be two-sided:

| Test | Expected | Why it matters |
|---|---|---|
| RSVP a LIVE event **~5 min** after start | 200, registration created | The change works. |
| RSVP a LIVE event **>30 min** after start | rejected | Proves a *window* exists. Accepting LIVE unconditionally would pass the first test on its own and silently drop the 30-minute rule. |

Curl, with a participant token and an event that is currently LIVE:

```bash
curl -i -X POST "https://attend-api.schulltech.com/api/v1/participant/events/<EVENT_ID>/rsvp" \
  -H "Authorization: Bearer <PARTICIPANT_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" -d '{}'
```

**Record the clock times.** Note the event's `startTime`, the wall-clock time of each request, and
the cutoff our UI displays. If a request inside our displayed window is refused as too late, or one
well past our displayed cutoff succeeds, the two sides disagree on the **timezone** of `startTime` —
the backend reading a naive `12:40` as UTC while we read it as local WAT would shift its window by an
hour. That is the same class of bug as §1, just on the other side of the wire, and it is exactly what
this test would surface.

The response body on refusal is worth capturing too. Only `200` is documented, so we don't know what
a too-late RSVP returns; `apiErrorMessage` renders whatever `message` or `error` prose comes back, so
whatever they send is what the participant reads.

---

## 5. QA re-test

All steps are testable now that §4 reports done. Steps 1–3 are the ones that confirm it.

1. **LIVE, within 30 min of start, not registered** → *"Late registration open — closes HH:MM"* and
   an enabled button. The time must be start + 30 min in local time; an hour later means the timezone
   regression is back.
2. **Click RSVP & Join inside the window** → registration succeeds and the live room opens. A refusal
   here means §4 did not actually ship, whatever the annotation says.
3. **LIVE, more than 30 min after start** → our UI shows *"Registration closed 30 minutes after this
   event started."* Also POST directly (§4) to confirm the **backend** refuses it, not just our UI.
   Without this step, a backend that accepts LIVE unconditionally looks identical to one that
   implements the window.
4. **Joining after a late RSVP** → the live room loads. `GET /events/{id}/stream` returns *"403 if
   not registered"*, so this checks the late registration actually satisfies that gate — the agreed
   behaviour is RSVP **and join**.
5. **PUBLISHED, before start** → RSVP enabled, succeeds.
6. **PUBLISHED, after start time but still PUBLISHED** → still enabled and succeeds. Previously
   disabled with a false "Registration Closed".
7. **`rsvpEnabled: false`** → disabled, message shown up front rather than after a failed click.
8. **COMPLETED / ENDED** → *"This event has ended."*
