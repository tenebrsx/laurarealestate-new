import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
    return handleRevalidation(request);
}

export async function POST(request: NextRequest) {
    return handleRevalidation(request);
}

async function handleRevalidation(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    const expectedSecret = process.env.EASYBROKER_WEBHOOK_SECRET || 'xnv5jq5sv9dnkjtli9s3pepbe5lzqp_secret';

    if (!secret || secret !== expectedSecret) {
        return NextResponse.json(
            { error: 'Unauthorized: Invalid or missing secret token' },
            { status: 401 }
        );
    }

    try {
        // Trigger Next.js App Router on-demand cache revalidation
        revalidateTag('properties', 'max');

        return NextResponse.json({
            revalidated: true,
            tag: 'properties',
            message: 'Cache purged successfully. The next visit will retrieve fresh data from EasyBroker.',
            timestamp: Date.now()
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error revalidating EasyBroker cache:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message },
            { status: 500 }
        );
    }
}
