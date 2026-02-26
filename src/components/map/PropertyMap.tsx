'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Fix for default marker icon in Next.js
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface PropertyMapProps {
    latitude: number;
    longitude: number;
    title: string;
    showExact?: boolean;
}

export default function PropertyMap({ latitude, longitude, title, showExact = true }: PropertyMapProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="map-loading-skeleton" style={{ height: '400px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}></div>;

    return (
        <MapContainer
            center={[latitude, longitude]}
            zoom={showExact ? 15 : 14}
            scrollWheelZoom={false}
            style={{ height: '400px', width: '100%', borderRadius: 'var(--radius-md)', zIndex: 1 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {showExact ? (
                <Marker position={[latitude, longitude]} icon={icon}>
                    <Popup>
                        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>{title}</span>
                    </Popup>
                </Marker>
            ) : (
                <Circle
                    center={[latitude, longitude]}
                    pathOptions={{ color: 'var(--accent-primary)', fillColor: 'var(--accent-primary)', fillOpacity: 0.2 }}
                    radius={500}
                >
                    <Popup>
                        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>Ubicación aproximada: {title}</span>
                    </Popup>
                </Circle>
            )}
        </MapContainer>
    );
}
