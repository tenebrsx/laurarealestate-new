import PropertyCard from '@/components/properties/PropertyCard';
import { getProperties } from '@/services/easybroker';
import { Property } from '@/types/property';
import './home.css';

export default async function Home() {
  // Fetch featured properties directly on the server
  const featuredProperties = await getProperties(6);
  return (
    <div className="home-wrapper container" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-4xl))' }}>

      {/* Quick Search Panel */}
      <div className="search-panel glass-panel" style={{ marginTop: 0, marginBottom: 'var(--space-4xl)', maxWidth: '100%' }}>
        <div className="search-inputs">
          <input type="text" placeholder="Search by City, Zip Code, Community Name" className="search-input" />
          <button className="btn-search">Find Property</button>
        </div>
      </div>

      {/* Featured Properties Section */}
      <section className="intro-section" style={{ paddingTop: 0, background: 'transparent' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2xl)', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
          Featured Listings
        </h1>

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
