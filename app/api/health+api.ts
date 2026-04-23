export async function GET(request: Request) {
  console.log('=== Health Check Endpoint Hit ===');
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  
  return Response.json({ 
    status: 'ok', 
    message: 'API is running',
    timestamp: new Date().toISOString(),
    url: request.url
  });
}
