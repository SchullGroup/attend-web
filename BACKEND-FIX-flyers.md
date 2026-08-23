# Backend fix: event flyers (and OBS logos) return 403

**Problem:** `flyerUrl` / `organizerLogo` point to the private OBS bucket
`attend-assets-prod.obs.af-south-1.myhuaweicloud.com`. Anonymous GET → `403 AccessDenied`,
so `<img>` can't load them and flyers never render.

**Verified:**
```
GET …/attend%2Fevent-flyers%2F…png → 403 AccessDenied
GET …/attend%2Flogos%2F…png        → 403 AccessDenied
```
(Cloudinary-hosted logos are public and work — the split host is the tell.)

**Fix (either one):**
1. Make `event-flyers/` (and OBS `logos/`) objects **public-read**, **or**
2. Return a **presigned GET URL** in `flyerUrl` / `organizerLogo`.

**Frontend:** already correct — maps `flyerUrl` into the card image. No FE change needed once URLs are readable.
