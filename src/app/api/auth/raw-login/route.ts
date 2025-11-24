import { NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/lib/utils/constants';
import type { AuthResponse } from '@/types/auth/userauthentication';

// Server-side proxy for external login to avoid browser CORS.
// Accepts { username, password } and calls external API with pass_phrase.
// Returns full external payload but NEVER stores anything in session directly.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body || {};

    if (!username || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const payload = { username, pass_phrase: password };
    const apiUrl = `${API_ENDPOINTS.BASE_URL}/api/auth/login.php`;

    const externalResp = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await externalResp.text();

    if (!externalResp.ok) {
      return NextResponse.json({ error: 'Invalid credentials', raw: text }, { status: externalResp.status });
    }

    // Try parse JSON with explicit typing
    let data: AuthResponse & { company_template?: unknown };
    try {
      data = JSON.parse(text) as AuthResponse & { company_template?: unknown };
    } catch {
      return NextResponse.json({ error: 'Upstream parse error', raw: text }, { status: 502 });
    }

    // Split company_template out so client can decide what to do
    const { company_template, ...rest } = data;

    return NextResponse.json({ auth: rest, company_template });
  } catch (e) {
    console.error('raw-login route error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
