export async function GET() {
  console.log('Test API endpoint hit');
  return Response.json({ message: 'Test API works!' });
}

export async function POST(request: Request) {
  console.log('Test API POST endpoint hit');
  const body = await request.json();
  return Response.json({ message: 'Test API POST works!', received: body });
}
