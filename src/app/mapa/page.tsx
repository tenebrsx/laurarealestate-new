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
    const { properties: listProperties } = await getProperties(30, 1);

    // 2. Fetch full details for each property to get latitude & longitude
    // Next.js will cache these individual fetch calls
    const detailedProperties = await Promise.all(
        listProperties.map((p: Property) => getPropertyById(p.id))
    );

    // 3. Filter out any that failed to load or don't have coordinates
    const mappableProperties = detailedProperties.filter(
        (p: Property) => p !== undefined && p.latitude !== undefined && p.longitude !== undefined
    );

    return (
        <main>
            <DynamicPropertiesMap properties={mappableProperties} />
        </main>
    );
}
