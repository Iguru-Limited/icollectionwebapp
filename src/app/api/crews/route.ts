import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils/auth';
import { API_ENDPOINTS } from '@/lib/utils/constants';
import type { GetCrewsResponse } from '@/types/crew';

// GET /api/crews
// Query: ?company_id=9
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get company_id from query params or session
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('company_id') || session.user.company?.company_id;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID is required' },
        { status: 400 },
      );
    }

    // Construct API URL with company_id as query parameter
    const apiUrl = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.LIST_CREW}?company_id=${companyId}`;

    console.log('=== CREW LIST API REQUEST ===');
    console.log('API URL:', apiUrl);
    console.log('Company ID:', companyId);
    console.log('Token:', session.user.token ? 'Present' : 'Missing');
    console.log('=============================');

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('=== CREW LIST API ERROR ===');
      console.error('Status:', response.status);
      console.error('Error:', errorText);
      console.error('===========================');
      return NextResponse.json(
        { success: false, error: 'Failed to fetch crew list' },
        { status: response.status },
      );
    }

    const data = await response.json();

    console.log('=== CREW LIST API RESPONSE ===');
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('==============================');

    // Wrap in standard response format if API returns array directly
    const responseData: GetCrewsResponse = Array.isArray(data)
      ? { success: true, data }
      : data;

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Crew list error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}
