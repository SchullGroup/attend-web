# BVN Consent — Regulatory Review (NDPA 2023 / CBN)

**Scope:** the KYC BVN step in Attend Web (Participant) — `src/app/(kyc)/bvn/page.tsx`.
**Status:** review only. **No code has been changed.**
**Caveat:** this is an engineering review of publicly available regulation, **not legal
advice**. Final wording and legal basis must be signed off by counsel / the Data Protection
Officer before release.

---

## 0. Most important finding — this is not (only) a pop-up problem

On **26 March 2026** the CBN issued a circular revising the BVN regulatory framework,
**effective 1 May 2026**. Under it, **access to the BVN database is restricted to
CBN-licensed financial institutions**. Third parties — including **fintechs, data
aggregators and informal verification services** — are cut off *unless expressly approved by
the CBN*. Providers with active NIBSS partnership agreements may still verify through
authorised channels.

Our consent modal currently names **"Dojah / NIBSS"** as the licensed verification partners.

**Action required (not a UI change):** confirm in writing that the BVN verification provider
we use still holds authorised access under the post-May-2026 regime, and that **Attend's own
use case** (shareholder identity verification for AGMs — not a financial service) is covered
by that authorisation. If it is not, no amount of consent wording makes the processing lawful.

This should be verified **before** the consent copy is finalised, because the answer changes
what we are allowed to say.

---

## 1. What we already have (credit where due)

The BVN page **already shows a blocking consent modal before the form** — it is not missing.
It currently:

- opens first, before any BVN entry;
- requires an affirmative click (`hasConsented` defaults to `false`, nothing is pre-ticked);
- offers a genuine **Decline** path;
- names the purpose (shareholder eligibility and voting);
- states BVN will not be used to access bank accounts;
- is labelled as an NDPA & CBN notice.

That is a reasonable starting point. The gaps below are about **completeness and
provability**, not about the absence of a notice.

---

## 2. Gaps against NDPA 2023

### 2.1 Right to withdraw consent is not disclosed — **required, currently missing**
Section 26(4) NDPA: where processing is based on consent, the data subject **must be informed
of the right to withdraw consent *before* consent is granted**. Withdrawal must be **as easy
as giving it**.

Our modal does not mention withdrawal at all. This is the clearest single gap.

*Needed:* a line in the notice stating consent may be withdrawn at any time and how, plus a
real mechanism (e.g. in Profile) to exercise it.

### 2.2 Consent is not recorded — **required, currently missing**
NDPA requires consent to be **demonstrable**. Today `hasConsented` is React state only; it is
never sent to or stored by the backend. If challenged, **we cannot prove any user consented.**

*Needed (backend):* persist consent — user id, timestamp, the notice **version**, and the
action taken. Versioning matters: re-consent is required when the notice materially changes.

### 2.3 "Freely given" — legal-basis question for counsel
NDPA states consent is **not freely given** where provision of a service is made conditional
on it. Declining currently routes the user away and blocks AGM participation entirely.

There is a legitimate argument that verifying shareholder identity is necessary for AGM
voting, but that argument points to a **different lawful basis** (legal obligation /
performance of a task) rather than consent. Relying on "consent" for something mandatory is a
well-known compliance weak point.

*Needed:* counsel to confirm the lawful basis. If it is not consent, the notice should be
framed as a **privacy notice** rather than a consent request — this changes the wording
substantially.

### 2.4 Mandatory privacy-notice content missing
A notice must, before collection, tell the data subject at least:

| Element | Present today? |
|---|---|
| Identity and contact details of the data controller (Attend / legal entity) | ❌ |
| Purpose of processing | ✅ |
| Recipients / third parties receiving the data | ⚠️ named, but see §0 |
| **Retention period** — how long BVN data is kept | ❌ |
| **Data subject rights** (access, rectification, erasure, objection, portability) | ❌ |
| **Right to lodge a complaint with the NDPC** | ❌ |
| Whether data leaves Nigeria (cross-border transfer) | ❌ |
| Automated decision-making / profiling, and how to object | ❌ |
| Link to full **Privacy Policy** and **Terms & Conditions** | ❌ |

The missing **T&Cs / Privacy Policy link** is what was specifically raised — there is
currently no link to any full policy document from the consent modal.

### 2.5 Biometric data (liveness/selfie) needs its own treatment
The KYC flow's **step 3 captures a selfie** (`KycStep3Request.selfieImage`). Biometric data is
**sensitive personal data** under NDPA and attracts a higher standard. The current modal
mentions retrieving a photo *from BVN records* but does not cover **capturing and processing
the user's facial image** for liveness/matching.

*Needed:* explicit, separate coverage of biometric processing — ideally its own consent step
at the liveness screen, stating purpose, retention, and whether the image is stored after
matching.

### 2.6 Data minimisation
NDPA requires collecting only what is necessary. Worth confirming with counsel whether Attend
needs to **store** the BVN itself after verification, or only the verification **result** plus
the CHN link. This ties to open question 6.4 in
[core-data-requirements.md](./core-data-requirements.md) — storing less is both cheaper and
lower-risk at 2 M records.

---

## 3. Recommended additions to the notice (subject to legal sign-off)

Structured as what a compliant notice should cover, not final copy:

1. **Who is processing** — Attend's legal entity name, address, and DPO/privacy contact.
2. **What is collected** — BVN, date of birth, name; and separately, facial image for liveness.
3. **Why** — to verify identity and confirm eligibility to participate and vote at AGMs.
4. **Lawful basis** — per counsel (consent, or legal obligation).
5. **Who else sees it** — the verification provider, named, with confirmation of authorised
   access; the registrar; whether data leaves Nigeria.
6. **How long it is kept**, and what is deleted after verification.
7. **Your rights** — access, rectification, erasure, objection, portability, and
   **withdrawal of consent at any time, as easily as it was given**.
8. **Complaints** — the right to complain to the **Nigeria Data Protection Commission (NDPC)**.
9. **Assurance** — BVN is used only for identity verification and never to access accounts or
   initiate transactions.
10. **Links** — full Privacy Policy and Terms & Conditions, opening in a new tab.

**Interaction requirements:** affirmative action only (no pre-ticked boxes — already correct);
a real decline path (already correct); separate acknowledgement for biometric capture; and the
consent event recorded server-side with a notice version.

---

## 4. Suggested order of work

1. **Confirm BVN provider authorisation post-May-2026** (§0) — blocks everything else.
2. **Counsel confirms lawful basis** (§2.3) — determines whether this is a consent request or
   a privacy notice.
3. **Draft final copy** with counsel covering §3.
4. **Backend: consent recording** with versioning (§2.2).
5. **Frontend: update the modal**, add the withdrawal mechanism, add a distinct biometric
   consent at the liveness step, and link the Privacy Policy / T&Cs.

Items 1–3 are not engineering tasks and should start first; the frontend change is small once
the wording and basis are settled.

---

## Sources

- [Nigeria Data Protection Act 2023 — overview (Securiti)](https://securiti.ai/overview-of-nigeria-data-protection-act/)
- [NDPA 2023 guide for businesses (CookieYes)](https://www.cookieyes.com/blog/nigeria-data-protection-act-ndpa/)
- [Consent and data subject rights under the NDPA (Law Haven)](https://lawhavensolicitors.com/consent-and-data-subject-rights-in-the-nigeria-data-protection/)
- [Rights of a data subject under the NDPA (Mondaq)](https://www.mondaq.com/nigeria/privacy-protection/1346702/rights-of-a-data-subject-under-the-nigeria-data-protection-act-2023)
- [NDPA compliance checklist (Dimeri)](https://www.dimeri.ai/blog/guides/ndpa-compliance-checklist-nigeria)
- [What CBN's new BVN regulations mean for the Nigerian financial ecosystem (NIBSS)](https://nibss-plc.com.ng/what-cbns-new-bvn-regulation-mean-for-the-nigerian-financial-ecosystem/)
- [Nigeria BVN security changes — breakdown of the new rules](https://www.withinnigeria.com/2026/04/22/nigeria-bvn-security-changes-full-breakdown-of-new-rules-and-what-every-bank-customer-must-do-now/)
- [CBN — BVN](https://www.cbn.gov.ng/PaymentsSystem/BVN.html)
- [CBN KYC/AML requirements 2026 (Youverify)](https://youverify.co/en/blogs/cbn-kyc-aml-requirements-2026)
