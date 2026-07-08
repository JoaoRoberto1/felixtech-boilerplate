# Felix Boilerplate

Production-ready SaaS boilerplate built by **Felix Technology**. Provides authentication, teams,
role-based access control (RBAC), Stripe billing, a dashboard shell and account settings — the
baseline every new Felix product starts from.

## Stack

| Layer    | Choice                                                                           |
| -------- | -------------------------------------------------------------------------------- |
| Frontend | React 18 + TypeScript, Vite, React Router, TanStack Query, Zustand, Tailwind CSS |
| Backend  | Node.js + TypeScript, Express, Prisma ORM                                        |
| Database | PostgreSQL                                                                       |
| Auth     | JWT access token (in memory) + rotating refresh token (httpOnly cookie)          |
| Payments | Stripe (Checkout + Billing Portal + webhooks)                                    |
| Monorepo | pnpm workspaces + Turborepo                                                      |

## Project structure

```
apps/
  api/     Express API (auth, teams, RBAC, billing)
  web/     React SPA (dashboard, settings, billing UI)
packages/
  shared/  Zod schemas, DTO types and RBAC constants shared by both apps
```

## Getting started

### 1. Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker (for local PostgreSQL) or an existing Postgres instance

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start PostgreSQL

```bash
docker compose up -d
```

### 4. Configure environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Fill in `apps/api/.env` with real values — at minimum generate two 32+ character random strings for
`JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`, and add your Stripe test keys.

### 5. Run database migrations and seed permissions

```bash
pnpm db:migrate
pnpm db:seed
```

### 6. Start the dev servers

```bash
pnpm dev
```

- API: http://localhost:4000
- Web: http://localhost:5173

## RBAC model

- **Permission** — a global catalog of fine-grained actions (`team:manage`, `team:members:invite`, …),
  seeded once via `pnpm db:seed`. See `packages/shared/src/constants/permissions.ts` for the full list.
- **Role** — scoped to a single team. Every team automatically gets three system roles on creation
  (`Owner`, `Admin`, `Member`) with sensible default permissions; teams can also create custom roles
  with any combination of permissions.
- **TeamMember** — links a user to a team through exactly one role.

The API enforces this via the `loadTeamContext` + `requirePermission(...)` middlewares
(`apps/api/src/middlewares/rbac.ts`); the frontend mirrors the same checks with the `usePermission`
hook and `<PermissionGate>` component so the UI never offers actions the user can't perform.

## Authentication flow

1. `POST /api/auth/register` / `login` returns a short-lived access token in the response body and
   sets a rotating refresh token as an httpOnly, `SameSite=Lax` cookie scoped to `/api/auth`.
2. The access token is kept in memory on the client (never `localStorage`) and attached as a
   `Authorization: Bearer` header by the axios interceptor in `apps/web/src/api/client.ts`.
3. On a 401, the client transparently calls `POST /api/auth/refresh`; the API validates the refresh
   token, rotates it (old one is revoked, a new one is issued) and returns a fresh access token.
4. Refresh token reuse (a revoked or tampered token presented again) revokes every active session for
   that user as a precaution against token theft.

## Stripe billing

Each team lazily gets a Stripe Customer on first checkout. Subscription state is written to the
`Subscription` table by the webhook handler (`apps/api/src/modules/stripe/webhook.routes.ts`), which
listens for `checkout.session.completed`, `customer.subscription.updated` and
`customer.subscription.deleted`.

To test webhooks locally:

```bash
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

Copy the printed signing secret into `STRIPE_WEBHOOK_SECRET`.

## Useful scripts

| Command           | Description                 |
| ----------------- | --------------------------- |
| `pnpm dev`        | Run API + web in watch mode |
| `pnpm build`      | Build all apps              |
| `pnpm lint`       | Lint all packages           |
| `pnpm typecheck`  | Type-check all packages     |
| `pnpm db:migrate` | Run Prisma migrations (dev) |
| `pnpm db:seed`    | Seed the permission catalog |
| `pnpm db:studio`  | Open Prisma Studio          |

## License

Proprietary — © Felix Technology.
