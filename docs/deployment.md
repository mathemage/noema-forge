# Vercel deployment

## Production setup

1. [Import the GitHub repository into Vercel](https://vercel.com/docs/git). Keep the detected Next.js preset and default install and build settings.
2. Provision [Neon Postgres from the Vercel Marketplace](https://vercel.com/marketplace/neon) and connect it to the Production environment.
3. Configure the Production variables:

   ```text
   DATABASE_URL=<pooled PostgreSQL URL>
   DATABASE_URL_NON_POOLING=<direct PostgreSQL URL>
   NEXT_PUBLIC_APP_URL=https://your-production-domain
   NEXT_PUBLIC_APP_NAME=NoemaForge
   AUTH_SIGN_IN_MODE=journal
   ```

   Use the pooled URL for application traffic and the direct URL for migrations. If Neon exposes the direct connection as `DATABASE_URL_UNPOOLED`, copy that value into the app's `DATABASE_URL_NON_POOLING` variable.

4. Let Vercel deploy with its default `npm run build` command. Never add `db:migrate` or `db:push` to the Vercel Build Command.
5. Apply any pending checked-in migrations from a trusted workstation, outside the build. Run this step for every release that may contain a migration; Drizzle skips migrations it has already recorded:

   ```bash
   vercel link
   vercel env run -e production -- npm run db:migrate
   ```

   The first migration run expects a fresh Neon database. A database previously initialized with `db:push` has no Drizzle migration ledger and cannot be adopted automatically. Back it up and restore its data into a freshly migrated database, or have a PostgreSQL administrator review and baseline its migration history before using this command.

6. After a release that adds reflection columns, fill them in from the existing entry text. Run the plan against a Neon branch cloned from Production first and read the diff, then apply it to Production:

   ```bash
   vercel env run -e preview --git-branch <branch-name> -- npm run db:backfill-reflections > plan.ndjson
   # review plan.ndjson, then apply against Production
   vercel env run -e production -- npm run db:backfill-reflections -- --apply
   ```

   The script never writes `body`, `source`, or either timestamp, and re-running it after `--apply` reports every row as already stored.

7. Redeploy Production and verify health:

   ```bash
   vercel redeploy <current-production-url>
   vercel curl /api/health --deployment <new-production-url>
   ```

8. Smoke-test registration, sign-in, typed capture, voice capture, OCR, reflection, save, search, edit, and sign-out on the HTTPS production domain. Check Vercel function logs for database or authentication errors:

   ```bash
   vercel logs --environment production --level error --since 30m
   ```

`OLLAMA_BASE_URL` and `OLLAMA_MODEL` remain optional. The configured service must be reachable from Vercel; a localhost URL will not work. The `S3_*` variables are also optional because original capture files are not currently persisted. `AUTH_SECRET` and `AUTH_TRUST_HOST=true` are required only for `AUTH_SIGN_IN_MODE=authjs-credentials`.

## Preview verification

Give Preview deployments a non-production database or a Neon preview branch. Use a branch cloned after Production migrations, or run `vercel env run -e preview --git-branch <branch-name> -- npm run db:migrate` outside the build before testing a fresh Preview database. Test one Preview deployment through its generated hostname and confirm registration, journal actions, redirects, and the session remain on that hostname. `NEXT_PUBLIC_APP_URL` does not control POST redirect destinations.

## Rollback

For an application regression, [restore the previous production deployment](https://vercel.com/docs/deployments/rollback-production-deployment) and verify health and logs:

```bash
vercel rollback
vercel rollback status
```

A Vercel rollback changes the deployed application, not the Neon schema. Drizzle migrations in this repository are forward-only: recover an incompatible database change with a reviewed corrective migration or Neon point-in-time restore. Never edit an already-applied migration; rerunning `db:migrate` safely skips it. Promote a verified fixed deployment to resume normal production assignment after a rollback.
