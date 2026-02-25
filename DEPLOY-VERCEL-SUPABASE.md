# Deploy ColdCall Pro: Vercel + Supabase

Follow these steps in order.

---

## Part 1: Supabase (database)

### Step 1.1 – Create a project

1. Go to **[supabase.com](https://supabase.com)** and sign in.
2. Click **New project**.
3. **Name:** e.g. `coldcall-pro`. Choose a **database password** and save it.
4. **Region:** pick one close to your users.
5. Click **Create new project** and wait until it’s ready.

### Step 1.2 – Run the schema

1. In the Supabase dashboard, open **SQL Editor** (left sidebar).
2. Click **New query**.
3. Open the file `supabase-schema.sql` in this repo and copy **all** its contents.
4. Paste into the SQL Editor and click **Run** (or Ctrl/Cmd+Enter).
5. You should see “Success. No rows returned.” Tables `free_sims` and `anon_purchases` (and others) are now created.

### Step 1.3 – Get API details

1. Go to **Project Settings** (gear icon in the left sidebar) → **API**.
2. Copy and save:
   - **Project URL** → you’ll use this as `SUPABASE_URL`.
   - **Service role** key (under “Project API keys”) → you’ll use this as `SUPABASE_SERVICE_ROLE_KEY`.  
     ⚠️ This key is secret; never commit it or expose it in the browser.

---

## Part 2: Stripe (payments)

### Step 2.1 – Create the £19 product

1. Go to **[dashboard.stripe.com](https://dashboard.stripe.com)**.
2. **Product catalogue** → **Add product**.
3. **Name:** e.g. `ColdCall Pro — 50 simulations`.
4. **Pricing:**  
   - **One time** (not recurring).  
   - **Price:** `19` GBP (or your currency).  
5. Click **Save product**.
6. On the product page, open the **Price** you just created and copy the **Price ID** (starts with `price_...`).  
   → You’ll use this as `STRIPE_PRICE_ID`.

### Step 2.2 – Note your Stripe keys

1. **Developers** → **API keys**.
2. Copy your **Secret key** (`sk_live_...` or `sk_test_...` for testing).  
   → You’ll use this as `STRIPE_SECRET_KEY`.  
   (You’ll add the webhook secret **after** you have a live URL in Part 4.)

---

## Part 3: Vercel (hosting)

### Step 3.1 – Push your code to GitHub

1. In your project folder, if you haven’t already:
   ```bash
   git init
   git add .
   git commit -m "ColdCall Pro initial"
   ```
2. Create a new repo on **GitHub** (e.g. `coldcall-pro`).
3. Add the remote and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/coldcall-pro.git
   git branch -M main
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` and repo name with yours.)

If your app lives in a **subfolder** (e.g. repo is `sales-simulation` and the app is in `coldcall-pro/`), push that repo; in Vercel you’ll set the **Root Directory** to `coldcall-pro`.

### Step 3.2 – Create the Vercel project

1. Go to **[vercel.com](https://vercel.com)** and sign in (e.g. with GitHub).
2. Click **Add New** → **Project**.
3. **Import** your GitHub repo (e.g. `coldcall-pro` or `sales-simulation`).
4. If the app is in a subfolder, set **Root Directory** to that folder (e.g. `coldcall-pro`) and click **Edit** → **Continue**.
5. **Do not** deploy yet — add env vars first.

### Step 3.3 – Add environment variables

1. In the Vercel project, go to **Settings** → **Environment Variables**.
2. Add each of these (name and value). Use **Production** (and optionally **Preview** if you want):

   | Name | Value | Notes |
   |------|--------|--------|
   | `OPENAI_API_KEY` | your OpenAI key | From platform.openai.com |
   | `STRIPE_SECRET_KEY` | `sk_live_...` or `sk_test_...` | From Stripe → API keys |
   | `STRIPE_PRICE_ID` | `price_...` | From Stripe product price |
   | `SUPABASE_URL` | `https://xxxxx.supabase.co` | From Supabase → Settings → API |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` long string | From Supabase → Settings → API (service role) |

3. Leave **`STRIPE_WEBHOOK_SECRET`** empty for now. You’ll add it in Part 4 after the first deploy.
4. Click **Save**.

### Step 3.4 – Deploy

1. Go to the **Deployments** tab.
2. If the project was already deployed, click **Redeploy** on the latest deployment (so it picks up env vars).  
   Otherwise trigger a new deploy (e.g. **Deploy** from the project overview).
3. Wait until the deployment is **Ready**.
4. Open your app with the **Visit** link (e.g. `https://coldcall-pro.vercel.app`).  
   Copy this URL — you need it for the Stripe webhook.

---

## Part 4: Stripe webhook (after first deploy)

### Step 4.1 – Create the webhook endpoint in Stripe

1. **Stripe Dashboard** → **Developers** → **Webhooks**.
2. Click **Add destination** (or **Add endpoint**).
3. **Select event:** search for `checkout.session.completed` and select it → **Continue**.
4. **Destination type:** choose **Webhook endpoint** (or equivalent).
5. **Endpoint URL:**  
   `https://YOUR_VERCEL_URL/api/webhooks/stripe`  
   Example: `https://coldcall-pro.vercel.app/api/webhooks/stripe`  
   (Use the exact URL from Vercel’s **Visit** link.)
6. Finish creating the destination.

### Step 4.2 – Get the webhook signing secret

1. Open the webhook you just created.
2. Find **Signing secret** (or “Reveal”).
3. Copy the value (starts with `whsec_...`).

### Step 4.3 – Add it to Vercel

1. **Vercel** → your project → **Settings** → **Environment Variables**.
2. Add:
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_...` (the signing secret you copied).
3. Save.
4. **Redeploy** the project (Deployments → … on latest → Redeploy) so the new variable is used.

---

## Done

- **App:** `https://your-project.vercel.app`
- **Supabase:** stores free-sim usage and purchases.
- **Stripe:** checkout works; after payment, the webhook grants 50 sims.

### Quick checks

1. Open the app → do one free call → you should be gated on the next one (“Unlock to continue”).
2. Click **Unlock now** on Pricing → complete a test payment (use Stripe test card `4242 4242 4242 4242`) → you should get 50 sims and be able to start calls again.
3. In Supabase **Table Editor**, check **free_sims** and **anon_purchases** for new rows after using the free sim and after a purchase.

### If something breaks

- **403 on “Start call”:** Check Supabase env vars and that the schema was run (Part 1.2).
- **Checkout works but sims not unlocked:** Add `STRIPE_WEBHOOK_SECRET` (Part 4) and redeploy; check Stripe → Webhooks → your endpoint for failed events.
- **Build fails on Vercel:** Run `npm run build` locally and fix any errors; ensure **Root Directory** points to the folder that contains `package.json`.
