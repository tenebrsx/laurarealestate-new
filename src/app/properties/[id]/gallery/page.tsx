import { getPropertyById } from '@/services/easybroker';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import './gallery-page.css';

interface GalleryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PropertyGalleryPage({ params }: GalleryPageProps) {
  const resolvedParams = await params;
  const property = await getPropertyById(resolvedParams.id);

  if (!property) {
    notFound();
  }

  // Format price
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
    <div className="gallery-page-wrapper">
      {/* Premium Sticky Gallery Header */}
      <header className="gallery-page-header">
        <div className="gallery-header-container">
          <Link href={`/properties/${property.id}`} className="btn-gallery-back">
            <ArrowLeft size={18} />
            <span>Volver a la propiedad</span>
          </Link>
          
          <div className="gallery-header-info">
            <h1 className="gallery-property-title">{property.title}</h1>
            <span className="gallery-property-price">{finalPriceDisplay}</span>
          </div>

          <a href={`/properties/${property.id}#contacto`} className="btn-gallery-contact">
            <Mail size={16} />
            <span>Contactar Asesor</span>
          </a>
        </div>
      </header>

      {/* Main Luxury Masonry Image Grid */}
      <main className="gallery-grid-section container">
        <div className="gallery-masonry-grid">
          {property.images && property.images.length > 0 ? (
            property.images.map((img: string, idx: number) => {
              // Give some random items a tall class to simulate beautiful masonry grid
              const isTall = idx % 5 === 1 || idx % 5 === 3;
              return (
                <div key={idx} className={`gallery-grid-item ${isTall ? 'tall' : ''} glass-panel`}>
                  <div className="gallery-item-inner">
                    <Image
                      src={img}
                      alt={`${property.title} - Imagen ${idx + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                      className="gallery-grid-img"
                      loading={idx < 6 ? "eager" : "lazy"}
                    />
                    <div className="gallery-item-overlay">
                      <span className="gallery-item-number">{idx + 1} / {property.images.length}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-images-fallback">
              <p>No hay imágenes disponibles para esta galería.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
