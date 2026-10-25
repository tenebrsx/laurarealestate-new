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
            src="/hero/villa-palmar-de-ocoa.webp"
            alt="Piscina frente al mar de una villa en primera línea de playa en Palmar de Ocoa, listada por Laura Alba"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: '55% 50%' }}
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
              Propiedades seleccionadas por su diseño, ubicación y potencial de inversión.
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
