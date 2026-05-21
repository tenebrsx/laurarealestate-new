import { NextResponse } from 'next/server';
import { getOverridesStore, saveOverrideForProperty, deleteOverrideForProperty } from '@/services/overrides';
import { revalidateTag, revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic'; // Prevent Next.js from caching the JSON reads

export async function GET() {
  const store = await getOverridesStore();
  return NextResponse.json(store);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, override } = body;
    
    if (!id || !override) {
      return NextResponse.json({ error: 'Missing id or override payload' }, { status: 400 });
    }

    const success = await saveOverrideForProperty(id, override);
    
    if (success) {
      // Purge Next.js static cache for pages and data fetches dynamically
      try {
        (revalidateTag as any)('properties');
        (revalidateTag as any)(`property-${id}`);
        revalidatePath('/');
        revalidatePath('/properties');
        revalidatePath(`/properties/${id}`);
        revalidatePath('/mapa');
      } catch (cacheError) {
        console.error('Error during cache revalidation in POST:', cacheError);
      }

      return NextResponse.json({ success: true, message: 'Override applied successfully.' });
    } else {
      return NextResponse.json({ error: 'Failed to save override' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in POST /api/overrides:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing property id' }, { status: 400 });
    }

    const success = await deleteOverrideForProperty(id);
    
    if (success) {
      // Purge Next.js static cache for pages and data fetches dynamically
      try {
        (revalidateTag as any)('properties');
        (revalidateTag as any)(`property-${id}`);
        revalidatePath('/');
        revalidatePath('/properties');
        revalidatePath(`/properties/${id}`);
        revalidatePath('/mapa');
      } catch (cacheError) {
        console.error('Error during cache revalidation in DELETE:', cacheError);
      }

      return NextResponse.json({ success: true, message: 'Override reverted successfully.' });
    } else {
      return NextResponse.json({ error: 'Failed to delete override' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in DELETE /api/overrides:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
