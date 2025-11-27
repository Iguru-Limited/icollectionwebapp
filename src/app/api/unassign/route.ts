import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils/auth';
import { API_ENDPOINTS } from '@/lib/utils/constants';

interface UnassignPayload {
  crew_id: number;
  vehicle_id: null;
}

function isValidPayload(payload: unknown): payload is UnassignPayload {
  if (!payload || typeof payload !== 'object') return false;
  const obj = payload as Record<string, unknown>;
  return typeof obj.crew_id === 'number' && obj.vehicle_id === null;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!isValidPayload(body)) {
      return NextResponse.json({ error: 'Invalid payload. Expect { crew_id: number, vehicle_id: null }' }, { status: 400 });
    }

    const apiUrl = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.ASSIGN_VEHICLE}`;
    const upstream = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.user.token}`,
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    const data = (() => {
      try { return JSON.parse(text); } catch { return { message: text }; }
    })();

    if (!upstream.ok) {
      return NextResponse.json({ error: data.message || 'Unassignment failed' }, { status: upstream.status });
    }

    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
