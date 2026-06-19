# What the Design Needs to Change — from the AGM Meeting

These are the design updates the participant app needs, based on the product
meeting. Each one says **what we need**, **what it does**, and **why we need it** in
plain terms. Please make these on the design branch (`main`); once they're there,
we pull them in and connect the data.

This is for the participant app only — admin, streaming, and tablet items from the
meeting are not included here.

---

## Already done — no action needed
Listed so nothing gets redone by mistake. These are already in the design:
- "Resolution" wording in the AGM screens (not "Agenda").
- No "Speakers" tab on the AGM screen.
- "Innovation" as the menu name (not "Challenges").
- For / Against / Abstain options on each resolution.
- The notification toggle-switch fix.

---

## 1. Remove "Proxy" from the app

**What we need:** Take out the "Appoint a proxy" feature entirely — the button, the
proxy page, and any links to it.

**What it does:** Today the app lets a user appoint someone to vote on their behalf.
After this change, that option is gone.

**Why we need it:** A proxy is only for people who can't attend a physical meeting.
On this app, anyone joining online can simply vote themselves (or vote early), so
proxy isn't needed. The meeting decided to drop it.

---

## 2. Add "Register for an AGM" to the sign-up flow

**What we need:** After someone creates an account, give them a way to register for
an AGM right there, as part of getting started.

**What it does:** A new user finishes sign-up and can immediately register for an
upcoming AGM, instead of having to hunt for it elsewhere.

**Why we need it:** The meeting flagged this as missing from onboarding. (Voting
still requires identity verification — keep the "complete verification" gate in
place; this is just about being able to register for the meeting.)

---

## 3. Redesign the live AGM voting screen

This is the biggest one. The live meeting needs a proper voting experience. Please
design these states (we'll connect the live data once the backend supports it):

**a) Show the person their early vote, and let them change it**
- *What it does:* When voting opens on a resolution, the screen shows the vote they
  cast earlier ("You voted: Against") and lets them keep it or switch to For /
  Against / Abstain.
- *Why:* People change their mind after hearing the meeting discussion.

**b) A countdown on each resolution**
- *What it does:* When the host opens a resolution, a visible timer counts down
  (e.g. 60 seconds). When it hits zero, that resolution locks and can't be voted on
  anymore.
- *Why:* This is how a real AGM runs — one resolution at a time, with a fixed
  voting window the chairman controls.

**c) The result after voting closes**
- *What it does:* Once a resolution closes, show everyone the result — For /
  Against / Abstain — with both the number of people and the number of shares
  behind each, and a clear "passed / not passed".
- *Why:* AGM votes are decided by shareholding, and shareholders expect to see the
  outcome on screen.

**d) Early voting before the meeting**
- *What it does:* The existing pre-vote screen should let people vote on all the
  resolutions ahead of the meeting (up to a few weeks before).
- *Why:* Early votes protect people who have connection problems on the day.

---

## 4. Quick wording check

**What we need:** Make sure the AGM screens say **"resolution"** everywhere (not
"agenda"), and menus/sections say **"Innovation"** (not just "Challenges").

**Why we need it:** These are the words shareholders and the market actually use;
the wrong wording is confusing or unclear.

---

## Not part of the app (for your awareness)
These came up in the meeting but belong to the admin tool, streaming, or hardware —
not this participant app:
- Merging the partner dashboard into the admin tool; the multi-company (SaaS) setup
  with per-company logos.
- Capturing in-room and proxy votes by hand; tablet stations for shareholders
  without smartphones; checking people against the share register.
- How the live video is run (Zoom + YouTube vs built-in); muting/unmuting people.
- Keeping past meetings (recordings, votes) and whether that's a paid feature.

---

## How this fits together
When these land on the design branch, we pull them and reconnect the data. The
live-voting screens (section 3) are visual-only until the backend provides the
voting data — so they can be designed now and connected later. See the backend
needs doc for the matching list.
