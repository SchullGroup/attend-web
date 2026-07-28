# Shareholder Data Requirements — Core → Attend

**Scope:** Attend Web (Participant) application
**Purpose:** Define the shareholder information Attend requires from the Core system, how it
is used, and the decisions still outstanding.
**Status:** Field requirements confirmed against the live application. Section 6 lists items
that require a decision before the synchronisation is built.

---

## 1. Data Required from Core

### 1.1 Shareholder Identity

| Field | Purpose |
|---|---|
| **CHN** | Primary link key — identifies the shareholder at the registrar |
| **BVN** | Identity verification |
| **Full Name** (first / last) | Display and identity matching |
| **Email Address** | Account identity and notifications |
| **Phone Number** | Alternate contact and notifications |
| **Date of Birth** | Identity verification |
| **Active Status** | Whether the shareholder is eligible to participate |

> Attend accepts **email or phone** — a record with neither is rejected. Core should
> guarantee at least one contact method per shareholder.

### 1.2 Holdings

| Field | Purpose |
|---|---|
| **Register ID / Register Name** | Identifies which company's register the holding belongs to |
| **Share Count (per register)** | Determines the weight of the shareholder's vote |
| **Share Weighting Enabled** | Whether this register votes by shares or by head count |
| **Holding Status / Date** | Whether the holding is current for a given meeting |

> **Share Weighting Enabled** is required in addition to the share counts. Not every
> register is share-weighted; where it is not, Attend displays head counts only. Without
> this flag we cannot distinguish "no weighting" from "zero shares".

### 1.3 Register / Company

| Field | Purpose |
|---|---|
| **Register Name** | Event attribution and display |
| **Branding — Logo URL** | Event cards, listings, live session header |
| **Branding — Brand Colour** | Event theming |

*Register branding is already integrated in the application.*

---

## 2. How the Data Is Used

| Area | Data used |
|---|---|
| **Login and authentication** | Email / phone, held in Attend's own copy |
| **KYC verification** (BVN → CHN → Liveness) | BVN, CHN, name, date of birth |
| **AGM eligibility** | Active status, holding in the relevant register |
| **Vote weighting** | Share count per register, share-weighting flag |
| **Proxy voting** | Share count (the shares a proxy represents) |

**Login note:** users authenticate against **Attend's own copy** of the data — Core is not
queried at login. The link between an Attend account and a Core shareholder record is
established through the **KYC flow (BVN + CHN)**. See open question 6.1.

**Isolation boundary:** the Hackathon and Product Launch modules use **none** of the above.
A participant in those modules requires no shareholder record and no Core lookup.

---

## 3. Data Ownership

| System | Owns |
|---|---|
| **Core** | Shareholder identity and holdings (source of truth) |
| **Attend** | All event data — AGM participation, hackathons, product launches, registrations, attendance, voting, proxies |

Shareholder data is **copied into Attend** and synchronised on a scheduled interval
(approximately every 3–4 hours). Attend does not query Core in real time.

---

## 4. Data Model Consideration

A single shareholder may hold shares in **several companies**. The synchronisation model
must therefore support a **one-to-many relationship** — one shareholder linked to many
holdings — rather than a separate flat record per company.

```
Shareholder (CHN)
   ├── Holding → Register A → share count
   ├── Holding → Register B → share count
   └── Holding → Register C → share count
```

This matters beyond storage: eligibility and vote weight are evaluated **per register**, so
the same person can be eligible at one company's AGM and not another's.

---

## 5. Scale

The design target is approximately **2 million shareholders**, each with one or more
holdings. This affects the initial migration approach more than the incremental sync — see
open question 6.5.

---

## 6. Open Questions

These require a decision before the synchronisation is built. Items 6.1–6.3 affect the
architecture and estimate directly.

### 6.1 How is an Attend account linked to a Core shareholder record?
Currently the link is established by the shareholder completing **KYC (BVN + CHN)** inside
Attend. The alternative is to **pre-create accounts** from the migrated Core data and have
shareholders claim them. These produce very different onboarding experiences and should be
settled before build.

### 6.2 Is there one Core system, or one per registrar?
Attend already serves events from **multiple registrars**. If each registrar operates its own
system, "synchronise with Core" becomes **several separate integrations** — each with its own
API, credentials, data format and failure modes — rather than one. This materially changes
both the architecture (an adapter layer would be required to normalise formats) and the
delivery estimate.

### 6.3 Is there a record date for share weighting?
Share counts change continuously. With a 3–4 hour synchronisation interval, Attend's figures
are always slightly behind Core.

- **Option A — latest sync:** vote weight uses the most recent synchronised figure. Simple,
  but two shareholders voting an hour apart may be counted against different data, and a
  recount later may not reproduce the original result.
- **Option B — record date snapshot:** holdings are frozen as at a declared record date and
  stored against the meeting. Vote weights are calculated from that snapshot.

AGM results are corporate records and may be challenged. **Option B** is recommended, as it
makes results reproducible and auditable. It requires storing a per-meeting snapshot, which
is a data-model decision rather than a later adjustment.

### 6.4 What is the scope of personal data stored in Attend?
Does Attend need to **store** BVN and date of birth, or is a verification result
(`verified: true`) plus the CHN link sufficient? At 2 million records, holding less personal
data reduces both storage cost and risk exposure.

### 6.5 How is the initial migration performed?
Is a bulk export available from Core, or must Attend page through an API? At 2 million
shareholders plus holdings, this shapes the migration plan significantly.

### 6.6 What happens on de-registration?
If a shareholder is removed in Core, or transfers all their shares, what becomes of their
Attend account and any votes already cast?

### 6.7 Is the synchronisation strictly one-way?
Confirmed: Core → Attend. Should anything created in Attend — KYC outcomes, attendance,
voting records — be reported back to Core, or does Attend remain authoritative for all event
data?

---

## 7. Assumptions

Recorded for confirmation:

1. Attend is authoritative for all event data; Core is authoritative for identity and holdings.
2. Synchronisation is scheduled (~3–4 hours), not real-time.
3. Shareholder data is isolated from non-AGM modules. This is enforced in the application
   today; the same boundary should be enforced at the API layer, so that a request for
   shareholder data from a non-AGM context is rejected server-side rather than merely hidden
   in the interface.
4. AI-driven features are out of scope for this delivery.
5. The system is designed around the standard business process rather than exceptional cases.
