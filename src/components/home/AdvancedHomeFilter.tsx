'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import './AdvancedHomeFilter.css';

export default function AdvancedHomeFilter() {
    const router = useRouter();
    const [filters, setFilters] = useState({
        province: '',
        city_sector: '',
        property_type: '',
        operation_type: 'sale',
        min_price: '',
        max_price: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        
        const queryParams = new URLSearchParams();
        
        if (filters.province) queryParams.append('location', filters.province);
        if (filters.city_sector) queryParams.append('location', filters.city_sector);
        if (filters.property_type) queryParams.append('property_type', filters.property_type);
        if (filters.operation_type) queryParams.append('operation_type', filters.operation_type);
        if (filters.min_price) queryParams.append('min_price', filters.min_price);
        if (filters.max_price) queryParams.append('max_price', filters.max_price);

        const queryString = queryParams.toString();
        router.push(`/properties${queryString ? `?${queryString}` : ''}`);
    };

    const provinces = [
        'Santo Domingo', 'Distrito Nacional', 'La Altagracia (Punta Cana / Bávaro)', 
        'Santiago', 'Samaná', 'Puerto Plata', 'La Romana (Casa de Campo)'
    ];

    const propertyTypes = ['Apartamento', 'Casa', 'Penthouse', 'Terreno', 'Local Comercial'];

    return (
        <section className="advanced-filter-section animate-fade-in">
            <div className="advanced-filter-panel glass-panel">
                <form className="advanced-filter-form" onSubmit={handleSearch}>
                    
                    <div className="filter-group">
                        <label htmlFor="operation_type">Operación</label>
                        <select 
                            id="operation_type" 
                            name="operation_type" 
                            className="filter-select"
                            value={filters.operation_type}
                            onChange={handleChange}
                            suppressHydrationWarning
                        >
                            <option value="sale">Comprar</option>
                            <option value="rental">Alquilar</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="property_type">Tipo de Propiedad</label>
                        <select 
                            id="property_type" 
                            name="property_type" 
                            className="filter-select"
                            value={filters.property_type}
                            onChange={handleChange}
                            suppressHydrationWarning
                        >
                            <option value="">Todas</option>
                            {propertyTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="province">Provincia / Región</label>
                        <select 
                            id="province" 
                            name="province" 
                            className="filter-select"
                            value={filters.province}
                            onChange={handleChange}
                            suppressHydrationWarning
                        >
                            <option value="">Todas</option>
                            {provinces.map(prov => (
                                <option key={prov} value={prov}>{prov}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="city_sector">Ciudad / Sector</label>
                        <input 
                            type="text"
                            id="city_sector"
                            name="city_sector"
                            placeholder="Ej. Piantini, Naco..."
                            className="filter-input"
                            value={filters.city_sector}
                            onChange={handleChange}
                            suppressHydrationWarning
                        />
                    </div>

                    <div className="filter-group price-group">
                        <label>Rango de Precio (USD)</label>
                        <div className="price-inputs">
                            <input 
                                type="number" 
                                name="min_price" 
                                placeholder="Min" 
                                className="filter-input min-input"
                                value={filters.min_price}
                                onChange={handleChange}
                                min="0"
                                suppressHydrationWarning
                            />
                            <span className="price-separator">-</span>
                            <input 
                                type="number" 
                                name="max_price" 
                                placeholder="Max" 
                                className="filter-input max-input"
                                value={filters.max_price}
                                onChange={handleChange}
                                min="0"
                                suppressHydrationWarning
                            />
                        </div>
                    </div>

                    <div className="filter-submit-group">
                         <button type="submit" className="btn-advanced-search">
                            <span>Buscar</span> <Search size={18} />
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
