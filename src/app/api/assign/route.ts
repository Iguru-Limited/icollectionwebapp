import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils/auth';
import { API_ENDPOINTS } from '@/lib/utils/constants';
import type { AssignVehiclePayload, AssignVehicleResponse } from '@/types/crew';

function isValidPayload(payload: unknown): payload is AssignVehiclePayload {
  if (!payload || typeof payload !== 'object') return false;
  const obj = payload as Record<string, unknown>;
  if (typeof obj.vehicle_id !== 'number') return false;
  const cid = obj.crew_id as unknown;
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

    // Handle 409 conflict or any response with pending_assignment_ids
    if (upstream.status === 409 || (data.pending_assignment_ids && data.pending_assignment_ids.length > 0)) {
      return NextResponse.json<AssignVehicleResponse>(data, { status: 200 });
    }

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
