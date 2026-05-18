import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';
import './admin.css';

export const metadata = {
  title: 'Laura Alba | Panel de Administración',
  description: 'Gestión y modificación de propiedades importadas de EasyBroker.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-wrapper" data-theme="light">
      <header className="admin-header">
        <div className="admin-container header-inner">
          <div className="admin-brand">
            <Link href="/admin">
              <h1>LAURA ALBA</h1>
            </Link>
            <span className="admin-badge">ADMIN ENGINE</span>
          </div>
          <nav className="admin-nav">
            <Link href="/" className="admin-nav-link" target="_blank" rel="noopener noreferrer">
              <Home size={18} />
              <span>Ver Sitio Web</span>
            </Link>
          </nav>
        </div>
      </header>
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
