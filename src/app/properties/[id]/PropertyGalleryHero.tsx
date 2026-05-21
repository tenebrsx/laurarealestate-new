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
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [dotsStart, setDotsStart] = useState(0);

  const images = property.images || [];
  const totalImages = images.length;
  const remainingCount = totalImages - 3;

  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    if (width > 0) {
      const index = Math.round(scrollLeft / width);
      setActiveSlideIndex(index);
      if (totalImages > 5) {
        setDotsStart(prev => {
          let newStart = prev;
          if (index >= prev + 4) {
            newStart = Math.min(totalImages - 5, index - 3);
          } else if (index <= prev) {
            newStart = Math.max(0, index - 1);
          }
          return newStart;
        });
      }
    }
  };

  return (
    <section id="gallery-section" className="detail-gallery-hero container animate-fade-in">
      {/* Mobile Swipeable Carousel */}
      <div className="gallery-mobile-carousel">
        {/* Floating Badges */}
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

        {/* Scrollsnap Track */}
        <div
          className="mobile-carousel-track"
          onScroll={handleMobileScroll}
          id="mobile-carousel-track"
        >
          {images.map((img, idx) => (
            <div key={idx} className="mobile-carousel-slide">
              <Image
                src={img}
                alt={`${property.title} - Foto ${idx + 1}`}
                fill
                priority={idx === 0}
                sizes="100vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>

        {/* Dynamic Center dots (Instagram-style sliding window of 5 dots with boundary scaling) */}
        {totalImages > 1 && (() => {
          if (totalImages <= 5) {
            return (
              <div className="mobile-carousel-dots floaty-glass">
                {images.map((_, idx) => (
                  <span
                    key={idx}
                    className={`carousel-dot ${activeSlideIndex === idx ? 'active' : ''}`}
                    onClick={() => {
                      const track = document.getElementById('mobile-carousel-track');
                      if (track) {
                        track.scrollTo({ left: track.clientWidth * idx, behavior: 'smooth' });
                      }
                    }}
                  />
                ))}
              </div>
            );
          }

          // More than 5 images: show window of 5, make edge dots smaller if there are more in that direction
          const visibleDotsIndices = Array.from({ length: 5 }, (_, i) => dotsStart + i);

          return (
            <div className="mobile-carousel-dots floaty-glass">
              {visibleDotsIndices.map((idx) => {
                const isFirstVisibleEdge = idx === dotsStart && idx > 0;
                const isLastVisibleEdge = idx === dotsStart + 4 && idx < totalImages - 1;
                const isSmallEdge = isFirstVisibleEdge || isLastVisibleEdge;

                return (
                  <span
                    key={idx}
                    className={`carousel-dot ${activeSlideIndex === idx ? 'active' : ''} ${isSmallEdge ? 'scale-small' : ''}`}
                    onClick={() => {
                      const track = document.getElementById('mobile-carousel-track');
                      if (track) {
                        track.scrollTo({ left: track.clientWidth * idx, behavior: 'smooth' });
                      }
                    }}
                  />
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Desktop Asymmetric Luxury Hero Grid */}
      <div className="gallery-hero-grid">
        {/* Main Large Image */}
        <div className="gallery-hero-main">
          {/* Floating Badges */}
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
              {remainingCount > 0 && !isExpanded && (
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

      {/* Expanded Editorial Magazine Gallery Section */}
      {isExpanded && images.length > 3 && (
        <div className="gallery-expanded-section animate-fade-in">
          <div className="editorial-gallery-flow">
            {(() => {
              const remaining = images.slice(3);
              const renderedBlocks = [];
              let i = 0;

              while (i < remaining.length) {
                // Pattern 1: Wide Side-by-Side Split (2 columns)
                if (i % 3 === 0) {
                  const chunk = remaining.slice(i, i + 2);
                  renderedBlocks.push(
                    <div key={`split-${i}`} className="editorial-row split-2">
                      {chunk.map((img, idx) => {
                        const actualIndex = i + 3 + idx;
                        return (
                          <div key={actualIndex} className="editorial-item glass-panel">
                            <div className="editorial-item-inner aspect-split">
                              <Image
                                src={img}
                                alt={`${property.title} - Imagen ${actualIndex + 1}`}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                style={{ objectFit: 'cover' }}
                                className="editorial-img"
                              />
                              <div className="editorial-overlay">
                                <span className="editorial-number">{actualIndex + 1} / {totalImages}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                  i += 2;
                }
                // Pattern 2: Dramatic Full-Width Panoramic Banner (1 column)
                else {
                  const img = remaining[i];
                  const actualIndex = i + 3;
                  renderedBlocks.push(
                    <div key={`panoramic-${i}`} className="editorial-row full-width">
                      <div className="editorial-item glass-panel">
                        <div className="editorial-item-inner aspect-panoramic">
                          <Image
                            src={img}
                            alt={`${property.title} - Imagen ${actualIndex + 1}`}
                            fill
                            sizes="100vw"
                            style={{ objectFit: 'cover' }}
                            className="editorial-img"
                          />
                          <div className="editorial-overlay">
                            <span className="editorial-number">{actualIndex + 1} / {totalImages}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                  i += 1;
                }
              }
              return renderedBlocks;
            })()}
          </div>

          <div className="expanded-gallery-footer">
            <button
              className="btn-collapse-gallery"
              onClick={() => {
                setIsExpanded(false);
                const el = document.getElementById('gallery-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              type="button"
            >
              <ChevronUp size={16} />
              <span>Ver menos fotos</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
