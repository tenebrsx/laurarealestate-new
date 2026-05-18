'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import FavoriteButton from '@/components/properties/FavoriteButton';
import { Property } from '@/types/property';
import { ChevronUp } from 'lucide-react';

interface PropertyGalleryHeroProps {
  property: Property;
}

export default function PropertyGalleryHero({ property }: PropertyGalleryHeroProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedImageIndex, setExpandedImageIndex] = useState<number | null>(null);

  const images = property.images || [];
  const totalImages = images.length;
  const remainingCount = totalImages - 3;

  const handleToggleExpand = (idx: number) => {
    setExpandedImageIndex(expandedImageIndex === idx ? null : idx);
  };

  if (isExpanded) {
    return (
      <section className="detail-gallery-hero container animate-fade-in expanded-gallery-wrapper">
        <div className="expanded-gallery-header">
          <button className="btn-collapse-gallery" onClick={() => { setIsExpanded(false); setExpandedImageIndex(null); }}>
            <ChevronUp size={16} />
            <span>Ver menos fotos</span>
          </button>
        </div>

        {/* Dynamic masonry CSS Grid layout with interactive in-place cinematic expansion */}
        <div className="gallery-grid">
          {images.map((img, idx) => {
            const isSingleExpanded = expandedImageIndex === idx;
            return (
              <div
                key={idx}
                className={`gallery-grid-item ${isSingleExpanded ? 'expanded' : ''} glass-panel`}
                onClick={() => handleToggleExpand(idx)}
                title={isSingleExpanded ? "Click para contraer" : "Click para expandir"}
              >
                <div className="gallery-item-inner">
                  <Image
                    src={img}
                    alt={`${property.title} - Imagen ${idx + 1}`}
                    fill
                    sizes={isSingleExpanded ? "100vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
                    style={{ objectFit: 'cover' }}
                    className="gallery-grid-img"
                    priority={idx < 4}
                  />
                  <div className="gallery-item-overlay">
                    <span className="gallery-item-number">
                      {idx + 1} / {totalImages} {isSingleExpanded ? '← Contraer' : '🔍 Expandir'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  // Not expanded - Asymmetric Luxury Hero Grid
  return (
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
        {images.length > 1 && (
          <div className="gallery-hero-side">
            <div className="gallery-hero-side-item">
              <Image 
                src={images[1] || property.imageUrl} 
                alt={`${property.title} - View 2`}
                fill
                sizes="35vw"
                style={{ objectFit: 'cover' }}
                className="gallery-hero-img"
              />
            </div>
            <div className="gallery-hero-side-item">
              <Image 
                src={images[2] || images[0] || property.imageUrl} 
                alt={`${property.title} - View 3`}
                fill
                sizes="35vw"
                style={{ objectFit: 'cover' }}
                className="gallery-hero-img"
              />
              {remainingCount > 0 && (
                <button 
                  onClick={() => setIsExpanded(true)}
                  className="gallery-hero-overlay animate-fade-in"
                  type="button"
                >
                  <span className="overlay-text">Ver más imágenes (+{remainingCount})</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
