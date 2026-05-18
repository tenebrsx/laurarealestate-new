'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface FavoriteProperty {
    id: string;
    title: string;
    price: number;
    currency: string;
    imageUrl: string;
    location: string;
    operationType: 'sale' | 'rental';
}

interface FavoritesContextType {
    favorites: FavoriteProperty[];
    addFavorite: (property: FavoriteProperty) => void;
    removeFavorite: (id: string) => void;
    isFavorite: (id: string) => boolean;
    toggleFavorite: (property: FavoriteProperty) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
    const [mounted, setMounted] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
            try {
                const stored = localStorage.getItem('lauraalba_favorites');
                if (stored) {
                    setFavorites(JSON.parse(stored));
                }
            } catch (error) {
                console.error('Error loading favorites from local storage:', error);
            }
        }, 0);
        
        return () => clearTimeout(timer);
    }, []);

    // Save to local storage whenever favorites change
    useEffect(() => {
        if (mounted) {
            try {
                localStorage.setItem('lauraalba_favorites', JSON.stringify(favorites));
            } catch (error) {
                console.error('Error saving favorites to local storage:', error);
            }
        }
    }, [favorites, mounted]);

    const addFavorite = (property: FavoriteProperty) => {
        setFavorites((prev) => {
            if (!prev.find((p) => p.id === property.id)) {
                return [...prev, property];
            }
            return prev;
        });
    };

    const removeFavorite = (id: string) => {
        setFavorites((prev) => prev.filter((p) => p.id !== id));
    };

    const isFavorite = (id: string) => {
        return favorites.some((p) => p.id === id);
    };

    const toggleFavorite = (property: FavoriteProperty) => {
        if (isFavorite(property.id)) {
            removeFavorite(property.id);
        } else {
            addFavorite(property);
        }
    };

    return (
        <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}
