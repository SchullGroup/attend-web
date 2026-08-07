# Backend Request: Per-Resolution Share-Weighted Tallies

## 1. Overview & Context

In the Attend AGM Admin platform, admins can toggle **"Share-Weighted Tallies"** on an **individual resolution** basis. However, in the participant-facing resolutions API (`GET /api/v1/participant/events/{id}/resolutions`), the response schema currently provides `shareWeightedTalliesEnabled` only at the event wrapper level (`ResolutionsData`), rather than per resolution (`Resolution`).

As a result:
- When `shareWeightedTalliesEnabled` is `false` at the event wrapper level, all resolution share fields (`forShares`, `againstShares`, `abstainShares`) return `0`, even if individual resolutions were toggled ON by the admin.
- The frontend has no way to determine which specific resolutions have share-weighting enabled when the setting is configured on a per-resolution basis.

---

## 2. Technical Gap Analysis

### Current API Response Payload (`GET /api/v1/participant/events/{id}/resolutions`)

```json
{
  "eventId": "evt_12345",
  "votingOpen": true,
  "hasProxy": true,
  "shareWeightedTalliesEnabled": false,  // <-- Event-level flag only
  "resolutions": [
    {
      "id": "res_001",
      "title": "Approval of Financial Statements",
      "status": "OPEN",
      "forCount": 1,
      "againstCount": 0,
      "abstainCount": 0,
      "forShares": 0,       // <-- Zeroed out because event wrapper flag is false
      "againstShares": 0,
      "abstainShares": 0
    }
  ]
}
```

### Problem
1. **Granularity Mismatch**: The Admin interface toggles `shareWeightedTalliesEnabled` per-resolution, but the participant API schema exposes `shareWeightedTalliesEnabled` only at the event level.
2. **Share Tally Zeroing**: The backend zeroes out `forShares`, `againstShares`, and `abstainShares` when the global `shareWeightedTalliesEnabled` flag is false, ignoring individual resolution settings.

---

### Observed evidence (captured 7 August 2026)

Test event `a2b4cc1f-4918-4ce8-8ec4-bb713a89293e` (Test AGM event, Zenith Bank Plc).

Admin console, resolution "Shares test vote", with **Share-Weighted Tallies = On**:

```
Online    For 1   Shares For 700,000
In-room   For 0   Shares For 0
Combined  For 1   Shares For 700,000
```

Participant response for the same event at `2026-08-07 12:56:24` — `shareWeightedTalliesEnabled: false`
and every share field `0`, including on resolutions that carry a recorded vote:

```json
{
  "id": "d27a471e-30ee-476b-ace3-9dd17d078798",
  "title": "Shares test vote",
  "status": "CLOSED",
  "myVote": "ABSTAIN",
  "abstainCount": 1, "abstainShares": 0,
  "forCount": 0,     "forShares": 0,
  "againstCount": 0, "againstShares": 0
}
```

All six resolutions on the event returned `0` for all three share fields, as did every nested
`candidates[]` entry. Closing each resolution individually did **not** change this — all six
reached `status: "CLOSED"` and the flag stayed `false`.

Separately, `votingOpen` remained `true` on the wrapper while all six resolutions were `CLOSED`.
Please confirm these two notions of "closed" are intended to be independent, since the admin
toggle is gated on being "locked while voting is open".

---

## 3. Testing Caveat & Resolution Lifecycle Note

Before finalizing backend changes, verify the lifecycle behavior:
- **Timing of Toggling**: If a resolution is created or updated while in `WAITING` state, does the backend recalculate/materialize share weights when the resolution transitions to `OPEN` and votes are cast?
- **Recommendation**: Ensure that whenever a resolution has share-weighting enabled, votes cast (both pre-votes, live votes, and proxy votes) are multiplied by the participant's register share balance and reflected in `forShares`, `againstShares`, and `abstainShares` upon fetch.

---

## 4. Requested Backend API Changes

### 1. Add `shareWeightedTalliesEnabled` to the `Resolution` DTO
Include `shareWeightedTalliesEnabled: boolean` on each item inside the `resolutions` array.

### 2. Populate Share Weight Fields
When `shareWeightedTalliesEnabled` is `true` for a resolution, populate `forShares`, `againstShares`, `abstainShares` (and the `bySource` share breakdowns) using the participant's shareholding from the share register.

### Expected Updated API Schema

```json
{
  "eventId": "evt_12345",
  "votingOpen": true,
  "hasProxy": true,
  "shareWeightedTalliesEnabled": true, // Global default / fallback (optional)
  "resolutions": [
    {
      "id": "res_001",
      "title": "Approval of Financial Statements",
      "status": "OPEN",
      "shareWeightedTalliesEnabled": true, // <-- NEW: Per-resolution flag
      "forCount": 1,
      "againstCount": 0,
      "abstainCount": 0,
      "forShares": 700000,                // <-- Populated from share register
      "againstShares": 0,
      "abstainShares": 0,
      "bySource": {
        "ONLINE": {
          "for": 1,
          "against": 0,
          "abstain": 0,
          "forShares": 700000,
          "againstShares": 0,
          "abstainShares": 0
        }
      }
    }
  ]
}
```

---

## 5. Frontend Readiness & Verification

- The frontend UI components (`SourceBreakdown`, `NomineeBallot`, resolution voting displays) are already built to render both headcount and share count (e.g., `1 · 700,000 shares · 100%`).
- Once the backend supplies the per-resolution `shareWeightedTalliesEnabled` flag and non-zero share numbers, the frontend will automatically render the share weights without requiring structural UI changes.
- Frontend types will be updated to include `shareWeightedTalliesEnabled?: boolean` on `Resolution`.
