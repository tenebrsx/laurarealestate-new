import { getPropertyById } from '@/services/easybroker';
import { notFound } from 'next/navigation';
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

    // Format price
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: property.currency,
        maximumFractionDigits: 0,
    }).format(property.price);

    return (
        <div className="property-detail-page">
            {/* Detail Hero Section */}
            <section className="detail-hero">
                <div className="detail-hero-image" style={{ backgroundImage: `url(${property.imageUrl})` }}>
                    <div className="hero-gradient-bottom"></div>
                </div>
                <div className="container detail-hero-content animate-fade-in">
                    <div className="property-tags">
                        <span className="tag">{property.operationType === 'rental' ? 'En Alquiler' : 'En Venta'}</span>
                        <span className="tag-price">{formattedPrice}{property.operationType === 'rental' ? '/mes' : ''}</span>
                    </div>
                    <h1 className="detail-title">{property.title}</h1>
                    <p className="detail-location">
                        <span className="icon-marker-lg"></span>
                        {property.location}
                    </p>
                </div>
            </section>

            {/* Main Content Area */}
            <section className="detail-main container">
                <div className="detail-grid">

                    {/* Left Column: Specs & Description */}
                    <div className="detail-content">

                        {/* Key Metrics Ribbon */}
                        <div className="metrics-ribbon glass-panel">
                            <div className="metric-box">
                                <span className="box-value">{property.bedrooms}</span>
                                <span className="box-label">Habitaciones</span>
                            </div>
                            <div className="metric-box">
                                <span className="box-value">{property.bathrooms}</span>
                                <span className="box-label">Baños</span>
                            </div>
                            <div className="metric-box">
                                <span className="box-value">{property.area}</span>
                                <span className="box-label">Metros Cuadrados</span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h2 className="section-heading">Descripción de la Propiedad</h2>
                            <div className="property-description">
                                {property.description ? (
                                    <div dangerouslySetInnerHTML={{ __html: property.description.replace(/\n/g, '<br/>') }} />
                                ) : (
                                    <p>No se proporcionó descripción para esta propiedad exclusiva.</p>
                                )}
                            </div>
                        </div>

                        {/* Photo Gallery Grid */}
                        {property.images && property.images.length > 0 && (
                            <div className="detail-section">
                                <h2 className="section-heading">Galería de Fotos</h2>
                                <div className="photo-gallery">
                                    {property.images.map((img, idx) => (
                                        <div key={idx} className="gallery-thumbnail">
                                            <img src={img} alt={`${property.title} - View ${idx + 1}`} loading="lazy" />
                                        </div>
                                    ))}
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
                                    <p className="agent-title">Corredora Inmobiliaria Exclusiva</p>
                                </div>
                            </div>

                            <form className="contact-form">
                                <div className="form-group">
                                    <input type="text" placeholder="Tu Nombre" required className="form-input" />
                                </div>
                                <div className="form-group">
                                    <input type="email" placeholder="Tu Correo Electrónico" required className="form-input" />
                                </div>
                                <div className="form-group">
                                    <textarea placeholder="Estoy interesado/a en esta propiedad..." required className="form-textarea" rows={4}></textarea>
                                </div>
                                <button type="submit" className="btn-submit">Solicitar Información</button>
                            </form>

                            <div className="direct-contact">
                                <p>O contáctenos directamente:</p>
                                <a href="mailto:contact@lauraalba.com" className="contact-link">contact@lauraalba.com</a>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}
