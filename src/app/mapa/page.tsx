import { getProperties, getPropertyById } from '@/services/easybroker';
import DynamicPropertiesMap from '@/components/map/DynamicPropertiesMap';
import { Metadata } from 'next';
import { Property } from '@/types/property';
import PropertiesFilterWrapper from '@/components/properties/PropertiesFilterWrapper';

export const metadata: Metadata = {
    title: 'Mapa de Propiedades | Laura Alba Bienes Raíces Exclusivos',
    description: 'Explora nuestras propiedades exclusivas en venta y alquiler a través de nuestro mapa interactivo de República Dominicana.',
};

interface MapBrowsePageProps {
    searchParams: Promise<{
        property_type?: string;
        location?: string;
        operation_type?: 'sale' | 'rental';
        min_price?: number;
        max_price?: number;
        currency?: string;
        bedrooms?: string;
        bathrooms?: string;
        min_area?: string;
        max_area?: string;
    }>;
}

export default async function MapBrowsePage({ searchParams }: MapBrowsePageProps) {
    const params = await searchParams;

    const filters: any = {};
    if (params.property_type) filters.property_type = params.property_type;
    if (params.location) filters.location = params.location;
    // Map view defaults to 'sale' if no operation_type is provided.
    filters.operation_type = params.operation_type || 'sale';
    if (params.min_price) filters.min_price = params.min_price;
    if (params.max_price) filters.max_price = params.max_price;
    if (params.currency) filters.currency = params.currency;
    if (params.bedrooms) filters.bedrooms = params.bedrooms;
    if (params.bathrooms) filters.bathrooms = params.bathrooms;
    if (params.min_area) filters.min_area = params.min_area;
    if (params.max_area) filters.max_area = params.max_area;

    // 1. Fetch a list of properties (list endpoint doesn't have coordinates)
    // We will loop to fetch up to 4 pages (200 properties max) to prevent serverless timeouts
    let allListProperties: Property[] = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
        // Fetch up to 50 items per page with filters
        const { properties, pagination } = await getProperties(50, currentPage, filters);
        allListProperties = [...allListProperties, ...properties];

        // Safety limit to 200 properties to prevent insane API spam/timeouts during SSR
        if (currentPage >= pagination.totalPages || currentPage >= 4) {
            hasMorePages = false;
        } else {
            currentPage++;
        }
    }

    // 2. Fetch full details for each property to get latitude & longitude
    // Next.js will cache these individual fetch calls automatically under the hood
    // Process in smaller batches using Promise.all to avoid rate-limiting spikes
    const chunkSize = 20;
    const detailedProperties: Property[] = [];

    for (let i = 0; i < allListProperties.length; i += chunkSize) {
        const chunk = allListProperties.slice(i, i + chunkSize);
        const resolvedChunk = await Promise.all(
            chunk.map(p => getPropertyById(p.id))
        );
        detailedProperties.push(...resolvedChunk);
    }

    // 3. Filter out any that failed to load or don't have coordinates
    const mappableProperties = detailedProperties.filter(
        (p): p is Property => p !== undefined && p.latitude !== undefined && p.longitude !== undefined
    );

    return (
        <main style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '100px', right: '20px', zIndex: 1000 }}>
                <PropertiesFilterWrapper />
            </div>
            <DynamicPropertiesMap properties={mappableProperties} />
        </main>
    );
}
