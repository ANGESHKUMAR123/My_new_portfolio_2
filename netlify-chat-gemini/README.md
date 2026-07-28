# Portfolio Chatbot — Netlify + Google Gemini (FREE) — Full Setup

This uses Google's Gemini API, which has a genuine free tier (no credit
card needed). Good enough for a portfolio chatbot with light traffic.

Free tier limits (subject to change by Google):
- Gemini 2.5 Flash: ~10 requests/minute, ~250 requests/day
- Gemini 2.5 Flash-Lite: ~15 requests/minute, ~1,000 requests/day (swap
  the MODEL variable in chat.js to this if you expect more visitors)

## Folder structure to deploy

```
my-portfolio/
├── index.html                   (renamed from portfolio_main_file.html)
├── netlify.toml
└── netlify/
    └── functions/
        └── chat.js
```

---

## STEP 1 — Get a free Gemini API key

1. Go to **https://aistudio.google.com/app/apikey**
2. Sign in with any Google account.
3. Click **"Create API key"**.
4. Choose "Create API key in new project" if asked.
5. Copy the key that appears (starts with something like `AIzaSy...`).
   No credit card, no billing setup needed for this step.

---

## STEP 2 — Prepare your project folder

1. Rename `portfolio_main_file.html` to `index.html`.
2. Put it in a folder together with `netlify.toml` and
   `netlify/functions/chat.js` (structure shown above).

---

## STEP 3 — Push it to GitHub

1. Go to **github.com** → **New repository** → name it e.g. `my-portfolio`
   → Create.
2. On the empty repo page, click **"uploading an existing file"**.
3. Drag in `index.html` and `netlify.toml`.
4. For the function file specifically: click **"Add file" → "Create new
   file"**, then in the filename box type the full path:
   `netlify/functions/chat.js` — GitHub will auto-create the folders.
   Paste in the chat.js content.
5. Click **Commit changes**.

---

## STEP 4 — Create the Netlify site

1. Go to **netlify.com** → sign up/log in (GitHub login is simplest).
2. **Add new site** → **Import an existing project** → **GitHub**.
3. Pick your `my-portfolio` repo.
4. Build settings:
   - Build command: leave blank
   - Publish directory: `.`
5. Click **Deploy site**. Wait for the first deploy to finish. The site
   is live now, but the chatbot is still using its local fallback answers
   (no AI yet) until the next step.

---

## STEP 5 — Add your Gemini key to Netlify

1. In your site dashboard → **Site configuration** → **Environment
   variables** → **Add a variable**.
2. Key: `GEMINI_API_KEY`
3. Value: paste the key from Step 1.
4. Save.

---

## STEP 6 — Redeploy so the key takes effect

1. Go to the **Deploys** tab → **Trigger deploy** → **Deploy site**.
2. Wait for it to finish (~30–60 sec).

---

## STEP 7 — Test the live chatbot

1. Open your Netlify URL (e.g. `random-name-123.netlify.app`).
2. Click the chat bubble to open it.
3. Ask a question like "What projects have you worked on?"
4. It should now answer using Gemini instead of just the keyword fallback.

---

## Troubleshooting

- **Still getting only keyword/fallback answers** →
  Netlify dashboard → **Functions** tab → click `chat` → check the logs
  for the actual error (most common: missing/misspelled `GEMINI_API_KEY`).
- **429 error in logs** → you've hit the free-tier rate limit; wait a
  minute (per-minute limit) or until the next day (daily limit), or
  switch `MODEL` in `chat.js` to `"gemini-2.5-flash-lite"` for a higher
  free quota.
- **"API key not valid"** → re-copy the key from AI Studio, make sure
  there's no extra space, and confirm it's saved under the exact name
  `GEMINI_API_KEY` in Netlify.
- **Function not triggering at all** → confirm the file path is exactly
  `netlify/functions/chat.js` and `netlify.toml` sits at the repo root.

## A note on limits

Free tier is shared across everyone visiting your site. If your portfolio
gets a lot of traffic, visitors might occasionally see the fallback
answer during a rate-limit window — this is expected and harmless, the
site keeps working either way.
