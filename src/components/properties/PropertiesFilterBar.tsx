'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, FormEvent } from 'react';
import '@/app/properties/properties.css';

export default function PropertiesFilterBar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from existing URL params if present
    const [propertyType, setPropertyType] = useState(searchParams.get('property_type') || '');
    const [operationType, setOperationType] = useState(searchParams.get('operation_type') || '');
    const [location, setLocation] = useState(searchParams.get('location') || '');

    const handleFilterSubmit = (e: FormEvent) => {
        e.preventDefault();

        const query = new URLSearchParams();
        // Reset to page 1 on new filter
        query.set('page', '1');

        if (propertyType) query.set('property_type', propertyType);
        if (operationType) query.set('operation_type', operationType);
        if (location.trim()) query.set('location', location.trim());

        router.push(`/properties?${query.toString()}`);
    };

    const handleClearFilters = () => {
        setPropertyType('');
        setOperationType('');
        setLocation('');
        router.push('/properties');
    };

    return (
        <form className="properties-filter-bar glass-panel animate-fade-in" onSubmit={handleFilterSubmit}>
            <div className="filter-group">
                <label htmlFor="operationType">Operación</label>
                <select
                    id="operationType"
                    className="filter-select"
                    value={operationType}
                    onChange={(e) => setOperationType(e.target.value)}
                >
                    <option value="">Todas</option>
                    <option value="sale">Venta</option>
                    <option value="rental">Alquiler</option>
                </select>
            </div>

            <div className="filter-group">
                <label htmlFor="propertyType">Tipo</label>
                <select
                    id="propertyType"
                    className="filter-select"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                >
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

            <div className="filter-group location-group">
                <label htmlFor="location">Zona / Ciudad</label>
                <input
                    id="location"
                    type="text"
                    placeholder="Ej: Piantini, Punta Cana..."
                    className="filter-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />
            </div>

            <div className="filter-actions">
                <button type="submit" className="btn-filter-apply">Aplicar Filtros</button>
                {(propertyType || operationType || location) && (
                    <button type="button" className="btn-filter-clear" onClick={handleClearFilters}>
                        Limpiar
                    </button>
                )}
            </div>
        </form>
    );
}
