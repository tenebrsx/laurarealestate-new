'use client';

import React, { useState } from 'react';
import { Mail, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import './property-detail.css';

interface PropertyContactFormProps {
    propertyTitle: string;
    propertyId: string;
}

export default function PropertyContactForm({ propertyTitle, propertyId }: PropertyContactFormProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState(`Hola, me interesa obtener más información sobre la propiedad "${propertyTitle}" (ID: ${propertyId}).`);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate premium API post / form submission delay
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    return (
        <div className="property-cta-section container animate-fade-in">
            <div className="property-cta-wrapper glass-panel">
                <div className="property-cta-grid">
                    {/* Left Details Info */}
                    <div className="property-cta-info">
                        <span className="text-eyebrow">Hablemos</span>
                        <h2 className="cta-heading">¿Deseas conocer esta propiedad?</h2>
                        <p className="cta-subheading">
                            Agenda una visita guiada o solicita información detallada. Nuestro equipo de asesores senior se pondrá en contacto contigo hoy mismo.
                        </p>
                        
                        <div className="cta-contact-details">
                            <div className="cta-contact-item">
                                <div className="cta-icon-wrapper">
                                    <Mail size={18} className="icon-gold" />
                                </div>
                                <div>
                                    <span>Correo</span>
                                    <a href="mailto:info@lauraalba.com">info@lauraalba.com</a>
                                </div>
                            </div>
                            <div className="cta-contact-item">
                                <div className="cta-icon-wrapper">
                                    <Phone size={18} className="icon-gold" />
                                </div>
                                <div>
                                    <span>Teléfono / WhatsApp</span>
                                    <a href="tel:+18092997077">+1 (809) 299-7077</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Contact Form Card */}
                    <div className="property-cta-form-container">
                        {!isMounted ? (
                            <div className="property-cta-form-skeleton animate-pulse" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', opacity: 0.6 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ height: '14px', width: '30%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
                                    <div style={{ height: '46px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div style={{ height: '14px', width: '50%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
                                        <div style={{ height: '46px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }} />
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div style={{ height: '14px', width: '50%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
                                        <div style={{ height: '46px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ height: '14px', width: '20%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
                                    <div style={{ height: '90px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }} />
                                </div>
                                <div style={{ height: '48px', background: 'rgba(212, 175, 55, 0.15)', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.25)' }} />
                            </div>
                        ) : isSubmitted ? (
                            <div className="form-success-state">
                                <CheckCircle2 size={48} className="icon-gold animate-scale-in" />
                                <h3>¡Solicitud Recibida!</h3>
                                <p>Hemos recibido tu consulta para <strong>{propertyTitle}</strong>. Un especialista senior se comunicará contigo a la brevedad.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="property-cta-form">
                                <div className="form-group">
                                    <label htmlFor="cta-name">Nombre Completo</label>
                                    <input 
                                        type="text" 
                                        id="cta-name" 
                                        placeholder="Tu nombre" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="cta-email">Correo Electrónico</label>
                                        <input 
                                            type="email" 
                                            id="cta-email" 
                                            placeholder="tu@correo.com" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="cta-phone">Teléfono</label>
                                        <input 
                                            type="tel" 
                                            id="cta-phone" 
                                            placeholder="Tu teléfono" 
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cta-message">Mensaje</label>
                                    <textarea 
                                        id="cta-message" 
                                        rows={3} 
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                                    {isSubmitting ? 'Enviando...' : (
                                        <>
                                            Solicitar Información <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
