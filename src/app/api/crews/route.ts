import { NextResponse } from 'next/server';
import { crewsStore, Crew } from '@/app/api/crews/_data/store';

export async function GET() {
  return NextResponse.json({ data: crewsStore });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.role) {
      return NextResponse.json({ error: 'Missing name or role' }, { status: 400 });
    }
    const newCrew: Crew = {
      id: String(Date.now()),
      name: body.name,
      role: body.role,
      phone: body.phone,
      employeeNo: body.employeeNo,
      badgeNo: body.badgeNo,
      badgeExpiry: body.badgeExpiry,
      avatarUrl: body.avatarUrl,
    };
    crewsStore.push(newCrew);
    return NextResponse.json({ data: newCrew }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
