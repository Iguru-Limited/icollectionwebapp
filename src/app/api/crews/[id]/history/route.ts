import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils/auth';
import { API_ENDPOINTS } from '@/lib/utils/constants';
import type { GetCrewHistoryResponse, CrewAssignmentHistoryEntry } from '@/types/crew';

// GET /api/crews/[id]/history
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const apiUrl = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.CREW_HISTORY}?crew_id=${encodeURIComponent(id)}`;

    console.log('=== CREW HISTORY API REQUEST ===');
    console.log('API URL:', apiUrl);
    console.log('Crew ID:', id);
    console.log('================================');

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('=== CREW HISTORY API ERROR ===');
      console.error('Status:', response.status);
      console.error('Error:', errorText);
      console.error('================================');
      return NextResponse.json(
        { success: false, error: 'Failed to fetch crew history' },
        { status: response.status },
      );
    }

    const raw = await response.json();
    // Wrap arrays into standard response shape
    const data: GetCrewHistoryResponse = Array.isArray(raw)
      ? { success: true, data: raw as CrewAssignmentHistoryEntry[] }
      : raw;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Crew history error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
