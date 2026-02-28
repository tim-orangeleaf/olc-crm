# Orangeleaf CRM — Setup Guide

## Prerequisites
- Node.js 18+
- Vercel account + Vercel CLI (`npm i -g vercel`)
- Vercel Postgres database provisioned

---

## 1. Clone & Install

```bash
git clone <repo>
cd orangeleaf-crm
npm install
```

---

## 2. Database (Vercel Postgres)

```bash
vercel link          # link to your Vercel project
vercel env pull      # pulls POSTGRES_* vars into .env.local

npx prisma db push   # push schema to database
npm run db:seed      # seed Orangeleaf workspace + Mendix defaults
```

---

## 3. Microsoft Entra ID (Azure AD) — Primary SSO

1. Go to https://portal.azure.com → **Azure Active Directory** → **App registrations** → **New registration**

2. Set:
   - Name: `Orangeleaf CRM`
   - Supported account types: `Accounts in any organizational directory (Multitenant) and personal Microsoft accounts`
     - _(Use "Single tenant" if Orangeleaf-only, "Multitenant" if reselling)_
   - Redirect URIs (Web):
     - `http://localhost:3000/api/auth/callback/microsoft-entra-id`
     - `https://orangeleaf.crm.orangeleaf.nl/api/auth/callback/microsoft-entra-id`

3. After creation, go to **API permissions** → **Add a permission** → **Microsoft Graph**:
   - `openid`, `profile`, `email`, `offline_access`
   - `Mail.Read`, `Mail.ReadWrite`, `Mail.Send` (Delegated)
   - Click **Grant admin consent**

4. Go to **Certificates & secrets** → **New client secret** → copy the secret

5. Set in `.env.local`:
   ```
   AZURE_AD_CLIENT_ID=<Application (client) ID>
   AZURE_AD_CLIENT_SECRET=<secret value>
   AZURE_AD_TENANT_ID=common   # or your specific tenant ID
   ```

---

## 4. Google OAuth (Secondary SSO + Gmail)

1. Go to https://console.cloud.google.com → **APIs & Services** → **Credentials**

2. **OAuth 2.0 Client IDs** → Web application:
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://orangeleaf.crm.orangeleaf.nl/api/auth/callback/google`

3. Enable APIs:
   - **Gmail API** (for email sync)
   - Go to **OAuth consent screen** → add scopes: `gmail.readonly`, `gmail.send`

4. Set in `.env.local`:
   ```
   GOOGLE_CLIENT_ID=<client id>
   GOOGLE_CLIENT_SECRET=<client secret>
   ```

---

## 5. NextAuth Secret

```bash
openssl rand -hex 32
# paste into NEXTAUTH_SECRET in .env.local
```

---

## 6. Cron Secret

```bash
openssl rand -hex 32
# paste into CRON_SECRET in .env.local
# Also add to Vercel environment variables
```

---

## 7. Vercel Subdomain Setup

For subdomains like `orangeleaf.crm.orangeleaf.nl`:

1. In Vercel project settings → **Domains** → add `*.crm.orangeleaf.nl`

2. Add DNS record at your registrar:
   ```
   CNAME  *.crm.orangeleaf.nl  cname.vercel-dns.com
   ```

3. In middleware, subdomain extraction handles routing automatically.

---

## 8. Local Development

For local subdomain testing, add to `/etc/hosts`:
```
127.0.0.1  orangeleaf.localhost
```

Then visit `http://orangeleaf.localhost:3000`

Or simply run without subdomain — the app falls back gracefully on localhost.

```bash
npm run dev
```

Visit: http://localhost:3000/auth/login

---

## 9. Email Sync: Gmail Push (Optional — recommended for production)

Gmail push webhooks require a Google Cloud Pub/Sub topic:

```bash
# Create topic
gcloud pubsub topics create gmail-crm-push

# Add Gmail service account as publisher
gcloud pubsub topics add-iam-policy-binding gmail-crm-push \
  --member="serviceAccount:gmail-api-push@system.gserviceaccount.com" \
  --role="roles/pubsub.publisher"

# Create subscription pointing to your webhook
gcloud pubsub subscriptions create gmail-crm-sub \
  --topic=gmail-crm-push \
  --push-endpoint=https://orangeleaf.crm.orangeleaf.nl/api/workspace/email/webhook/google

# Set in .env.local
GOOGLE_CLOUD_PROJECT=your-project-id
```

Without this, email sync still runs every 15 minutes via Vercel Cron.

---

## 10. Email Sync: Outlook Push (Recommended)

Microsoft Graph subscriptions are created automatically when a user connects their Outlook account.
Requires the webhook URL to be publicly accessible (so must be deployed first).

The webhook endpoint is: `/api/workspace/email/webhook/microsoft`

---

## Environment Variables Checklist

| Variable | Required | Notes |
|---|---|---|
| `POSTGRES_PRISMA_URL` | ✅ | From Vercel Postgres |
| `POSTGRES_URL_NON_POOLING` | ✅ | From Vercel Postgres |
| `NEXTAUTH_SECRET` | ✅ | 32-byte hex |
| `NEXTAUTH_URL` | ✅ | Full URL |
| `AZURE_AD_CLIENT_ID` | ✅ | Primary SSO |
| `AZURE_AD_CLIENT_SECRET` | ✅ | Primary SSO |
| `AZURE_AD_TENANT_ID` | ✅ | `common` or tenant ID |
| `GOOGLE_CLIENT_ID` | Optional | Secondary SSO + Gmail |
| `GOOGLE_CLIENT_SECRET` | Optional | Secondary SSO + Gmail |
| `CRON_SECRET` | ✅ | Protects cron endpoints |
| `GOOGLE_CLOUD_PROJECT` | Optional | Gmail push webhooks |
