# Backend Feature Request: Revoke Proxy API

## Overview
Shareholders who have assigned a proxy (either the Chairman or a named proxy) need the ability to **revoke** their proxy appointment prior to or during the meeting so they can cast votes directly.

Currently, calling `DELETE /api/v1/participant/events/{eventId}/proxy` returns server error `"Something went wrong. Please try again later."` because no `DELETE` method handler is implemented for `/api/v1/participant/events/{id}/proxy` on the backend.

---

## Required API Specification

### Endpoint:
`DELETE /api/v1/participant/events/{eventId}/proxy`

### Headers:
```http
Authorization: Bearer <accessToken>
```

### Expected Response (`200 OK`):
```json
{
  "status": true,
  "message": "Proxy revoked successfully",
  "data": null
}
```

---

## Expected Backend Behavior
1. **Validation**: Verify that the authenticated participant has an active proxy for `eventId`.
2. **Revocation Logic**:
   - Mark the proxy assignment record as `REVOKED` (or soft-delete).
   - Invalidate any generated `proxyCode` for that shareholder.
   - Re-enable direct pre-voting and live voting for the shareholder.
