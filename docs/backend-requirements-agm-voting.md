# What the Backend Needs to Build — AGM Voting & Login

These are the things the app needs from the backend to finish the AGM voting and
login experience. Each one says **what we need**, **what it does**, and **why we
need it** in plain terms.

---

## 1. Let people vote before the meeting starts

**What we need:** Allow shareholders to cast their votes on the resolutions in the
days leading up to the meeting, not only when the meeting is live.

**What it does:** A shareholder opens an upcoming AGM, sees the list of
resolutions, and picks For / Against / Abstain on each one ahead of time. The
system saves these as their early votes.

**Why we need it:** If someone has network trouble during the live meeting, their
early vote still counts. Shareholders also register and vote up to about three
weeks before the meeting. Right now the system only accepts votes while the
meeting is live, so early voting fails.

---

## 2. A countdown timer on each resolution

**What we need:** When the meeting host opens voting on a resolution, the app
should show a countdown (for example, 60 seconds), and stop taking votes when it
reaches zero.

**What it does:** During the meeting, the host says "let's vote on Resolution 1"
and starts a timer. Everyone sees the same countdown on their screen. When it hits
zero, that resolution closes and no more votes are accepted for it (the other
resolutions can still be voted on).

**Why we need it:** This is how AGMs actually run — the chairman takes resolutions
one at a time with a fixed voting window. The app needs to know when a vote is
open, how long is left, and when it's closed. So each resolution needs to tell us
its status (waiting / open / closed) and the exact time the countdown ends, and to
notify the app the moment voting opens or closes so the timer appears without
anyone refreshing.

---

## 3. Let people change their vote during the live window

**What we need:** When voting opens during the meeting, show the person the vote
they cast early, and let them change it until the countdown ends.

**What it does:** A shareholder pre-voted "Against" last week. During the live
meeting, when Resolution 1 opens, the app shows "You voted Against" and lets them
keep it or switch to For or Abstain. Whatever they have chosen when the timer hits
zero is what counts.

**Why we need it:** Shareholders often change their mind after hearing the
discussion in the meeting. For this to work, the resolution data needs to tell us
each person's current vote so we can show it, and the system needs to accept an
updated vote while the window is open and reject any change after it closes.

---

## 4. Show the results, weighted by shares

**What we need:** When a resolution closes, show everyone the result — not just how
many people voted each way, but how many **shares** voted each way.

**What it does:** After voting closes on a resolution, the app displays For /
Against / Abstain with both the number of people and the number of shares (units)
behind each, and whether the resolution passed.

**Why we need it:** AGM votes are decided by shareholding, not headcount — someone
with a million shares carries far more weight than someone with ten. The system
already gives us the headcounts but not the share totals, so we need the share
(unit) numbers added to each closed resolution.

---

## 5. Combine in-room votes into the final result (hybrid meetings) — ✅ DONE (backend confirmed)

**Status:** Backend confirmed the `forCount/againstCount/abstainCount` and
`*Shares` returned by `GET /participant/events/{id}/resolutions` already include the
combined total (online + in-room + proxy). No frontend change — we display whatever
totals the endpoint returns.

**What we need:** For meetings that are part in-person and part online, the final
result the app shows must already include the votes cast in the room (and by
proxy), entered by the admin, added to the online votes.

**What it does:** Some shareholders attend physically and some join online. The
admin enters the in-room and proxy vote counts; the system combines them with the
online votes, and the app shows the single combined result.

**Why we need it:** The number on screen has to be the true final tally for the
whole meeting, not just the online portion. So when a resolution closes, the result
we read should already be the combined total.

---

## 6. Log in with phone number and OTP

**What we need:** Let people sign up and log in with their phone number and a
one-time code (OTP), instead of email and password.

**What it does:** The user enters their phone number, receives a code by SMS,
types it in, and they're in.

**Why we need it:** This is the login method shown in the product demo and what the
team wants. The app currently uses email and password only because there's no
phone-OTP option on the backend yet. We need: send a code to a phone, verify the
code and sign the user in, and resend the code. Until these exist, we stay on email
and password.

---

## 7. Hackathon / Innovation Challenges — make it robust

The challenge screens are designed to be rich (prizes, tracks, team size, deadlines,
application tracking), but the backend currently returns only basic event fields —
so most of that shows as sample/demo data. Here's what each part needs.

### 7a. Full challenge details
**What we need:** The challenge list and detail should include the full information:
the **prize breakdown**, **tracks**, **team size (min–max)**, **eligibility**,
**sponsors**, and **submission deadline**.

**What it does:** A real challenge can then show "Prize: ₦5,000,000", its tracks,
"Team: 2–5", the deadline, and sponsors — instead of just a title and date.

**Why we need it:** Right now only our sample (demo) challenges have these, so real
challenges look bare. This is the difference between the plain card and the full
designed card/detail.

### 7b. One source for all challenges
**What we need:** All innovation events should come back from the challenges
endpoint, not be split between the challenges collection and the general events list.

**What it does:** The Innovation tab gets every hackathon/challenge from one place.

**Why we need it:** Today some challenge events only appear in the general events
list, so the app has to pull from two sources and merge to avoid missing any. One
source removes the risk of gaps or duplicates.

### 7c. Application form — track and team members
**What we need:** Creating a team should accept the chosen **track** and the
**team members** (each with name, email, and role) — not just a team name and
description.

**What it does:** When someone applies, their track and full team are saved.

**Why we need it:** The apply form already collects these, but the backend only
stores name + description, so the track and members are currently dropped.

### 7d. Submission — pitch deck (and demo video)
**What we need:** Project submission should accept a **pitch deck** and a **demo
video** — alongside the title, description, and links.

**Resolved.** The submit endpoint accepts `pitchDeckUrl` and `demoVideoUrl`, **and a
file-upload endpoint already exists**: `POST /api/v1/upload` (multipart, field `file`)
uploads to Cloudinary and returns the URL. So native file upload is fully possible —
the frontend uploads the file, gets the URL, and submits it as `pitchDeckUrl` /
`demoVideoUrl`. No backend work needed; this is a frontend wiring task.

### 7e. Application status tracking
**What we need:** "My applications" should show, for each application: the **track**,
the **submission date**, an **application code/reference**, and a clear **status**
(Submitted → Under Review → Shortlisted → Selected / Not Progressed), plus a
notification when the status changes.

**What it does:** Applicants can see exactly where their submission stands.

**Why we need it:** The list currently only carries basic team/event info; the
designed tracker needs these fields to show real progress.

### 7f. Idea/submission attachments — fields to store the uploaded URLs
**What we need:** Three URL fields so the apply + submit attachments can be saved. The
**file upload itself already works** (existing `POST /api/v1/upload` → Cloudinary URL);
what's missing are the fields to store the returned URLs:

- **`CreateTeamRequest`** (apply idea step) → add **`ideaVideoUrl`** and **`ideaSupportingDocUrl`**.
- **`SubmitApplicationRequest`** (project submission) → add **`additionalDocumentsUrl`**
  (only needed because the `requireAdditionalDocuments` submission flag has no save target;
  the other submission fields — pitch deck, demo video — already exist).

**What it does:** When someone applies/submits, their pitch-video link and uploaded
documents are saved with the application (and visible to organisers).

**Current behaviour (until added):** these fields are **shown in the UI** (design parity)
and the files **do upload** to Cloudinary, but the resulting URLs are **not sent** — there's
nowhere to store them. We deliberately do **not** fold them into the description anymore
(that polluted the team description with raw URLs). So they're collected and ready to send
the instant these fields exist.

---

## 8. Gaps found when matching our screens to the live endpoints

These came out of a full check of every participant screen against the live API.
The participant app **only calls the `/participant/...` endpoints**. Importantly,
**most of this data already exists** in the system — it's returned on the `/admin/...`
or `/client/...` (organiser) endpoints — it just isn't exposed on the participant
API. So in most cases the ask is **"surface the data you already have on the
participant endpoints,"** not build it new. Only 8a (saved events) is genuinely new.
Each item below points to where the data already lives.

### 8a. Saved events — there's no way to save
**What we need:** Endpoints to **save an event**, **remove a saved event**, and
**list a user's saved events**.

**What it does:** A user taps the bookmark on an event and finds it later under
"Saved", on any device.

**Why we need it:** Right now "save" only writes to the browser on that one device
(it's not stored on the backend at all), so saved events vanish on another device or
after clearing the browser. There is no saved-events endpoint to call.

### 8b. Documents — no download link
**What we need:** Each document should include a **download URL** (or a download
endpoint), so the file can actually be opened.

**What it does:** A user taps a document under "My documents" and the file opens or
downloads.

**Why we need it:** The documents list gives us the title, type, size and a download
count — but **no link to the file**, so there's nothing to open. We can show the
list but the download button has nowhere to go.

**Where it already exists:** the file is already served on the organiser side at
`GET /client/documents/{documentId}`. The fix is to add a `downloadUrl` to the
participant `DocumentItem`, or add `GET /participant/documents/{documentId}` for the
logged-in user.

### 8c. My applications — track + review status per application
**What we need:** The participant "My applications" list (`teams/mine`) should
include, per application, the **track** and a **review status** (Submitted → Under
review → Shortlisted → Selected / Not progressed).

**What it does:** The My Applications table shows each entry's real track and where it
stands in review — which is exactly what that screen is designed to display.

**Why we need it:** The design's My Applications page already has **Track** and
**Status** columns, but the participant `teams/mine` (`TeamItem`) only carries
`submissionStatus` (submitted / not submitted) — no track and no review-pipeline
status. So the screen currently derives a fake "track" from the event type and can't
show real progress. This is the same need as **section 7e**.

**Note (deliberately not requested):** the admin/organiser endpoints also return
**score, criteria scores and a status-history timeline** (`ChallengeApplicationDetailResponse`).
Those are **not** part of the participant design, so we are **not** asking for them —
only add them later if we decide to build a richer applicant detail screen.

### 8d. Event tags
**What we need:** The participant events list and detail should include the event's
**tags** (e.g. "EGM").

**What it does:** Tags show on the event card and detail, and can be used to filter.

**Where it already exists:** the admin/organiser event (`EventSummaryResponse`)
already has a `tags` field. The participant event responses
(`ParticipantEventDetailResponse` and the events list item) just don't include it.

**Why we need it:** Tags are set by the admin but aren't returned on the participant
events API, so they can't be shown — this is the missing "tag" data noticed on the
event screens. The fix is to add `tags` to the participant event response.

### 8e. Product Launch details (if we want the full launch experience)
**What we need:** Launch events need a few extra fields: a **press-kit released**
flag with **downloadable assets**, and the **audience tiers** (e.g. Press / VIP /
Public) for that launch.

**What it does:** The launch page can show a real "Press kit available" state with
files, and the correct audience access, instead of placeholders.

**Where it already exists:** the product-launch config already holds these —
`ProductLaunchConfigResponse` has `embargoEnabled`, `embargoReleaseAt` and
`audienceTargeting`. They're just not surfaced on the participant launch event detail.

**Why we need it:** The launch screen is designed for these, but the participant
events API has no embargo/audience fields, so that section currently shows fixed
placeholder text. The fix is to include the existing embargo/audience config on the
participant launch event response.

### 8f. BUG — challenge detail endpoint returned 500 — ✅ RESOLVED (verified 2026-06-17)
**Was:** `GET /participant/challenges/{id}` returned **HTTP 500 ("Something went
wrong")** even though the challenge existed.

**Now:** verified returning **200** with the full rich detail (incl. `prizeTiers`,
`tracks`, `submissionRequirements`, eligibility, team size, etc.) for a valid
challenge (`88d116d9-…` "ZenithBank Fintech Challenge"). The handler crash is fixed.

**Our side:** the event-detail fallback in `hackathon/[id]` can stay as a safety net,
but the rich challenge page now populates from the real challenge detail.

---

## Already built and working (for reference)
- The stepped KYC flow (BVN → CHN → selfie) is wired and working.
- KYC officer review (submit → pending review → officer approves → verified) is confirmed.
- AGM registration correctly requires a verified BVN, with a clear message.
- Resolutions, casting a vote, vote receipt, Q&A, notification preferences,
  documents, my events, challenge details/resources/certificate, check-in, and my
  applications are all connected.

## Smaller open items (from earlier)
- **A working test BVN** the verification service recognises in this environment,
  so we can finish the KYC flow end to end.
- **The liveness (selfie) check** in this environment — it was returning a
  "not found" error from the provider.
- **SMS notification settings** — the design has an SMS toggle, but there's no
  place on the backend to save it yet.
- **Hackathon / Innovation Challenges** — see section 7 above for the full list
  (rich challenge details, one source for challenges, apply track + members, pitch
  deck on submission, and application status tracking).
- **Screen-vs-endpoint gaps** — see section 8 above: document download links,
  track + review status on `teams/mine`, event tags, and Product Launch
  (audience/press-kit) fields. (Saved events is now delivered.)
