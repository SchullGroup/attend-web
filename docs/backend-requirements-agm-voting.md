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

## 5. Combine in-room votes into the final result (hybrid meetings)

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
**What we need:** Project submission should accept a **pitch deck (PDF)** and,
optionally, a **demo video** — alongside the title, description, and links.

**What it does:** Teams can upload their deck and demo as part of submitting.

**Why we need it:** The submit form has a pitch-deck upload, but there's nowhere to
send the file yet.

### 7e. Application status tracking
**What we need:** "My applications" should show, for each application: the **track**,
the **submission date**, an **application code/reference**, and a clear **status**
(Submitted → Under Review → Shortlisted → Selected / Not Progressed), plus a
notification when the status changes.

**What it does:** Applicants can see exactly where their submission stands.

**Why we need it:** The list currently only carries basic team/event info; the
designed tracker needs these fields to show real progress.

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
