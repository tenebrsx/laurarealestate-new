'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface GalleryGridProps {
  images: string[];
  title: string;
}

export default function GalleryGrid({ images, title }: GalleryGridProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggleExpand = (index: number) => {
    // If clicking the currently expanded image, contract it; otherwise, expand the new one
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="gallery-grid">
      {images.map((img, idx) => {
        const isExpanded = expandedIndex === idx;
        return (
          <div
            key={idx}
            className={`gallery-grid-item ${isExpanded ? 'expanded' : ''} glass-panel`}
            onClick={() => handleToggleExpand(idx)}
            title={isExpanded ? "Haga clic para contraer" : "Haga clic para expandir en pantalla completa"}
          >
            <div className="gallery-item-inner">
              <Image
                src={img}
                alt={`${title} - Imagen ${idx + 1}`}
                fill
                sizes={isExpanded ? "100vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
                style={{ objectFit: 'cover' }}
                className="gallery-grid-img"
                priority={idx < 4}
              />
              <div className="gallery-item-overlay">
                <span className="gallery-item-number">
                  {idx + 1} / {images.length} {isExpanded ? '← Contraer' : '🔍 Expandir'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
