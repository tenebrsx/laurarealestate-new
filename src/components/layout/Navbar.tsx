'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Search, X } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import FavoritesDrawer from '@/components/properties/FavoritesDrawer';
import './Navbar.css';

const PROVINCES = [
  'Santo Domingo',
  'Distrito Nacional',
  'La Altagracia (Punta Cana / Bávaro)',
  'Santiago',
  'Samaná',
  'Puerto Plata',
  'La Romana (Casa de Campo)',
  'Otras Ubicaciones'
];

const PROVINCE_SECTORS: Record<string, string[]> = {
  'Santo Domingo': [
    'Autopista de San Isidro',
    'El Higüero',
    'Hato Nuevo',
    'La Victoria',
    'Los Alcarrizos',
    'Pedro Brand',
    'Santo Domingo Norte',
    'Villa Mella'
  ],
  'Distrito Nacional': [
    'Altos de Arroyo Hondo II',
    'Arroyo Hondo',
    'Bella Vista',
    'Cuesta Hermosa II',
    'Cuesta Hermosa III',
    'El Millón',
    'El Vergel',
    'Ensanche Kennedy',
    'Ensanche La Fe',
    'Ensanche Naco',
    'Ensanche Paraiso',
    'Ensanche Serrallés',
    'Evaristo Morales',
    'Gazcue',
    'Isabel Villa',
    'Julieta Morales',
    'La Esperilla',
    'Los Pinos',
    'Los Prados',
    'Los próceres',
    'Mirador Sur',
    'Piantini',
    'Viejo Arroyo Hondo',
    'Zona Colonial',
    'Zona Industrial de Herrera'
  ],
  'La Altagracia (Punta Cana / Bávaro)': [
    'Cap Cana',
    'Uvero Alto'
  ],
  'Santiago': [
    'La Trinitaria',
    'Villa Olga',
    'Los Cerros de Gurabo'
  ],
  'Samaná': [
    'Cosón',
    'El Limon',
    'Playa Pescadores',
    'Santa Bárbara de Samaná',
    'balcones del atlántico'
  ],
  'Puerto Plata': [
    'Cabarete'
  ],
  'La Romana (Casa de Campo)': [
    'Casa de Campo'
  ],
  'Otras Ubicaciones': [
    'Bonao',
    'Buena Vista (Jarabacoa)',
    'Mata de Platano (Jarabacoa)',
    'Guayacanes (Juan Dolio)',
    'Palmar de Ocoa',
    'San Cristóbal'
  ]
};

const SALE_PRICES = [
  { value: '5000', label: 'USD 5,000' },
  { value: '10000', label: 'USD 10,000' },
  { value: '20000', label: 'USD 20,000' },
  { value: '30000', label: 'USD 30,000' },
  { value: '50000', label: 'USD 50,000' },
  { value: '75000', label: 'USD 75,000' },
  { value: '100000', label: 'USD 100,000' },
  { value: '150000', label: 'USD 150,000' },
  { value: '200000', label: 'USD 200,000' },
  { value: '250000', label: 'USD 250,000' },
  { value: '300000', label: 'USD 300,000' },
  { value: '350000', label: 'USD 350,000' },
  { value: '400000', label: 'USD 400,000' },
  { value: '450000', label: 'USD 450,000' },
  { value: '500000', label: 'USD 500,000' },
  { value: '600000', label: 'USD 600,000' },
  { value: '700000', label: 'USD 700,000' },
  { value: '800000', label: 'USD 800,000' },
  { value: '900000', label: 'USD 900,000' },
  { value: '1000000', label: 'USD 1,000,000' },
  { value: '1500000', label: 'USD 1,500,000' },
  { value: '2000000', label: 'USD 2,000,000' }
];

const RENTAL_PRICES = [
  { value: '500', label: 'USD 500' },
  { value: '800', label: 'USD 800' },
  { value: '1000', label: 'USD 1,000' },
  { value: '1200', label: 'USD 1,200' },
  { value: '1500', label: 'USD 1,500' },
  { value: '1800', label: 'USD 1,800' },
  { value: '2000', label: 'USD 2,000' },
  { value: '2500', label: 'USD 2,500' },
  { value: '3000', label: 'USD 3,000' },
  { value: '3500', label: 'USD 3,500' },
  { value: '4000', label: 'USD 4,000' },
  { value: '4500', label: 'USD 4,500' },
  { value: '5000', label: 'USD 5,000' },
  { value: '6000', label: 'USD 6,000' },
  { value: '7000', label: 'USD 7,000' },
  { value: '8000', label: 'USD 8,000' },
  { value: '10000', label: 'USD 10,000' },
  { value: '15000', label: 'USD 15,000' }
];

const PROPERTY_TYPES = ['Apartamento', 'Casa', 'Penthouse', 'Terreno', 'Local Comercial', 'Oficina', 'Villa'];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const { favorites } = useFavorites();
  const router = useRouter();

  // Search Modal Dialog States & Refs
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Form State
  const [searchQuery, setSearchQuery] = useState('');
  const [operationType, setOperationType] = useState('sale');
  const [propertyType, setPropertyType] = useState('');
  const [province, setProvince] = useState('');
  const [sector, setSector] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');

  // Dynamically swap prices based on Sale vs Rental
  const currentPrices = operationType === 'rental' ? RENTAL_PRICES : SALE_PRICES;

  const openSearchDialog = () => {
    setIsSearchDialogOpen(true);
    dialogRef.current?.showModal();
  };

  const closeSearchDialog = () => {
    dialogRef.current?.close();
    setIsSearchDialogOpen(false);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    // If the click occurs on the dialog itself (the backdrop layer), close it
    if (e.target === dialogRef.current) {
      closeSearchDialog();
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setOperationType('sale');
    setPropertyType('');
    setProvince('');
    setSector('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setBathrooms('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();

    // 1. Keyword search (the "option to simply just search")
    if (searchQuery.trim()) {
      queryParams.set('query', searchQuery.trim());
    }

    // 2. Base Filters
    if (propertyType) queryParams.set('property_type', propertyType);
    if (operationType) queryParams.set('operation_type', operationType);

    // 3. Location filtering (Sector has priority as it is more specific)
    if (sector) {
      queryParams.set('location', sector);
    } else if (province) {
      queryParams.set('location', province);
    }

    // 4. Advanced specifications
    if (minPrice) queryParams.set('min_price', minPrice);
    if (maxPrice) queryParams.set('max_price', maxPrice);
    if (minPrice || maxPrice) queryParams.set('currency', 'USD');
    if (bedrooms) queryParams.set('bedrooms', bedrooms);
    if (bathrooms) queryParams.set('bathrooms', bathrooms);

    router.push(`/properties?${queryParams.toString()}`);
    closeSearchDialog();
  };

  // Sync scroll class
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle native dialog element state sync (e.g. Esc button close)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleNativeClose = () => {
      setIsSearchDialogOpen(false);
    };

    dialog.addEventListener('close', handleNativeClose);
    return () => {
      dialog.removeEventListener('close', handleNativeClose);
    };
  }, []);

  // Prevent background scrolling when search dialog or mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen || isSearchDialogOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, isSearchDialogOpen]);

  const renderSectorOptions = () => {
    if (province) {
      const sectors = PROVINCE_SECTORS[province] || [];
      return (
        <>
          <option value="">Todos los sectores</option>
          {sectors.map(sec => (
            <option key={sec} value={sec}>{sec}</option>
          ))}
        </>
      );
    }

    // Render grouped grouped locations if no province selected yet
    return (
      <>
        <option value="">Selecciona una provincia primero</option>
        {Object.entries(PROVINCE_SECTORS).map(([provName, sectors]) => (
          <optgroup key={provName} label={provName}>
            {sectors.map(sec => (
              <option key={`${provName}-${sec}`} value={sec}>{sec}</option>
            ))}
          </optgroup>
        ))}
      </>
    );
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-content">
        <Link href="/" className="nav-logo">
          LAURA ALBA
        </Link>

        <div className="nav-links">
          <Link href="/" className="nav-link">Inicio</Link>
          <Link href="/properties" className="nav-link">Propiedades</Link>
          <Link href="/mapa" className="nav-link">Mapa</Link>
          <Link href="/about" className="nav-link">Nosotros</Link>
        </div>

        <div className="nav-actions">
          {/* Quick Search Button */}
          <button 
            className="nav-action-btn" 
            onClick={openSearchDialog}
            aria-label="Búsqueda avanzada de propiedades"
          >
            <Search size={20} />
          </button>

          <button 
            className="nav-action-btn" 
            onClick={() => setFavoritesOpen(true)}
            aria-label="Ver favoritos"
          >
            <Heart size={20} />
            {favorites.length > 0 && (
              <span className="nav-favorites-badge">{favorites.length}</span>
            )}
          </button>

          <Link href="/about" className="btn btn-primary btn-nav">Contactar</Link>

          <button
            className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <div className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-links">
          <Link href="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Inicio</Link>
          <Link href="/properties" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Propiedades</Link>
          <Link href="/mapa" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Mapa</Link>
          <Link href="/about" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Nosotros</Link>
          <button 
            className="mobile-nav-link" 
            onClick={() => {
              setMobileMenuOpen(false);
              setFavoritesOpen(true);
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}
          >
            Favoritos ({favorites.length})
          </button>
          <Link href="/about" className="btn btn-primary mobile-btn" onClick={() => setMobileMenuOpen(false)}>Contactar Agente</Link>
        </div>
      </div>

      <FavoritesDrawer isOpen={favoritesOpen} onClose={() => setFavoritesOpen(false)} />

      {/* Premium Quick Advanced Search Dialog Modal */}
      <dialog 
        ref={dialogRef} 
        className="quick-search-dialog" 
        onClick={handleBackdropClick}
        aria-labelledby="quick-search-title"
      >
        <div className="search-modal-content">
          <div className="search-modal-header">
            <h2 id="quick-search-title" className="search-modal-title">
              BÚSQUEDA <span className="text-accent">AVANZADA</span>
            </h2>
            <button 
              type="button" 
              className="search-modal-close" 
              onClick={closeSearchDialog}
              aria-label="Cerrar búsqueda"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="search-modal-form">
            {/* Simple Text Keyword Search - "the option to simply just search" */}
            <div className="search-field-primary">
              <div className="search-input-wrapper">
                <Search className="search-input-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="Buscar por palabra clave, zona o código..." 
                  className="search-primary-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Advanced Filters Layout */}
            <div className="search-filters-grid">
              
              {/* Operation Toggle Buttons */}
              <div className="search-filter-group col-span-2">
                <label className="filter-label">Operación</label>
                <div className="operation-toggle-group">
                  <button 
                    type="button"
                    className={`operation-toggle-btn ${operationType === 'sale' ? 'active' : ''}`}
                    onClick={() => {
                      setOperationType('sale');
                      setMinPrice('');
                      setMaxPrice('');
                    }}
                  >
                    Comprar
                  </button>
                  <button 
                    type="button"
                    className={`operation-toggle-btn ${operationType === 'rental' ? 'active' : ''}`}
                    onClick={() => {
                      setOperationType('rental');
                      setMinPrice('');
                      setMaxPrice('');
                    }}
                  >
                    Alquilar
                  </button>
                </div>
              </div>

              {/* Property Type Selector */}
              <div className="search-filter-group">
                <label htmlFor="modal-property-type" className="filter-label">Tipo de Propiedad</label>
                <select 
                  id="modal-property-type"
                  value={propertyType} 
                  onChange={(e) => setPropertyType(e.target.value)} 
                  className="modal-filter-select"
                >
                  <option value="">Todos los tipos</option>
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Province Selector */}
              <div className="search-filter-group">
                <label htmlFor="modal-province" className="filter-label">Provincia</label>
                <select 
                  id="modal-province"
                  value={province} 
                  onChange={(e) => {
                    setProvince(e.target.value);
                    setSector(''); // Reset sector
                  }} 
                  className="modal-filter-select"
                >
                  <option value="">Todas las provincias</option>
                  {PROVINCES.map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              {/* Sector Selector */}
              <div className="search-filter-group col-span-2">
                <label htmlFor="modal-sector" className="filter-label">Sector / Zona</label>
                <select 
                  id="modal-sector"
                  value={sector} 
                  onChange={(e) => setSector(e.target.value)} 
                  className="modal-filter-select"
                >
                  {renderSectorOptions()}
                </select>
              </div>

              {/* Price Ranges Selects */}
              <div className="search-filter-group">
                <label htmlFor="modal-min-price" className="filter-label">Precio Mínimo (USD)</label>
                <select 
                  id="modal-min-price"
                  value={minPrice} 
                  onChange={(e) => setMinPrice(e.target.value)} 
                  className="modal-filter-select"
                >
                  <option value="">Mínimo</option>
                  {currentPrices.map(price => (
                    <option key={`min-${price.value}`} value={price.value}>{price.label}</option>
                  ))}
                </select>
              </div>

              <div className="search-filter-group">
                <label htmlFor="modal-max-price" className="filter-label">Precio Máximo (USD)</label>
                <select 
                  id="modal-max-price"
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(e.target.value)} 
                  className="modal-filter-select"
                >
                  <option value="">Máximo</option>
                  {currentPrices.map(price => (
                    <option key={`max-${price.value}`} value={price.value}>{price.label}</option>
                  ))}
                </select>
              </div>

              {/* Bedrooms chips */}
              <div className="search-filter-group col-span-2">
                <label className="filter-label">Dormitorios</label>
                <div className="chips-row">
                  <button 
                    type="button"
                    className={`chip-btn ${bedrooms === '' ? 'active' : ''}`}
                    onClick={() => setBedrooms('')}
                  >
                    Cualquiera
                  </button>
                  {['1', '2', '3', '4', '5'].map(opt => (
                    <button 
                      key={`beds-${opt}`}
                      type="button"
                      className={`chip-btn ${bedrooms === opt ? 'active' : ''}`}
                      onClick={() => setBedrooms(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bathrooms chips */}
              <div className="search-filter-group col-span-2">
                <label className="filter-label">Baños</label>
                <div className="chips-row">
                  <button 
                    type="button"
                    className={`chip-btn ${bathrooms === '' ? 'active' : ''}`}
                    onClick={() => setBathrooms('')}
                  >
                    Cualquiera
                  </button>
                  {['1', '2', '3', '4', '5'].map(opt => (
                    <button 
                      key={`baths-${opt}`}
                      type="button"
                      className={`chip-btn ${bathrooms === opt ? 'active' : ''}`}
                      onClick={() => setBathrooms(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="search-modal-actions">
              <button 
                type="button" 
                className="btn-modal-clear" 
                onClick={handleClearFilters}
              >
                Limpiar Filtros
              </button>
              <button 
                type="submit" 
                className="btn btn-primary btn-modal-submit"
              >
                <Search size={16} style={{ marginRight: '8px' }} />
                Buscar Propiedades
              </button>
            </div>

          </form>
        </div>
      </dialog>
    </nav>
  );
}
