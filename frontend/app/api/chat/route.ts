import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { message } = await request.json();
  // Process the message and generate a response
  const response = 'Simulated response to: ' + message;
  return NextResponse.json({ response });
}