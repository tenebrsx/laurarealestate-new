import PropertyCard from '@/components/properties/PropertyCard';
import { getProperties } from '@/services/easybroker';
import { Property } from '@/types/property';
import Link from 'next/link';
import HeroSearch from '@/components/home/HeroSearch';
import './home.css';

const categories = [
  { label: 'Apartamentos de Diseño', type: 'Apartamento', image: '/images/categories/apartamentos.png' },
  { label: 'Residencias Exclusivas', type: 'Casa', image: '/images/categories/casas.png' },
  { label: 'Penthouses con Vista', type: 'Penthouse', image: '/images/categories/penthouse.png' },
  { label: 'Solares e Inversiones', type: 'Terreno', image: '/images/categories/terrenos.png' },
  { label: 'Espacios Comerciales', type: 'Local Comercial', image: '/images/categories/comercial.png' },
];

const zones = [
  { name: 'Piantini', desc: 'El corazón financiero y residencial' },
  { name: 'Naco', desc: 'Vida urbana con carácter' },
  { name: 'Evaristo Morales', desc: 'Conectividad y modernidad' },
  { name: 'Bella Vista', desc: 'Elegancia tradicional' },
  { name: 'Los Cacicazgos', desc: 'Exclusividad y privacidad' },
  { name: 'Arroyo Hondo', desc: 'Naturaleza y amplitud' },
];

const trustPoints = [
  {
    icon: '🏆',
    title: 'Experiencia Personal',
    description: 'Cada cliente recibe atención directa de Laura Alba, corredora con más de 15 años en el mercado inmobiliario dominicano.',
  },
  {
    icon: '🔑',
    title: 'Propiedades Verificadas',
    description: 'Todas nuestras propiedades son visitadas y verificadas personalmente. Sin sorpresas, sin decepciones.',
  },
  {
    icon: '📍',
    title: 'Conocimiento Local',
    description: 'Especialistas en las zonas más exclusivas de Santo Domingo. Te guiamos hacia la mejor inversión.',
  },
];

export default async function Home() {
  const { properties: featuredProperties } = await getProperties(8);

  return (
    <div className="home-wrapper">

      {/* ===== 1. HERO SECTION ===== */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container hero-content animate-fade-in">
          <div className="hero-text-wrapper">
            <span className="hero-subtitle">Bienes Raíces Exclusivos en Santo Domingo</span>
            <h1 className="hero-title">
              Tu próximo gran espacio <br />
              <span className="text-gradient">te espera aquí</span>
            </h1>
            <p className="hero-description">
              Propiedades seleccionadas por su diseño, ubicación y potencial de inversión.
            </p>
          </div>
          <div className="search-panel glass-panel">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* ===== 2. LIFESTYLE CATEGORY CARDS ===== */}
      <section className="categories-section container">
        <div className="section-header">
          <span className="section-eyebrow">Explora</span>
          <h2 className="home-section-title">¿Qué estás buscando?</h2>
        </div>
        <div className="lifestyle-grid">
          {categories.map((cat) => (
            <Link
              href={`/properties?property_type=${encodeURIComponent(cat.type)}`}
              key={cat.label}
              className="lifestyle-card"
            >
              <div className="lifestyle-card-bg" style={{ backgroundImage: `url(${cat.image})` }}></div>
              <div className="lifestyle-card-overlay"></div>
              <span className="lifestyle-card-label">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== 3. FEATURED PROPERTIES CAROUSEL ===== */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Portafolio</span>
            <h2 className="home-section-title">Seleccionadas para ti</h2>
          </div>
        </div>
        <div className="featured-carousel">
          {featuredProperties.map((property: Property) => (
            <div className="carousel-item" key={property.id}>
              <PropertyCard {...property} />
            </div>
          ))}
        </div>
        <div className="container" style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
          <Link href="/properties" className="btn-primary">Ver todas las propiedades →</Link>
        </div>
      </section>

      {/* ===== 4. TRUST / DIFFERENTIATOR SECTION ===== */}
      <section className="trust-section">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto var(--space-3xl)' }}>
            <span className="section-eyebrow">La Diferencia</span>
            <h2 className="home-section-title">¿Por qué Laura Alba?</h2>
            <p className="trust-intro">
              No somos un portal de clasificados. Somos tu aliada personal en cada paso del proceso inmobiliario.
            </p>
          </div>
          <div className="trust-grid">
            {trustPoints.map((point) => (
              <div className="trust-card" key={point.title}>
                <span className="trust-icon">{point.icon}</span>
                <h3 className="trust-card-title">{point.title}</h3>
                <p className="trust-card-desc">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 5. EXCLUSIVE ZONES ===== */}
      <section className="zones-section container">
        <div className="section-header">
          <span className="section-eyebrow">Ubicaciones</span>
          <h2 className="home-section-title">Zonas Exclusivas</h2>
        </div>
        <div className="zones-grid">
          {zones.map((zone) => (
            <Link
              href={`/properties?location=${encodeURIComponent(zone.name)}`}
              key={zone.name}
              className="zone-card"
            >
              <h3 className="zone-name">{zone.name}</h3>
              <p className="zone-desc">{zone.desc}</p>
              <span className="zone-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== 6. CTA BANNER ===== */}
      <section className="cta-section">
        <div className="container cta-content">
          <h2 className="cta-title">¿Quieres vender o alquilar tu propiedad?</h2>
          <p className="cta-desc">Agenda una consulta gratuita y descubre cómo podemos maximizar el valor de tu inversión.</p>
          <Link href="/about" className="btn-cta">Contactar a Laura Alba →</Link>
        </div>
      </section>
    </div>
  );
}
