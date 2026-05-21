import { NextResponse } from 'next/server';
import { getPropertyById } from '@/services/easybroker';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const property = await getPropertyById(id);
        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }
        return NextResponse.json({
            images: property.images || []
        });
    } catch (error) {
        console.error(`Error in GET /api/properties/${(await params).id}:`, error);
        return NextResponse.json({ error: 'Failed to fetch property details' }, { status: 500 });
    }
}
