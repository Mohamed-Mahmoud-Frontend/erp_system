// Always isolated: no environment credentials or remote services are used.
await import('./verify-stock.mjs');
await import('./verify-orders.mjs');
await import('./verify-quotations.mjs');
