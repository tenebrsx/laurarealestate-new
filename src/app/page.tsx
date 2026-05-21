import { getProperties } from '@/services/easybroker';
import Image from 'next/image';
import AdvancedHomeFilter from '@/components/home/AdvancedHomeFilter';
import FeaturedListSection from '@/components/home/FeaturedListSection';
import './home.css';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { properties: featuredProperties } = await getProperties(20);

  return (
    <div className="home-wrapper">

      {/* ===== 1. HERO SECTION ===== */}
      <section className="hero-section">
        <div className="hero-bg-container">
          <Image
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80"
            alt="Bienes Raíces Exclusivos"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
            className="hero-bg-img"
          />
        </div>
        <div className="hero-overlay"></div>
        <div className="container hero-content animate-fade-in">
          <div className="hero-text-wrapper">
            <span className="hero-subtitle">Bienes Raíces Exclusivos en Santo Domingo</span>
            <h1 className="hero-title">
              Tu próximo gran espacio <br />
              <span className="text-gold">te espera aquí</span>
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

    </div>
  );
}
