'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-content">
        <Link href="/" className="nav-logo">
          LAURA ALBA
        </Link>
        
        <div className="nav-links">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/properties" className="nav-link">Properties</Link>
          <Link href="/about" className="nav-link">About</Link>
        </div>

        <div className="nav-actions">
          <button className="btn-contact">Contact Agent</button>
        </div>
      </div>
    </nav>
  );
}
