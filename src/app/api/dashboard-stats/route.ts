import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils/auth';
import { API_ENDPOINTS } from '@/lib/utils/constants';
import type { GetDashboardStatsResponse, DashboardStats } from '@/types/dashboard';

// GET /api/dashboard-stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('company_id') || session.user.company?.company_id;

    // Construct API URL, include company_id when available
    const base = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.DASHBOARD_STATS}`;
    const apiUrl = companyId ? `${base}?company_id=${companyId}` : base;

    console.log('=== DASHBOARD STATS API REQUEST ===');
    console.log('API URL:', apiUrl);
    console.log('Company ID:', companyId ?? 'N/A');
    console.log('Token:', session.user.token ? 'Present' : 'Missing');
    console.log('===================================');

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('=== DASHBOARD STATS API ERROR ===');
      console.error('Status:', response.status);
      console.error('Error:', errorText);
      console.error('=================================');
      return NextResponse.json(
        { success: false, error: 'Failed to fetch dashboard stats' },
        { status: response.status },
      );
    }

    const raw = await response.json();

    console.log('=== DASHBOARD STATS API RESPONSE ===');
    console.log('Response:', JSON.stringify(raw, null, 2));
    console.log('====================================');

    // Wrap to standard format when upstream doesn't include success
    const data: GetDashboardStatsResponse = (raw && raw.vehicles && raw.crew)
      ? { success: true, data: raw as DashboardStats }
      : raw;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}