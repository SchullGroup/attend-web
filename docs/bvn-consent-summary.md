# BVN Consent — Compliance Findings

**Scope:** BVN identity verification step, Attend Web (Participant)
**Basis:** Nigeria Data Protection Act 2023 (NDPA) and CBN BVN regulations
**Status:** Review only — no code changed. Requires legal / DPO sign-off.

---

## 1. Priority Issue — BVN Access Authorisation

The CBN circular of **26 March 2026** (effective **1 May 2026**) restricts access to the BVN
database to **CBN-licensed financial institutions**. Fintechs, data aggregators and
third-party verification services are excluded unless expressly approved by the CBN.

Attend's consent notice currently names a third-party verification provider.

**Required:** written confirmation that our verification provider retains authorised BVN
access under the current regime, and that Attend's use case — shareholder verification for
AGMs, not a financial service — falls within that authorisation.

*If access is not authorised, consent wording cannot make the processing lawful. This must be
resolved before the notice is finalised.*

---

## 2. Current Position

A consent modal already exists and blocks BVN entry until accepted. It correctly requires
affirmative action, provides a decline option, states the purpose, and confirms the BVN will
not be used to access bank accounts.

The findings below concern **completeness and provability**, not the absence of a notice.

---

## 3. Compliance Gaps

| # | Gap | Requirement |
|---|---|---|
| 1 | **Right to withdraw consent is not disclosed** | NDPA s.26(4) — the data subject must be told of this right *before* consenting, and withdrawal must be as easy as giving consent |
| 2 | **Consent is not recorded** | Consent must be demonstrable. It is currently held in browser state only and never stored, so it cannot be evidenced if challenged |
| 3 | **Privacy notice content incomplete** | Missing: controller identity and contact, retention period, data subject rights, right to complain to the NDPC, cross-border transfer disclosure |
| 4 | **No link to Privacy Policy or Terms & Conditions** | The notice must be accessible in full |
| 5 | **Liveness selfie not covered** | Facial images are biometric — sensitive personal data under NDPA — and require their own explicit consent, separate from BVN lookup |
| 6 | **Lawful basis requires confirmation** | Consent is not "freely given" where a service is conditional on it. As participation is blocked without verification, counsel should confirm whether the correct basis is consent or legal obligation |

---

## 4. Required Notice Content

Subject to legal approval, the notice should state:

- **Controller** — Attend's legal entity, address and privacy contact
- **Data collected** — BVN, date of birth, name; and separately, facial image for liveness
- **Purpose** — verifying identity and eligibility to participate and vote at AGMs
- **Lawful basis** — as confirmed by counsel
- **Recipients** — verification provider (named), registrar, and any transfer outside Nigeria
- **Retention** — how long data is held and what is deleted after verification
- **Rights** — access, rectification, erasure, objection, portability, and **withdrawal of
  consent at any time**
- **Complaints** — right to complain to the Nigeria Data Protection Commission (NDPC)
- **Assurance** — BVN used solely for identity verification; never to access accounts or
  initiate transactions
- **Links** — full Privacy Policy and Terms & Conditions

---

## 5. Recommended Sequence

| Step | Owner |
|---|---|
| 1. Confirm BVN provider authorisation (Section 1) | Compliance / Vendor |
| 2. Confirm lawful basis — consent or legal obligation | Legal / DPO |
| 3. Approve final notice wording | Legal / DPO |
| 4. Record consent server-side, with notice versioning | Backend |
| 5. Update modal, add withdrawal option, add biometric consent, link policies | Frontend |

Steps 1–3 are not engineering tasks and gate the remainder. The frontend change is small once
wording and lawful basis are settled.

---

## 6. Data Minimisation — For Consideration

Confirm whether Attend needs to **store** the BVN after verification, or only the verification
result and the CHN link. With approximately 2 million shareholder records, holding less
personal data reduces both storage cost and breach exposure.

---

*Prepared as an engineering review of publicly available regulation. Not legal advice — final
wording and lawful basis require sign-off by counsel or the Data Protection Officer.*

**References:** CBN BVN circular (26 Mar 2026, effective 1 May 2026) · Nigeria Data Protection
Act 2023, ss. 26–27 · NIBSS guidance on the revised BVN framework
