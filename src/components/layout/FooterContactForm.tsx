'use client';

import React, { useState } from 'react';
import { Mail, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import './Footer.css';

export default function FooterContactForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate premium API post / form submission delay
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    return (
        <div className="footer-cta-section container animate-fade-in">
            <div className="footer-cta-wrapper glass-panel">
                <div className="footer-cta-grid">
                    {/* Left Details Info */}
                    <div className="footer-cta-info">
                        <span className="text-eyebrow">Hablemos</span>
                        <h2 className="cta-heading">¿Quieres vender o alquilar tu propiedad?</h2>
                        <p className="cta-subheading">
                            Permítenos guiarte con profesionalidad y discreción. Nuestro equipo de asesores senior se pondrá en contacto contigo hoy mismo para brindarte una asesoría personalizada.
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
                    <div className="footer-cta-form-container">
                        {isSubmitted ? (
                            <div className="form-success-state">
                                <CheckCircle2 size={48} className="icon-gold animate-scale-in" />
                                <h3>¡Solicitud Recibida!</h3>
                                <p>Hemos recibido tus datos con éxito. Un especialista senior se comunicará contigo a la brevedad.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="property-cta-form">
                                <div className="form-group">
                                    <label htmlFor="footer-cta-name">Nombre Completo</label>
                                    <input 
                                        type="text" 
                                        id="footer-cta-name" 
                                        placeholder="Tu nombre" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required 
                                        suppressHydrationWarning={true}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="footer-cta-email">Correo Electrónico</label>
                                        <input 
                                            type="email" 
                                            id="footer-cta-email" 
                                            placeholder="tu@correo.com" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required 
                                            suppressHydrationWarning={true}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="footer-cta-phone">Teléfono</label>
                                        <input 
                                            type="tel" 
                                            id="footer-cta-phone" 
                                            placeholder="Tu teléfono" 
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required 
                                            suppressHydrationWarning={true}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="footer-cta-message">Mensaje</label>
                                    <textarea 
                                        id="footer-cta-message" 
                                        rows={3} 
                                        placeholder="¿En qué podemos ayudarte con tu propiedad?"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                        suppressHydrationWarning={true}
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                                    {isSubmitting ? 'Enviando...' : (
                                        <>
                                            Enviar Mensaje <ArrowRight size={18} />
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
