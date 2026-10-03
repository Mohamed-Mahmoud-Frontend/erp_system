# Supabase keepalive

The workflow makes a read-only PostgREST database request daily at 06:23 UTC.
It also supports **Actions → Supabase keepalive → Run workflow**.

In repository **Settings → Secrets and variables → Actions**, create:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Copy their values from your local `.env.local`. Do not use the service-role
key or an administrator password. Anonymous requests remain subject to RLS;
an empty successful response still confirms that the database was queried.

Run the workflow manually after configuring secrets and check that it succeeds.
The workflow must be on the default branch for scheduled runs.

This reduces inactivity but does not guarantee that a Free project will never
pause. A paused project must first be restored through Supabase Dashboard.
Supabase policy: https://supabase.com/docs/guides/platform/free-project-pausing

GitHub disables scheduled workflows in public repositories after 60 days of
repository inactivity. Check Actions periodically and re-enable if necessary.
https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows
