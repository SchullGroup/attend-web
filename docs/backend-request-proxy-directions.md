# Backend Feature Request: Pre-Directed Proxy Instructions API

## Overview
When a shareholder appoints a proxy (either the Chairman of the meeting or a named individual), they need the ability to specify how their proxy should vote on each specific resolution prior to the meeting. 

Currently, appointing a proxy via `POST /api/v1/participant/events/{eventId}/proxy` works, but the subsequent request to submit resolution-level instructions returns a `404 Not Found`. On the frontend, we have temporarily hidden the instructions section (`PROXY_DIRECTIONS_ENABLED = false`) in [src/app/(main)/agm/proxy/page.tsx](file:///c:/Users/HP/Desktop/Attend-Project/attend-web/src/app/(main)/agm/proxy/page.tsx) until this endpoint is available.

---

## Required API Specification

### Endpoint:
`POST /api/v1/participant/events/{eventId}/proxy/directions`

> *(Alternatively `/api/v1/agm/{eventId}/proxy/directions` if maintaining legacy namespace, but participant namespace is preferred for consistency).*

### Headers:
```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

### Request Body:
```json
{
  "directions": [
    {
      "resolutionId": "res-uuid-1",
      "direction": "FOR"
    },
    {
      "resolutionId": "res-uuid-2",
      "direction": "AGAINST"
    },
    {
      "resolutionId": "res-uuid-3",
      "direction": "ABSTAIN"
    },
    {
      "resolutionId": "res-uuid-4",
      "direction": "LET_PROXY_DECIDE"
    }
  ]
}
```

#### Valid Direction Enum Values:
* `"FOR"` – Auto-cast vote as FOR.
* `"AGAINST"` – Auto-cast vote as AGAINST.
* `"ABSTAIN"` – Auto-cast vote as ABSTAIN.
* `"LET_PROXY_DECIDE"` – Do not auto-cast; leave open for the appointed proxy to cast live during the AGM.

### Expected Response (`200 OK`):
```json
{
  "status": true,
  "message": "Proxy directions saved successfully",
  "data": null
}
```

---

## Expected Backend Behavior
1. **Validation**: Ensure the user has an active proxy appointment for the specified `eventId`.
2. **Auto-Casting Logic**: 
   * When a resolution opens or closes during a live AGM, votes with directed instructions (`FOR`, `AGAINST`, `ABSTAIN`) should be auto-cast on behalf of the shareholder using their share weighting.
   * Resolutions marked `LET_PROXY_DECIDE` should remain un-voted until the appointed proxy casts the vote live.

---

## Frontend Activation
As soon as this endpoint is deployed, we only need to update 1 line in `src/app/(main)/agm/proxy/page.tsx`:
```typescript
const PROXY_DIRECTIONS_ENABLED: boolean = true;
```
This will immediately restore the full resolution direction breakdown UI for all shareholders.
