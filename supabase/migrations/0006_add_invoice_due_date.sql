-- Migration: 0006_add_invoice_due_date.sql
-- Adds a due_date column to invoices for tracking overdue payments

alter table invoices add column due_date date;

comment on column invoices.due_date is 'Date by which the invoice should be paid (calculated as created_at + credit_days)';
