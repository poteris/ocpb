import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { message } = await request.json();

  // Here you would typically process the message and generate a response
  // For this example, we'll just echo the message with a prefix
  const botResponse = `Thanks for your message: "${message}". As a union rep training bot, I'm here to help. What specific aspect of ${message} would you like to know more about?`;

  return NextResponse.json({ response: botResponse });
}
