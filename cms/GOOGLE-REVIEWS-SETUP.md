# Connecting Google reviews (one-time setup, about 15 minutes)

Once this is done, the website checks Google once a day and adds any **new 5-star review** to the reviews section automatically. It also keeps the rating (e.g. 4.7) and the number of reviews on the home page up to date. Older reviews already on the site are never removed.

You need: a Google account and a credit or debit card. **You will not be charged.** Google gives a free monthly allowance, and one check a day uses a tiny fraction of it (around US$0.15 a month). The card is only required by Google to switch the service on.

---

## Step 1: Create a Google Cloud project
1. Go to **https://console.cloud.google.com** and sign in with your Google account.
2. At the top of the page, click the project picker (it may say "Select a project") → **New project**.
3. Name it **Voila Website** → **Create**. Make sure the new project is selected at the top.

## Step 2: Turn on billing
1. In the menu (☰, top left) go to **Billing**.
2. Click **Link a billing account** → **Create billing account**, and add your card.
3. Optional but recommended: in Billing → **Budgets & alerts** → **Create budget**, set **US$1**, so Google emails you if anything is ever charged.

## Step 3: Switch on the Places API
1. In the menu go to **APIs & Services → Library**.
2. Search for **Places API (New)** → click it → **Enable**.

## Step 4: Create the key
1. Go to **APIs & Services → Credentials**.
2. Click **+ Create credentials → API key**. Copy the key that appears (it starts with `AIza`).
3. Click **Edit API key** (or the key's name) and under **API restrictions** choose **Restrict key** → tick **Places API (New)** → **Save**.

## Step 5: Send the key to your web developer
Send the key privately (not in a group chat). They add it to the website settings and switch on the daily check.

---

## After it's connected
- New 5-star reviews appear on the website within a day of being posted on Google.
- Reviews below 5 stars are not added automatically. You can still add any review by hand in the admin panel (**Google reviews → Add review**).
- You can edit or delete any review in the admin panel at any time.
- In the admin panel, **Google reviews → Check Google now** runs the check immediately.
- Google only shares a handful of reviews at a time, so very occasionally a new review may be missed. If you spot one that hasn't appeared after a couple of days, add it by hand in the admin panel.
