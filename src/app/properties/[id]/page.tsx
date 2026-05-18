import { getPropertyById } from '@/services/easybroker';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import DynamicMap from '@/components/map/DynamicMap';
import { MapPin, BedDouble, Bath, Car, Maximize2, Mail, Phone, Calendar } from 'lucide-react';
import FavoriteButton from '@/components/properties/FavoriteButton';
import './property-detail.css';

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

    const isTerreno = property.propertyType?.toLowerCase().includes('terreno') || property.propertyType?.toLowerCase().includes('solar');

    // Format price - ensure Currency is visible and /m2 if applicable
    const basePriceStr = property.formattedPrice || new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: property.currency,
        maximumFractionDigits: 0,
    }).format(property.price);

    const currencySuffix = (property.formattedPrice && property.formattedPrice.includes(property.currency)) ? '' : ` ${property.currency}`;
    const mt2Suffix = property.priceUnit && property.priceUnit.includes('meter') ? ' /m²' : '';
    const rentalSuffix = property.operationType === 'rental' && !mt2Suffix ? '/mes' : '';

    const finalPriceDisplay = `${basePriceStr}${currencySuffix}${mt2Suffix}${rentalSuffix}`;

    return (
        <div className="property-detail-page">
            {/* Premium Asymmetric Gallery Hero (Moved to Top) */}
            <section className="detail-gallery-hero container animate-fade-in">
                <div className="gallery-hero-grid">
                    {/* Main Large Image */}
                    <div className="gallery-hero-main">
                        {/* Floating Badges & Favorite */}
                        <div className="hero-floating-tags">
                            <span className="text-eyebrow" style={{ marginBottom: 0 }}>{property.propertyType}</span>
                            {property.operationTypes && property.operationTypes.includes('sale') && property.operationTypes.includes('rental') ? (
                                <span className="tag both">Venta / Alquiler</span>
                            ) : (
                                <span className="tag">{property.operationType === 'rental' ? 'Alquiler' : 'Venta'}</span>
                            )}
                        </div>
                        <div className="hero-floating-favorite">
                            <FavoriteButton property={{
                                id: property.id,
                                title: property.title,
                                price: property.price,
                                currency: property.currency,
                                imageUrl: property.imageUrl,
                                location: property.location,
                                operationType: property.operationType
                            }} />
                        </div>

                        <Image 
                            src={property.imageUrl} 
                            alt={property.title}
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, 65vw"
                            style={{ objectFit: 'cover' }}
                            className="gallery-hero-img"
                        />
                    </div>
                    {/* Stacked Side Images */}
                    {property.images && property.images.length > 1 && (
                        <div className="gallery-hero-side">
                            <div className="gallery-hero-side-item">
                                <Image 
                                    src={property.images[1] || property.imageUrl} 
                                    alt={`${property.title} - View 2`}
                                    fill
                                    sizes="35vw"
                                    style={{ objectFit: 'cover' }}
                                    className="gallery-hero-img"
                                />
                            </div>
                            <div className="gallery-hero-side-item">
                                <Image 
                                    src={property.images[2] || property.images[0] || property.imageUrl} 
                                    alt={`${property.title} - View 3`}
                                    fill
                                    sizes="35vw"
                                    style={{ objectFit: 'cover' }}
                                    className="gallery-hero-img"
                                />
                                {property.images && property.images.length > 3 && (
                                    <Link href={`/properties/${property.id}/gallery`} className="gallery-hero-overlay animate-fade-in">
                                        <span className="overlay-text">Ver más imágenes (+{property.images.length - 3})</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Detail Header Section (Moved Below Image) */}
            <header className="detail-header-section container animate-fade-in">
                <div className="detail-price-container">
                    <span className="detail-price-large">{finalPriceDisplay}</span>
                </div>
                <h1 className="detail-title">{property.title}</h1>
                <div className="detail-location-container">
                    <MapPin size={18} className="icon-gold" />
                    <p className="detail-location">{property.location}</p>
                </div>
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
                                    <div className="metric-box">
                                        <BedDouble size={24} className="icon-gold" />
                                        <span className="box-value">{property.bedrooms}</span>
                                        <span className="box-label">Habitaciones</span>
                                    </div>
                                    <div className="metric-box">
                                        <Bath size={24} className="icon-gold" />
                                        <span className="box-value">{property.bathrooms}</span>
                                        <span className="box-label">Baños</span>
                                    </div>
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
                                <button className="btn btn-primary" style={{ width: '100%', marginBottom: 'var(--space-sm)' }}>
                                    <Mail size={18} /> Enviar Mensaje
                                </button>
                                <button className="btn btn-outline" style={{ width: '100%' }}>
                                    <Calendar size={18} /> Agendar Visita
                                </button>
                            </div>

                            <div className="direct-contact">
                                <p className="contact-label">O contáctenos directamente:</p>
                                <div className="contact-links" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                                    <a href="mailto:info@lauraalba.com" className="contact-method" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                                        <Mail size={16} className="icon-gold" /> info@lauraalba.com
                                    </a>
                                    <a href="tel:+18090000000" className="contact-method" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                                        <Phone size={16} className="icon-gold" /> +1 (809) 000-0000
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}
