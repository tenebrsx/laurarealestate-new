import PropertyCard from '@/components/properties/PropertyCard';
import { getProperties } from '@/services/easybroker';
import { Property } from '@/types/property';
import Link from 'next/link';
import HeroSearch from '@/components/home/HeroSearch';
import './home.css';
import { Property } from '@/types/property';
import './home.css';

export default async function Home() {
  // Fetch featured properties directly on the server
  const { properties: featuredProperties } = await getProperties(6);
  return (
    <div className="home-wrapper">

      {/* Functional Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container hero-content animate-fade-in">
          <div className="hero-text-wrapper">
            <h1 className="hero-title">
              Encuentra tu próximo <br />
              <span className="text-gradient">gran espacio</span>
            </h1>
            <p className="hero-description">
              Explora las mejores propiedades en Santo Domingo, seleccionadas por su diseño y ubicación premium.
            </p>
          </div>

          {/* Quick Search Glass Panel directly in Hero */}
          <div className="search-panel glass-panel" style={{ marginTop: 'var(--space-2xl)', maxWidth: '800px' }}>
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Property Categories / Types */}
      <section className="categories-section container" style={{ paddingTop: 'var(--space-4xl)', paddingBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: 'var(--space-xl)', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
          ¿Qué estás buscando?
        </h2>
        <div className="categories-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-md)' }}>
          {[
            { label: 'Apartamentos', type: 'Apartamento' },
            { label: 'Casas', type: 'Casa' },
            { label: 'Penthouse', type: 'Penthouse' },
            { label: 'Locales Comerciales', type: 'Local Comercial' },
            { label: 'Solares', type: 'Terreno' }
          ].map((category) => (
            <Link
              href={`/properties?property_type=${encodeURIComponent(category.type)}`}
              key={category.label}
              className="category-pill glass-panel"
              style={{ textDecoration: 'none', textAlign: 'center', padding: 'var(--space-md)', borderRadius: 'var(--radius-full)', cursor: 'pointer', border: '1px solid var(--border-color)', transition: 'all 0.3s ease' }}
            >
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{category.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Explore by Zone Section */}
      <section className="zones-section container" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-2xl)' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: 'var(--space-xl)', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
          Zonas Exclusivas
        </h2>
        <div className="zones-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-lg)' }}>
          {['Piantini', 'Naco', 'Evaristo Morales', 'Bella Vista', 'Los Cacicazgos', 'Arroyo Hondo'].map((zone) => (
            <Link
              href={`/properties?location=${encodeURIComponent(zone)}`}
              key={zone}
              className="zone-card glass-panel"
              style={{ textDecoration: 'none', padding: 'var(--space-xl)', textAlign: 'center', cursor: 'pointer', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', transition: 'all 0.3s ease' }}
            >
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', margin: '0' }}>{zone}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--space-xs)' }}>Explorar zona →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="intro-section container" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-4xl)', background: 'transparent' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: 'var(--space-xl)', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
          Propiedades Destacadas
        </h2>

        {/* Dynamic Property Grid */}
        <div className="intro-gallery" style={{ height: 'auto' }}>
          {featuredProperties.map((property: Property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      </section>
    </div>
  );
}
