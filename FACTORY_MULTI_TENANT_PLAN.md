# Factory subscriptions and account isolation

The current database is a single-factory installation. Business tables have nullable `factory_id`, while `user_access` has no factory assignment. Existing RLS policies grant an authenticated user with a module permission access to that module across the database. Creating another factory now would expose its business data to existing accounts.

## Migration to review before provisioning factories

1. Audit existing non-null `factory_id` values and all parent/child links. Export and verify a backup. Map legacy rows and accounts to one primary factory without changing financial values.
2. Add `factories` and a required `user_access.factory_id`. Establish a separate platform-owner identity for creating factories; a factory admin must only manage users in that factory.
3. Backfill and require `factory_id` on every business table, including delivery notes and recipe materials. Add composite foreign keys so a row cannot reference a customer, worker, supplier, material, order, or invoice from another factory.
4. Replace global read/write policies with restrictive factory checks. Audit `SECURITY DEFINER` functions, views, public quotation tokens, and anonymous quotation creation. Scope invoice numbering and external Google Drive synchronization per factory.
5. Add factory creation, activation, name, address, phone, tax details, and validated logo upload. Create the first factory admin during provisioning, with rollback if auth or database creation fails. Render branding from the current factory.
6. Test two factories with separate admins and employees. Verify that SELECT, INSERT, UPDATE, DELETE, RPCs, PDF views, exports, and shared quotation links never expose or link the other factory's data. Verify a legacy invoice and payroll history remain unchanged.

A broad migration covering these steps was rejected by automatic approval review because it would alter permissions, foreign keys, and invoice numbering across nearly every business table in one deployment. This document is the reviewable scope for a staged implementation. No second factory should be provisioned before the isolation tests pass.