# Backend Request: Live Vote Tallies for Candidate / Election Polls

## 1. Overview & Context

In the Attend AGM platform, resolutions can be either **STANDARD** (voted on as a single motion: For / Against / Abstain) or **CANDIDATE** (an election poll where participants vote on individual candidate nominees).

Currently, standard resolutions return live vote tallies (`forCount`, `againstCount`, `abstainCount`, `forShares`, `againstShares`, `abstainShares`). However, for **CANDIDATE** resolutions, the `CandidateItem` objects inside the `candidates` array do not populate live vote tallies while voting is open or closed.

As a result:
- Participants and Admins cannot view live vote counts or percentage distributions for individual candidates in election polls.
- The UI is unable to display live progress bars, candidate headcounts, or share-weighted counts per candidate.

---

## 2. Technical Gap Analysis

### Current API Response (`GET /api/v1/participant/events/{id}/resolutions`)

```json
{
  "id": "res_candidate_001",
  "title": "Election of Directors",
  "resolutionType": "CANDIDATE",
  "status": "OPEN",
  "candidates": [
    {
      "id": "cand_101",
      "name": "Dr. Adebayo Ogunlesi",
      "bio": "Independent Non-Executive Director",
      "order": 1,
      "myVote": "FOR"
      // MISSING: forCount, againstCount, abstainCount, forShares, againstShares, abstainShares
    },
    {
      "id": "cand_102",
      "name": "Mrs. Folorunsho Alakija",
      "bio": "Executive Director",
      "order": 2,
      "myVote": "FOR"
      // MISSING: forCount, againstCount, abstainCount, forShares, againstShares, abstainShares
    }
  ]
}
```

---

## 3. Requested Backend Changes

### 1. Populate Vote Tallies per `CandidateItem`
For every candidate in the `candidates` array, return the aggregated headcounts and share weights:
- `forCount`: Total number of participants who voted FOR this candidate.
- `againstCount`: Total number of participants who voted AGAINST this candidate.
- `abstainCount`: Total number of participants who ABSTAINED on this candidate.
- `forShares`: Total share weight voted FOR this candidate (when share-weighted tallies are enabled).
- `againstShares`: Total share weight voted AGAINST this candidate.
- `abstainShares`: Total share weight ABSTAINED for this candidate.

### 2. Optional: Candidate `bySource` Breakdown
Provide `bySource` breakdowns (`ONLINE`, `IN_ROOM`, `PROXY`) per candidate item if source breakdown is tracked at the candidate level.

---

## 4. Expected Updated API Payload

```json
{
  "id": "res_candidate_001",
  "title": "Election of Directors",
  "resolutionType": "CANDIDATE",
  "status": "OPEN",
  "candidates": [
    {
      "id": "cand_101",
      "name": "Dr. Adebayo Ogunlesi",
      "bio": "Independent Non-Executive Director",
      "order": 1,
      "myVote": "FOR",
      "forCount": 42,
      "againstCount": 3,
      "abstainCount": 1,
      "forShares": 1500000,
      "againstShares": 50000,
      "abstainShares": 10000
    },
    {
      "id": "cand_102",
      "name": "Mrs. Folorunsho Alakija",
      "bio": "Executive Director",
      "order": 2,
      "myVote": "FOR",
      "forCount": 38,
      "againstCount": 5,
      "abstainCount": 3,
      "forShares": 1200000,
      "againstShares": 80000,
      "abstainShares": 30000
    }
  ]
}
```

---

## 5. Frontend Readiness & Impact

- The frontend types in [`src/types/agm.ts`](file:///c:/Users/HP/Desktop/Attend-Project/attend-web/src/types/agm.ts#L6-L18) already include:
  ```typescript
  export interface CandidateItem {
    id: string;
    name: string;
    bio?: string;
    order?: number;
    myVote?: string | null;
    forCount?: number;
    againstCount?: number;
    abstainCount?: number;
    forShares?: number;
    againstShares?: number;
    abstainShares?: number;
  }
  ```
- Candidate ballot components (`NomineeBallot`, candidate voting displays) will immediately display live vote tallies, percentage bars, and share weight breakdown as soon as the backend returns these fields.
