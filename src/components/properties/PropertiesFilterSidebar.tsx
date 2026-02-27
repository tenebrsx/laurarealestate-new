import { useRouter, useSearchParams } from 'next/navigation';
import { useState, FormEvent, useEffect } from 'react';
import './PropertiesFilterSidebar.css';

interface PropertiesFilterSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PropertiesFilterSidebar({ isOpen, onClose }: PropertiesFilterSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Base Filters
    const [propertyType, setPropertyType] = useState(searchParams.get('property_type') || '');
    const [operationType, setOperationType] = useState(searchParams.get('operation_type') || '');
    const [location, setLocation] = useState(searchParams.get('location') || '');

    // Advanced Filters
    const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
    const [currency, setCurrency] = useState(searchParams.get('currency') || 'USD');
    const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
    const [bathrooms, setBathrooms] = useState(searchParams.get('bathrooms') || '');
    const [minArea, setMinArea] = useState(searchParams.get('min_area') || '');
    const [maxArea, setMaxArea] = useState(searchParams.get('max_area') || '');

    // UI Accordion States
    const [openSections, setOpenSections] = useState({
        price: true,
        bedrooms: false,
        bathrooms: false,
        area: false
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleFilterSubmit = (e: FormEvent) => {
        e.preventDefault();

        const query = new URLSearchParams();
        query.set('page', '1'); // Reset to page 1 on new filter

        // Base Filters
        if (propertyType) query.set('property_type', propertyType);
        if (operationType) query.set('operation_type', operationType);
        if (location.trim()) query.set('location', location.trim());

        // Advanced Filters
        if (minPrice) query.set('min_price', minPrice);
        if (maxPrice) query.set('max_price', maxPrice);
        if (minPrice || maxPrice) query.set('currency', currency);
        if (bedrooms) query.set('bedrooms', bedrooms);
        if (bathrooms) query.set('bathrooms', bathrooms);
        if (minArea) query.set('min_area', minArea);
        if (maxArea) query.set('max_area', maxArea);

        router.push(`/properties?${query.toString()}`);
        onClose();
    };

    const handleClearFilters = () => {
        setPropertyType('');
        setOperationType('');
        setLocation('');
        setMinPrice('');
        setMaxPrice('');
        setCurrency('USD');
        setBedrooms('');
        setBathrooms('');
        setMinArea('');
        setMaxArea('');
        router.push('/properties');
        onClose();
    };

    if (!isOpen) return null;

    // Helper functions for options
    const roomOptions = ['1', '2', '3', '4', '5', '6+'];

    return (
        <div className="filter-sidebar-overlay" onClick={onClose}>
            <div className="filter-sidebar-content" onClick={e => e.stopPropagation()}>
                <div className="filter-sidebar-header">
                    <h2>Filtros</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="filter-sidebar-scroll">
                    <form id="filter-form" onSubmit={handleFilterSubmit}>

                        {/* Dynamic Location Tags */}
                        {location && (
                            <div className="active-tag-group">
                                <span className="active-tag">
                                    {location}
                                    <button type="button" onClick={() => setLocation('')}>×</button>
                                </span>
                            </div>
                        )}

                        <div className="filter-form-base">
                            <div className="filter-input-group">
                                <label>Zona / Ciudad</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Piantini, Punta Cana..."
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="advanced-input"
                                />
                            </div>

                            <div className="filter-input-group">
                                <label>Operación</label>
                                <select value={operationType} onChange={(e) => setOperationType(e.target.value)} className="advanced-select">
                                    <option value="">Todas</option>
                                    <option value="sale">Venta</option>
                                    <option value="rental">Alquiler</option>
                                </select>
                            </div>

                            <div className="filter-input-group">
                                <label>Tipo de Propiedad</label>
                                <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="advanced-select">
                                    <option value="">Todos</option>
                                    <option value="Apartamento">Apartamento</option>
                                    <option value="Casa">Casa</option>
                                    <option value="Penthouse">Penthouse</option>
                                    <option value="Local Comercial">Local Comercial</option>
                                    <option value="Oficina">Oficina</option>
                                    <option value="Terreno">Solar / Terreno</option>
                                    <option value="Villa">Villa</option>
                                </select>
                            </div>
                        </div>

                        {/* Expandable Sections */}
                        <div className="filter-accordion">
                            {/* Price Section */}
                            <div className="accordion-item">
                                <div className="accordion-header" onClick={() => toggleSection('price')}>
                                    <h3>Precio</h3>
                                    <span className={`accordion-icon ${openSections.price ? 'open' : ''}`}>&#8964;</span>
                                </div>
                                {openSections.price && (
                                    <div className="accordion-body">
                                        <div className="range-inputs">
                                            <input type="number" placeholder="Mínimo" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="advanced-input" />
                                            <input type="number" placeholder="Máximo" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="advanced-input" />
                                        </div>
                                        <select value={currency} onChange={e => setCurrency(e.target.value)} className="advanced-select mt-sm">
                                            <option value="USD">Dólar estadounidense (USD)</option>
                                            <option value="DOP">Peso dominicano (DOP)</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Bedrooms Section */}
                            <div className="accordion-item">
                                <div className="accordion-header" onClick={() => toggleSection('bedrooms')}>
                                    <h3>Dormitorios</h3>
                                    <span className={`accordion-icon ${openSections.bedrooms ? 'open' : ''}`}>&#8964;</span>
                                </div>
                                {openSections.bedrooms && (
                                    <div className="accordion-body">
                                        <div className="chips-grid">
                                            {roomOptions.map(opt => (
                                                <button
                                                    key={opt} type="button"
                                                    className={`filter-chip ${bedrooms === opt.replace('+', '') ? 'active' : ''}`}
                                                    onClick={() => setBedrooms(opt.replace('+', ''))}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bathrooms Section */}
                            <div className="accordion-item">
                                <div className="accordion-header" onClick={() => toggleSection('bathrooms')}>
                                    <h3>Baños</h3>
                                    <span className={`accordion-icon ${openSections.bathrooms ? 'open' : ''}`}>&#8964;</span>
                                </div>
                                {openSections.bathrooms && (
                                    <div className="accordion-body">
                                        <div className="chips-grid">
                                            {roomOptions.map(opt => (
                                                <button
                                                    key={opt} type="button"
                                                    className={`filter-chip ${bathrooms === opt.replace('+', '') ? 'active' : ''}`}
                                                    onClick={() => setBathrooms(opt.replace('+', ''))}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Area Section */}
                            <div className="accordion-item">
                                <div className="accordion-header" onClick={() => toggleSection('area')}>
                                    <h3>Superficie (m²)</h3>
                                    <span className={`accordion-icon ${openSections.area ? 'open' : ''}`}>&#8964;</span>
                                </div>
                                {openSections.area && (
                                    <div className="accordion-body">
                                        <div className="range-inputs">
                                            <input type="number" placeholder="Mínimo" value={minArea} onChange={e => setMinArea(e.target.value)} className="advanced-input" />
                                            <input type="number" placeholder="Máximo" value={maxArea} onChange={e => setMaxArea(e.target.value)} className="advanced-input" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </form>
                </div>

                <div className="filter-sidebar-footer">
                    <button type="button" className="btn-sidebar-clear" onClick={handleClearFilters}>Limpiar todo</button>
                    <button type="submit" form="filter-form" className="btn-sidebar-apply">Aplicar</button>
                </div>
            </div>
        </div>
    );
}
