# What We Need From Backend

---

### 1. Notifications

**Push — blocking, nothing works without these:**

1. **The VAPID public key**, so we can set `NEXT_PUBLIC_VAPID_KEY`.
2. **Confirm which system**, and give us the endpoint + exact payload:
   - **Web Push** — we send `{ endpoint, keys: { p256dh, auth } }`, or
   - **Firebase (FCM)** — we send a token string.

   `POST /api/v1/device-tokens` takes `{ token, platform }`, which suggests FCM, but please
   confirm. We can't build until this is answered.
3. **How do we unsubscribe a device?** There's no endpoint for it, so switching push off only
   clears the browser subscription — your side keeps sending.

**Preferences:**

4. **Does the push toggle need to be saved to the preferences record?**
   `PUT /api/v1/participant/notification-preferences` takes six flags (email + in-app × RSVP,
   reminder, document) — nothing for push. If push on/off should persist per user rather than
   per browser, we need a seventh flag.
5. **Are the preference flags actually honoured when you send?** i.e. if a user turns off
   `emailEventReminder`, does the reminder email stop. We can save them; we can't verify they
   do anything.

**Notification feed:**

6. **The full list of `type` values** you send on `GET /api/v1/participant/notifications`.
   We're matching on `vote_open`, `event_reminder`, `application_update`, `document`,
   `broadcast` — guessed, not confirmed. Anything outside that list renders a generic bell.
7. **What is `referenceId` for each type** — event ID, resolution ID, document ID? We want to
   make notifications tappable (open the vote, open the event) and can't route without knowing
   what the ID points at.

---

### 2. Email delivery

1. Confirm **SPF, DKIM and DMARC** are configured and passing on the sending domain.
2. For the testers who got no code — send us the **message-ID from the mail provider logs**, or
   confirm there isn't one.

---

### 3. The failing BVN/selfie check

For that tester's attempt on `POST /api/v1/kyc/bvn-selfie/v2`:

1. The **status code and full error body Dojah returned**.
2. Whether **NIBSS has a photo on file** for that BVN.
3. Confirm whether the request was **rejected on size**.
4. **Is the `bvn-selfie/v2` call before step 3 required?** Step 3 already does a liveness check.
   If it's redundant we'll remove it.

---

### 4. Error responses (not urgent)

Return a stable **`code`** field alongside `message` on errors, so we can map to our own copy
instead of showing users the raw backend string.

---

### 5. One decision for you

There is **no error tracking** on the web app — no Sentry, nothing server-side. When a user hits
a failure, nobody finds out unless they tell us. Worth deciding whether to add it before launch.
