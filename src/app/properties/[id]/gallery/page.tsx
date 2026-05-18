import { getPropertyById } from '@/services/easybroker';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import GalleryGrid from './GalleryGrid';
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

      {/* Main Luxury Dynamic Image Grid */}
      <main className="gallery-grid-section container">
        <GalleryGrid images={property.images || []} title={property.title} />
      </main>
    </div>
  );
}
