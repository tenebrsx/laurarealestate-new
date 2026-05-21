'use client';

import React from 'react';
import { Property } from '@/types/property';
import PropertyCard from '@/components/properties/PropertyCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import './FeaturedListSection.css';

interface FeaturedListSectionProps {
  properties: Property[];
}

export default function FeaturedListSection({ properties }: FeaturedListSectionProps) {
  // Select the first 6 properties to form a perfect 3-column grid (2 rows) on desktop
  const featuredProperties = properties.slice(0, 6);

  return (
    <section className="featured-list-section container animate-fade-in">
      <div className="section-header text-center">
        <span className="text-eyebrow">Portafolio</span>
        <h2 className="home-section-title">Propiedades destacadas</h2>
        <p className="section-subtitle">Explora nuestra colección selecta de las propiedades más exclusivas de Santo Domingo.</p>
      </div>

      {/* 3-Column Luxury Grid on Desktop */}
      <div className="featured-properties-grid">
        {featuredProperties.map((prop) => (
          <PropertyCard
            key={prop.id}
            id={prop.id}
            title={prop.title}
            location={prop.location}
            price={prop.price}
            currency={prop.currency}
            formattedPrice={prop.formattedPrice}
            priceUnit={prop.priceUnit}
            operationType={prop.operationType}
            operationTypes={prop.operationTypes}
            propertyType={prop.propertyType}
            bedrooms={prop.bedrooms}
            bathrooms={prop.bathrooms}
            parking={prop.parking}
            area={prop.area}
            imageUrl={prop.imageUrl}
          />
        ))}
      </div>

      {/* Premium "Ver Todas" Action Bar */}
      <div className="featured-action-bar">
        <Link href="/properties" className="btn-ver-todas">
          <span>Ver todas las propiedades</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
