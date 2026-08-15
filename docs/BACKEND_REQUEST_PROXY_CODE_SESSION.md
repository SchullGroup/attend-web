# Backend Request: One Active Session Per Proxy Code

## Problem
`POST /api/v1/guest/events/{eventId}/join` issues a new `guestToken` with `canVote: true` on every call, with no limit on how many active sessions one proxy code can have. The same code can be entered on multiple devices at once, each getting a fully working voting session — so one proxy code can vote more than once.

## Ask
Enforce one active session per proxy code, same as login already does per account via `deviceId`. Either:

1. **Reject re-join while a session is active** — second `/join` with a code that already has a live guest token fails with a clear error (e.g. `PROXY_CODE_IN_USE`).
2. **Revoke-on-rejoin** — new `/join` with that code invalidates the previous guest token (mirrors `SESSION_REVOKED` for participant login, which we already handle on the frontend).

Option 2 is likely less work if it can reuse the existing deviceId/session-revoke logic from login.

## Also confirm
Does resolution voting already block the *same* guest token from voting twice on one resolution? That's a separate check from session exclusivity above, and we haven't verified it.
