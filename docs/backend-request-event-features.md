# Web → Backend: findings & requests (July 2026)

From the participant web app, after reviewing the July update spec and the **AGM + Onboarding FE Handoff**. Two items need a decision from you; the rest are questions.

---

## 1. Guest access — our client calls 3 endpoints that don't exist

We built the guest flow against the **update spec**, but the handoff shipped a **different contract**. Confirmed two ways (api-docs + live requests):

| Endpoint we call | In api-docs | Live |
|---|---|---|
| `GET /api/v1/guest/invites/{code}` | not found | **404** |
| `POST /api/v1/guest/redeem` | not found | **404** |
| `GET /api/v1/guest/session` | not found | **404** |

*(Control test: `POST /guest/events/{id}/join` also returns 404 for a fake event id — but with body `"Event not found."`, and it **is** in the docs. The three above return a bare 404, i.e. the route genuinely doesn't exist.)*

**What actually exists under `/guest`:**
```
POST /guest/events/{eventId}/join
GET  /guest/events/{eventId}/view
GET  /guest/events
GET  /guest/events/{eventId}/resolutions
GET  /guest/events/{eventId}/polls
GET,POST /guest/events/{eventId}/questions
POST /guest/events/{eventId}/polls/{pollId}/vote
```

**Our side:** the event detail page already uses the correct `POST /guest/events/{eventId}/join`. We'll repoint the remaining two callers (`(guest)/join/[code]` page and `useSession`) to `join` + `view` with the `X-Guest-Token` header, and delete the dead client. **No backend action needed for this part.**

### ❓ Question 1 — can guests really do Q&A and polls?
The handoff says guest scope is **"view/join only — no voting, polls, or chat."**
But the API exposes `guest/…/questions`, `guest/…/polls/{pollId}/vote`, and `guest/…/resolutions`.

**The doc and the API contradict each other.** Please confirm which is authoritative — we can't build guest UI until we know whether to show or hide Q&A and polls.

---

## 2. Feature flags — put them on the event, not per-tenant

The spec says flags come from `GET /api/v1/tenants/{id}/features`. Two problems:

1. **That namespace doesn't exist** — the API has `client`, `admin`, `participant`, `auth`, `judge`, `innovation`, `guest`, `device-tokens`. (The existing `POST /client/events/{id}/feature` is unrelated — it means "promote this event".)
2. **Per-tenant flags are ambiguous for a participant.** An admin belongs to one company, so "this tenant's flags" is obvious. But a shareholder can hold shares in Zenith *and* UBA *and* Dangote. If Zenith enables multi-nominee voting and UBA doesn't, and the user attends both AGMs, a flag attached to the **user** can't express that — it will be wrong in one of them.

**Ask:** add a `features` object to the **existing** event detail response (`GET /participant/events/{id}`) — no new endpoint, no extra round-trip:

```json
{
  "data": {
    "id": "abc-123",
    "title": "Zenith Bank AGM 2026",
    "features": {
      "lateRsvp": true,
      "guestAccess": false,
      "multiNominee": true,
      "proxyDirections": true,
      "combinedTally": true
    }
  }
}
```

All keys boolean and optional. Because it rides on the event, it's automatically the right company's settings.

**⚠️ Sync note:** features already live today (late RSVP, proxy directions, nominee ballot, combined tally) default to **on** when the field is absent. When you start sending `features`, send `true` for anything currently enabled — omitting a key you intend to be on will switch off working functionality.

**Honest caveat:** most of these features are already shipped un-flagged, so this is retrofitting. If per-event admin settings already cover it, we're happy to drop flags entirely.

---

## 3. Questions from the AGM + Onboarding handoff

### ❓ Question 2 — RSVP reopen: which direction is correct?
The handoff says RSVP **closes at live start and reopens 30 minutes later**, staying open.
The update spec says the opposite — **open for the first 30 minutes, then closes** (`lateRsvpMinutes`, configurable 0–120).

As built, someone **5 minutes late is blocked**, but someone **35 minutes late gets in**. That seems inverted from the client's intent ("let people join late"). Also, the spec wanted a **per-event** setting; the handoff hardcodes 30 minutes.

Please confirm the intended rule, and whether `lateRsvpMinutes` should be configurable per event. *(Our UI currently assumes the spec's version — open then closes.)*

### ❓ Question 3 — participant-facing proxy endpoint
`GET /client/votes/{eventId}/proxies` is **CLIENT_ADMIN / ADMIN / EVENT_MANAGER / VIEWER** only. Our `/agm/proxy-history` runs as a **participant**, so it can't call it.

**Ask:** a participant-scoped equivalent (e.g. `GET /participant/events/{id}/proxy` returning that shareholder's own proxy + per-resolution directions and outcomes), so we can enrich proxy history as the feedback asked.

### ❓ Question 4 — pre-directed proxy votes were never built

The update spec (master §5.5) specifies `POST /api/v1/agm/{eventId}/proxy/directions`, and we built the **"Pre-directed proxy instructions"** UI against it (For / Against / Abstain / Let proxy decide, per resolution). It **404s — "No such endpoint."**

Confirmed against api-docs:
- There is **no `/api/v1/agm/…` namespace at all.**
- **No path anywhere contains "direction".**
- The only proxy routes that exist are:
  ```
  GET, POST  /participant/events/{id}/proxy
  GET        /participant/events/proxies
  GET        /client/votes/{eventId}/proxies
  PATCH      /client/votes/{eventId}/proxies/{proxyId}/attended
  ```

This matches the handoff, which for Item D says *"Proxy voting in virtual meetings — **No endpoint changes** — this already worked."* So the "proxy works for virtual events" half shipped; the **pre-direction** half did not.

**Effect before our fix:** appointing the proxy succeeded, then the directions call failed — the user saw an error but their proxy *was* saved, and their instructions silently went nowhere.

**Our side:** we've hidden the pre-direction section behind a flag (one-line re-enable). Appointing a proxy works normally.

**Ask — is Item D's pre-direction half planned?** If yes, it needs two pieces, not just a route:
1. `POST /participant/events/{id}/proxy/directions` — body `{ directions: [{ resolutionId, direction }] }`, where `direction` is `FOR | AGAINST | ABSTAIN | LET_PROXY_DECIDE`.
2. The **auto-cast** behaviour: when a resolution opens, directed votes are cast automatically for absent shareholders; `LET_PROXY_DECIDE` is left for the proxy to cast live.

If it's **out of scope**, say so and we'll drop the UI rather than keep it flagged — `ProxyHistoryItem.directions` in our types would go too.

### ℹ️ Noted (no action requested)
- Guest join has **no rate limiting** yet — you flagged this. Keeping `maxUses`/`expiresAt` conservative in the meantime.
- Proxy `ACCEPTED` status is never set today — we won't build UI that assumes it.
