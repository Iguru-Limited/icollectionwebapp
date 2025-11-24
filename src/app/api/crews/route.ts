import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils/auth';
import { API_ENDPOINTS } from '@/lib/utils/constants';
import type { GetCrewsResponse, UpdateCrewRequest, UpdateCrewResponse, EditCrewPayload, EditCrewResponse } from '@/types/crew';

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

// PUT /api/crews
// Body: { crew_id, name, crew_role_id, phone, badge_number }
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body: UpdateCrewRequest = await request.json();

    // Validate required fields
    if (!body.crew_id || !body.name || !body.crew_role_id || !body.phone || !body.badge_number) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const apiUrl = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.UPDATE_CREW}`;

    console.log('=== CREW UPDATE API REQUEST ===');
    console.log('API URL:', apiUrl);
    console.log('Payload:', JSON.stringify(body, null, 2));
    console.log('===============================');

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('=== CREW UPDATE API ERROR ===');
      console.error('Status:', response.status);
      console.error('Error:', errorText);
      console.error('=============================');
      return NextResponse.json(
        { success: false, error: 'Failed to update crew' },
        { status: response.status },
      );
    }

    const data: UpdateCrewResponse = await response.json();

    console.log('=== CREW UPDATE API RESPONSE ===');
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('================================');

    return NextResponse.json(data);
  } catch (error) {
    console.error('Crew update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}

// PATCH /api/crews
// Body: { crew_id, <changed fields only> }
// Proxies to UPDATE_CREW endpoint but sends only provided fields.
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body: EditCrewPayload = await request.json();

    if (!body.crew_id) {
      return NextResponse.json(
        { success: false, error: 'crew_id is required' },
        { status: 400 },
      );
    }

    // Build minimal payload (remote may still expect numeric ids for some fields)
    const payload: Record<string, unknown> = { crew_id: Number(body.crew_id) };
    const mutableKeys: (keyof EditCrewPayload)[] = [
      'name','phone','badge_number','crew_role_id','role_name','badge_expiry','email','employee_no','id_number','active','photo'
    ];
    mutableKeys.forEach((k) => {
      if (body[k] !== undefined && body[k] !== null && body[k] !== '') {
        // Convert crew_role_id to number if present
        if (k === 'crew_role_id') {
          payload[k] = Number(body[k]);
        } else {
          payload[k] = body[k];
        }
      }
    });

    const apiUrl = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.UPDATE_CREW}`;

    console.log('=== CREW PARTIAL UPDATE API REQUEST ===');
    console.log('API URL:', apiUrl);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('=======================================');

    const response = await fetch(apiUrl, {
      method: 'PUT', // Remote endpoint expects PUT; using PUT while we expose PATCH semantics
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('=== CREW PARTIAL UPDATE API ERROR ===');
      console.error('Status:', response.status);
      console.error('Error:', errorText);
      console.error('====================================');
      return NextResponse.json(
        { success: false, error: 'Failed to edit crew' },
        { status: response.status },
      );
    }

    const data: EditCrewResponse = await response.json();

    console.log('=== CREW PARTIAL UPDATE API RESPONSE ===');
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('========================================');

    return NextResponse.json(data);
  } catch (error) {
    console.error('Crew partial update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}
