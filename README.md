# مميز | Momayaz ERP

digital product & software

نظام عربي لإدارة المصنع: العملاء والمبيعات والتحصيل، التصنيع والخامات، الموردون، الحضور والرواتب، وصلاحيات فريق العمل.

## Local development

Use Node.js 22. Copy `.env.example` to `.env.local`, provide your project settings, then:

```bash
npm ci
npm run dev
```

Development and production builds use Webpack explicitly. This avoids the recurring Turbopack PostCSS worker timeout on this Windows workspace; Tailwind and the application CSS remain enabled.

## Verification

```bash
npm run db:check
npm run verify:business
npm run verify:permissions
npm run build
npm run typecheck
npx eslint . --max-warnings=0
```

Business tests run against isolated PostgreSQL/PGlite fixtures. They do not verify live Supabase, Google Drive, or AI services.

## Release workflow

Use a feature branch and a focused Conventional Commit (`feat(sales): …`, `fix(payroll): …`, `chore(deploy): …`). Open a pull request to `main`. Quality checks run before production release. Configure hosting and repository secrets once using the [deployment guide](.deploy/README.md).

Production database migrations run separately from the application build. Previously applied migrations are immutable and are not replayed on ordinary commits. Never reset or reseed production during a release.

## Design and review

The interface supports Arabic RTL, desktop and mobile navigation, searchable sections, keyboard access, and page loading/error states. The [factory review PDF](deliverables/factory-review.pdf) helps collect feature requests from the factory team.

Operational evidence, private credentials and backup archives stay outside Git. See [backup and recovery](BACKUP_AND_RECOVERY.md) for the separate backup worker and its limitations.
