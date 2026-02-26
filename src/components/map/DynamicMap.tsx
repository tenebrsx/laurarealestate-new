'use client';

import dynamic from 'next/dynamic';

// Dynamically import the Leaflet map with SSR disabled
// This is required because Leaflet relies heavily on the window object
const PropertyMap = dynamic(
    () => import('./PropertyMap'),
    {
        ssr: false,
        loading: () => <div style={{ height: '400px', width: '100%', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Cargando mapa...</div>
    }
);

export default PropertyMap;
