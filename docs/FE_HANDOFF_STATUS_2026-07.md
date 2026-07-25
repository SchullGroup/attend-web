# Attend Participant Web — FE Status & Handoff (July 2026)

Status of the participant/guest web app (`attend-web`) against the backend
**AGM + Onboarding Milestone** handoff. Scope here is the **participant- and
guest-facing** surface only — admin/super-admin/judge endpoints (§3 stakeholder
import, §5 proxy dashboard, §6 super-admin results, §4 & §10 admin offline/CSV
vote entry, branding PATCH) belong to the admin console, not this app, and are
intentionally excluded.

Verified by reading the current `dev` branch (HEAD `04ecb33`), not from memory.

---

## 1. Implemented ✅

### Guest access (handoff §2, §9)
- **Browse → join → live room.** "Continue as guest" on login → `/guest`
  (public `GET /guest/events`) → pick event → enter code → live room.
- **Invite link** `/guest-join?eventId=&code=` — the shareable shape the backend
  documents; auto-joins, guarded against strict-mode double-fire.
- **Guest name at join** (§10) — optional `name` sent on `/join`; stored and used
  as the default Q&A label. [`guest/page.tsx:239`](../src/app/(main)/../(guest)/guest/page.tsx)
- **Guest Q&A** — view, submit, **and upvote** (`/guest/.../questions/{id}/upvote`).
- **Guest polls** — view + vote (`/guest/.../polls/{pollId}/vote`).
- **Guest resolutions — view-only** with live tallies, candidates included
  (`GET /guest/.../resolutions`). Read-only enforced; no direct vote buttons.
- Guest session lives in `sessionStorage` + an `isGuest` flag cookie so the
  Next 16 `proxy.ts` middleware admits guests to `/agm/live` and `/events/live`
  **only**. Sign-out clears both.

### Multi-candidate / "Resolution Poll" resolutions (§8)
- Uses the API's `candidates` / `votes` / `candidateId` shape (the spec's
  `nominees` naming was never shipped). Candidate ballot renders a per-candidate
  For/Against/Abstain slate; atomic submission (all candidates required).
- "Fully answered" selection counting (fixes the earlier "2 of 1 selected").

### Proxy — appoint, self-service vote, receipt (§10)
- **Appoint a proxy** (`POST /participant/events/{id}/proxy`), showing the
  returned **`proxyCode`** to hand to the proxy holder.
- **Virtual proxy voting via access code** — a guest holding a 10-digit proxy
  code casts on the shareholder's behalf. "Have a proxy code?" entry in the live
  room → `POST /guest/.../resolutions/{resolutionId}/proxy-vote`. Handles both
  STANDARD (`choice`) and CANDIDATE (`votes[]`) resolutions.
  [`LiveRoom.tsx:850`](../src/components/attend/LiveRoom.tsx)
- **Proxy precedence 409** — a shareholder whose proxy already voted gets a clear
  "your proxy has already voted" message, in both the live room and pre-vote.
- **Vote receipt** shows `castByProxy` / `proxyName` ("Cast by …"), incl. in the
  PDF export.
- **Remove my proxy** — `DELETE /participant/events/{eventId}/proxy`.

### Register branding (§7)
- `branding.logoUrl` + `branding.brandColor` rendered on event cards (home,
  events, general, saved-events), the guest browse grid, **and the live-room
  header** (logo + brand-tinted organiser, guest view included), with a graceful
  fallback to the organiser name / initial when `logoUrl` is null.

### Unified proxy voting + QR (§11)
- A guest who signs in with a proxy code/QR gets `canVote: true` on the join/view
  payload; the live room reads it (`guestCanVote`) and lets them vote via the
  plain `POST /guest/.../resolutions/{id}/vote` — **no per-vote code entry**. The
  §10 code box remains as the fallback for a plain guest holding a loose code.
- **`proxyQrCode`** rendered as a scannable QR on the vote receipt and the
  "Proxy Appointed" success screen (`qrcode.react`).

### RSVP reopen window (§1)
- Late-RSVP handled via `getRsvpWindow(start, lateRsvpMinutes ?? 30)`; RSVP is
  not permanently hidden the moment status flips to LIVE.

---

## 2. Not implemented ❌ — remaining gaps

All three prior FE gaps (§11 unified proxy voting, §11 proxy QR, §7 live-room
branding) are now closed — see §1. No participant/guest-facing gaps remain
against this handoff. Anything still outstanding is backend-dependent (below).

---

## 3. Open questions still with backend

- **§1 RSVP direction clash** — handoff says RSVP *reopens* 30 min after LIVE and
  stays open; the earlier spec said *open for the first 30 min then closes*. Our
  UI assumes a `lateRsvpMinutes` window. Confirm the intended rule and whether
  it's per-event configurable. (Tracked in `backend-request-event-features.md`.)
- **Proxy pre-directed instructions (`/agm/.../proxy/directions`)** — still 404s;
  no `/agm` namespace exists. UI is flag-hidden. (Tracked in
  `backend-request-proxy-directions.md`.)
- **§10 guest identity re-mint on token expiry (~6h)** — a re-entering guest can
  double-vote in a poll. Accepted by design for the guest tier; flag if it needs
  device-bound identity.

---

## 4. Production / security notes

- **Zoom Client Secrets were pasted in chat during development and MUST be
  regenerated before production.**
- Zoom's **same-account rule** (error 4011): the SDK app and the meeting must
  share one Zoom account, or cross-account ZAK/OBF is required.
- Never `npm run build` while `next dev` is running (corrupts `.next`).
