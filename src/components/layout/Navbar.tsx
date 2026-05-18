'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import FavoritesDrawer from '@/components/properties/FavoritesDrawer';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const { favorites } = useFavorites();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-content">
        <Link href="/" className="nav-logo">
          LAURA ALBA
        </Link>

        <div className="nav-links">
          <Link href="/" className="nav-link">Inicio</Link>
          <Link href="/properties" className="nav-link">Propiedades</Link>
          <Link href="/mapa" className="nav-link">Mapa</Link>
          <Link href="/about" className="nav-link">Nosotros</Link>
        </div>

        <div className="nav-actions">
          <button 
            className="nav-favorites-btn" 
            onClick={() => setFavoritesOpen(true)}
            aria-label="Ver favoritos"
          >
            <Heart size={20} />
            {favorites.length > 0 && (
                <span className="nav-favorites-badge">{favorites.length}</span>
            )}
          </button>

          <Link href="/about" className="btn btn-primary btn-nav">Contactar</Link>

          <button
            className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <div className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-links">
          <Link href="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Inicio</Link>
          <Link href="/properties" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Propiedades</Link>
          <Link href="/mapa" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Mapa</Link>
          <Link href="/about" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Nosotros</Link>
          <button 
            className="mobile-nav-link" 
            onClick={() => {
                setMobileMenuOpen(false);
                setFavoritesOpen(true);
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}
          >
            Favoritos ({favorites.length})
          </button>
          <Link href="/about" className="btn btn-primary mobile-btn" onClick={() => setMobileMenuOpen(false)}>Contactar Agente</Link>
        </div>
      </div>

      <FavoritesDrawer isOpen={favoritesOpen} onClose={() => setFavoritesOpen(false)} />
    </nav>
  );
}
