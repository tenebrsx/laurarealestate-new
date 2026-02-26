'use client';

import dynamic from 'next/dynamic';

const PropertiesMapBrowse = dynamic(
    () => import('./PropertiesMapBrowse'),
    {
        ssr: false,
        loading: () => <div style={{ height: 'calc(100vh - var(--nav-height))', width: '100%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Cargando mapa interactivo...</div>
    }
);

export default PropertiesMapBrowse;
