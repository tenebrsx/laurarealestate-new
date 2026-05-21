'use client';

import React from 'react';
import FavoriteButton from '@/components/properties/FavoriteButton';
import { MessageCircle } from 'lucide-react';
import { Property } from '@/types/property';

interface PropertyHeaderActionsProps {
    property: Property;
}

export default function PropertyHeaderActions({ property }: PropertyHeaderActionsProps) {
    const handleContactClick = () => {
        const urlToShare = typeof window !== 'undefined' ? window.location.href : `https://lauraalba.com/properties/${property.id}`;
        const message = `Hola Laura, estoy interesado en la propiedad *${property.title}* (${property.location}) que vi en tu sitio web.

Aquí tienes el enlace de la propiedad:
${urlToShare}

¿Podrías darme más información?`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/18092997077?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="property-header-actions animate-fade-in">
            <button 
                type="button"
                className="btn btn-primary header-action-contact" 
                onClick={handleContactClick}
                aria-label="Contactar con Laura Alba por WhatsApp"
            >
                <MessageCircle size={18} />
                <span>Contactar</span>
            </button>
            <div className="header-action-favorite">
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
                    showLabel={false}
                />
            </div>
        </div>
    );
}
