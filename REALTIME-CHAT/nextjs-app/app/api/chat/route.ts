import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.json({ message: 'Chat handled client-side. Use the UI to interact!' });
}