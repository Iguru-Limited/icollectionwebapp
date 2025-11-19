import { NextResponse } from 'next/server';
import { crewsStore, Crew } from '@/app/api/crews/_data/store';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const crew = crewsStore.find((c: Crew) => c.id === id);
  if (!crew) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ data: crew });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const crew = crewsStore.find((c: Crew) => c.id === id);
  if (!crew) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  try {
    const body = await request.json();
    crew.name = body.name ?? crew.name;
    crew.role = body.role ?? crew.role;
    crew.phone = body.phone ?? crew.phone;
    crew.employeeNo = body.employeeNo ?? crew.employeeNo;
    crew.badgeNo = body.badgeNo ?? crew.badgeNo;
    crew.badgeExpiry = body.badgeExpiry ?? crew.badgeExpiry;
    crew.avatarUrl = body.avatarUrl ?? crew.avatarUrl;
    return NextResponse.json({ data: crew });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const index = crewsStore.findIndex((c: Crew) => c.id === id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const removed = crewsStore.splice(index, 1)[0];
  return NextResponse.json({ data: removed });
}
