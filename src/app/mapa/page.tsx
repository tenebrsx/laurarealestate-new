import { getProperties, getPropertyById } from '@/services/easybroker';
import DynamicPropertiesMap from '@/components/map/DynamicPropertiesMap';
import { Metadata } from 'next';
import { Property } from '@/types/property';

export const metadata: Metadata = {
    title: 'Mapa de Propiedades | Laura Alba Bienes Raíces Exclusivos',
    description: 'Explora nuestras propiedades exclusivas en venta y alquiler a través de nuestro mapa interactivo de República Dominicana.',
};

export default async function MapBrowsePage() {
    // 1. Fetch a list of properties (list endpoint doesn't have coordinates)
    // We will loop to fetch up to 4 pages (200 properties max) to prevent serverless timeouts
    let allListProperties: Property[] = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
        // Fetch up to 50 sales per page
        const { properties, pagination } = await getProperties(50, currentPage, { operation_type: 'sale' });
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
        <main>
            <DynamicPropertiesMap properties={mappableProperties} />
        </main>
    );
}
