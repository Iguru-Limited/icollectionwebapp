import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils/auth';
import { API_ENDPOINTS } from '@/lib/utils/constants';
import type { AssignVehiclePayload, AssignVehicleResponse } from '@/types/crew';

function isValidPayload(payload: any): payload is AssignVehiclePayload {
  if (!payload || typeof payload !== 'object') return false;
  if (typeof payload.vehicle_id !== 'number') return false;
  const cid = payload.crew_id;
  if (typeof cid === 'number') return Number.isFinite(cid);
  if (Array.isArray(cid)) return cid.every((n) => typeof n === 'number' && Number.isFinite(n));
  return false;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!isValidPayload(body)) {
      return NextResponse.json({ error: 'Invalid payload. Expect { vehicle_id: number, crew_id: number | number[] }' }, { status: 400 });
    }

    const apiUrl = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ASSIGN_VEHICLE}`;
    const upstream = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.user.token}`,
      },
      body: JSON.stringify(body satisfies AssignVehiclePayload),
    });

    const text = await upstream.text();
    const data = (() => {
      try { return JSON.parse(text) as AssignVehicleResponse; } catch { return { message: text } as AssignVehicleResponse; }
    })();

    if (!upstream.ok) {
      return NextResponse.json({ error: data.message || 'Assignment failed' }, { status: upstream.status });
    }

    return NextResponse.json<AssignVehicleResponse>(data, { status: upstream.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
