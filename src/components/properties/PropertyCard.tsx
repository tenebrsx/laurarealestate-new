import Link from 'next/link';
import './PropertyCard.css';

interface PropertyProps {
    id: string;
    title: string;
    location: string;
    price: number;
    currency: string;
    formattedPrice?: string;
    priceUnit?: string;
    operationType: 'sale' | 'rental';
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    parking?: number;
    area: number;
    imageUrl: string;
}

export default function PropertyCard({
    id,
    title,
    location,
    price,
    currency,
    formattedPrice,
    priceUnit,
    operationType,
    propertyType,
    bedrooms,
    bathrooms,
    parking,
    area,
    imageUrl,
}: PropertyProps) {

    const isTerreno = propertyType?.toLowerCase().includes('terreno') || propertyType?.toLowerCase().includes('solar');

    // Format price - ensure Currency is visible and /m2 if applicable
    const basePriceStr = formattedPrice || new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0,
    }).format(price);

    const currencySuffix = (formattedPrice && formattedPrice.includes(currency)) ? '' : ` ${currency}`;
    const mt2Suffix = priceUnit && priceUnit.includes('meter') ? ' /m²' : '';
    const rentalSuffix = operationType === 'rental' && !mt2Suffix ? '/mes' : '';

    const finalPriceDisplay = `${basePriceStr}${currencySuffix}${mt2Suffix}${rentalSuffix}`;

    return (
        <Link href={`/properties/${id}`} className="property-card">
            <div className="property-image-container">
                {/* We use standard img for now to easily pull unsplash placeholders */}
                <img src={imageUrl} alt={title} className="property-image" loading="lazy" />
                <div className="property-overlay">
                    <span className="view-btn">Ver Detalles</span>
                </div>
            </div>

            <div className="property-details">
                <div className="property-header">
                    <h3 className="property-title">{title}</h3>
                    <p className="property-location">
                        <span className="icon-marker"></span>
                        {location}
                    </p>
                </div>

                <div className="property-metrics">
                    {!isTerreno && (
                        <>
                            <div className="metric">
                                <span className="metric-value">{bedrooms}</span>
                                <span className="metric-label">Hab</span>
                            </div>
                            <div className="metric">
                                <span className="metric-value">{bathrooms}</span>
                                <span className="metric-label">Baños</span>
                            </div>
                            {parking !== undefined && parking > 0 && (
                                <div className="metric">
                                    <span className="metric-value">{parking}</span>
                                    <span className="metric-label">Parqueos</span>
                                </div>
                            )}
                        </>
                    )}
                    <div className="metric last-metric">
                        <span className="metric-value">{area}</span>
                        <span className="metric-label">m²</span>
                    </div>
                </div>

                <div className="property-footer">
                    <span className="property-price">
                        {finalPriceDisplay}
                    </span>
                </div>
            </div>
        </Link>
    );
}
