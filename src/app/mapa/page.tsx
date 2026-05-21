import { getPropertyById, getAllProperties } from '@/services/easybroker';
import DynamicPropertiesMap from '@/components/map/DynamicPropertiesMap';
import { Metadata } from 'next';
import { Property } from '@/types/property';

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

    const filters: Record<string, string | number> = {};
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

    // 1. Fetch the consolidated catalog (downloads all pages in a single parallel pass)
    let allListProperties = await getAllProperties();

    // 2. Apply filters in a single clean pass matching getProperties logic
    if (filters.operation_type) {
        allListProperties = allListProperties.filter(
            (p: Property) => p.operationType === filters.operation_type
        );
    }
    if (filters.property_type) {
        const pType = String(filters.property_type).toLowerCase();
        allListProperties = allListProperties.filter(
            (p: Property) => p.propertyType?.toLowerCase() === pType
        );
    }
    if (filters.location) {
        const locQuery = String(filters.location).toLowerCase().trim();
        allListProperties = allListProperties.filter(
            (p: Property) => p.location?.toLowerCase().includes(locQuery)
        );
    }
    if (filters.min_price) {
        allListProperties = allListProperties.filter(
            (p: Property) => p.price >= Number(filters.min_price)
        );
    }
    if (filters.max_price) {
        allListProperties = allListProperties.filter(
            (p: Property) => p.price <= Number(filters.max_price)
        );
    }
    if (filters.bedrooms) {
        allListProperties = allListProperties.filter(
            (p: Property) => p.bedrooms >= parseInt(String(filters.bedrooms))
        );
    }
    if (filters.bathrooms) {
        allListProperties = allListProperties.filter(
            (p: Property) => p.bathrooms >= parseFloat(String(filters.bathrooms))
        );
    }
    if (filters.min_area) {
        allListProperties = allListProperties.filter(
            (p: Property) => p.area >= Number(filters.min_area)
        );
    }
    if (filters.max_area) {
        allListProperties = allListProperties.filter(
            (p: Property) => p.area <= Number(filters.max_area)
        );
    }

    // Safety limit to 150 properties to prevent insane API spam/timeouts during SSR
    allListProperties = allListProperties.slice(0, 150);

    // 2. Fetch full details for each property to get latitude & longitude
    // Next.js will cache these individual fetch calls automatically under the hood
    // Process in smaller batches using Promise.all to avoid rate-limiting spikes
    const chunkSize = 20;
    const detailedProperties: (Property | null)[] = [];

    for (let i = 0; i < allListProperties.length; i += chunkSize) {
        const chunk = allListProperties.slice(i, i + chunkSize);
        const resolvedChunk = await Promise.all(
            chunk.map(p => getPropertyById(p.id))
        );
        detailedProperties.push(...resolvedChunk);
    }

    // 3. Filter out any that failed to load or don't have coordinates
    const mappableProperties = detailedProperties.filter(
        (p): p is Property => p !== null && p !== undefined && p.latitude !== undefined && p.longitude !== undefined
    );

    return (
        <main>
            <DynamicPropertiesMap properties={mappableProperties} />
        </main>
    );
}
