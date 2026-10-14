# ADR 002 — Host on Railway

- Status: accepted
- Date: 2026-10-12
- Supersedes: the hosting, database and storage parts of ADR 001

## Context

ADR 001 split infrastructure across three vendors: Render (web + cron),
Neon (Postgres) and Cloudflare R2 (audio). For one founder and ~50 test
users, three dashboards, three bills and three sets of credentials cost more
attention than they save money. Nothing has been deployed yet, so switching
now is free.

## Decision

Put everything in one Railway project in Singapore
(`asia-southeast1-eqsg3a`), described in `.railway/railway.ts`:

- **web**: `apps/web/Dockerfile`, health check `/api/health`.
- **nightly**: `apps/worker/Dockerfile` as a Railway cron service
  (`0 18 * * *` = 03:00 KST). The container runs and exits, so we pay only
  while it runs.
- **postgres**: Railway Postgres, reached over the private network.
- **audio**: Railway Bucket (S3-compatible, free egress) for TTS audio.

Config uses Railway Infrastructure as Code (`.railway/railway.ts`, the
`railway` dev dependency), not `railway.json`: Config as Code is deprecated
and stops being read on 2026-12-01.

Start on the Hobby plan ($5/month, includes $5 of usage).

## Consequences

- One provider, one bill, one place for secrets. Estimated group-test infra
  cost drops from ~$8–15 to ~$6–12 a month.
- Postgres is a Railway service with a volume, not a serverless database.
  It does not scale to zero, and backups are our setting to turn on:
  enable point-in-time recovery (about 4 weeks of history, stored in a
  bucket) and daily volume backups before the first learner signs up, and
  run one restore drill.
- Billing is by usage with no fixed ceiling. Set a usage limit in the
  Railway workspace.
- No per-PR database branches like Neon's. Use Railway PR environments if
  we need them.
- Docker images still keep us portable to Fly.io / AWS / GCP; the database
  moves with `pg_dump`.
