'use client';

import React from 'react';
import { MessageCircle, Calendar } from 'lucide-react';
import { Property } from '@/types/property';

interface PropertySidebarActionsProps {
    property: Property;
}

export default function PropertySidebarActions({ property }: PropertySidebarActionsProps) {
    const handleSendMessage = () => {
        const urlToShare = typeof window !== 'undefined' ? window.location.href : `https://lauraalba.com/properties/${property.id}`;
        const message = `Hola Laura, estoy interesado en la propiedad *${property.title}* (${property.location}) que vi en tu sitio web.

Aquí tienes el enlace de la propiedad:
${urlToShare}

¿Podrías darme más información?`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/18092997077?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    const handleScheduleVisit = () => {
        const urlToShare = typeof window !== 'undefined' ? window.location.href : `https://lauraalba.com/properties/${property.id}`;
        const message = `Hola Laura, me gustaría agendar una visita para conocer la propiedad *${property.title}* (${property.location}) que vi en tu sitio web.

Aquí tienes el enlace de la propiedad:
${urlToShare}

¿Qué horarios tienes disponibles para visitarla?`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/18092997077?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
            <button 
                className="btn btn-primary" 
                onClick={handleSendMessage}
                style={{ width: '100%' }}
                aria-label="Enviar mensaje por WhatsApp"
            >
                <MessageCircle size={18} /> Enviar Mensaje
            </button>
            <button 
                className="btn btn-outline" 
                onClick={handleScheduleVisit}
                style={{ width: '100%' }}
                aria-label="Agendar visita por WhatsApp"
            >
                <Calendar size={18} /> Agendar Visita
            </button>
        </div>
    );
}
