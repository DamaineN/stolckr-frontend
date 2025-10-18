export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Stolckr API',
    version: '2.0.0'
  });
}