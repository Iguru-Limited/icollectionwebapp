import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils/auth';
import { API_ENDPOINTS } from '@/lib/utils/constants';
import type { GetVehiclesResponse } from '@/types/vehicle';

// GET /api/vehicles?company_id=9
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('company_id') || session.user.company?.company_id;
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID is required' },
        { status: 400 },
      );
    }

    const apiUrl = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.LIST_VEHICLES}?company_id=${companyId}`;
    const upstream = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.user.token}`,
      },
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return NextResponse.json(
        { success: false, error: text || 'Failed to fetch vehicles' },
        { status: upstream.status },
      );
    }

    const raw = await upstream.json();
    const responseData: GetVehiclesResponse = Array.isArray(raw)
      ? { success: true, data: raw }
      : raw;

    return NextResponse.json(responseData);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ success: false, error: 'Method Not Allowed' }, { status: 405 });
}