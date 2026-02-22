import PropertyCard from '@/components/properties/PropertyCard';
import { getProperties } from '@/services/easybroker';
import { Property } from '@/types/property';
import './properties.css';

export default async function PropertiesPage() {
    const properties = await getProperties(12); // Fetch up to 12 properties

    return (
        <div className="properties-page">
            <div className="container" style={{ paddingTop: 'var(--space-2xl)' }}>
                <div className="properties-grid animate-fade-in">
                    {properties.map((property: Property) => (
                        <PropertyCard key={property.id} {...property} />
                    ))}
                </div>
            </div>
        </div>
    );
}
