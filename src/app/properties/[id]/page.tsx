import { getPropertyById, getAllProperties, getSimilarProperties, AMENITY_RULES } from '@/services/easybroker';
import { notFound } from 'next/navigation';
import DynamicMap from '@/components/map/DynamicMap';
import { MapPin, BedDouble, Bath, Car, Maximize2, Mail, Phone, Compass, Waves, Tv, Sun, Dumbbell, Zap, ShieldCheck, ArrowUpDown, Briefcase, Box, ConciergeBell, Shirt, Hammer, ChefHat, Droplet } from 'lucide-react';
import PropertyGalleryHero from './PropertyGalleryHero';
import PropertyCard from '@/components/properties/PropertyCard';
import PropertyContactForm from './PropertyContactForm';
import FavoriteButton from '@/components/properties/FavoriteButton';
import PropertyHeaderActions from './PropertyHeaderActions';
import PropertySidebarActions from './PropertySidebarActions';
import { formatCurrency } from '@/utils/format';
import './property-detail.css';

export const revalidate = 300; // Revalidate static pages in the background every 5 minutes

export async function generateStaticParams() {
    try {
        const properties = await getAllProperties();
        return properties.map((prop) => ({
            id: prop.id,
        }));
    } catch (error) {
        console.error("Error generating static params for properties:", error);
        return [];
    }
}

function getAmenityIcon(id: string) {
    switch (id) {
        case 'terraza': return <Compass className="icon-gold" size={20} />;
        case 'piscina': return <Waves className="icon-gold" size={20} />;
        case 'estudio': return <Tv className="icon-gold" size={20} />;
        case 'balcon': return <Sun className="icon-gold" size={20} />;
        case 'gimnasio': return <Dumbbell className="icon-gold" size={20} />;
        case 'planta': return <Zap className="icon-gold" size={20} />;
        case 'seguridad': return <ShieldCheck className="icon-gold" size={20} />;
        case 'ascensor': return <ArrowUpDown className="icon-gold" size={20} />;
        case 'servicio': return <Briefcase className="icon-gold" size={20} />;
        case 'locker': return <Box className="icon-gold" size={20} />;
        case 'lobby': return <ConciergeBell className="icon-gold" size={20} />;
        case 'closet': return <Shirt className="icon-gold" size={20} />;
        case 'madera': return <Hammer className="icon-gold" size={20} />;
        case 'cocina': return <ChefHat className="icon-gold" size={20} />;
        case 'agua': return <Droplet className="icon-gold" size={20} />;
        default: return <Compass className="icon-gold" size={20} />;
    }
}

interface PageProps {
    params: {
        id: string;
    };
}

export default async function PropertyDetailPage({ params }: PageProps) {
    // Await the params per Next.js 15 guidelines
    const resolvedParams = await params;
    const property = await getPropertyById(resolvedParams.id);

    if (!property) {
        notFound();
    }

    // Fetch up to 6 similar properties based on location/type similarity
    const similarProperties = await getSimilarProperties(property, 6);

    const isTerreno = property.propertyType?.toLowerCase().includes('terreno') || property.propertyType?.toLowerCase().includes('solar');

    // 1. Smart Pricing Metrics Calculation
    const isPricePerMeter = property.priceUnit && property.priceUnit.includes('meter');
    let totalPrice = property.price;
    let pricePerMeter = null;

    if (isPricePerMeter) {
        if (property.area && property.area > 0) {
            totalPrice = property.price * property.area;
        }
        pricePerMeter = property.price;
    } else {
        if (property.area && property.area > 0) {
            pricePerMeter = Math.round(property.price / property.area);
        }
    }

    // Format primary total price using premium formatCurrency
    const basePriceStr = formatCurrency(totalPrice, property.currency);

    // Format secondary metric price (per square meter)
    const basePricePerMeterStr = pricePerMeter ? formatCurrency(pricePerMeter, property.currency) : null;

    const rentalSuffix = property.operationType === 'rental' ? ' / mes' : '';
    const priceSuffix = rentalSuffix;
    const secondaryPriceDisplay = basePricePerMeterStr ? `${basePricePerMeterStr} / m²` : null;

    return (
        <div className="property-detail-page">
            {/* Premium Gallery Hero with Inline Expand Support */}
            <PropertyGalleryHero property={property} />

            {/* Restructured Premium Detail Header Section */}
            <header className="detail-header-section container animate-fade-in">
                {/* Unified Price, Secondary Price, and Badges Bar */}
                <div className="detail-meta-bar">
                    <div className="detail-price-wrapper">
                        <span className="detail-price-amount">{basePriceStr}</span>
                        {priceSuffix && (
                            <span className="detail-price-suffix">{priceSuffix}</span>
                        )}
                        {secondaryPriceDisplay && (
                            <>
                                <span className="detail-price-separator">•</span>
                                <span className="detail-price-secondary">{secondaryPriceDisplay}</span>
                            </>
                        )}
                    </div>
                    
                    <div className="detail-badge-group">
                        {property.propertyType && (
                            <span className="detail-badge type">{property.propertyType}</span>
                        )}
                        {property.operationTypes && property.operationTypes.includes('sale') && property.operationTypes.includes('rental') ? (
                            <span className="detail-badge operation both">Venta / Alquiler</span>
                        ) : (
                            <span className={`detail-badge operation ${property.operationType}`}>
                                {property.operationType === 'rental' ? 'Alquiler' : 'Venta'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Full-width Magazine Headline Title */}
                <h1 className="detail-title">{property.title}</h1>

                {/* Subtitle Row: Muted Location info */}
                <div className="detail-location-container">
                    <MapPin size={16} className="icon-gold" />
                    <p className="detail-location">{property.location}</p>
                </div>

                {/* Elegant Header Quick Actions (Mobile-Only Primary CTA) */}
                <PropertyHeaderActions property={property} />
            </header>

            {/* Main Content Area */}
            <section className="detail-main container">
                <div className="detail-grid">

                    {/* Left Column: Specs & Description */}
                    <div className="detail-content">

                        {/* Key Metrics Ribbon */}
                        <div className="metrics-ribbon glass-panel">
                            {!isTerreno && (
                                <>
                                    {property.bedrooms > 0 && (
                                        <div className="metric-box">
                                            <BedDouble size={24} className="icon-gold" />
                                            <span className="box-value">{property.bedrooms}</span>
                                            <span className="box-label">Habitaciones</span>
                                        </div>
                                    )}
                                    {property.bathrooms > 0 && (
                                        <div className="metric-box">
                                            <Bath size={24} className="icon-gold" />
                                            <span className="box-value">{property.bathrooms}</span>
                                            <span className="box-label">Baños</span>
                                        </div>
                                    )}
                                    {property.parking !== undefined && property.parking > 0 && (
                                        <div className="metric-box">
                                            <Car size={24} className="icon-gold" />
                                            <span className="box-value">{property.parking}</span>
                                            <span className="box-label">Parqueos</span>
                                        </div>
                                    )}
                                </>
                            )}
                            <div className="metric-box">
                                <Maximize2 size={24} className="icon-gold" />
                                <span className="box-value">{property.area}</span>
                                <span className="box-label">Metros (m²)</span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h2 className="section-heading">Descripción</h2>
                            <div className="property-description">
                                {property.description ? (
                                    <div dangerouslySetInnerHTML={{ __html: property.description.replace(/\n/g, '<br/>') }} />
                                ) : (
                                    <p>No se proporcionó descripción para esta propiedad exclusiva.</p>
                                )}
                            </div>
                        </div>

                        {property.amenities && property.amenities.length > 0 && (
                            <div className="detail-section amenities-section border-t pt-8 mt-8">
                                <h2 className="section-heading">Amenidades y Características</h2>
                                <div className="amenities-grid">
                                    {property.amenities.map((item) => {
                                        // Find rule details to map dynamic icons cleanly
                                        const rule = AMENITY_RULES.find(r => r.label === item);
                                        const label = rule ? rule.label : item;
                                        const id = rule ? rule.id : 'default';
                                        return (
                                            <div key={id} className="amenity-item glass-panel">
                                                {getAmenityIcon(id)}
                                                <span className="amenity-label">{label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}



                        {/* Property Map */}
                        {property.latitude && property.longitude && (
                            <div className="detail-section">
                                <h2 className="section-heading">Ubicación</h2>
                                <div className="detail-map-container glass-panel">
                                    <DynamicMap
                                        latitude={property.latitude}
                                        longitude={property.longitude}
                                        title={property.title}
                                        showExact={true}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Contact Agent Sticky Panel */}
                    <div className="detail-sidebar">
                        <div className="contact-card glass-panel sticky">
                            <div className="agent-profile">
                                <div className="agent-avatar-large">LA</div>
                                <div className="agent-info">
                                    <h3 className="agent-name">Laura Alba</h3>
                                    <p className="agent-title">Asesora Senior</p>
                                </div>
                            </div>

                            <div className="contact-actions">
                                <PropertySidebarActions property={property} />
                                <FavoriteButton
                                    property={{
                                        id: property.id,
                                        title: property.title,
                                        price: property.price,
                                        currency: property.currency,
                                        imageUrl: property.imageUrl,
                                        location: property.location,
                                        operationType: property.operationType
                                    }}
                                    showLabel={true}
                                />
                            </div>

                            <div className="direct-contact">
                                <p className="contact-label">O contáctenos directamente:</p>
                                <div className="contact-links" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                                    <a href="mailto:info@lauraalba.com" className="contact-method" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                                        <Mail size={16} className="icon-gold" /> info@lauraalba.com
                                    </a>
                                    <a href="tel:+18092997077" className="contact-method" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                                        <Phone size={16} className="icon-gold" /> +1 (809) 299-7077
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Similar Properties Recommendation Section */}
                    {similarProperties.length > 0 && (
                        <div className="detail-similar-wrapper">
                            <section className="similar-properties-section animate-fade-in">
                                <div className="section-header">
                                    <span className="text-eyebrow">Exclusividad</span>
                                    <h2 className="section-title">Propiedades Similares</h2>
                                    <p className="section-subtitle">Otras residencias selectas en zonas y categorías afines.</p>
                                </div>
                                <div className="similar-properties-grid">
                                    {similarProperties.map((similarProp) => (
                                        <PropertyCard key={similarProp.id} {...similarProp} />
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                </div>
            </section>

            {/* Clean Contact Form Layout Final CTA */}
            <PropertyContactForm propertyTitle={property.title} propertyId={property.id} />

        </div>
    );
}
