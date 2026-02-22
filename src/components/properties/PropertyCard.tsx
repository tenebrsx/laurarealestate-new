import Link from 'next/link';
import './PropertyCard.css';

interface PropertyProps {
    id: string;
    title: string;
    location: string;
    price: number;
    currency: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    imageUrl: string;
}

export default function PropertyCard({
    id,
    title,
    location,
    price,
    currency,
    bedrooms,
    bathrooms,
    area,
    imageUrl,
}: PropertyProps) {

    // Format price
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0,
    }).format(price);

    return (
        <Link href={`/properties/${id}`} className="property-card">
            <div className="property-image-container">
                {/* We use standard img for now to easily pull unsplash placeholders */}
                <img src={imageUrl} alt={title} className="property-image" loading="lazy" />
                <div className="property-overlay">
                    <span className="view-btn">View Details</span>
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
                    <div className="metric">
                        <span className="metric-value">{bedrooms}</span>
                        <span className="metric-label">Beds</span>
                    </div>
                    <div className="metric">
                        <span className="metric-value">{bathrooms}</span>
                        <span className="metric-label">Baths</span>
                    </div>
                    <div className="metric last-metric">
                        <span className="metric-value">{area}</span>
                        <span className="metric-label">m²</span>
                    </div>
                </div>

                <div className="property-footer">
                    <span className="property-price">{formattedPrice}</span>
                </div>
            </div>
        </Link>
    );
}
