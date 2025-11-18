import { NextResponse } from 'next/server';

interface Assignment { id: string; crewId: string; vehicleId: string }
const assignments: Assignment[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.crewId || !body.vehicleId) {
      return NextResponse.json({ error: 'Missing crewId or vehicleId' }, { status: 400 });
    }
    const newAssign: Assignment = { id: String(Date.now()), crewId: body.crewId, vehicleId: body.vehicleId };
    assignments.push(newAssign);
    return NextResponse.json({ data: newAssign }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ data: assignments });
}
