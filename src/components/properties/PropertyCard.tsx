'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, BedDouble, Bath, Car, Maximize2, Heart, ChevronRight } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { formatCurrency } from '@/utils/format';
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
    operationTypes?: string[];
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    parking?: number;
    area: number;
    imageUrl: string;
    images?: string[];
}

export default function PropertyCard({
    id,
    title,
    location,
    price,
    currency,
    priceUnit,
    operationType,
    operationTypes,
    propertyType,
    bedrooms,
    bathrooms,
    parking,
    area,
    imageUrl,
}: PropertyProps) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const active = isFavorite(id);

    const isResidential = ['apartamento', 'casa', 'penthouse', 'villa', 'condominio', 'apartment', 'house'].some(
        type => propertyType?.toLowerCase().includes(type)
    );
    const isTerreno = ['terreno', 'solar', 'land'].some(
        type => propertyType?.toLowerCase().includes(type)
    );
    const isRental = operationType === 'rental';

    let primaryPriceDisplay = '';
    let secondaryPriceDisplay = '';

    // Standard currency formatter
    const formatValue = (val: number) => {
        return formatCurrency(val, currency);
    };

    if (isResidential) {
        if (priceUnit && priceUnit.toLowerCase().includes('meter')) {
            // Price is per m2, calculate total price
            const calculatedTotal = price * (area || 1);
            primaryPriceDisplay = formatValue(calculatedTotal) + (isRental ? ' / mes' : '');
            secondaryPriceDisplay = `${formatValue(price)} / m²`;
        } else {
            // Price is already total
            primaryPriceDisplay = formatValue(price) + (isRental ? ' / mes' : '');
        }
    } else if (isTerreno) {
        if (priceUnit && priceUnit.toLowerCase().includes('meter')) {
            // Maintain price per m2, show total as secondary
            primaryPriceDisplay = `${formatValue(price)} / m²`;
            if (area > 0) {
                secondaryPriceDisplay = `${formatValue(price * area)} total`;
            }
        } else {
            // Price is total, show per m2 as secondary
            primaryPriceDisplay = formatValue(price);
            if (area > 0) {
                secondaryPriceDisplay = `${formatValue(price / area)} / m²`;
            }
        }
    } else {
        // Commercial or other listings
        primaryPriceDisplay = formatValue(price) + (isRental ? ' / mes' : '');
    }

    // Clean titles from user-generated noise like !, *, extra spaces
    const cleanedTitle = (() => {
        if (!title) return '';
        return title
            .replace(/[!*]/g, '') // Strip ! and *
            .replace(/\s+/g, ' ') // Collapse spaces
            .trim();
    })();

    return (
        <Link 
            href={`/properties/${id}`} 
            className="property-card"
        >
            <div className="property-image-container">
                <Image 
                    src={imageUrl} 
                    alt={cleanedTitle} 
                    className="property-image" 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                />
                <div className="property-badge-container">
                    {operationTypes && operationTypes.includes('sale') && operationTypes.includes('rental') ? (
                        <span className="property-badge both">Venta / Alquiler</span>
                    ) : (
                        <span className="property-badge">{operationType === 'rental' ? 'Alquiler' : 'Venta'}</span>
                    )}
                    <span className="property-badge-category">{propertyType}</span>
                </div>
                
                <button 
                    className={`favorite-btn ${active ? 'active' : ''}`}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite({ id, title, price, currency, imageUrl, location, operationType });
                    }}
                    aria-label={active ? "Quitar de favoritos" : "Guardar en favoritos"}
                >
                    <Heart size={20} fill={active ? "var(--accent-primary)" : "transparent"} stroke={active ? "var(--accent-primary)" : "white"} />
                </button>
            </div>

            <div className="property-details">
                <div className="property-header">
                    <h3 className="property-title">{cleanedTitle}</h3>
                    <p className="property-location">
                        <MapPin size={14} className="icon-gold" />
                        {location}
                    </p>
                </div>

                <div className="property-metrics">
                    {!isTerreno && (
                        <>
                            {bedrooms > 0 && (
                                <div className="metric">
                                    <BedDouble size={16} />
                                    <span className="metric-value">{bedrooms}</span>
                                </div>
                            )}
                            {bathrooms > 0 && (
                                <div className="metric">
                                    <Bath size={16} />
                                    <span className="metric-value">{bathrooms}</span>
                                </div>
                            )}
                            {parking !== undefined && parking > 0 && (
                                <div className="metric">
                                    <Car size={16} />
                                    <span className="metric-value">{parking}</span>
                                </div>
                            )}
                        </>
                    )}
                    <div className="metric last-metric">
                        <Maximize2 size={16} />
                        <span className="metric-value">{area} m²</span>
                    </div>
                </div>

                <div className="property-footer">
                    <div className="price-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="property-price">
                            {primaryPriceDisplay}
                        </span>
                        {secondaryPriceDisplay && (
                            <span className="property-price-secondary" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '2px' }}>
                                {secondaryPriceDisplay}
                            </span>
                        )}
                    </div>

                    <div className="view-property-btn">
                        <span>Ver Propiedad</span>
                        <ChevronRight size={16} />
                    </div>
                </div>
            </div>
        </Link>
    );
}
