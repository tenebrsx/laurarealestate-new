import type { Metadata } from 'next';
import Link from 'next/link';
import './not-found.css';

export const metadata: Metadata = {
  title: 'Página no encontrada | Laura Alba Bienes Raíces',
  robots: { index: false, follow: true },
};

const WHATSAPP = 'https://wa.me/18092997077?text=' + encodeURIComponent('Hola Laura, estoy buscando una propiedad y no encontré la página que buscaba.');

export default function NotFound() {
  return (
    <section className="nf-section">
      <img src="/hero/404-atardecer-palmar-de-ocoa.webp" alt="Atardecer frente al mar en Palmar de Ocoa" className="nf-bg" />
      <div className="nf-overlay" />
      <div className="nf-content">
        <span className="nf-code">404</span>
        <span className="nf-kicker">Página no encontrada</span>
        <h1 className="nf-title">Esta dirección <em>no existe</em>,<br />pero su próximo hogar sí.</h1>
        <p className="nf-text">Es posible que la propiedad ya se haya vendido o que el enlace haya cambiado. Le ayudamos a encontrar lo que busca.</p>
        <div className="nf-actions">
          <Link href="/" className="btn btn-primary">Volver al inicio</Link>
          <Link href="/properties" className="btn btn-outline nf-outline">Ver propiedades</Link>
        </div>
        <nav className="nf-links" aria-label="Accesos rápidos">
          <Link href="/properties?operation_type=sale">En venta</Link>
          <Link href="/properties?operation_type=rental">En alquiler</Link>
          <Link href="/mapa">Mapa</Link>
          <Link href="/about">Nosotros</Link>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">Escríbanos por WhatsApp</a>
        </nav>
      </div>
    </section>
  );
}
