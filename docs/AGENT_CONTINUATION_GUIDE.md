# Agent Continuation Guide — Attend Participant Web

**Audience:** an AI agent (possibly less capable) picking up this work between
sessions. Read this top-to-bottom before touching code. It captures not just
*what* was done but *how to reason* about this codebase so you don't repeat
mistakes that have already been made and fixed.

**Keep this file updated.** When you finish a unit of work, add it to
[§12 Changelog](#12-work-log) and adjust the status matrix in §8. This doc is the
memory that survives session limits.

---

## 1. What this project is

`attend-web` — the **participant/guest-facing** web app for Attend, an enterprise
events platform. It serves three event types:

- **AGM/EGM** (`eventType: "AGM_EGM"`) — shareholder meetings: live video, resolution
  voting, proxies, Q&A, minutes.
- **Product launches** (`eventType: "PRODUCT_LAUNCH"`) — live streams, press kits, polls.
- **Innovation challenges / hackathons** (`eventType: "HACKATHON"` or
  `"INNOVATION_CHALLENGE"`) — challenge browsing, resources, submissions.
- Plus **general events** (`eventType: "GENERAL"` / `"GENERAL_EVENT"`).

There is a **separate admin/super-admin/judge console** (not in this repo). Admin-only
endpoints (`/client/**`, `/admin/**`, `/judge/**`) are **out of scope** — do not build UI
for them here. This app calls `/participant/**`, `/guest/**`, `/auth/**`.

## 2. Tech stack

- **Next.js 16** (App Router, Turbopack), **TypeScript**, **Tailwind v4**.
- **TanStack Query** for all server state (`invalidateQueries`, `refetchInterval` polling).
- **axios** via a shared `apiClient` ([src/lib/api-client.ts](../src/lib/api-client.ts)).
- **Zoom Meeting SDK (Web, Component View)** for live AGM/launch video.
- **STOMP over SockJS** for real-time Q&A.
- `qrcode.react`, `jspdf` (receipts), `js-cookie`.
- ⚠️ In Next 16 the middleware file is **`src/proxy.ts`**, not `middleware.ts`. This
  tripped up a past session — `find middleware.*` returns nothing. It still behaves as
  Next middleware.

## 3. Non-negotiable operating rules

These come from the user directly. Violating them is worse than doing nothing.

1. **Commits: never add a co-author.** No `Co-Authored-By`, no "Generated with", no
   mention of Claude in messages. Author is the git user (Chinonyerem). Verify after
   committing: `git log -1 --format='%an %b' | grep -i "co-authored\|claude"` must be empty.
2. **Never push unless explicitly told.** Commit locally; wait for "push".
3. **Never `npm run build` while `next dev` is running** — it corrupts `.next`.
4. **Typecheck is the gate.** Run `npx tsc --noEmit` after every change set; it must be
   clean before you commit. There is **no ESLint config** in the repo, so tsc + manual
   review is all you have.
5. **Verify before asserting.** Never present a theory as a root cause. Prove it with a
   grep, a live API call, or the actual code. The user has corrected this repeatedly.
6. **Zoom Client Secrets were pasted in chat during development — they MUST be regenerated
   before production.** Flag this whenever Zoom config comes up.
7. **The repo has been reset/replaced mid-project before.** If `git status` is
   unexpectedly clean or HEAD moved, your uncommitted work may be gone and other commits
   may have landed on top. **Re-audit the current code; don't trust your memory of it.**
   Commit early and often to avoid losing work.

## 4. How to reason about this codebase

The single most valuable skill here is **distinguishing "our frontend bug" from "the
backend never built it."** This project's spec drifted from what the backend shipped, so
the FE was repeatedly built against endpoints that 404. Method:

1. **When something 404s or errors, check the live API first.** Fetch the OpenAPI:
   ```bash
   curl -s https://attend-api.schulltech.com/v3/api-docs -o apidocs.json
   ```
   (Save to the scratchpad dir. The API is sometimes slow/unreachable — retry 2–3×.)
   Then grep the `paths` for the route. If the path isn't there, it's a backend gap, not
   our bug. Several "obvious" endpoints from the spec **do not exist** (see §6).
2. **Read request/response schemas, don't assume.** Many responses are
   `ApiResponseMapStringObject` (a generic map) — fields exist at runtime but aren't in a
   typed schema. Read defensively (`data?.someKey`) and `grep` the raw docs text for a
   field name if the schema is generic.
3. **Grep for evidence before claiming a cause.** e.g. "why does it route to Launches?" →
   grep the routing logic, don't guess.
4. **Separate the layers.** A guest hitting a participant endpoint gets 401 *by design* —
   that's "not allowed", not "session expired". Don't "fix" backend-correct 401s.
5. **When the user pushes back ("are you hallucinating?"), they're usually right that
   something is off.** Re-verify against real evidence rather than defending.

## 5. Auth & session model (critical — most bugs live here)

Two completely different identities:

### Signed-in participant
- Auth = **`accessToken` cookie** (js-cookie). ~15-min lifetime; refresh via
  `POST /api/auth/refresh` (interceptor handles it).
- `useSession()` → `type: "SHAREHOLDER"`, full VIEW/QA/VOTE capabilities.

### Guest (no account)
- Auth = **`guestToken` in `sessionStorage`** (dies with the tab), sent as the
  **`X-Guest-Token` header** — NEVER as `Authorization`.
- Plus a flag-only **`isGuest` cookie** so the server-side middleware (`proxy.ts`) can see
  the guest — the server cannot read `sessionStorage`.
- Guest session helpers live in [src/lib/guest-session.ts](../src/lib/guest-session.ts):
  `storeGuestSession`, `clearGuestSession`, `getGuestName`, `guestLiveHref`,
  `resolveGuestLiveHref`, `readJoinResult`. **Always go through these** — writing
  `sessionStorage` directly caused a bug where a stale guest token demoted a signed-in
  shareholder to a guest (and lost their vote).

### Three enforcement points that must agree
1. **[src/proxy.ts](../src/proxy.ts)** (middleware): redirects any route without an
   `accessToken` to `/login`, UNLESS it's a public route or the `isGuest` cookie is set and
   the path is a guest-allowed live route (`/agm/live`, `/events/live`). Its `matcher`
   excludes static assets — **including `.html`**, because the Zoom SDK loads
   `/zoom-meeting.html` in an iframe and the guard was 307-ing it to `/login`, hanging the
   meeting on "Connecting…".
2. **[src/lib/api-client.ts](../src/lib/api-client.ts)** interceptor: on 401/403 it does
   the refresh dance — but for a guest (`isGuest` cookie) it just rejects. Earlier it
   *cleared the guest session and reloaded*, which bounced guests to `/login` on the first
   participant-endpoint 401. `publicEndpoints` includes the whole `/api/v1/guest/`
   namespace so guest calls never trigger the refresh/redirect flow.
3. **[src/hooks/useSession.ts](../src/hooks/useSession.ts)**: a real account always wins;
   it clears any leftover guest session when an `accessToken` is present.

### Invariant
> A guest can reach **only** `/agm/live` and `/events/live`. Participant-only queries in
> the live room are gated on `!isGuest` so a guest doesn't fire a burst of doomed 401s.
> Guests use parallel `/guest/**` endpoints for view, resolutions, Q&A, polls.

## 6. Backend facts

- **Base URL:** `https://attend-api.schulltech.com`. Swagger UI:
  `.../swagger-ui/index.html`. Machine-readable: `.../v3/api-docs`. The Next dev server
  proxies `/api/v1/*` to it (see [next.config.ts](../next.config.ts)).
- **Response envelope:** `{ requestTime, referenceId, status, message, data }`.
- **Namespaces that exist:** `auth`, `participant`, `guest`, `client`, `admin`, `judge`,
  `innovation`, `device-tokens`, `upload`, `kyc-officer`. **There is NO `agm` and NO
  `tenants` namespace** — routes like `/api/v1/agm/...` 404.
- **Endpoints the FE was built against that DO NOT exist** (confirmed via api-docs):
  - `GET /guest/invites/{code}`, `POST /guest/redeem`, `GET /guest/session` — the old
    guest-invite flow. Dead. Guests use `/guest/events/{id}/join` + `/view`.
  - `POST /agm/{eventId}/proxy/directions` — pre-directed proxy votes (spec §5.5). Never
    built; there's no `/agm` namespace. UI is flag-hidden behind `PROXY_DIRECTIONS_ENABLED`
    in [agm/proxy/page.tsx](../src/app/(main)/agm/proxy/page.tsx). Tracked in
    [backend-request-proxy-directions.md](./backend-request-proxy-directions.md).
- **The backend "AGM + Onboarding" handoff** is the source of truth for recent features.
  Its sections are referenced in commits as "§7", "§10", "§11" etc. Key ones:
  §2/§9 guest access, §7 register branding (`branding.logoUrl` + `branding.brandColor` on
  every event payload; default `#0B5CFF`), §8 multi-candidate resolutions, §10 proxy codes
  + precedence, §11 unified proxy sign-in (`canVote`) + QR. **Treat the handoff as
  aspirational** — it says "no live manual API run was done", and some fields it describes
  (e.g. proxy `status`/`sharesRepresented`) aren't in the live schema yet.
- **Naming gotcha:** the spec said `nominees`/`nomineeVotes`/`nomineeId`; the API actually
  uses **`candidates`/`votes`/`candidateId`**. AGM type is **`AGM_EGM`**, not `"AGM"`.

## 7. Where things live (map)

- Route groups: `(auth)`, `(kyc)`, `(guest)`, `(main)`. Live rooms: `(main)/agm/live` and
  `(main)/events/live`, both rendering [LiveRoom.tsx](../src/components/attend/LiveRoom.tsx).
- Guest entry: `(guest)/guest` (browse), `(guest)/guest-join` (invite link),
  `(guest)/join/[code]` (legacy redirect).
- API layer: `src/api/{events,agm,auth,kyc,...}/{client,hooks}.ts`. Types in `src/types/`.
- `LiveRoom.tsx` is the biggest, most important component — video (Zoom/iframe), ballot,
  Q&A, polls, press kit, for both participant and guest. Most feature work touches it.

## 8. Feature status matrix

| Area | Status | Notes |
|---|---|---|
| Guest browse → join → live | ✅ | `/guest`, `/guest-join`; sessionStorage + isGuest cookie |
| Guest Q&A (view/submit/upvote) | ✅ | `/guest/.../questions` |
| Guest polls (view/vote) | ✅ | `/guest/.../polls` |
| Guest resolutions (view-only) | ✅ | `/guest/.../resolutions` (bare array) |
| Multi-candidate resolutions (§8) | ✅ | `candidates`/`votes`/`candidateId` |
| Proxy appoint + code (§10) | ✅ | shows `proxyCode` |
| Proxy self-service vote by code (§10) | ✅ | `/guest/.../proxy-vote` |
| Unified proxy vote via `canVote` (§11) | ✅ | proxy signs in once, votes via `/guest/.../vote` |
| Proxy QR (`proxyQrCode`) (§11) | ✅ | rendered on receipt + appoint screen |
| Proxy precedence 409 | ✅ | handled in LiveRoom + pre-vote |
| "What your proxy voted" | ✅ | derived from vote receipt; receipt + proxy-history |
| Ballot auto-advance (multi-open) | ✅ | next unvoted open resolution, optimistic |
| Per-candidate live tally | ✅ | on `NomineeBallot`, head counts |
| Proxy receipt download (proxy history) | ✅ | shared `lib/vote-receipt-pdf.ts`, inside the row dropdown |
| Register branding (§7) | ✅ | cards, guest grid, live-room header |
| Block proxy assign/revoke once LIVE | ✅ FE-only | appoint page + both entry points; backend still permits |
| Zoom live | ✅ | same-account rule applies (§11 below) |
| AGM minutes | ✅ | `data:null` = not published yet |
| Pre-directed proxy votes | ❌ backend | endpoint doesn't exist; flag-hidden |
| Admin proxy dashboard / per-proxy outcomes | ❌ out of scope | admin console, not this app |

## 9. Known traps (already hit — don't repeat)

- **`eventType` is `AGM_EGM`, not `AGM`.** Guessing `"AGM"` routed AGMs into the launches
  section. `guestLiveHref` accepts both spellings.
- **SSR can't read `sessionStorage` or cookies via js-cookie.** Any component that gates on
  guest/auth state renders the "logged-out" branch on the server, ships it in the HTML, and
  relies on hydration to undo it. The AGM KYC gate did this — fixed by waiting for
  `session.loading` to resolve before deciding. **Gate auth-dependent UI on a resolved
  session, never on the first render.**
- **Stale guest token.** Reading `sessionStorage.getItem("guestToken")` directly (instead
  of via `useSession`) let a leftover token demote a signed-in shareholder to guest. Always
  use `useSession`.
- **`/zoom-meeting.html` must be public** in the `proxy.ts` matcher, or the Zoom iframe 307s
  to login and the meeting hangs on "Connecting…".
- **Resolution numbering:** use position (`sortedRes.findIndex + 1`), not `order + 1` —
  `order` isn't reliably 0-based (produced "6 of 5" and "Resolution 3" vs "2 of 2").
- **Zoom "Waiting for the host to start the meeting"** is not a bug — it's Zoom's own
  waiting room; the meeting genuinely hasn't been started by a host. The grey Zoom
  Workplace panel with a self-view tile means the SDK connected fine.

## 10. Zoom specifics

- **Same-account rule (error 4011):** the SDK app (key/secret) and the meeting must belong
  to the same Zoom account, or cross-account ZAK/OBF is required. In practice: use the
  admin account's SDK key/secret so `isSameAccount: true`.
- **Cross-origin isolation:** gallery/self-view needs `SharedArrayBuffer`, which needs COOP
  `same-origin` + COEP `credentialless`. Applied **only** when a page has `?coi=1`
  (LiveRoom adds it and reloads for Zoom meetings). Other pages stay un-isolated so
  YouTube/Vimeo iframes keep working. Config in [next.config.ts](../next.config.ts).

## 11. Working checklist (per change)

1. Understand the request; if it's an endpoint gap, verify against api-docs first.
2. Grep the current code (it may have changed since last session).
3. Make the change; match surrounding style and comment density.
4. `npx tsc --noEmit` → must be clean.
5. Commit with a clear message, **no co-author**. Verify authorship.
6. Update this guide (§8 matrix + §12 log) and the relevant `docs/*`.
7. Do **not** push. Report what you did, what you verified, and what you couldn't verify
   (e.g. anything needing a live proxy code or a running Zoom meeting).

## 12. Work log

Most recent first. Update this as you go.

- `9e53c98` — **Proxy assignment + revocation closed at LIVE** (appoint page shows a
  closed-state panel; AGM-list and event-detail entry points hide the action — the same
  `!isLive && !isEnded` pattern "Pre-AGM Voting" already used). **FE-only.** Also
  **unified the proxy-history download**: extracted the receipt page's PDF builder into
  `lib/vote-receipt-pdf.ts` so proxy history downloads the *same* vote receipt, and moved
  the button into the row dropdown beside the proxy activity. The code+QR authorization
  artifact stays on the appoint-success screen (pre-meeting hand-off).
- `4329ad3` — *(superseded by `9e53c98`)* first pass at a downloadable proxy authorization
  card from proxy history.
- `9dd3e22` — Per-candidate **live tally** on the candidate ballot (`NomineeBallot`), hidden
  until votes exist. The standard-resolution tally already showed for all voters.
- `24b6ba7` — **Auto-advance** the ballot to the next *unvoted* open resolution on a
  successful cast (optimistic `locallyVoted` set, no ~5s poll wait). Prev/next stepper
  shows only when >1 resolution is open; a transient "vote recorded" note survives the jump.
- `22fe7bc` — **Three review-found bug fixes:** (1) [high] guest business-rule 403s (wrong
  proxy code, "not a proxy session", already-voted) were ejecting the guest via the
  token-expiry handler — now auto-logout only on 401 (any guest route) or 403 on `/view`;
  (2) [med] stale `voteMsg` falsely marked the next resolution "Vote Recorded" — reset on
  `openRes.id` change; (3) [low] stale `pollChoice`/`pollMsg` across polls.
- `4e9f857` — This continuation guide.
- `2ffe7a9` / `1b9f026` / `d79ef61` / `c12b9e8` / `1d7dc49` — §11 unified proxy voting
  (`canVote`, vote via `/guest/.../vote`), §11 `proxyQrCode` QR on receipt + appoint,
  §7 live-room branding, "What your proxy voted" panel on receipt + proxy history.
- **§12 (mutually-exclusive proxy channels) — already handled, no code change.** The new
  "Already recorded via CSV" is a **409**; our interceptor only touches 401/403 (so no
  eject) and vote `onError` shows `err.response.data.message` inline. CSV skip + ENDED-only
  gating are admin-console concerns, out of scope here.

### `1b9f026` and older
- `d79ef61` — §7 live-room header themed with register `logoUrl` + `brandColor`.
- `c12b9e8` — §11 `proxyQrCode` rendered as scannable QR on receipt + appoint screen.
- `1d7dc49` — §11 unified proxy voting: read `canVote` from guest session, vote via plain
  `/guest/.../vote` (no per-vote code); §10 code box kept as fallback.
- Earlier (`c2cb4b1` and prior + other sessions' `12c3954`, `04ecb33`, `53946a6`,
  `de3af0c`): working guest access end to end (browse/join/invite), candidate-resolution
  fix, guest Q&A/polls/upvote, proxy-code voting, branding on cards, the middleware /
  interceptor / KYC-gate / stale-token / eventType fixes described in §5 and §9.

## 13. Other docs

- [FE_HANDOFF_STATUS_2026-07.md](./FE_HANDOFF_STATUS_2026-07.md) — feature status vs the
  backend handoff (participant/guest scope).
- [backend-request-event-features.md](./backend-request-event-features.md) — asks/questions
  for backend (guest endpoint contradictions, feature flags, RSVP direction clash).
- [backend-request-proxy-directions.md](./backend-request-proxy-directions.md) — the
  missing pre-directed proxy endpoint.
- [backend-request-revoke-proxy.md](./backend-request-revoke-proxy.md) — revoke-proxy ask.
- [auth_and_tanstack_guide.md](./auth_and_tanstack_guide.md) — auth + query patterns.

## 14. Open items / backlog

### Verification / cleanup
- **Proxy LIVE gating is FE-only.** `9e53c98` blocks appointment *and* revocation from
  LIVE onward on the appoint page and both entry points, but **the backend still accepts
  these calls at any status** — a direct API call bypasses it. Worth a backend ask,
  especially as §12's whole theme is gating write-flows by event lifecycle.
- **The "48 hours before the meeting" copy on the appoint page is still not enforced** —
  we enforce at LIVE instead. Either implement the real 48h cutoff (start time is
  available) or soften the copy so UI and text agree.
- **§11 unified vote / branding / candidate tally need live verification** — endpoints &
  types confirmed, but not an end-to-end run (needs a real proxy code, an event with several
  simultaneously-open resolutions, and populated guest tallies).
- **`ProxyHistoryItem` over-declares** `status`, `sharesRepresented`, `directions[]` — the
  live API doesn't send them. Guarded in UI so harmless. Leave documented-as-pending or
  trim; user's call.
- **RSVP reopen direction (§1)** — handoff says RSVP reopens 30 min after LIVE; earlier spec
  said the opposite. Unresolved with backend. UI assumes a `lateRsvpMinutes` window.
- **Correct `backend-request-event-features.md`**: it claims the missing code→event lookup
  is a gap, but invite links carry `eventId` by design — so that's not actually a backend
  gap. Worth fixing before it goes to backend.
