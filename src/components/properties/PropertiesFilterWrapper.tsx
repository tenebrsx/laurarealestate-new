'use client';

import { useState } from 'react';
import PropertiesFilterSidebar from './PropertiesFilterSidebar';
import { useSearchParams } from 'next/navigation';
import './PropertiesFilterWrapper.css';

export default function PropertiesFilterWrapper() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const searchParams = useSearchParams();

    // Count how many active filters we have
    let activeFiltersCount = 0;
    const trackedParams = [
        'property_type', 'location', 'operation_type',
        'min_price', 'max_price', 'bedrooms', 'bathrooms',
        'min_area', 'max_area'
    ];

    trackedParams.forEach(param => {
        if (searchParams.get(param)) activeFiltersCount++;
    });

    return (
        <div className="filter-wrapper-container">
            <button
                onClick={() => setIsFilterOpen(true)}
                className="btn-filter-trigger"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                Filtros Avanzados
                {activeFiltersCount > 0 && (
                    <span className="filter-badge">{activeFiltersCount}</span>
                )}
            </button>

            <PropertiesFilterSidebar
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
            />
        </div>
    );
}
