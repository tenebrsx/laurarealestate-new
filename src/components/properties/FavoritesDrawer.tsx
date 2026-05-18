'use client';

import React, { useEffect } from 'react';
import { X, Heart, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useFavorites } from '@/context/FavoritesContext';
import './FavoritesDrawer.css';

interface FavoritesDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FavoritesDrawer({ isOpen, onClose }: FavoritesDrawerProps) {
    const { favorites, removeFavorite } = useFavorites();

    // Prevent scrolling when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="favorites-overlay" onClick={onClose}>
            <div className="favorites-drawer glass-panel" onClick={(e) => e.stopPropagation()}>
                <div className="favorites-header">
                    <div className="header-title">
                        <Heart size={20} className="icon-gold" fill="var(--accent-primary)" />
                        <h2>Mis Favoritos</h2>
                        <span className="favorites-count">{favorites.length}</span>
                    </div>
                    <button className="close-drawer-btn" onClick={onClose} aria-label="Cerrar">
                        <X size={24} />
                    </button>
                </div>

                <div className="favorites-content">
                    {favorites.length === 0 ? (
                        <div className="empty-favorites">
                            <Heart size={48} strokeWidth={1} className="empty-icon" />
                            <p>Aún no tienes propiedades guardadas.</p>
                            <Link href="/properties" className="btn btn-outline" onClick={onClose}>
                                Explorar Propiedades
                            </Link>
                        </div>
                    ) : (
                        <div className="favorites-list">
                            {favorites.map((property) => (
                                <div key={property.id} className="favorite-item glass-panel">
                                    <div className="favorite-img-wrapper">
                                        <Image 
                                            src={property.imageUrl} 
                                            alt={property.title} 
                                            fill
                                            sizes="100px"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div className="favorite-info">
                                        <h3>{property.title}</h3>
                                        <p className="favorite-location">{property.location}</p>
                                        <p className="favorite-price">
                                            {new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: property.currency,
                                                maximumFractionDigits: 0,
                                            }).format(property.price)}
                                        </p>
                                        <div className="favorite-actions">
                                            <Link 
                                                href={`/properties/${property.id}`} 
                                                className="view-favorite-btn"
                                                onClick={onClose}
                                            >
                                                Ver <ExternalLink size={14} />
                                            </Link>
                                            <button 
                                                className="remove-favorite-btn" 
                                                onClick={() => removeFavorite(property.id)}
                                                aria-label="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="favorites-footer">
                    {favorites.length > 0 && (
                        <p className="footer-note">Estas propiedades se guardan localmente en tu navegador.</p>
                    )}
                    <button className="btn btn-primary w-full" onClick={onClose}>
                        Cerrar Panel
                    </button>
                </div>
            </div>
        </div>
    );
}
