import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils/auth';
import { API_ENDPOINTS } from '@/lib/utils/constants';
import type { GetCrewRolesResponse } from '@/types/crew';

// GET /api/crew-roles
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const apiUrl = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.LIST_CREW_ROLE}`;

    console.log('=== CREW ROLES API REQUEST ===');
    console.log('API URL:', apiUrl);
    console.log('Token:', session.user.token ? 'Present' : 'Missing');
    console.log('==============================');

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('=== CREW ROLES API ERROR ===');
      console.error('Status:', response.status);
      console.error('Error:', errorText);
      console.error('============================');
      return NextResponse.json(
        { success: false, error: 'Failed to fetch crew roles' },
        { status: response.status },
      );
    }

    const data = await response.json();

    console.log('=== CREW ROLES API RESPONSE ===');
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('===============================');

    // Wrap in standard response format if API returns array directly
    const responseData: GetCrewRolesResponse = Array.isArray(data)
      ? { success: true, data }
      : data;

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Crew roles error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}
