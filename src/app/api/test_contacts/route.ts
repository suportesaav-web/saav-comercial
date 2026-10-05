import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.PLOOMES_API_KEY;
  const res = await fetch(`https://api2.ploomes.com/Contacts?$top=1`, {
    headers: { 'User-Key': apiKey || '', 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  return NextResponse.json(data);
}
