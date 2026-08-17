# Backend Request: `registered` flag wrong for AGM shareholders who never RSVP'd

## Problem
`GET /api/v1/participant/events/{id}` returns `registered: true` for a user who was only
added to the event's shareholder register (admin side) — they never RSVP'd. This drives the
"You're confirmed" badge and shows a "Cancel RSVP" button on the frontend.

Clicking "Cancel RSVP" then fails with `"You are not registered for this event."` — because
there genuinely is no RSVP/`EventRegistration` record to cancel. Same thing happens on
**Appoint a Proxy** for the same event/user — stable code this time:
```json
{
  "code": "NOT_REGISTERED",
  "error": "Not registered",
  "message": "You must be registered to assign a proxy.",
  "status": false
}
```
So this isn't specific to one action — every action that checks for a real RSVP
(`EventRegistration` row) rejects this user, while `registered` on the event/event-list
response says they're confirmed. The `registered` flag looks like it's set from
register/shareholder eligibility instead of an actual RSVP.

Repro:
1. Create an AGM, add a user as a shareholder on the register (admin side) — no RSVP action.
2. That user opens the event on the participant app → shows "confirmed" + Cancel RSVP.
3. They click Cancel RSVP → `400`/error: "You are not registered for this event."

**Real example** — event `fb3b601a-ed4e-485d-9657-b419dcb167fb` ("Proxy Code Test",
register `cff22cdc-1a64-4545-a17a-4c558904a594` / "schulltech"). This user was added as a
shareholder minutes before pulling this, never RSVP'd, and `registered: true` shows up
identically on both `GET /api/v1/participant/events` (list) and the single-event detail
call — so this isn't one endpoint disagreeing with another, the underlying "is this user
registered" computation itself returns true for register membership alone:

```json
{
  "id": "fb3b601a-ed4e-485d-9657-b419dcb167fb",
  "title": "Proxy Code Test",
  "registerId": "cff22cdc-1a64-4545-a17a-4c558904a594",
  "registerName": "schulltech",
  "registered": true,
  "rsvpEnabled": true,
  "status": "PUBLISHED"
}
```

## Ask
Being added to the register from the admin side is more like an invitation/pass to RSVP —
not the RSVP itself. So rather than making `registered` mean only "has an `EventRegistration`
row" (which would remove today's confirmation for people who really did RSVP), please expose
**two separate signals**:

- `registered` (or a new `eligible`) — on the register / invited, as today.
- A second field — e.g. `hasRsvped` — true only once the actual RSVP action has been taken
  and an `EventRegistration` row exists.

With both present, the frontend can keep showing the **RSVP button** (not "Cancel RSVP")
whenever `hasRsvped` is false, even if the user is already `registered`/eligible via the
share register. Only clicking RSVP creates the real record — at which point Cancel RSVP and
Appoint Proxy have something to act on, and the "You must be registered" errors go away
naturally instead of needing a special case per action.

## Also please confirm: AGM minutes access

`GET /api/v1/participant/events/{id}/minutes` is documented as gating on registration
(403 if not registered). Please confirm that check uses genuine RSVP/attendance, not the
same register/shareholder-eligibility signal behind today's `registered: true` bug above.
Minutes often contain confidential resolutions and discussion — if it's using the loose
signal, anyone on a company's share register could read minutes for a meeting they never
attended, which is a bigger deal than the RSVP-button issue. The frontend's minutes list
(`/agm/minutes`) also currently filters on `registered`, so it has the same exposure and
will be tightened to key off `hasRsvped` once that field exists.
