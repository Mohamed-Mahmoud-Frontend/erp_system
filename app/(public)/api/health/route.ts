export const dynamic = 'force-dynamic';
// Liveness only: no database calls, credentials, or customer data.
export function GET() {
  return Response.json({status: 'ok', service: 'momayaz'}, {
    headers: {'Cache-Control': 'no-store'},
  });
}
