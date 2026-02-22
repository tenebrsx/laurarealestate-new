import PropertyCard from '@/components/properties/PropertyCard';
import { getProperties } from '@/services/easybroker';
import { Property } from '@/types/property';
import './home.css';

export default async function Home() {
  // Fetch featured properties directly on the server
  const featuredProperties = await getProperties(3);
  return (
    <div className="home-wrapper">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container hero-content animate-fade-in">
          <div className="hero-text-wrapper">
            <span className="hero-subtitle">[ WELCOME TO LAURA ALBA ]</span>
            <h1 className="hero-title">
              Find Your Next <br />
              <span className="text-gradient">Great Space</span>
            </h1>
            <p className="hero-description">
              Premium properties for rent or sale — managed with professionalism and absolute care.
            </p>
            <div className="hero-actions">
              <button className="btn-primary">Browse Properties</button>
            </div>
          </div>

          {/* Quick Search Glass Panel */}
          <div className="search-panel glass-panel">
            <div className="search-inputs">
              <input type="text" placeholder="Search by City, Zip Code, Community Name" className="search-input" />
              <button className="btn-search">Find Home</button>
            </div>

            <div className="agent-quick-contact">
              <div className="agent-avatar">
                {/* Placeholder for agent image */}
                <div className="avatar-placeholder">LA</div>
              </div>
              <span className="agent-text">Talk to Laura Alba</span>
              <span className="arrow-icon">→</span>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="intro-section container">
        <div className="intro-header">
          <span className="section-subtitle">[ ABOUT LAURA ALBA ]</span>
          <h2 className="section-title">
            More than a property manager — a <span className="text-gradient">space matchmaker</span>.
            Helping clients find places they love.
          </h2>
          <button className="btn-outline">More About Us</button>
        </div>

        {/* Dynamic Property Grid */}
        <div className="intro-gallery">
          {featuredProperties.map((property: Property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      </section>
    </div>
  );
}
