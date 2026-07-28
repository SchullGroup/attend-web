# Core → Attend: data we need, and where it's used

Derived from the Attend data-architecture meeting (Core = source of truth, Attend keeps its
own synced database) **and** from what the participant app actually consumes today. Field
names below are the ones already in our types/UI, so this doubles as a mapping contract.

---

## 1. What we understood from the meeting

- **Core stays the source of truth**; Attend gets a **copy** and runs day-to-day off it.
- **Scheduled sync (~3–4 h)**, not real-time — cost/complexity call by Stanley.
- **Shareholder data is isolated** — hackathon/launch participants must not reach it, even
  on the same Attend account.
- **One Attend account per person**, used across AGM / hackathon / launch.
- **Design for ~2 M shareholders.**
- Build for the **normal path**, not rare edge cases. AI is **out of scope**.

---

## 2. Data we need from Core

### A. Shareholder identity (the core record)

| Field | Why we need it | Where it's used |
|---|---|---|
| `chn` | **The link key.** Clearing House Number identifies the shareholder at the registrar. | KYC step 2 (`KycStep2Request.chn`); matching an Attend account to a holding |
| `bvn` | Identity verification | KYC step 1 (`KycStep1Request.bvn`) |
| `firstName`, `lastName` / full name | Display + KYC name match | Profile, ballot, proxy receipt, Q&A attribution |
| `email` | Login identity, notifications | Auth, RSVP/vote confirmations |
| `phone` | Alternate contact/login | Auth, notifications |
| `dob` | KYC verification | KYC step 1 |
| Status (active/suspended) | Whether they may vote at all | Eligibility gating |

> Backend already accepts **email OR phone** (a row with both blank is skipped) — Core
> should therefore guarantee **at least one** contact per shareholder.

### B. Holdings — the part that drives voting

| Field | Why we need it | Where it's used |
|---|---|---|
| `registerId` / `registerName` | Which company's register the holding belongs to | `EventListItem.registerId/registerName`; event branding; scoping |
| **Share count per register** | **Share-weighted voting** — the vote's weight | `forShares` / `againstShares` / `abstainShares`; `sharesRepresented` on proxies |
| Holding status / date | Whether the holding is current as of record date | Eligibility for a given AGM |

⚠️ **A shareholder can hold shares in several companies.** Our types already model this
(`registerId` per event, `shareWeightedTalliesEnabled` per event). The sync must therefore be
**one person → many holdings**, not one flat row per person.

### C. Register / company

| Field | Where it's used |
|---|---|
| Register id, name | Event attribution, "MERISTEM REGISTRARS LTD" header |
| `branding.logoUrl`, `branding.brandColor` | Event cards, guest grid, live-room header (already built) |

---

## 3. Where this data is used in the product

- **Login / account** — email or phone; the Attend account is the identity.
- **KYC (BVN → CHN → liveness)** — proves the person owns the CHN, i.e. links an Attend
  account to a Core shareholder record. **This is the join between the two systems.**
- **AGM eligibility** — only verified shareholders of that register may RSVP/vote
  (`kycStatus === "FULL_KYC"` gates the whole AGM section today).
- **Voting weight** — share counts produce the share-weighted tallies; when a register isn't
  share-weighted we fall back to head counts (`shareWeightedTalliesEnabled`).
- **Proxies** — `sharesRepresented` is the weight a proxy carries.
- **Hackathon / launch** — needs **none** of the above. A non-shareholder registers and
  participates with no Core lookup. This is the isolation boundary in practice.

---

## 4. Questions / risks to raise

1. **How is an Attend account matched to a Core shareholder?** Today it's via the KYC flow
   (BVN + CHN). Is that the intended permanent link, or should the migration pre-create
   accounts from Core? These give very different onboarding flows — worth settling early.
2. **Is there one Core, or one per registrar?** The app already shows multiple registrars
   (Meristem, CardinalStone). If each has its own system, "sync with Core" is really
   *N* integrations, which changes the estimate substantially.
3. **Sync direction.** Confirmed Core → Attend. But what about data *created in Attend* —
   KYC results, votes, proxy assignments, attendance? Does any of it flow back, or is Attend
   authoritative for event data? (Assumption: Attend owns event data; Core owns identity.)
4. **Record date.** Share counts change. Which snapshot is authoritative for a given AGM —
   latest sync, or holdings as at a declared record date? A 3–4 h sync means a vote can be
   weighted on slightly stale numbers; for a legal record that needs an explicit rule.
5. **Deletions / de-registration.** If a shareholder is removed or transfers all shares in
   Core, what happens to their Attend account and any votes already cast?
6. **PII scope.** Do we need BVN/DOB stored in Attend at all, or only *verified: true* plus
   the CHN link? Storing less is cheaper and safer given 2 M records.
7. **Initial migration volume.** 2 M shareholders × holdings — is there a bulk export, or do
   we page an API? Affects the migration plan far more than the incremental sync.

---

## 5. Note on isolation

The meeting's "shareholder data must be isolated" requirement is mostly a **backend**
concern (schema/permissions). On the frontend it already holds: hackathon and launch screens
never request shareholder or KYC data, and the AGM section is gated behind full KYC. Worth
confirming the same boundary exists at the API layer — i.e. a hackathon-only account calling
an AGM endpoint should be rejected server-side, not merely hidden in the UI.
