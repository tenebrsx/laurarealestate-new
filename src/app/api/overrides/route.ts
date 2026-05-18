import { NextResponse } from 'next/server';
import { getOverridesStore, saveOverrideForProperty } from '@/services/overrides';

export const dynamic = 'force-dynamic'; // Prevent Next.js from caching the JSON reads

export async function GET() {
  const store = getOverridesStore();
  return NextResponse.json(store);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, override } = body;
    
    if (!id || !override) {
      return NextResponse.json({ error: 'Missing id or override payload' }, { status: 400 });
    }

    const success = saveOverrideForProperty(id, override);
    
    if (success) {
      return NextResponse.json({ success: true, message: 'Override applied successfully.' });
    } else {
      return NextResponse.json({ error: 'Failed to save override to disk' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in POST /api/overrides:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
