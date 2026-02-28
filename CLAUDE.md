# Orangeleaf CRM — Claude Code Instructions

## What you are building

A multi-tenant SaaS CRM for Orangeleaf Consulting. Read `docs/spec.md` fully before
writing any code. It is the single source of truth. The spec overrides everything else,
including anything that conflicts with the base template.

## Starting point

This repo is cloned from `github.com/Saas-Starter-Kit/Saas-Kit-prisma`.
Section 5.3 of the spec contains an explicit integration map for every template file:
**keep, extend, delete, or add**. Follow it exactly.

## Folder structure of this repo

```
/
├── CLAUDE.md                        ← you are here
├── docs/
│   ├── spec.md                      ← MAIN SPEC — read first, always
│   ├── ui-prototype.jsx             ← visual reference for UI/UX (all 7 modules)
│   ├── reference-schema.prisma      ← annotated schema reference (superseded by spec §5.5)
│   └── scaffold/                    ← pre-built reference implementations (see below)
│       ├── src/lib/email/microsoft.ts      ← Graph delta sync — USE THIS
│       ├── src/lib/email/shared.ts         ← contact matching logic — USE THIS
│       ├── src/lib/automation/triggers.ts  ← fireTrigger() system — USE THIS
│       ├── src/lib/db/workspace.ts         ← workspace resolution helpers — USE THIS
│       ├── src/lib/auth/config.ts          ← auth config pattern — ADAPT (see notes)
│       ├── src/middleware.ts               ← middleware pattern — ADAPT (see notes)
│       ├── src/app/api/workspace/opportunities/route.ts  ← API route pattern — USE THIS
│       ├── src/app/api/workspace/pipeline/stages/route.ts
│       ├── src/app/api/workspace/email/webhook/microsoft/route.ts
│       ├── src/app/api/cron/sync-emails/route.ts
│       ├── src/app/api/cron/stale-deals/route.ts
│       ├── src/app/auth/login/page.tsx
│       ├── prisma/schema.prisma            ← OLD schema — use spec §5.5 instead
│       ├── prisma/seed.ts                  ← seed pattern — ADAPT to new schema
│       └── package.json                   ← dependency reference
├── prisma/
│   └── schema.prisma          ← authoritative schema — extend this
├── src/                       ← Next.js App Router source
└── ... (template files)
```

## Scaffold reference files — what to use, what to adapt

The `docs/scaffold/` folder contains working implementations built before the template
was chosen. Most of the logic is correct and should be used directly. Some files need
adaptation due to the v0.4 spec changes. Here is the exact status of each:

### Use directly (copy into place, minimal changes needed)

| Scaffold file | Copy to | Notes |
|---|---|---|
| `src/lib/email/microsoft.ts` | `src/lib/email/microsoft.ts` | Fully correct Graph delta sync logic. Update import path for prisma client to match template's `src/lib/prisma.ts`. |
| `src/lib/email/shared.ts` | `src/lib/email/shared.ts` | Contact matching and activity creation. Update Prisma import. |
| `src/lib/automation/triggers.ts` | `src/lib/automation/triggers.ts` | `fireTrigger()` system. Update Prisma import. |
| `src/lib/db/workspace.ts` | `src/lib/db/workspace.ts` | Workspace resolution helpers. Update Prisma import. |
| `src/app/api/workspace/opportunities/route.ts` | same path | Reference implementation for the API route pattern. Adapt field names to v0.4 schema. |
| `src/app/api/workspace/email/webhook/microsoft/route.ts` | same path | Microsoft Graph push webhook handler. Use as-is. |
| `src/app/api/cron/sync-emails/route.ts` | same path | Email sync cron. Use as-is. |

### Adapt (correct pattern, needs specific changes)

| Scaffold file | What to change |
|---|---|
| `src/lib/auth/config.ts` | Uses NextAuth v4 patterns. Rewrite for Auth.js v5 (`next-auth@beta`). Keep the `linkAccount` event logic for token capture — that part is correct. Remove Google provider. |
| `src/middleware.ts` | Update auth check from old session pattern to Auth.js v5 `auth()`. Subdomain extraction logic is correct — keep it. |
| `prisma/seed.ts` | Schema field names have changed. Adapt to v0.4 schema (spec §5.5). Keep the Mendix pipeline stages and product catalog data. |
| `src/app/auth/login/page.tsx` | Good structure. Update `signIn()` call to Auth.js v5 pattern. |
| `src/app/api/cron/stale-deals/route.ts` | Merge this into `daily-maintenance` cron (spec §5.10 — three crons: sync-emails, daily-maintenance, task-digest). |

### Ignore entirely

| Scaffold file | Why |
|---|---|
| `src/lib/email/gmail.ts` | Gmail removed from Phase 1 |
| `src/app/api/workspace/email/webhook/google/route.ts` | Gmail removed from Phase 1 |
| `prisma/schema.prisma` (scaffold) | Superseded by spec §5.5. Use the spec, not this file. |
| `package.json` (scaffold) | Use as a dependency reference only — do not use as the actual package.json |

## Non-negotiable rules

1. **Spec is law.** If the template does something differently, rewrite the template to
   match the spec. Never adapt the spec to fit the template.

2. **Auth is Microsoft Entra ID only.** No email/password. No Google. Remove all
   credential and Google auth code from the template before building anything else.

3. **Every DB query must include `workspaceId` filter.** No exceptions. This is the
   tenant isolation boundary.

4. **Workspace is resolved from subdomain, not URL.** The middleware extracts the
   subdomain from the `host` header and injects it as `x-workspace-subdomain`. API
   routes read this header. Never put workspaceId in a URL segment.

5. **Opportunity value is always manual.** Products linked to an opportunity are for
   classification only. They do not calculate or modify the value field.

6. **Members see only their own opportunities.** `ownerId = currentMember.id`.
   Managers see their team. Admins/Owners see all. Enforce this in every query.

7. **Activity body is raw Markdown.** Store as text. Render as HTML in the UI using
   the markdown editor component.

## Build order

Work in this sequence. Do not jump ahead — each phase depends on the previous.

### Phase 1 — Foundation (do this first, get it running)
1. Delete template auth (sign-up page, password reset, credential provider, Google provider, `bcrypt`, `jose`)
2. Install Auth.js v5 (`next-auth@beta`) + `@auth/prisma-adapter`
3. Implement `src/auth.ts` — Microsoft Entra ID provider, Prisma adapter, session callbacks, `linkAccount` event for email integration token capture (see spec §5.6)
4. Replace `src/middleware.ts` — Auth.js session guard + subdomain extraction (see spec §5.7)
5. Replace login page with Microsoft SSO button only
6. Replace Prisma schema — keep auth tables (User, Account, Session, VerificationToken), extend with full CRM schema (see spec §5.5)
7. Run `prisma migrate dev` — verify all tables created cleanly
8. Write and run seed (`prisma/seed.ts`) — Orangeleaf workspace, Mendix pipeline + stages, Mendix product catalog, default tags
9. Verify: user can sign in with Microsoft, session contains workspace memberships, subdomain routes correctly

### Phase 2 — Core CRM data layer
10. Workspace resolution helpers (`src/lib/db/workspace.ts`) — `getWorkspaceFromRequest()`, `requireWorkspaceMember()`
11. API route convention implemented for one resource end-to-end (use Opportunities as the reference implementation)
12. Opportunities CRUD API (`/api/workspace/opportunities`)
13. Stage move endpoint (`/api/workspace/opportunities/[id]/stage`) — fires `fireTrigger()`
14. Contacts CRUD API
15. Accounts CRUD API
16. Activities API
17. Pipeline/stages CRUD API (including reorder)

### Phase 3 — UI
18. CRM sidebar layout + topbar (replace template's generic dashboard shell)
19. Dashboard page — KPI cards, pipeline chart, activity feed, top opportunities
20. Kanban board — @dnd-kit, drag to change stage, optimistic updates
21. Pipeline list view — sortable table, filters, bulk actions
22. Contact list + detail page — timeline, quick-log bar
23. Account list + detail page
24. Activities list page — filterable, overdue task highlighting

### Phase 4 — Email sync
25. `src/lib/email/microsoft.ts` — delta sync, token refresh, internal domain filtering
26. `src/lib/email/shared.ts` — contact matching, activity creation
27. Webhook handler (`/api/workspace/email/webhook/microsoft`)
28. Cron: sync-emails (every 15 min), daily-maintenance (stale deals + subscription renewal), task-digest (08:00)

### Phase 5 — Reports
29. Report data API endpoints (pipeline, forecast, performance, products)
30. Reports UI — date range picker, pipeline funnel, forecast chart, rep performance table with targets
31. `SalesTarget` CRUD in settings

### Phase 6 — Settings
32. Workspace settings (name, logo, currency, timezone, allowed domains, internal domains)
33. Pipeline settings (stage CRUD with drag-to-reorder)
34. Products settings (catalog CRUD)
35. Team management + member invitations
36. Sales targets (per-member per-period, bulk team set)
37. Integrations page (view/disconnect email integrations)
38. Custom fields
39. Webhooks
40. Exchange rates

## Key technical decisions (already made — do not revisit)

| Decision | Choice |
|---|---|
| Auth | Auth.js v5, Microsoft Entra ID, database sessions |
| ORM | Prisma 5.x |
| Database | Vercel Postgres |
| UI components | shadcn/ui + Tailwind |
| Drag and drop | @dnd-kit/core + @dnd-kit/sortable |
| Charts | Recharts |
| Client state | Zustand |
| Server state | TanStack React Query |
| Markdown editor | @uiw/react-md-editor |
| Email sending | Resend |
| File storage | Vercel Blob |
| Background jobs | Vercel Cron |
| Email provider | Microsoft Graph API (Outlook only) |
| Domain | orangeleaf.app, subdomains per tenant |
| Multi-tenancy | Subdomain-based |
| Opportunity value | Manual — products are classification only |
| Opportunity visibility | Members: own only. Managers: team. Admin/Owner: all |
| Activity body | Raw Markdown, stored as text |

## Environment variables

See spec §5.13 for the full list. For local dev you need at minimum:
```
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
AUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=common
```

## Questions

If you encounter anything ambiguous, check `docs/spec.md` first — it likely has the
answer. If genuinely not covered, ask before implementing.
