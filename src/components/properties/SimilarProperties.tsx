import React from 'react';
import PropertyCard from './PropertyCard';
import { Property } from '@/types/property';
import './SimilarProperties.css';

interface SimilarPropertiesProps {
    properties: Property[];
}

export default function SimilarProperties({ properties }: SimilarPropertiesProps) {
    if (properties.length === 0) return null;

    return (
        <section className="similar-properties-section">
            <div className="section-header">
                <span className="text-eyebrow">Sugerencias</span>
                <h2 className="section-title">Propiedades Similares</h2>
            </div>
            
            <div className="similar-properties-grid">
                {properties.map((property) => (
                    <PropertyCard 
                        key={property.id}
                        {...property}
                    />
                ))}
            </div>
        </section>
    );
}
