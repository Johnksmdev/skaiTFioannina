# skaitfioannina

Private training social platform built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, PostgreSQL, bcryptjs, JWT cookies, and Zod.

## Run locally

You need a PostgreSQL database (hosted Neon/Supabase or local). Copy `.env.example` to `.env`, then set:

- `DATABASE_URL` — pooled connection string for runtime
- `DATABASE_URL_DIRECT` — direct connection string, used for `prisma migrate deploy`
- `AUTH_SECRET` — generate with `openssl rand -base64 32`

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open http://localhost:3000.

To stop the dev server: `lsof -ti:3000 | xargs kill -9`

## Deploy to Vercel (with Vercel Postgres)

1. Push the repo to GitHub (see bottom of this file).
2. Import the project in Vercel (framework auto-detected as Next.js).
3. In **Storage → Create Database → Postgres**, choose a region and create. Vercel auto-injects:
   - `POSTGRES_PRISMA_URL` (pooled — runtime)
   - `POSTGRES_URL_NON_POOLING` (direct — migrations)
   - `POSTGRES_URL` (legacy)
4. In **Settings → Environment Variables**, add `AUTH_SECRET` (generate with `openssl rand -base64 32`).
5. `.env.example` references the Vercel-injected variables via `$POSTGRES_PRISMA_URL` / `$POSTGRES_URL_NON_POOLING` expansion — no manual paste needed in Vercel. For local dev, set `DATABASE_URL` and `DATABASE_URL_DIRECT` directly in `.env`.
6. Build runs `prisma generate && next build` automatically.
7. Migrations are NOT run by Vercel. Run them once locally against the direct URL shown in the Vercel Storage tab:
   ```bash
   DATABASE_URL="<paste POSTGRES_URL_NON_POOLING>" npx prisma migrate deploy
   DATABASE_URL="<paste POSTGRES_PRISMA_URL>" npm run db:seed
   ```
8. Deploy.

## Seed accounts

Edit `prisma/seed.ts` to set emails, usernames, and passwords, then run `npm run db:seed`. Passwords are hashed with bcrypt before insert; only the seed file holds the cleartext. The seed is **idempotent** — it upserts by email and rewrites `passwordHash`, so re-running updates existing rows.

| Role | Email (default seed) |
| --- | --- |
| Admin | `admin@skai.com` |
| Coach | `kammenos@skai.com` |
| Verified Athlete | `john@skai.com` |
| User | `themis@gmail.com` |

New registrations are always `USER`. Role changes are accepted only by the protected `PATCH /api/admin/users/:id/role` route and write `RoleChangeAuditLog` records. Training creation requires an authenticated coach. Passwords are hashed with bcrypt and sessions use an HTTP-only, same-site signed JWT cookie.

Every account has an immutable Prisma `User.id`. Friend requests, friendships, conversation participants, messages, training ownership, notifications, and audit records reference that ID, so changing a user's name, username, or email does not break existing relationships.