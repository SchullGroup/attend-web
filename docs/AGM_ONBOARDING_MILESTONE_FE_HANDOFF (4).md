# AGM + Onboarding Milestone — FE Handoff

Backend status: implemented, compiled clean, Spring context smoke-tested (`BUILD SUCCESS`, 0 failures). No live manual API run was done this session — please flag anything that doesn't match on first integration.

All endpoints below use the standard envelope unless noted:
```json
{
  "requestTime": "...",
  "requestType": "Outbound",
  "referenceId": "...",
  "status": true,
  "message": "...",
  "data": { ... }
}
```

---

## 1. AGM live join eligibility + RSVP reopen window

**No endpoint changes.** `POST /api/v1/participant/events/{id}/rsvp` keeps the exact same contract.

Behavior change only:
- Previously RSVP closed permanently the moment an event went LIVE.
- Now RSVP **reopens automatically 30 minutes after the meeting goes live** (i.e. `liveStartedAt + 30min`), and stays open for the rest of the LIVE period. All existing eligibility checks (KYC verification for AGM/EGM, invite-only guest list) still apply during the reopened window.
- `POST /api/v1/participant/events/{id}/check-in` was already unrestricted by timing — no change, already lets any registrant join anytime while LIVE.

No FE change required beyond knowing RSVP can succeed again later in a LIVE event (don't hide the RSVP button just because status flips to LIVE).

---

## 2. Guest access (view/join only, no login required)

New, fully unauthenticated flow for non-shareholder guests (directors, regulators, auditors). **Scope: view/join only — no voting, polls, or chat.**

### Admin: manage codes (CLIENT_ADMIN / ADMIN / EVENT_MANAGER)

**Create a code** — `POST /api/v1/client/events/{eventId}/guest-access`
```json
// request body (all optional)
{ "label": "Board observers", "expiresAt": "2026-08-01T18:00:00", "maxUses": 50 }
```
```json
// response data
{
  "id": "uuid",
  "code": "7F3KQXPM",
  "label": "Board observers",
  "expiresAt": "2026-08-01T18:00:00",
  "maxUses": 50,
  "useCount": 0,
  "revoked": false,
  "createdAt": "..."
}
```

**List codes** — `GET /api/v1/client/events/{eventId}/guest-access` → `data: [ ...same shape as above ]`

**Revoke a code** — `DELETE /api/v1/client/events/{eventId}/guest-access/{accessId}` → takes effect immediately, even for tokens already handed out.

A "shareable link" is just this same code embedded in your own join-page URL, e.g. `https://app.example.com/guest-join?eventId={eventId}&code=7F3KQXPM` — there's no separate link entity on the backend.

### Guest: join and view (no auth header, no account)

**Join** — `POST /api/v1/guest/events/{eventId}/join`
```json
// request
{ "code": "7F3KQXPM" }
```
```json
// response data
{
  "eventId": "uuid",
  "eventTitle": "Annual General Meeting 2026",
  "status": "LIVE",
  "streamUrl": "https://...",      // null if not LIVE yet
  "zoomJoinUrl": "https://...",    // null if not a Zoom event or not LIVE yet
  "guestToken": "opaque-string"    // store this, send on every /view call
}
```
Errors: `403 Invalid code` if the code is wrong, expired, revoked, or has hit `maxUses`.

**Re-fetch the view** — `GET /api/v1/guest/events/{eventId}/view`
Header: `X-Guest-Token: <guestToken>` — **do not** send this as `Authorization`, it will be rejected by the normal auth filter.
```json
// response data — same shape as join, minus guestToken
```
Errors: `401` if the token is invalid/expired/for a different event; `403 Access revoked` if the admin revoked the code since the token was minted (checked live on every call, not just once).

WebSocket: connect to `/ws` and send native STOMP header `guest-token: <guestToken>` on CONNECT instead of `Authorization`. A guest connection can only subscribe to `/topic/live.{eventId}` for its own event — subscribing to any other topic is rejected.

⚠️ Flagged to backend/security review: there's no rate-limiting on the join endpoint yet, so a short code is brute-forceable in theory. Keep `maxUses`/`expiresAt` conservative until that's addressed.

---

## 3. Flexible stakeholder import (email OR phone)

**No new endpoints** — existing ones, contract additions only:

**`POST /api/v1/client/registers/{registerId}/shareholders`** (bulk upload/upsert by CHN)
- `email` and `phone` were already optional per-row; now a row with **both blank is skipped** instead of silently saved with no contact info.
- Response `data` gains two fields:
```json
{
  "registerId": "...",
  "inserted": 12,
  "updated": 3,
  "skipped": 1,
  "totalShareholders": 150,
  "activeShareholders": 148,
  "errors": ["Row for CHN CHN123456789 skipped: at least one of email or phone is required."]
}
```
`errors` is only present when `skipped > 0`.

**`PATCH /api/v1/client/registers/{registerId}/shareholders/{shareholderId}`**
- New `400 Bad Request` if the PATCH would leave the shareholder with neither email nor phone (e.g. blanking out their only contact field):
```json
{ "error": "Contact required", "message": "Shareholder must have at least one of email or phone." }
```

---

## 4. Proxy voting in virtual meetings

No endpoint changes — this already worked (no hybrid-only restriction existed in the backend). `PATCH /api/v1/client/votes/{eventId}/resolutions/{resolutionId}/offline-votes` (admin-recorded vote totals) works identically for virtual events; only its Swagger description text was clarified.

---

## 5. Proxy dashboard & reporting (new)

**List proxies** — `GET /api/v1/client/votes/{eventId}/proxies?search=&status=&page=0&size=20`
Roles: CLIENT_ADMIN / ADMIN / EVENT_MANAGER / VIEWER (read-only).
- `status` filter values: `PENDING`, `ACCEPTED`, `ATTENDED` (invalid values are ignored, not rejected).
- `search` matches proxy name, grantor first/last name, or grantor email.

```json
// response data
{
  "eventId": "uuid",
  "eventTitle": "AGM 2026",
  "summary": { "total": 42, "pending": 30, "accepted": 0, "attended": 12 },
  "tabs": [
    { "key": "ALL", "label": "All", "count": 42 },
    { "key": "PENDING", "label": "Pending", "count": 30 },
    { "key": "ACCEPTED", "label": "Accepted", "count": 0 },
    { "key": "ATTENDED", "label": "Attended", "count": 12 }
  ],
  "totalCount": 42,
  "page": 0,
  "size": 20,
  "proxies": [
    {
      "id": "uuid",
      "grantorName": "Ngozi Okafor",
      "grantorEmail": "ngozi@example.com",
      "proxyName": "Chidi Eze",
      "proxyEmail": "chidi@example.com",
      "proxyPhone": "+234...",
      "status": "PENDING",
      "sharesRepresented": 150000,
      "assignedAt": "...",
      "attendedAt": null
    }
  ]
}
```
Note: `status` is currently only ever `PENDING` or `ATTENDED` in practice — `ACCEPTED` is modeled for a future proxy-holder confirmation flow but nothing sets it today. Don't build UI that assumes it's reachable yet.

**Mark a proxy attended** — `PATCH /api/v1/client/votes/{eventId}/proxies/{proxyId}/attended` (CLIENT_ADMIN / ADMIN only)
```json
// response data
{ "proxyId": "uuid", "status": "ATTENDED" }
```
This is a manual, independent admin action — it does **not** automatically adjust the resolution's offline vote totals (endpoint 4 above). Both actions need to be done separately by the admin.

---

## 6. Resolution poll breakdown (super-admin parity fix)

**No new endpoint, no shape change.** `GET /api/v1/admin/votes/{eventId}/results` now returns the **same fully-populated fields** that `GET /api/v1/client/votes/{eventId}/results` already returned — shares (`sharesFor/Against/Abstain`, `totalShares`), offline/in-room counts, combined totals, real `achievedQuorumPercentage`/`quorumMet`, and `percentageFor`/`passed` computed off combined (not online-only) totals. Previously these fields were present in the response but always zero/false for the super-admin view — if your super-admin UI was already coded defensively against that, it should now just show real numbers with no code change needed. If it was hiding those fields because they were always zero, they can be shown now.

---

## Open questions for product (not yet resolved, flagged in the backend plan)

- RSVP reopen window (#1) has no stated closing time — currently stays open for the rest of the LIVE period once the 30-min mark passes. Confirm if that's intended.
- Guest access (#2): no rate-limiting exists yet on the join endpoint.

---

## 7. Register branding (logo + color), inherited by events (new)

Default brand color: **`#0B5CFF`** — every existing register got backfilled to this on deploy; every new register defaults to it too unless set explicitly. Align your FE default to the same value.

Naming is now standardized: **`branding.logoUrl`** and **`branding.brandColor`**, nested, everywhere below. Please retire the `logoUrl ?? registerLogoUrl ?? branding?.logoUrl` probing — the nested form is now populated consistently on every event-serving payload.

**Update branding** — `PATCH /api/v1/client/registers/{registerId}/branding` (CLIENT_ADMIN / ADMIN)
```json
// request — any subset
{ "logoUrl": "https://res.cloudinary.com/.../logo.png", "brandColor": "#1A6B3C" }
```
- Upload the logo file via the existing `POST /api/v1/upload` first, then PATCH the returned URL here.
- `"logoUrl": null` clears the logo.
- `brandColor` **cannot** be cleared — omit the key to leave it unchanged, or send a valid 6-digit hex to change it. Sending `null` or an invalid hex returns `400`:
```json
{ "error": "Invalid brand color", "message": "Brand color must be a valid 6-digit hex color e.g. #1a6b3c." }
```
```json
// response data (200)
{ "logoUrl": "https://...", "brandColor": "#1A6B3C" }
```

**Register list/detail** — `GET /api/v1/client/registers` and `GET /api/v1/client/registers/{registerId}` both gain a nested `branding: { logoUrl, brandColor }` on each register.

**Every event-serving payload now carries `branding: { logoUrl, brandColor }`, resolved live from the event's register** (rebrand a register → every one of its events reflects it immediately, no caching/snapshot lag):
- Client-admin event list (`EventListResponse.events[].branding`) and detail (`EventDetailResponse.branding`)
- Super-admin event list (`EventSummaryResponse.branding`)
- Live-room snapshot, both client-admin and super-admin (`LiveRoomDetailResponse.branding`)
- Super-admin live overview (`LiveOverviewResponse.sessions[].branding`)
- **All participant "GET events" endpoints**: `GET /api/v1/participant/events` (browse), `GET /api/v1/participant/events/{id}` (detail), `GET /api/v1/participant/events/mine`, `GET /api/v1/participant/events/saved` — every event item/detail gets `branding`
- Participant live stream — `GET /api/v1/participant/events/{id}/stream` gains a `branding` key alongside `streamUrl`/`status`, so the live view can theme itself too
- Guest access join/view payload (`branding` key, alongside `streamUrl`/`zoomJoinUrl`)

Note: this is separate from the existing **organisation-level** branding you may already be reading in a few of these payloads (`organizerLogo`, `organizerPrimaryColor`, `organiserLogoUrl` — all sourced from the Stakeholder, not the Register). Those fields are untouched and still present; `branding.*` is the new, standardized, register-level source of truth going forward. If a register's own logo isn't set, `branding.logoUrl` is simply `null` — it does not fall back to the organisation logo, so keep your own fallback chain client-side if you want one.

---

## 8. Multi-candidate resolutions ("Resolution Polls") — new

Implemented as an extension of the existing resolution model, gated by a new `resolutionType` field — fully backward compatible: every existing resolution and every field on it behaves exactly as before when `resolutionType` is `STANDARD` (the default).

**Our calls on the two open questions, both already implemented:**
- **Atomic voting**: yes — a candidate-resolution vote submission must include a choice for every candidate in one request, or it's rejected with 400. No partial-ballot support needed on your end.
- **Pass/fail**: each candidate is evaluated independently against the same threshold a standard resolution uses (`>50%`, or `≥75%` if `specialResolution`) — it's normal and expected for multiple candidates to all "pass" in a multi-seat election. We added a purely informational `rank` field per candidate (1 = highest `combinedForCount`) so you can highlight a "leading candidate" in single-seat UI without us inventing a plurality-based pass rule.

### Creating a candidate resolution
`POST /api/v1/client/votes/{eventId}/resolutions` (unchanged path) — request gains:
```json
{
  "title": "Election of President",
  "resolutionType": "CANDIDATE",
  "specialResolution": false,
  "defaultDurationSeconds": 300,
  "candidates": [
    { "name": "Ngozi Okafor", "bio": "Incumbent Vice President" },
    { "name": "Chidi Eze" },
    { "name": "Amaka Bello" },
    { "name": "Tunde Alabi" }
  ]
}
```
`resolutionType` omitted/blank → `STANDARD` (today's behavior, unchanged). `candidates` required, min 2, only when `resolutionType` is `CANDIDATE`. Response gains `resolutionType` and, for CANDIDATE, `candidates: [{id, name, bio}, ...]` with server-assigned ids.

### Open/close, quorum
Unchanged — one open/close action and one quorum context governs the entire slate, exactly as requested.

### Casting a vote
Same endpoint (`POST /api/v1/participant/events/{id}/resolutions/{resolutionId}/vote`) — body shape depends on the resolution's own type (you don't need to re-send `resolutionType`, the server already knows it):
```json
// STANDARD — unchanged
{ "choice": "FOR" }

// CANDIDATE — atomic, all candidates required
{
  "votes": [
    { "candidateId": "c1", "choice": "FOR" },
    { "candidateId": "c2", "choice": "AGAINST" },
    { "candidateId": "c3", "choice": "ABSTAIN" },
    { "candidateId": "c4", "choice": "AGAINST" }
  ]
}
```
400 if any candidate is missing, duplicated, or doesn't belong to this resolution. Voting again overwrites each candidate's previous choice (same "change your vote" semantics as standard resolutions).

### Recording offline/in-room votes
`PATCH /api/v1/client/votes/{eventId}/resolutions/{resolutionId}/offline-votes` (same path) — for a CANDIDATE resolution, add `candidateId` and the call now targets **only that candidate** (one admin call per nominee):
```json
{ "candidateId": "c1", "forCount": 4, "againstCount": 1, "abstainCount": 0, "forShares": 12000, "againstShares": 3000, "abstainShares": 0 }
```
For STANDARD resolutions, unchanged.

### Results — `GET /api/v1/client/votes/{eventId}/results` and the super-admin equivalent
Each entry in `data.resolutions[]` gains `resolutionType`. For CANDIDATE resolutions, the flat `votesFor`/`votesAgainst`/etc. fields stay at 0 — all real data is in a new `candidates[]` array, same per-item shape as the resolution-level fields you already know, plus `id`, `name`, `bio`, `order`, and `rank`:
```json
{
  "id": "res_9", "title": "Election of President", "resolutionType": "CANDIDATE", "status": "CLOSED",
  "candidates": [
    {
      "id": "c1", "name": "Ngozi Okafor", "rank": 1,
      "votesFor": 120, "votesAgainst": 30, "abstentions": 5,
      "sharesFor": 450000, "sharesAgainst": 90000, "sharesAbstain": 10000,
      "offlineForCount": 4, "offlineAgainstCount": 1, "offlineAbstainCount": 0,
      "combinedForCount": 124, "combinedAgainstCount": 31, "combinedAbstainCount": 5,
      "percentageFor": 78.0, "passed": true
    }
  ]
}
```
Same `candidates[]` addition on: the participant resolutions list (`GET /api/v1/participant/events/{id}/resolutions`, each item also gets `myVote` per candidate), the live-room snapshot (both client-admin and super-admin views), and the CSV export (`GET .../export/resolutions` — one row per candidate per resolution, via `resolutions[].candidates[]`).

### Deploy note (not FE, but flagging so nobody's surprised)
This required dropping a database uniqueness constraint that can't be dropped automatically by our schema tool — needs a one-time manual step against Postgres before this ships to an environment with real data. Already tracked on our side, just flagging it exists.

---

## 9. Guest access expansion — browse, Q&A, polls, view-only voting (new)

Second, fully unauthenticated "sign in as guest" path, expanding well beyond the original view/join-only scope in §2.

### Browse events (no code, no token needed)
`GET /api/v1/guest/events?search=&page=0&size=20` — deliberately minimal per the "hide all other important data" instruction: only name, date, time, and branding logo.
```json
{
  "totalCount": 12, "page": 0, "size": 20,
  "events": [
    { "id": "uuid", "title": "Zenith Bank Plc — 2026 AGM", "date": "2026-08-15", "startTime": "10:00", "branding": { "logoUrl": "...", "brandColor": "#0B5CFF" } }
  ]
}
```

### Enter an event → access code (same mechanism as §2, response now much richer)
`POST /api/v1/guest/events/{eventId}/join` (body `{ "code": "..." }`) and `GET /api/v1/guest/events/{eventId}/view` (header `X-Guest-Token`) now return the **full** event detail, not just the minimal §2 payload:
```json
{
  "eventId": "uuid", "eventTitle": "...", "description": "...", "eventType": "AGM_EGM", "format": "VIRTUAL",
  "status": "LIVE", "date": "2026-08-15", "startTime": "10:00", "venue": "...",
  "organizerName": "...", "branding": { "logoUrl": "...", "brandColor": "..." },
  "speakers": [ { "id": "...", "name": "...", "roleTitle": "...", "bio": "..." } ],
  "agenda": [ { "id": "...", "time": "10:00", "title": "...", "speaker": "...", "orderIndex": 0, "durationMinutes": 15 } ],
  "streamUrl": "... (null unless LIVE)",
  "zoomJoinUrl": "... (null unless LIVE and Zoom-hosted)",
  "guestToken": "opaque-string — only on /join; send as X-Guest-Token on every call below"
}
```

### Q&A (new)
`GET /api/v1/guest/events/{eventId}/questions` and `POST` (same path, body `{ "content": "...", "name": "optional display name" }`), header `X-Guest-Token`. Submitted questions land in the **same moderation queue** admins already review, labeled with the supplied name or "Guest" if omitted. Guests can view approved/answered questions but **cannot upvote** (cut from this round's scope — flag if you need it).

### Polls (new)
`GET /api/v1/guest/events/{eventId}/polls` and `POST /api/v1/guest/events/{eventId}/polls/{pollId}/vote` (body `{ "optionId": "..." }`) — identical shapes to the authenticated participant poll endpoints. Guest votes are counted **together with** shareholder votes in the results (polls aren't part of the formal AGM record, so one combined tally, not two separate ones).

### Voting / resolutions — view only (new)
`GET /api/v1/guest/events/{eventId}/resolutions` — every resolution with live tallies (candidates included for election-style resolutions, per §8). Read-only for guests in general — the one exception, a guest holding a valid **proxy code**, is covered in §10.

### Real-time updates
WebSocket guests (native STOMP header `guest-token`, not `Authorization`) can now subscribe to both `/topic/live.{eventId}` (already worked) and `/topic/qa.{eventId}` (new — this is where poll-result and Q&A broadcasts actually get pushed).

### Known trade-off, by design
A guest's "identity" (used to dedupe poll votes and attribute questions) lives inside the signed `guestToken`, minted fresh every time `/join` is called. If the token expires (~6h) and they re-enter the code, they get a **new** identity — they could vote in the same poll again, and old questions won't show as "theirs." Accepted trade-off for a guest tier, not a bug — flag if this needs tightening (e.g. device-bound identity) for your use case.

---

## 10. Latest fixes — proxy CSV upload, proxy precedence, virtual proxy codes, guest name, branding & timestamps (new)

### Bulk-upload in-person proxy votes (new)
`POST /api/v1/client/votes/{eventId}/proxy-votes` (CLIENT_ADMIN / ADMIN) — same convention as the existing shareholder/attendee bulk uploads: JSON rows in the body, never a raw file upload.
```json
// request
{
  "proxyVotes": [
    { "referrerEmail": "ngozi@example.com", "resolutionId": "res_1", "choice": "FOR" },
    { "referrerEmail": "ngozi@example.com", "resolutionId": "res_2", "candidateId": "c1", "choice": "FOR" }
  ]
}
```
- `referrerEmail` is the **grantor's** (shareholder's) email — the person who assigned a proxy, not the proxy holder.
- `candidateId` only for CANDIDATE-type resolutions (§8); omit for STANDARD.
- Each row upserts a `Vote` attributed to the grantor, flows through the exact same tallying as a self-cast vote, and marks that grantor's `ProxyAssignment` as `ATTENDED`.
```json
// response data
{ "recorded": 2, "skipped": 0, "referrersNotified": 1, "errors": [] }
```
After upload, every referrer whose proxy voted gets **one consolidated notification** ("Your proxy voted on your behalf") — visible in their vote receipt (see below).

### Proxy precedence rule (new)
Once a proxy vote is recorded for a shareholder (via CSV upload above, or a proxy-code self-service vote below), that shareholder's **own** subsequent vote attempt on the same resolution/candidate is **rejected**, not silently overwritten:
```json
// 409, if the shareholder tries to vote after their proxy already did
{ "error": "Proxy already voted", "message": "Your proxy has already voted on your behalf for \"...\". Contact your event administrator if this is incorrect." }
```
No new field to check client-side beforehand — just handle the 409 on `POST /api/v1/participant/events/{id}/resolutions/{resolutionId}/vote`.

### Vote receipt shows proxy-cast votes
`GET` the participant's vote receipt endpoint — each item gains:
```json
{ "resolutionId": "...", "choice": "FOR", "votedAt": "...", "castByProxy": true, "proxyName": "Chidi Eze" }
```
`proxyName` is only present when `castByProxy` is `true`.

### Virtual proxy codes — self-service proxy voting (new)
When a shareholder assigns a proxy (`POST /api/v1/client/votes/{eventId}/proxies` or the participant equivalent), the response now includes a `proxyCode` — a random 10-digit code, generated once and stable across re-assignment:
```json
{ "id": "uuid", "proxyName": "Chidi Eze", "proxyEmail": "...", "status": "PENDING", "proxyCode": "0417382951", ... }
```
Give this code to the proxy holder. They enter it as a **guest** (no login) to cast the vote on the shareholder's behalf:

`POST /api/v1/guest/events/{eventId}/resolutions/{resolutionId}/proxy-vote` (header `X-Guest-Token`, obtained via the normal guest `/join` flow — no access code relationship to the proxy code, they're independent)
```json
// STANDARD resolution
{ "proxyCode": "0417382951", "choice": "FOR" }

// CANDIDATE resolution — atomic, all candidates required (same rule as §8)
{ "proxyCode": "0417382951", "votes": [ { "candidateId": "c1", "choice": "FOR" }, { "candidateId": "c2", "choice": "AGAINST" } ] }
```
403 if the code doesn't match any proxy assignment for this event. On success, the vote is recorded exactly as if the shareholder cast it themselves (`castByProxy: true`), the proxy assignment is marked `ATTENDED`, and the shareholder gets the same "your proxy voted" notification as the CSV-upload path. The same precedence rule above then blocks the shareholder's own later vote attempt.

### Remove my proxy (new)
`DELETE /api/v1/participant/events/{eventId}/proxy` (ATTENDEE, self only) — deletes the caller's own proxy assignment for that event (including its `proxyCode`, which becomes invalid immediately). 404 if none is assigned.
```json
// response data (200)
{ "eventId": "uuid" }
```
Note: this only removes the assignment record — if the proxy already cast a vote before being removed, that vote (and its `castByProxy: true` flag) stays on the receipt and still blocks the shareholder from voting again on that resolution/candidate (same precedence rule above, keyed off the `Vote` row, not the assignment). Use this endpoint to let a shareholder change their mind before the proxy votes, not to undo a vote after the fact.

### Guest name at join (new)
`POST /api/v1/guest/events/{eventId}/join` body gains an optional `name`:
```json
{ "code": "ABC123", "name": "Jane Doe" }
```
Omit or leave blank to continue anonymously. The response gains `guestName` (the trimmed name, or `"Anonymous"`). This name is now the default label on Q&A submissions (§9) — you no longer need to prompt for a name on every question. A per-question `name` in the `POST .../questions` body still overrides it for that one question if supplied; otherwise falls back to the join-time name, then `"Guest"`.

### Innovation Challenge responses carry branding (new)
Every challenge/hackathon response now includes `branding: { logoUrl, brandColor }`, resolved from the register that created it — same shape and behavior as §7:
- Super-admin challenge list and detail (`ChallengeListResponse.challenges[].branding`, `ChallengeDetailResponse.branding`)
- Client-admin challenge list (same `ChallengeListResponse.ChallengeItem.branding`)
- Judge challenge list and detail (same DTOs, same field)
- Participant challenge detail (`ParticipantChallengeDetailResponse.branding`)

### `createdAt` added to participant/attendee lists (new)
Three list endpoints gain a full `createdAt` timestamp alongside their existing date-only fields (kept unchanged, for backward compatibility):
- Client-admin attendee list — `AttendeeListResponse.attendees[].createdAt` (alongside the existing date-only `rsvpDate`)
- Client-admin expected-attendee list — `ExpectedAttendeeListResponse.attendees[].createdAt` (previously had no timestamp at all)
- Super-admin participant list — `ParticipantListResponse.participants[].createdAt` (alongside the existing date-only `joinedAt`/`joinedLabel`)

---

## 11. Unified guest/proxy sign-in, QR receipt, `canVote` (new)

Proxies now sign in exactly like guests — one field, one endpoint — rather than needing a separate proxy-code call per vote (§10's explicit-code endpoint still works unchanged, this is an additional, simpler path).

### Sign in with either code
`POST /api/v1/guest/events/{eventId}/join` — body unchanged (`{ "code": "...", "name": "..." }`), but `code` now accepts **any of three things**, tried in order:
1. A plain guest access code (unchanged — view/Q&A/polls only)
2. A signed QR payload from a proxy receipt (see below)
3. A raw 10-digit proxy code, typed by hand

Response gains a `canVote` boolean:
```json
{ "guestToken": "...", "guestName": "Jane Doe", "canVote": true, ... }
```
`canVote: true` means this session signed in as a proxy and can vote on resolutions; `false` means it's a plain guest session (view-only, same as before). `GET /api/v1/guest/events/{eventId}/view` also now returns `canVote` on every re-fetch, so a resumed session can re-check it without re-parsing the token.

### Voting without resending the code (new)
Once signed in with `canVote: true`, no need to resend the proxy code with every vote:
`POST /api/v1/guest/events/{eventId}/resolutions/{resolutionId}/vote` (header `X-Guest-Token`)
```json
// STANDARD
{ "choice": "FOR" }

// CANDIDATE — atomic, all candidates required (same rule as §8)
{ "votes": [ { "candidateId": "c1", "choice": "FOR" }, { "candidateId": "c2", "choice": "AGAINST" } ] }
```
403 ("Not a proxy session") if called on a session that signed in with a plain guest code (`canVote: false`). Everything else — precedence rule, notification, vote receipt visibility — is identical to §10's explicit-code endpoint; both paths write the same `Vote` row shape.

### QR code on the proxy receipt (new)
`ParticipantProxyResponse` (from `POST/GET /api/v1/participant/events/{id}/proxy`) and `ProxyHistoryResponse` (`GET /api/v1/participant/events/proxies`) both gain `proxyQrCode`:
```json
{ "proxyName": "Chidi Eze", "proxyCode": "0417382951", "proxyQrCode": "3fa85f64-...-a6:xY2z...", ... }
```
Render this as a QR code on the printed/displayed proxy receipt. Scanning it and submitting the raw string as `code` in `/join` works the same as typing the 10-digit `proxyCode` — it's signed (HMAC), so a forged or altered image fails verification rather than silently working. (The already-existing DB lookup on `proxyCode` already rejected any code that was never actually issued — the QR mainly adds scan-convenience and a harder-to-fake physical artifact for in-person check-in, not a new access-control guarantee.)

### Proxy codes are globally unique (confirmed, no change)
Checked per your question — `proxyCode` generation checks uniqueness across **all** events, not just the current one, so "unique per event" is automatically satisfied (a stronger guarantee than what was asked for).

### Flagging, not changing: guest access code format
Guest access codes are currently **8-character alphanumeric** (e.g. `A7K9QX3M`), not 6-digit numeric. The unified `/join` endpoint above doesn't rely on code length to disambiguate — it just tries a guest-code lookup, then a proxy-code lookup — so no format change was needed to ship this. Let us know if you specifically want guest codes changed to 6-digit numeric (e.g. for input-mask/UI reasons); that's a separate, larger change since it'd affect already-issued codes on live events, so flagging rather than doing it silently.

---

## 12. Proxy vote channels made mutually exclusive — no more duplicate/clobbered records (fix)

**Root cause of the duplicate-record issue**: virtual proxy self-service voting (§11) and the client-admin CSV proxy upload (§10) both write to the same `Vote` row (keyed by resolution/candidate + the shareholder), but neither checked which channel got there first — each just upserted and overwrote. A `Vote` now carries a `proxySource` (`VIRTUAL` or `CSV`, null for a non-proxy vote) so each channel can tell whose record it's about to touch.

### Virtual proxy vote — rejects if CSV already recorded it
`POST .../resolutions/{resolutionId}/vote` and `.../proxy-vote` (guest, §11) now check, per candidate for a CANDIDATE resolution (all candidates checked before anything is written — same all-or-nothing rule as §8), whether the existing vote's `proxySource` is `CSV`:
```json
// 409, if the admin already recorded this shareholder's vote via CSV upload
{ "error": "Already recorded", "message": "This shareholder's vote for \"...\" was already recorded by the event admin via CSV upload. Contact your event administrator if this is incorrect." }
```
Voting again through the **same** virtual-proxy channel (changing your mind before the resolution closes) is unaffected — that stays a normal idempotent update, not a clash.

### CSV upload — skips rows the virtual proxy already voted on, per-row
`POST /api/v1/client/votes/{eventId}/proxy-votes` (§10) now checks each row against the existing vote's `proxySource` before writing:
```json
// in the response's errors[] array, that row is skipped, not overwritten
"Row for ngozi@example.com skipped: virtual proxy has already voted on this resolution."
```
That row is counted in `skipped`, not `recorded`. Re-uploading the same CSV (or a corrected one) still works normally for rows the admin recorded themselves — only a `VIRTUAL`-sourced vote blocks a CSV row now.

### CSV upload now gated to ENDED events only (new restriction)
`POST /api/v1/client/votes/{eventId}/proxy-votes` returns 409 immediately, before touching any rows, if the event hasn't ended yet:
```json
{ "error": "Event not ended", "message": "Proxy vote uploads are only available after the event has ended, to avoid blocking live/virtual voting." }
```
This closes the "vice versa" gap: an admin could previously upload proxy votes while the meeting was still LIVE/PUBLISHED, locking in a vote before the shareholder or their virtual proxy had a chance to vote live (the existing precedence rule then blocks their own later attempt). Reconciling in-person paper votes via CSV is now strictly a post-meeting step. If your admin UI currently allows opening the upload flow before the event ends, gate that in the UI too — the API will reject it either way, but a clear pre-flight message is better UX than surfacing our 409 raw.
