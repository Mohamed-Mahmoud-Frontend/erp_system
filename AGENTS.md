<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Completion checks

Before reporting work complete, run `npm run build`, `tsc --noEmit`, and
`eslint . --max-warnings=0`. All must pass. Fix build causes (including asset
loading) rather than substituting a typecheck for a successful build.
Report external-service tests that failed or were explicitly deferred separately;
mocked responses do not prove that a live integration works.
