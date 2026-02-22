import PropertyCard from '@/components/properties/PropertyCard';
import { getProperties } from '@/services/easybroker';
import { Property } from '@/types/property';
import './properties.css';

export default async function PropertiesPage() {
    const properties = await getProperties(12); // Fetch up to 12 properties

    return (
        <div className="properties-page">
            <div className="properties-header">
                <div className="container">
                    <span className="page-subtitle">[ EXCLUSIVE LISTINGS ]</span>
                    <h1 className="page-title">Curated Spaces</h1>
                    <p className="page-description">
                        Discover our collection of premium properties tailored to elevate your lifestyle.
                    </p>
                </div>
            </div>

            <div className="container">
                <div className="properties-grid animate-fade-in">
                    {properties.map((property: Property) => (
                        <PropertyCard key={property.id} {...property} />
                    ))}
                </div>
            </div>
        </div>
    );
}
