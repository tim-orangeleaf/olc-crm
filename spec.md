# Orangeleaf CRM — Functional & Technical Specification

**Version:** 0.4
**Status:** For Review
**Last updated:** February 2026
**Author:** Orangeleaf Consulting / Claude
**Changelog v0.4:** Technical section rewritten for Saas-Kit-prisma template (Prisma + NextAuth). Full integration map added: every template file classified as keep/extend/delete/add. Complete Prisma schema with all CRM models. Auth.js v5 + Microsoft Entra ID config. Middleware pattern. API route convention with workspace resolution and role checks.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Goals & Non-Goals](#2-goals--non-goals)
3. [Users & Roles](#3-users--roles)
4. [Functional Specification](#4-functional-specification)
   - 4.1 Authentication & SSO
   - 4.2 Workspace & Multi-tenancy
   - 4.3 Pipeline & Opportunities
   - 4.4 Contacts
   - 4.5 Accounts
   - 4.6 Activities & Interaction Log
   - 4.7 Email Integration
   - 4.8 Products & Catalog
   - 4.9 Reports & Forecasting
   - 4.10 Settings
5. [Technical Specification](#5-technical-specification)
   - 5.1 Base Template
   - 5.2 Stack
   - 5.3 Template Integration Map
   - 5.4 Architecture
   - 5.5 Data Model (Drizzle)
   - 5.6 Auth — Microsoft Entra ID with Auth.js v5
   - 5.7 API Design
   - 5.8 Email Sync (Microsoft Graph)
   - 5.9 Automation & Triggers
   - 5.10 Multi-tenancy & Subdomains
   - 5.11 Security
   - 5.12 Infrastructure & Deployment
6. [Open Questions](#6-open-questions)
7. [Out of Scope (for now)](#7-out-of-scope-for-now)
8. [Glossary](#8-glossary)

---

## 1. Project Overview

**Product name:** Orangeleaf CRM (working title)

Orangeleaf CRM is a sales-focused CRM platform built for internal use at Orangeleaf Consulting, selling Mendix licenses, training packages, and development/consulting services to **enterprise clients across the APAC region**. Deals are denominated in multiple currencies (AUD, SGD, JPY, HKD, USD, EUR) reflecting the APAC market.

The platform is built to be multi-tenant and white-labelable from day one, with the goal of being sold as a SaaS product to other consulting firms and SMEs.

### Deployment Target
- **Hosting:** Vercel
- **Domain:** `orangeleaf.app`
- **Initial environment:** `orangeleaf.orangeleaf.app`
- **Future tenants:** `[customer].orangeleaf.app`

---

## 2. Goals & Non-Goals

### Goals
- SSO via **Microsoft Entra ID only** (Phase 1)
- Automated email logging via **Microsoft Outlook only** (Phase 1)
- Configurable pipeline stages per workspace
- **Multi-currency** opportunity values within a single workspace
- Reports with **date range filters** and **target vs. actual** tracking per rep and team
- Multi-tenant from day one
- Resellable: no Orangeleaf-specific hardcoding in the codebase

### Non-Goals (Phase 1)
- Google OAuth / Gmail integration
- Native mobile app
- Email composer (read and log only)
- Marketing automation, invoicing, VoIP
- AI features, automation rules, Zapier/n8n
- Custom domain per tenant (reserved, not implemented)

---

## 3. Users & Roles

### Role Definitions

| Role | Description |
|---|---|
| **Owner** | Workspace creator. One per workspace. All permissions. |
| **Admin** | Full configuration. Manages members, pipeline, products, integrations, targets. |
| **Manager** | Views and edits all team deals. Reports scoped to own team. |
| **Member** | Creates/edits own deals only. Views contacts and accounts. |
| **Viewer** | Read-only across all records. |

### Access Matrix

| Feature | Viewer | Member | Manager | Admin | Owner |
|---|:---:|:---:|:---:|:---:|:---:|
| View dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| View own opportunities | ✅ | ✅ | ✅ | ✅ | ✅ |
| View all opportunities | ✅ | ❌ | ✅ | ✅ | ✅ |
| Create/edit own opportunities | ❌ | ✅ | ✅ | ✅ | ✅ |
| Edit any opportunity | ❌ | ❌ | ✅ | ✅ | ✅ |
| Delete opportunity | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage contacts & accounts | ❌ | ✅ | ✅ | ✅ | ✅ |
| View own performance report | ❌ | ✅ | ✅ | ✅ | ✅ |
| View team reports | ❌ | ❌ | ✅ own team | ✅ all | ✅ all |
| Configure pipeline/products | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage members & teams | ❌ | ❌ | ❌ | ✅ | ✅ |
| Set sales targets | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage integrations | ❌ | ❌ | ❌ | ✅ | ✅ |

### Opportunity Visibility Rules
- **Members** see only `ownerId = their memberId`
- **Managers** see all opportunities owned by members of their assigned team
- **Admin/Owner** see all opportunities in the workspace

### Teams
A workspace can have one or more Teams. Each team has a name, a Manager, and Members. Members belong to at most one team. Team assignment is managed by Admins.

---

## 4. Functional Specification

### 4.1 Authentication & SSO

- **Phase 1: Microsoft Entra ID only.** No passwords, no Google.
- The template's custom email/password auth is fully replaced by Auth.js v5 with the Microsoft Entra ID provider.
- On first sign-in, a User record is created. The user is added to a workspace via invitation or auto-provisioning.
- Sessions are database-stored (via `@auth/drizzle-adapter`), lasting 30 days.

#### Auto-provisioning
- Admins configure one or more **allowed email domains** per workspace (e.g. `orangeleaf.com`, `orangeleaf.sg`).
- Users authenticating with a matching domain are automatically added as Members.
- Multiple domains stored in the `AllowedDomain` table (`isInternal: false`).

#### Token Storage
- Microsoft OAuth tokens (access + refresh) are captured at sign-in and stored in `EmailIntegration` — email sync begins immediately, no separate connect step.

#### Azure AD Configuration
- **Phase 1:** `tenantId: "common"` — any Microsoft account can authenticate.
- **Future:** Per-workspace Azure AD app registration. Fields `azureAdTenantId`, `azureAdClientId`, `azureAdClientSecret` are reserved on the `Workspace` table. When set, those credentials override the global registration for that workspace.

#### Session Shape
```ts
session.user = {
  id: string
  name: string
  email: string
  image?: string
  workspaces: Array<{
    id: string
    slug: string
    subdomain: string
    plan: string
    role: Role
    memberId: string
    teamId?: string
  }>
}
```

---

### 4.2 Workspace & Multi-tenancy

- Every customer is a **Workspace**. All data is isolated by `workspaceId`.
- Fields: name, slug, subdomain, plan (deferred), reportingCurrency, timezone, logo, optional Azure AD override credentials.
- A user can belong to multiple workspaces.
- Subdomain routing: `[subdomain].orangeleaf.app`

#### Multi-currency
- Each Workspace has a **reporting currency** (e.g. AUD for Australia).
- Each **Opportunity** has its own currency — a workspace can have deals in AUD, SGD, USD, JPY simultaneously.
- Reports aggregate in the reporting currency via stored exchange rates in the `ExchangeRate` table.
- Exchange rates are updated manually by Admins (auto-fetch is Phase 2).

---

### 4.3 Pipeline & Opportunities

#### Pipelines
- Multiple named pipelines per workspace. One is default.
- Each pipeline has its own configurable stage list.

#### Stages
Each stage: name, position, colour (hex), default probability (%), `rottenDays` threshold, `isWon` flag, `isLost` flag.

**Default Orangeleaf/Mendix stages (seeded, fully editable):**

| Stage | Probability | Rotten after |
|---|---|---|
| Discovery | 20% | 21 days |
| Qualification | 35% | 14 days |
| Proposal | 60% | 14 days |
| Negotiation | 80% | 10 days |
| Won | 100% | — |
| Lost | 0% | — |

#### Opportunity Fields
- Name, Pipeline/Stage, Account (optional), Owner, **Value** (manual), **Currency** (per deal), Probability override, Expected close date, Actual close date (auto), Priority, Status, Source, Lost reason, Description
- Linked: Contacts (with role), Products (classification only — no price calculation), Activities, Stage history, Custom fields

#### Pipeline Views
- **Board (Kanban):** Drag-and-drop between stage columns. Cards show name, account, value + currency, probability, owner, close date.
- **List (Table):** Sortable, filterable. Bulk actions: reassign, change stage, export CSV.

#### Stage Change Behaviour
1. `StageHistory` record created
2. `STAGE_CHANGE` activity auto-logged
3. `opportunity.stage_changed` trigger fired
4. Won → status = WON, set `actualCloseDate`, fire `opportunity.won`
5. Lost → prompt for reason, status = LOST, fire `opportunity.lost`

---

### 4.4 Contacts

Fields: first name, last name, email, phone, mobile, job title, department, account, LinkedIn, avatar, status, lead source, notes, tags, custom fields.

Contact detail page: Details | Opportunities | Interaction History | Email Threads | Quick-log bar.

Email matching: inbound = From address, outbound = first To address. No match → store thread, surface "Create contact" prompt.

---

### 4.5 Accounts

Fields: name, domain, industry, company size, website, phone, address, city, country, LinkedIn, logo, annual revenue, description, tags, custom fields.

Account detail page: Details | Contacts | Opportunities | Activity Feed.

---

### 4.6 Activities & Interaction Log

#### Activity Types
`NOTE` 📝 · `CALL` 📞 · `EMAIL` ✉️ · `MEETING` 🤝 · `TASK` ✅ · `DEMO` 🖥️ · `PROPOSAL_SENT` 📄 · `CONTRACT_SENT` 📋 · `STAGE_CHANGE` ↕️ · `SYSTEM` ⚙️

The template already has an `activityLogs` table for system events — this is **extended** (not replaced) to cover all CRM activity types.

#### Activity Body — Markdown
- Body field stores raw Markdown. Rendered as HTML in timeline.
- Simple editor with live preview toggle.
- Supported: bold, italic, lists, inline code, links. No image upload (Phase 2).

#### Tasks — Due Dates & Notifications
- Tasks have optional `dueAt`. Overdue = `dueAt` past + `completedAt` null.
- Overdue tasks highlighted in Activities list and Dashboard (red badge on nav).
- In-app `Notification` record created on overdue.
- Daily digest email (08:00 workspace timezone) lists overdue tasks for assignee. Opt-out in profile settings.

#### Quick-Log Bar
Type selector + Markdown text area + for tasks: due date/time picker + for calls/meetings: duration field.

---

### 4.7 Email Integration

**Microsoft Outlook / Graph API only in Phase 1.**

#### Connection
Tokens captured at Microsoft SSO sign-in. Stored in `EmailIntegration`. No separate connect step.

#### Internal Domain Filtering
Admin configures one or more **internal domains** per workspace via `AllowedDomain` table (`isInternal: true`). Emails where both From and To are on internal domains are skipped. Emails with one internal + one external party are logged normally.

#### Sync — Delta Queries
- First sync: fetch from `syncFromDate` via Graph filter.
- Subsequent syncs: use stored `deltaLink` — only fetches changes.
- Push notifications: Microsoft Graph subscription registered on first sync, renewed daily.
- Fallback: 15-minute Vercel Cron polling.

#### Mixed-recipient handling
Log the email, link to the known contact, store unknown address in activity metadata.

---

### 4.8 Products & Catalog

- Fully managed by Admins in Settings → Products.
- Orangeleaf Mendix catalog seeded on workspace creation (editable and deletable).
- Linked to opportunities for classification/reporting only — does not affect opportunity value.
- Fields: name, SKU, description, category, unit price, currency, active flag.

---

### 4.9 Reports & Forecasting

All monetary values in reporting currency. All reports have date range presets: This month / Last month / This quarter / Last quarter / This year / Custom.

#### Dashboard
KPI cards: Pipeline Value, Won in period, Weighted Forecast, Open Deals. Charts: Pipeline by stage, Recent activity feed, Top open opportunities (scoped by role).

#### Pipeline Report
Stage funnel (count + value), average time in stage (from `StageHistory`), drop-off rate between stages.

#### Forecast Report
Weighted forecast per stage, by expected close month, won vs forecast comparison.

#### Product Mix Report
Pipeline and closed revenue by product category, top products by count and value.

#### Rep Performance Report
Available to: Member (own), Manager (team), Admin/Owner (all).

| Metric | Description |
|---|---|
| Deals closed (Won) | Count |
| Revenue closed | Sum in reporting currency |
| Revenue target | Admin-set |
| Target attainment % | Closed ÷ target |
| Opportunities created | Count |
| Opportunity target | Admin-set |
| Activities logged | Count (excluding auto/system) |
| Activity target | Admin-set |
| Open pipeline | Sum open opportunity values |
| Win rate | Won ÷ (Won + Lost) |

Team summary row aggregates all members. Managers see own team. Admins/Owners see workspace-wide.

#### Target Setting
`SalesTarget` table: `memberId`, `period` (e.g. `2026-Q1` or `2026-03`), `periodType` (MONTHLY/QUARTERLY), `revenueTarget`, `opportunityTarget`, `activityTarget`. Set by Admins per member per period. Bulk-set for a whole team.

---

### 4.10 Settings

**Workspace:** Name, logo, reporting currency, timezone, allowed SSO domains (array), internal email domains (array), Azure AD override fields.

**Exchange Rates:** Manual CRUD. Rate per currency pair vs. reporting currency.

**Pipeline:** Create/rename/delete pipelines. Per pipeline: manage stages (add, rename, reorder, colour, probability, rotten threshold, isWon/isLost). Cannot delete stage with active opportunities.

**Products:** Full CRUD on catalog. Activate/deactivate.

**Teams:** Create teams, assign Manager, add Members. Members in one team at a time.

**Sales Targets:** Set per member per period. Bulk-set for team.

**Members:** View all with role + team badge. Invite by email (7-day link). Change role. Remove.

**Integrations:** View connected email integrations, last sync time, subscription status. Disconnect/reconnect.

**Custom Fields:** Add to Contact, Account, or Opportunity. Types: Text, Number, Date, Boolean, Select, Multi-select, URL. Set required flag and display order.

**Webhooks:** Outbound HMAC-signed webhooks per event type.

**Profile (own):** Display name, avatar. Notification preferences: overdue task digest on/off.

---


## 5. Technical Specification

### 5.1 Base Template

**Template:** `github.com/Saas-Starter-Kit/Saas-Kit-prisma` (free, open-source version)

Used as a starting scaffold only. The spec is the authority — wherever the template's implementation differs from this document, the template loses and gets rewritten.

The template provides ~15–20% of what the CRM needs: Prisma+Postgres wiring, shadcn/ui components, Tailwind config, Stripe setup, and Next.js folder conventions. Everything CRM-specific is built on top.

---

### 5.2 Stack

| Layer | Template ships with | CRM uses | Delta |
|---|---|---|---|
| Framework | Next.js 14 App Router | ✅ Same | None |
| Language | TypeScript | ✅ Same | None |
| Database | PostgreSQL (Vercel Postgres) | ✅ Same | None |
| ORM | Prisma 5.x | ✅ Same | Extend schema |
| Auth library | NextAuth v4 | **Auth.js v5 (next-auth@beta)** | Upgrade + replace providers |
| Auth adapter | @auth/prisma-adapter | ✅ Same library, v5 version | Update package version |
| Auth providers | Email/password + Google OAuth | **Microsoft Entra ID only** | Remove both, add Microsoft |
| UI components | shadcn/ui | ✅ Same | Add CRM-specific components |
| Styling | Tailwind CSS | ✅ Same | None |
| Payments | Stripe | ✅ Keep wired — billing UI deferred | None |
| Multi-tenancy | ❌ Not in free version | Built from scratch | Add |
| Roles | Owner / Member only | 5-role system | Extend |
| Team invites | ❌ Not in free version | Built from scratch | Add |
| Subdomain routing | ❌ Not in free version | Built from scratch | Add |
| Drag & drop | ❌ | @dnd-kit/core | Add |
| Charts | ❌ | Recharts | Add |
| Client state | ❌ | Zustand | Add |
| Server state | ❌ | TanStack React Query | Add |
| Markdown editor | ❌ | @uiw/react-md-editor | Add |
| Email sending | ❌ | Resend | Add |
| Background jobs | ❌ | Vercel Cron | Add |
| File storage | ❌ | Vercel Blob | Add |
| Error tracking | ❌ | Sentry (recommended) | Add |

---

### 5.3 Template Integration Map

**This is the authoritative guide for Claude Code.** Every file and directory from the template is classified. The spec overrides the template wherever they conflict.

#### ✅ Keep as-is (no changes needed)

| Path | What it provides |
|---|---|
| `tsconfig.json` | TypeScript configuration |
| `postcss.config.js` | PostCSS for Tailwind |
| `tailwind.config.ts` | Tailwind setup |
| `components.json` | shadcn/ui CLI config |
| `src/components/ui/` | All shadcn primitives: Button, Card, Dialog, Input, Select, Table, Badge, etc. |
| `src/lib/stripe.ts` | Stripe client singleton |
| `src/app/api/stripe/` | Stripe webhook handler |
| `prisma/migrations/` | Existing migration files (new ones will be added) |
| `.eslintrc.json` | Linting config |
| `playwright/` | E2E test scaffolding |

#### 🔄 Extend (keep the file, modify its contents)

| Path | What changes |
|---|---|
| `prisma/schema.prisma` | **Major extension.** Keep User, Account (auth table), Session, VerificationToken. Extend User with CRM fields. Replace template's org/subscription models with the full CRM schema (see §5.5). |
| `src/middleware.ts` | **Replace auth logic.** Template reads a JWT cookie. Replace with Auth.js v5 `auth()`. Add subdomain extraction — read `host` header, strip to subdomain, inject as `x-workspace-subdomain` response header. |
| `src/app/layout.tsx` | Add providers: TanStack Query provider, Zustand store initialisation, notification toast. |
| `src/app/(dashboard)/layout.tsx` | Replace template's sidebar with CRM sidebar navigation. |
| `package.json` | Add: `next-auth@beta`, `@auth/prisma-adapter`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `recharts`, `zustand`, `@tanstack/react-query`, `@uiw/react-md-editor`, `resend`, `@microsoft/microsoft-graph-client`, `immer`, `date-fns`. Remove: `bcrypt`, `jsonwebtoken` (if present — JWT auth replaced by Auth.js). |
| `.env.example` | Replace with full CRM env var set (see §5.12). |
| `prisma/seed.ts` | Replace template's seed data with CRM seed: Orangeleaf workspace, Mendix pipeline stages, Mendix product catalog, default tags. |
| `src/lib/prisma.ts` | No logic change — just verify singleton pattern is correct for Next.js 14. |

#### ❌ Delete entirely

| Path | Why |
|---|---|
| `src/app/(auth)/sign-up/` | No self-service sign-up. Invitation-only. |
| `src/app/(auth)/sign-in/` | Replaced by Microsoft SSO login page. |
| `src/app/(auth)/forgot-password/` | No passwords — SSO only. |
| `src/app/(auth)/reset-password/` | No passwords — SSO only. |
| `src/lib/auth.ts` (if present) | Template's custom JWT/credential auth logic. Replaced by Auth.js v5 config. |
| `src/lib/password.ts` (if present) | Password hashing utils. Not needed. |
| `src/app/(dashboard)/` page contents | Template's generic dashboard UI is replaced entirely by CRM pages. Keep the route group and layout shell, delete the page content. |

#### ➕ Add (new files, no template equivalent)

**Auth**
```
src/auth.ts                                          Auth.js v5 config — Microsoft Entra ID, Prisma adapter, session callbacks
src/app/api/auth/[...nextauth]/route.ts              Auth.js route handler
src/app/(auth)/login/page.tsx                        Microsoft SSO login page
src/app/(auth)/error/page.tsx                        Auth error page
```

**CRM pages**
```
src/app/(dashboard)/pipeline/board/page.tsx          Kanban board
src/app/(dashboard)/pipeline/list/page.tsx           List view
src/app/(dashboard)/contacts/page.tsx                Contact list
src/app/(dashboard)/contacts/[id]/page.tsx           Contact detail
src/app/(dashboard)/accounts/page.tsx                Account list
src/app/(dashboard)/accounts/[id]/page.tsx           Account detail
src/app/(dashboard)/activities/page.tsx              Activity feed
src/app/(dashboard)/reports/pipeline/page.tsx
src/app/(dashboard)/reports/forecast/page.tsx
src/app/(dashboard)/reports/performance/page.tsx
src/app/(dashboard)/reports/products/page.tsx
src/app/(dashboard)/settings/workspace/page.tsx
src/app/(dashboard)/settings/pipeline/page.tsx
src/app/(dashboard)/settings/products/page.tsx
src/app/(dashboard)/settings/members/page.tsx
src/app/(dashboard)/settings/teams/page.tsx
src/app/(dashboard)/settings/targets/page.tsx
src/app/(dashboard)/settings/integrations/page.tsx
src/app/(dashboard)/settings/custom-fields/page.tsx
src/app/(dashboard)/settings/webhooks/page.tsx
src/app/(dashboard)/settings/exchange-rates/page.tsx
```

**API routes**
```
src/app/api/workspace/opportunities/route.ts
src/app/api/workspace/opportunities/[id]/route.ts
src/app/api/workspace/opportunities/[id]/stage/route.ts
src/app/api/workspace/contacts/route.ts
src/app/api/workspace/contacts/[id]/route.ts
src/app/api/workspace/accounts/route.ts
src/app/api/workspace/accounts/[id]/route.ts
src/app/api/workspace/activities/route.ts
src/app/api/workspace/activities/[id]/route.ts
src/app/api/workspace/pipeline/stages/route.ts
src/app/api/workspace/pipeline/stages/[id]/route.ts
src/app/api/workspace/targets/route.ts
src/app/api/workspace/teams/route.ts
src/app/api/workspace/reports/pipeline/route.ts
src/app/api/workspace/reports/forecast/route.ts
src/app/api/workspace/reports/performance/route.ts
src/app/api/workspace/reports/products/route.ts
src/app/api/workspace/settings/domains/route.ts
src/app/api/workspace/settings/exchange-rates/route.ts
src/app/api/workspace/settings/webhooks/route.ts
src/app/api/workspace/email/webhook/microsoft/route.ts
src/app/api/cron/sync-emails/route.ts
src/app/api/cron/daily-maintenance/route.ts
src/app/api/cron/task-digest/route.ts
```

**Lib modules**
```
src/lib/auth/config.ts                               Auth.js config (re-exported as src/auth.ts)
src/lib/db/workspace.ts                              Workspace resolution helpers
src/lib/email/microsoft.ts                           Graph API delta sync
src/lib/email/shared.ts                              Contact matching, activity creation
src/lib/automation/triggers.ts                       fireTrigger() — audit, automations, webhooks
src/lib/currency.ts                                  Currency conversion helpers
src/lib/notifications.ts                             In-app notification creation
```

**Components**
```
src/components/layout/Sidebar.tsx                    CRM sidebar with grouped navigation
src/components/layout/Topbar.tsx                     Page header with search, notifications, new button
src/components/pipeline/KanbanBoard.tsx
src/components/pipeline/KanbanColumn.tsx
src/components/pipeline/OpportunityCard.tsx
src/components/pipeline/OpportunityTable.tsx
src/components/contacts/ContactList.tsx
src/components/contacts/ContactDetail.tsx
src/components/contacts/InteractionTimeline.tsx
src/components/contacts/QuickLogBar.tsx
src/components/accounts/AccountList.tsx
src/components/accounts/AccountDetail.tsx
src/components/activities/ActivityFeed.tsx
src/components/activities/ActivityItem.tsx
src/components/reports/ForecastChart.tsx
src/components/reports/PipelineFunnel.tsx
src/components/reports/RepPerformanceTable.tsx
src/components/reports/ProductMixChart.tsx
src/components/ui/MarkdownEditor.tsx                 Wrapper around @uiw/react-md-editor
src/components/ui/CurrencyInput.tsx                  Input with currency selector
src/components/ui/DateRangePicker.tsx                Report date range control
```

---

### 5.4 Architecture

```
Browser
  └── Next.js 14 App Router
        ├── Server Components       — data fetching, auth, DB queries via Prisma
        ├── Client Components       — kanban, forms, charts, markdown editor
        └── Server Actions          — all create/update/delete mutations

Auth (Auth.js v5)
  ├── Provider:  Microsoft Entra ID (tenantId: "common" → per-workspace later)
  ├── Adapter:   @auth/prisma-adapter → sessions in Postgres
  ├── Route:     /api/auth/[...nextauth]
  └── Tokens:    access + refresh stored in EmailIntegration on linkAccount event

Middleware (src/middleware.ts)
  ├── Read host header → extract subdomain
  ├── Check Auth.js session → redirect to /login if missing
  ├── Inject x-workspace-subdomain header for downstream use
  └── Pass public routes (/auth/*, /api/auth/*) through unchecked

API Routes
  ├── /api/workspace/*              CRM endpoints (workspace resolved from header)
  ├── /api/cron/*                   Vercel Cron (guarded by CRON_SECRET)
  └── /api/workspace/email/webhook  Microsoft Graph push notifications

External services
  ├── Microsoft Entra ID            SSO
  ├── Microsoft Graph API           Outlook email read + push subscriptions
  ├── Stripe                        Payments (wired, billing UI deferred)
  ├── Resend                        Task digest emails
  └── Vercel (Postgres, Blob, Cron, Edge Network)
```

---

### 5.5 Data Model (Prisma)

Full schema in `prisma/schema.prisma`. The template's auth tables are kept. Everything else is extended or replaced.

#### Auth tables (keep from template, do not modify manually)
Auth.js v5 with `@auth/prisma-adapter` manages these. The adapter requires: `User`, `Account`, `Session`, `VerificationToken`.

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  // Relations added by CRM:
  memberships   WorkspaceMember[]
  accounts      Account[]          // Auth.js OAuth accounts — NOT CRM accounts
  sessions      Session[]
}
```

Note: The template may name this table `accounts` for OAuth providers. The CRM has a separate `CrmAccount` model for company records to avoid naming collision.

#### Workspace (replaces template's organisation/team model)

```prisma
model Workspace {
  id                  String   @id @default(cuid())
  name                String
  slug                String   @unique
  subdomain           String   @unique
  plan                String   @default("starter")  // billing tier — deferred
  reportingCurrency   String   @default("USD")
  timezone            String   @default("Asia/Singapore")
  logoUrl             String?
  stripeCustomerId    String?  @unique              // kept from template
  stripeSubscriptionId String? @unique
  stripeProductId     String?
  planName            String?
  subscriptionStatus  String?
  // Azure AD override (per-workspace SSO — Phase 2)
  azureAdTenantId     String?
  azureAdClientId     String?
  azureAdClientSecret String?                       // stored encrypted
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  // Relations
  members             WorkspaceMember[]
  allowedDomains      AllowedDomain[]
  invitations         Invitation[]
  pipelines           Pipeline[]
  crmAccounts         CrmAccount[]
  contacts            Contact[]
  opportunities       Opportunity[]
  activities          Activity[]
  products            Product[]
  tags                Tag[]
  customFields        CustomField[]
  emailIntegrations   EmailIntegration[]
  exchangeRates       ExchangeRate[]
  salesTargets        SalesTarget[]
  notifications       Notification[]
  webhooks            Webhook[]
  auditLogs           AuditLog[]
  salesTeams          SalesTeam[]
}
```

#### WorkspaceMember

```prisma
model WorkspaceMember {
  id          String   @id @default(cuid())
  workspaceId String
  userId      String
  role        Role     @default(MEMBER)
  joinedAt    DateTime @default(now())

  workspace  Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  salesTeam  SalesTeamMember[]
  ownedOpps  Opportunity[] @relation("OpportunityOwner")
  activities Activity[]   @relation("ActivityAssignee")

  @@unique([workspaceId, userId])
}

enum Role { OWNER ADMIN MANAGER MEMBER VIEWER }
```

#### AllowedDomain

```prisma
model AllowedDomain {
  id          String  @id @default(cuid())
  workspaceId String
  domain      String  // e.g. "orangeleaf.com"
  isInternal  Boolean @default(false)
  // false = SSO auto-provisioning domain
  // true  = internal email domain (filter from sync)

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  @@unique([workspaceId, domain])
}
```

#### SalesTeam

```prisma
model SalesTeam {
  id          String @id @default(cuid())
  workspaceId String
  name        String
  managerId   String // WorkspaceMember.id

  workspace Workspace         @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  members   SalesTeamMember[]
}

model SalesTeamMember {
  salesTeamId String
  memberId    String

  salesTeam SalesTeam       @relation(fields: [salesTeamId], references: [id], onDelete: Cascade)
  member    WorkspaceMember @relation(fields: [memberId],    references: [id], onDelete: Cascade)
  @@id([salesTeamId, memberId])
}
```

#### Pipeline / Stage

```prisma
model Pipeline {
  id          String  @id @default(cuid())
  workspaceId String
  name        String
  isDefault   Boolean @default(false)
  currency    String  @default("USD")
  createdAt   DateTime @default(now())

  workspace     Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  stages        Stage[]
  opportunities Opportunity[]
}

model Stage {
  id          String  @id @default(cuid())
  pipelineId  String
  name        String
  position    Int
  probability Int     @default(0)   // 0-100
  color       String  @default("#6b7280")
  isWon       Boolean @default(false)
  isLost      Boolean @default(false)
  rottenDays  Int?

  pipeline     Pipeline      @relation(fields: [pipelineId], references: [id], onDelete: Cascade)
  opportunities Opportunity[]
  stageHistory  StageHistory[]
}
```

#### CrmAccount / Contact

```prisma
model CrmAccount {
  id          String      @id @default(cuid())
  workspaceId String
  name        String
  domain      String?
  industry    String?
  size        CompanySize?
  website     String?
  phone       String?
  city        String?
  country     String?
  logoUrl     String?
  linkedinUrl String?
  annualRevenue Float?
  description String?     @db.Text
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  workspace     Workspace    @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  contacts      Contact[]
  opportunities Opportunity[]
  activities    Activity[]
  tags          TagOnCrmAccount[]
  customValues  CustomFieldValue[]
}

enum CompanySize { MICRO SMALL MEDIUM LARGE ENTERPRISE }

model Contact {
  id          String        @id @default(cuid())
  workspaceId String
  accountId   String?
  firstName   String
  lastName    String
  email       String?
  phone       String?
  jobTitle    String?
  department  String?
  linkedinUrl String?
  avatarUrl   String?
  notes       String?       @db.Text
  status      ContactStatus @default(ACTIVE)
  leadSource  String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  workspace     Workspace              @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  account       CrmAccount?            @relation(fields: [accountId], references: [id])
  opportunities ContactOnOpportunity[]
  activities    Activity[]
  emailThreads  EmailThread[]
  tags          TagOnContact[]
  customValues  CustomFieldValue[]
}

enum ContactStatus { ACTIVE INACTIVE LEAD CUSTOMER CHURNED }
```

#### Opportunity

```prisma
model Opportunity {
  id                   String    @id @default(cuid())
  workspaceId          String
  pipelineId           String
  stageId              String
  accountId            String?
  ownerId              String    // WorkspaceMember.id
  name                 String
  value                Decimal   @default(0) @db.Decimal(15, 2)
  currency             String    @default("USD")
  valueInReportingCcy  Decimal?  @db.Decimal(15, 2) // cached converted value
  probability          Int?      // override of stage default
  expectedCloseDate    DateTime?
  actualCloseDate      DateTime?
  lostReason           String?
  source               String?
  description          String?   @db.Text
  priority             Priority  @default(MEDIUM)
  status               OppStatus @default(OPEN)
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  workspace     Workspace              @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  pipeline      Pipeline               @relation(fields: [pipelineId], references: [id])
  stage         Stage                  @relation(fields: [stageId], references: [id])
  account       CrmAccount?            @relation(fields: [accountId], references: [id])
  owner         WorkspaceMember        @relation("OpportunityOwner", fields: [ownerId], references: [id])
  contacts      ContactOnOpportunity[]
  products      ProductOnOpportunity[]
  activities    Activity[]
  stageHistory  StageHistory[]
  tags          TagOnOpportunity[]
  customValues  CustomFieldValue[]
}

enum Priority  { LOW MEDIUM HIGH CRITICAL }
enum OppStatus { OPEN WON LOST ON_HOLD }

model StageHistory {
  id            String   @id @default(cuid())
  opportunityId String
  fromStageId   String?
  toStageId     String
  movedAt       DateTime @default(now())
  movedById     String?

  opportunity Opportunity @relation(fields: [opportunityId], references: [id], onDelete: Cascade)
  toStage     Stage       @relation(fields: [toStageId], references: [id])
}

model ContactOnOpportunity {
  opportunityId String
  contactId     String
  role          String?

  opportunity Opportunity @relation(fields: [opportunityId], references: [id], onDelete: Cascade)
  contact     Contact     @relation(fields: [contactId], references: [id], onDelete: Cascade)
  @@id([opportunityId, contactId])
}
```

#### Activity (extends template's concept, new table)

```prisma
model Activity {
  id            String       @id @default(cuid())
  workspaceId   String
  type          ActivityType
  title         String
  body          String?      @db.Text  // raw Markdown
  outcome       String?
  scheduledAt   DateTime?
  completedAt   DateTime?
  dueAt         DateTime?              // tasks only
  duration      Int?                   // minutes
  assigneeId    String?                // WorkspaceMember.id
  createdById   String                 // WorkspaceMember.id or "system"
  opportunityId String?
  contactId     String?
  accountId     String?
  emailThreadId String?
  isAutomated   Boolean      @default(false)
  metadata      Json?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  workspace   Workspace        @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  opportunity Opportunity?     @relation(fields: [opportunityId], references: [id])
  contact     Contact?         @relation(fields: [contactId], references: [id])
  account     CrmAccount?      @relation(fields: [accountId], references: [id])
  assignee    WorkspaceMember? @relation("ActivityAssignee", fields: [assigneeId], references: [id])
  emailThread EmailThread?     @relation(fields: [emailThreadId], references: [id])
}

enum ActivityType {
  NOTE CALL EMAIL MEETING TASK DEMO
  PROPOSAL_SENT CONTRACT_SENT STAGE_CHANGE SYSTEM
}
```

#### Email integration tables

```prisma
model EmailIntegration {
  id           String    @id @default(cuid())
  workspaceId  String
  userId       String
  provider     String    @default("MICROSOFT")  // MICROSOFT only in Phase 1
  email        String
  accessToken  String    @db.Text
  refreshToken String?   @db.Text
  expiresAt    DateTime?
  deltaLink    String?   @db.Text
  syncFromDate DateTime  @default(now())
  lastSyncAt   DateTime?
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())

  workspace Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  threads   EmailThread[]

  @@unique([workspaceId, userId, provider])
}

model EmailThread {
  id                  String   @id @default(cuid())
  workspaceId         String
  emailIntegrationId  String?
  contactId           String?
  externalThreadId    String
  subject             String
  lastMessageAt       DateTime
  messageCount        Int      @default(1)
  isInbound           Boolean  @default(true)
  snippet             String?
  createdAt           DateTime @default(now())

  integration EmailIntegration? @relation(fields: [emailIntegrationId], references: [id])
  contact     Contact?          @relation(fields: [contactId], references: [id])
  activities  Activity[]
  messages    EmailMessage[]

  @@index([externalThreadId])
}

model EmailMessage {
  id        String   @id @default(cuid())
  threadId  String
  messageId String
  from      String
  to        String[]
  cc        String[]
  subject   String
  body      String   @db.Text
  bodyHtml  String?  @db.Text
  sentAt    DateTime
  isRead    Boolean  @default(false)

  thread EmailThread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  @@unique([threadId, messageId])
}
```

#### Products / Catalog

```prisma
model Product {
  id          String   @id @default(cuid())
  workspaceId String
  name        String
  sku         String?
  description String?
  category    String?
  unitPrice   Decimal  @db.Decimal(15, 2)
  currency    String   @default("USD")
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  workspace     Workspace              @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  opportunities ProductOnOpportunity[]
}

model ProductOnOpportunity {
  opportunityId String
  productId     String
  quantity      Int    @default(1)
  notes         String?

  opportunity Opportunity @relation(fields: [opportunityId], references: [id], onDelete: Cascade)
  product     Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@id([opportunityId, productId])
}
```

#### Reporting / Targets / Notifications

```prisma
model ExchangeRate {
  id            String   @id @default(cuid())
  workspaceId   String
  fromCurrency  String
  toCurrency    String   // = workspace reportingCurrency
  rate          Decimal  @db.Decimal(18, 8)
  effectiveDate DateTime @default(now())
  createdAt     DateTime @default(now())

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  @@unique([workspaceId, fromCurrency, toCurrency])
}

model SalesTarget {
  id               String     @id @default(cuid())
  workspaceId      String
  memberId         String     // WorkspaceMember.id
  period           String     // "2026-Q1" or "2026-03"
  periodType       PeriodType
  revenueTarget    Decimal    @db.Decimal(15, 2)
  opportunityTarget Int
  activityTarget   Int
  currency         String     // workspace reportingCurrency at time of creation
  createdAt        DateTime   @default(now())

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  @@unique([workspaceId, memberId, period])
}

enum PeriodType { MONTHLY QUARTERLY }

model Notification {
  id          String    @id @default(cuid())
  workspaceId String
  userId      String
  type        String    // TASK_OVERDUE | MENTION | SYSTEM
  title       String
  body        String?
  readAt      DateTime?
  entityId    String?
  entityType  String?
  createdAt   DateTime  @default(now())

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  @@index([workspaceId, userId, readAt])
}
```

#### Tags / Custom Fields / Webhooks / Audit

```prisma
model Tag { ... }
model TagOnContact { ... }
model TagOnCrmAccount { ... }
model TagOnOpportunity { ... }

model CustomField {
  // workspaceId, entity (CONTACT|CRM_ACCOUNT|OPPORTUNITY),
  // name, key, type (TEXT|NUMBER|DATE|BOOLEAN|SELECT|MULTI_SELECT|URL),
  // options String[], required, position
}

model CustomFieldValue {
  // fieldId, value (String), contactId?, accountId?, opportunityId?
}

model Webhook {
  // workspaceId, url, events String[], secret, isActive
}

model AuditLog {
  // workspaceId, userId, action, entity, entityId, before Json?, after Json?
}

model Invitation {
  // workspaceId, email, role, token (unique), expiresAt, acceptedAt
}
```

---

### 5.6 Auth — Microsoft Entra ID with Auth.js v5

```typescript
// src/auth.ts  (or src/lib/auth/config.ts re-exported from src/auth.ts)

import NextAuth from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    MicrosoftEntraID({
      clientId:     process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId:     process.env.AZURE_AD_TENANT_ID ?? "common",
      authorization: {
        params: {
          // Mail scopes required for email sync — captured at login
          scope: "openid profile email offline_access Mail.Read Mail.ReadWrite Mail.Send",
        },
      },
    }),
  ],

  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,   // 30 days
  },

  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id
      session.user.workspaces = await getWorkspaceMemberships(user.id)
      return session
    },
  },

  events: {
    // Capture OAuth tokens for email sync immediately on sign-in
    async linkAccount({ user, account }) {
      if (account.provider !== "microsoft-entra-id") return
      if (!account.access_token) return
      await upsertEmailIntegration({ user, account })
    },
  },

  pages: {
    signIn: "/auth/login",
    error:  "/auth/error",
  },
})
```

**What this replaces in the template:** The template's `src/lib/auth.ts` which implements credentials-based (email/password) auth with `bcrypt` and `jsonwebtoken`. That file and all its usages are deleted. The sign-in page is replaced with a single "Sign in with Microsoft" button.

---

### 5.7 Middleware

```typescript
// src/middleware.ts — replaces template's JWT cookie check

import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req) => {
  const url   = req.nextUrl
  const host  = req.headers.get("host") ?? ""

  // ── Subdomain extraction ──────────────────────────────────
  // "orangeleaf.orangeleaf.app" → "orangeleaf"
  // "localhost:3000" → null (dev fallback)
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1")
  const subdomain   = isLocalhost ? null : host.split(".")[0]

  // ── Public routes — always allow ─────────────────────────
  const isPublic =
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/api/auth/") ||
    url.pathname.startsWith("/api/stripe/") ||
    url.pathname === "/favicon.ico"

  if (isPublic) return NextResponse.next()

  // ── Auth guard ────────────────────────────────────────────
  if (!req.auth?.user?.id) {
    const loginUrl = new URL("/auth/login", req.url)
    loginUrl.searchParams.set("callbackUrl", url.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Workspace header ──────────────────────────────────────
  const res = NextResponse.next()
  if (subdomain) res.headers.set("x-workspace-subdomain", subdomain)
  return res
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
```

---

### 5.8 API Route Convention

All CRM routes live under `/api/workspace/[resource]`. The workspace is resolved from `x-workspace-subdomain` header — never from a URL segment — keeping URLs clean.

**Every route handler pattern:**
```typescript
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export async function GET(req: NextRequest) {
  // 1. Auth check
  const session = await auth()
  if (!session?.user?.id)
    return Response.json({ error: "Unauthorized" }, { status: 401 })

  // 2. Workspace resolution
  const subdomain = headers().get("x-workspace-subdomain")
  const workspace = subdomain
    ? await prisma.workspace.findUnique({ where: { subdomain } })
    : null
  if (!workspace)
    return Response.json({ error: "Workspace not found" }, { status: 404 })

  // 3. Membership + role check
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: session.user.id } },
  })
  if (!member)
    return Response.json({ error: "Forbidden" }, { status: 403 })

  // 4. Role-specific access check (example for report endpoint)
  if (!["MANAGER", "ADMIN", "OWNER"].includes(member.role))
    return Response.json({ error: "Forbidden" }, { status: 403 })

  // 5. Query — always include workspaceId filter
  const data = await prisma.opportunity.findMany({
    where: { workspaceId: workspace.id, /* ... */ },
  })

  return Response.json({ data })
}
```

**Response shapes:**
```typescript
{ data: T }                           // single record
{ items: T[], total?: number }        // list
{ error: string, details?: unknown }  // error
```

List endpoints accept: `?from=YYYY-MM-DD&to=YYYY-MM-DD`, `?limit=50&cursor=<id>`.

---

### 5.9 Email Sync (Microsoft Graph)

**Scope:** Microsoft Outlook only. Per-user mailbox. Gmail is Phase 2.

**Token flow:**
1. User signs in via Microsoft → Auth.js `linkAccount` event fires
2. `access_token` + `refresh_token` written to `EmailIntegration`
3. Sync starts automatically — no separate "connect email" step

**Delta sync:**
- First run: `GET /me/messages?$filter=receivedDateTime ge [syncFromDate]`
- Subsequent runs: use stored `deltaLink` — only returns changes since last sync
- New `deltaLink` saved after each successful sync

**Push notifications:**
- On first sync, register Graph subscription pointing to `/api/workspace/email/webhook/microsoft`
- `clientState` field set to `emailIntegration.id` for verification
- Subscriptions expire after 3 days — renewed by daily maintenance cron

**Internal filtering:**
- Before creating any activity, check if both From and To match `AllowedDomain` where `isInternal = true`
- If both internal → skip
- If one internal, one external → log, link to external contact

**Contact matching:**
- Inbound: match by From address
- Outbound: match by first To address
- If found → link activity to contact + their most recent open opportunity
- If not found → store thread/message, surface "Create contact" prompt

---

### 5.10 Automation & Triggers

`fireTrigger(payload)` called after every significant mutation. Runs three things in parallel:

1. **Audit log** — write to `AuditLog`
2. **Built-in automations** — create activities for stage changes, update status on won/lost, create stale deal alerts
3. **Outbound webhooks** — POST to all subscribed URLs with HMAC-SHA256 signature

| Event | Built-in action |
|---|---|
| `opportunity.stage_changed` | Create `STAGE_CHANGE` activity |
| `opportunity.won` | Create system activity, set `status=WON`, set `actualCloseDate` |
| `opportunity.lost` | Create system activity, set `status=LOST`, store `lostReason` |
| `deal.stale` | Create `SYSTEM` activity (max once per 24h per deal) |
| `email.received` | Create `EMAIL` activity linked to contact + opportunity |
| `task.overdue` | Create `Notification` record for assignee |

**Cron jobs (`vercel.json`):**
```json
{
  "crons": [
    { "path": "/api/cron/sync-emails",        "schedule": "*/15 * * * *" },
    { "path": "/api/cron/daily-maintenance",  "schedule": "0 7 * * *"   },
    { "path": "/api/cron/task-digest",        "schedule": "0 8 * * *"   }
  ]
}
```

All cron endpoints require `Authorization: Bearer [CRON_SECRET]` header.

---

### 5.11 Multi-tenancy & Subdomains

- Domain: `orangeleaf.app`
- Pattern: `[subdomain].orangeleaf.app`
- DNS: `CNAME *.orangeleaf.app cname.vercel-dns.com`
- Vercel project domain: `*.orangeleaf.app`
- Workspace resolved in middleware from subdomain → passed as header → used in every server component and API route via `headers().get("x-workspace-subdomain")`

---

### 5.12 Security

- All routes behind Auth.js `auth()` in middleware
- Every DB query filtered by `workspaceId` — no cross-workspace access
- Azure AD per-workspace override credentials stored encrypted (key: `WORKSPACE_SECRET_KEY`)
- Cron: `Authorization: Bearer CRON_SECRET`
- Webhooks: `X-CRM-Signature: sha256=HMAC(secret, payload)`
- OAuth tokens server-side only — never in client bundles or API responses

---

### 5.13 Environment Variables

```bash
# Vercel Postgres (auto-injected when provisioned via Vercel dashboard)
POSTGRES_PRISMA_URL=            # pooled connection (app)
POSTGRES_URL_NON_POOLING=       # direct connection (prisma migrate)

# Auth.js v5
AUTH_SECRET=                    # openssl rand -base64 32
NEXTAUTH_URL=https://orangeleaf.orangeleaf.app

# Microsoft Entra ID — only OAuth provider in Phase 1
# Setup: portal.azure.com → Entra ID → App registrations → New registration
# Redirect URI: https://[subdomain].orangeleaf.app/api/auth/callback/microsoft-entra-id
# API permissions: openid, profile, email, offline_access, Mail.Read, Mail.ReadWrite, Mail.Send
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=common       # or specific tenant ID for Orangeleaf-internal use

# Stripe (template default — billing UI deferred to later phase)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Vercel services
BLOB_READ_WRITE_TOKEN=          # Vercel Blob — workspace logos
CRON_SECRET=                    # openssl rand -hex 32 — protects cron endpoints

# Resend — task digest emails
RESEND_API_KEY=

# Workspace secret key — encrypts per-org Azure AD credentials
WORKSPACE_SECRET_KEY=           # openssl rand -hex 32

# App URLs
NEXT_PUBLIC_APP_URL=https://orangeleaf.orangeleaf.app
NEXT_PUBLIC_APP_DOMAIN=orangeleaf.app
```

## 6. Open Questions

| # | Question | Impact | Status |
|---|---|---|---|
| Q13 | Transactional email service for task digests? Resend is assumed in this spec. | Notification delivery | ❓ Confirm |
| Q14 | Currency dropdown: curated APAC set (AUD, SGD, JPY, HKD, USD, EUR, GBP) or full ISO 4217 autocomplete? | Currency UX | ❓ Open |
| Q15 | Exchange rates: manual only or auto-fetch from an API (e.g. ExchangeRate-API)? | FX data freshness | ❓ Open |
| Q16 | Contact name display order — family name first option? Workspace-level setting? | Contacts UX | ❓ Open |
| Q17 | Target period granularity — monthly only, or quarterly as well at launch? | `SalesTarget` data model | ❓ Open |

---

## 7. Out of Scope (for now)

- Gmail / Google OAuth
- Shared/org-wide Outlook sync
- Email composer
- Calendar sync
- File attachments
- Automatic FX rate fetching (if Q15 = manual for Phase 1)
- Custom domain per tenant
- Per-workspace Azure AD app registration UI (fields reserved)
- AI features
- User-configured automation rules
- Zapier / n8n / Make
- Native mobile app
- Historical exchange rate reporting
- Billing UI (Stripe wired, UI deferred)
- Win/loss deep analysis

---

## 8. Glossary

| Term | Definition |
|---|---|
| **Workspace** | An isolated CRM environment per customer. Stored as a `teams` row (template naming). |
| **Template `teams` table** | In the template, this is the top-level org unit. We extend it to serve as the Workspace. |
| **CRM teams** | Separate `crmTeams` table — sub-groups of members within a workspace, each with a Manager. |
| **Opportunity** | A tracked sales deal with a stage, value (own currency), and owner. |
| **Pipeline / Stage** | Configurable sales process. Stages have probability, colour, and rotten threshold. |
| **Account** | A company or organisation. |
| **Contact** | An individual person, usually linked to an Account. |
| **Activity** | Any logged interaction — extends the template's `activityLogs` table. |
| **Task** | An activity with a `dueAt` timestamp, trackable as overdue. |
| **Email Integration** | Connected Microsoft Outlook account. Tokens from SSO sign-in. |
| **Internal domain** | Email domain of the CRM user's org. `AllowedDomain` with `isInternal = true`. |
| **Allowed domain** | Email domain granting auto-workspace-join on SSO. `AllowedDomain` with `isInternal = false`. |
| **Delta query** | Microsoft Graph feature returning only changes since last sync via `deltaLink`. |
| **Trigger** | `fireTrigger()` — runs audit, automations, webhooks on CRM events. |
| **Weighted forecast** | Sum of (value × probability) across open opportunities, in reporting currency. |
| **Reporting currency** | Workspace default currency for aggregating multi-currency deals in reports. |
| **Exchange rate** | Stored conversion rate from a deal currency to reporting currency. Manual update. |
| **Target** | Admin-set goal per member per period: revenue, opportunity count, activity count. |
| **Target attainment** | Actual ÷ target × 100%. |
| **APAC** | Asia-Pacific — Orangeleaf's primary sales market. |
| **Drizzle** | TypeScript-first ORM used in the base template (replaces Prisma in our earlier scaffold). |
| **Auth.js v5** | Next.js auth library (next-auth). Replaces the template's custom JWT auth. |
| **`@auth/drizzle-adapter`** | Auth.js adapter that stores sessions in Drizzle-managed Postgres tables. |
