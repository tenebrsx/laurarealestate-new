import { getProperties } from '@/services/easybroker';
import Link from 'next/link';
import AdvancedHomeFilter from '@/components/home/AdvancedHomeFilter';
import FeaturedListSection from '@/components/home/FeaturedListSection';
import './home.css';

export default async function Home() {
  const { properties: featuredProperties } = await getProperties(20);

  return (
    <div className="home-wrapper">

      {/* ===== 1. HERO SECTION ===== */}
      <section className="hero-section">
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <div className="container hero-content animate-fade-in">
          <div className="hero-text-wrapper">
            <span className="hero-subtitle">Bienes Raíces Exclusivos en Santo Domingo</span>
            <h1 className="hero-title">
              Tu próximo gran espacio <br />
              <span className="text-gradient">te espera aquí</span>
            </h1>
            <p className="hero-description">
              Propiedades seleccionadas por su diseño, ubicación and potencial de inversión.
            </p>
          </div>
        </div>
        <AdvancedHomeFilter />
      </section>

      {/* ===== 2. FEATURED PROPERTIES ===== */}
      <FeaturedListSection properties={featuredProperties} />

      {/* ===== 3. CTA BANNER ===== */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">¿Listo para encontrar tu próximo hogar?</h2>
            <p className="cta-desc">
              Permítenos guiarte con profesionalidad y discreción en tu próxima inversión inmobiliaria.
            </p>
            <Link href="/properties" className="btn btn-primary" style={{ backgroundColor: '#ffffff', color: 'var(--accent-primary)' }}>
              Ver Propiedades Disponibles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
