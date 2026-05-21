'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { useFavorites, FavoriteProperty } from '@/context/FavoritesContext';

interface FavoriteButtonProps {
    property: FavoriteProperty;
    showLabel?: boolean;
}

export default function FavoriteButton({ property, showLabel = false }: FavoriteButtonProps) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const active = isFavorite(property.id);

    return (
        <button 
            className={`detail-favorite-btn ${active ? 'active' : ''}`}
            onClick={() => toggleFavorite(property)}
            aria-label={active ? "Quitar de favoritos" : "Guardar en favoritos"}
        >
            <Heart size={20} fill={active ? "var(--accent-primary)" : "transparent"} stroke={active ? "var(--accent-primary)" : "currentColor"} />
            {showLabel && <span>{active ? "Guardado" : "Guardar"}</span>}
        </button>
    );
}
