import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils/auth';
import { API_ENDPOINTS } from '@/lib/utils/constants';
import type { GetCollectionSchemaRequest, GetCollectionSchemaResponse } from '@/types/collection-schema';

export const dynamic = 'force-dynamic';

// GET /api/collection-schema?company_id=X
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get company_id from session only
    const companyId = session.user.company?.company_id;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID not found in session' },
        { status: 400 },
      );
    }

    // Prepare payload for external API
    const payload: GetCollectionSchemaRequest = {
      route: 'get_collection_form_schema',
      company_id: Number(companyId),
    };

    const apiUrl = API_ENDPOINTS.URL_1;

    console.log('=== COLLECTION SCHEMA API REQUEST ===');
    console.log('API URL:', apiUrl);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('======================================');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('=== COLLECTION SCHEMA API ERROR ===');
      console.error('Status:', response.status);
      console.error('Error:', errorText);
      console.error('====================================');
      return NextResponse.json(
        { success: false, error: 'Failed to fetch collection schema' },
        { status: response.status },
      );
    }

    const data: GetCollectionSchemaResponse = await response.json();

    console.log('=== COLLECTION SCHEMA API RESPONSE ===');
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('=======================================');

    return NextResponse.json(data);
  } catch (error) {
    console.error('Collection schema error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}
