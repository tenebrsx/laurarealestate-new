'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Property } from '@/types/property';
import './map-browse.css';

interface PropertiesMapBrowseProps {
    properties: Property[];
}

export default function PropertiesMapBrowse({ properties }: PropertiesMapBrowseProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const formatMapPrice = (price: number, currency: string) => {
        const symbol = currency === 'USD' ? 'US$' : 'RD$';
        if (price >= 1000000) {
            const m = price / 1000000;
            return `${symbol}${m % 1 === 0 ? m : m.toFixed(1)}m`;
        } else if (price >= 1000) {
            const k = price / 1000;
            return `${symbol}${k % 1 === 0 ? k : k.toFixed(1)}k`;
        }
        return `${symbol}${price}`;
    };

    // Filter properties that actually have coordinates
    const mappableProperties = properties.filter(p => p.latitude && p.longitude);

    // Default center point (Santo Domingo roughly if no properties, else average of first few)
    const defaultCenter: [number, number] = mappableProperties.length > 0
        ? [mappableProperties[0].latitude!, mappableProperties[0].longitude!]
        : [18.4861, -69.9312];

    if (!mounted) return <div className="map-loading-full">Cargando mapa interactivo...</div>;

    return (
        <div className="map-browse-container">
            <div className="map-sidebar">
                <div className="map-sidebar-header">
                    <h1 className="sidebar-title">Propiedades en Mapa</h1>
                    <p className="sidebar-subtitle">Mostrando {mappableProperties.length} propiedades</p>
                </div>
                <div className="map-property-list">
                    {mappableProperties.map(property => (
                        <Link href={`/properties/${property.id}`} key={property.id} className="map-sidebar-card">
                            <div className="card-img" style={{ backgroundImage: `url(${property.imageUrl})` }}></div>
                            <div className="card-info">
                                <h3>{property.title}</h3>
                                <p className="price">{new Intl.NumberFormat('en-US', { style: 'currency', currency: property.currency, maximumFractionDigits: 0 }).format(property.price)} {property.operationType === 'rental' ? '/mes' : ''}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="map-view-wrapper">
                <MapContainer
                    center={defaultCenter}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="leaflet-full-map"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />

                    {mappableProperties.map(property => {
                        const customIcon = L.divIcon({
                            className: 'custom-price-marker',
                            html: `<div class="price-bubble">${formatMapPrice(property.price, property.currency)}</div>`,
                            iconSize: [0, 0], // Sizing is handled by CSS
                            iconAnchor: [30, 15],
                        });

                        return (
                            <Marker
                                key={property.id}
                                position={[property.latitude!, property.longitude!]}
                                icon={customIcon}
                            >
                                <Popup className="custom-popup">
                                    <Link href={`/properties/${property.id}`} className="popup-link">
                                        <div className="popup-img" style={{ backgroundImage: `url(${property.imageUrl})` }}></div>
                                        <div className="popup-content">
                                            <span className="popup-tag">{property.operationType === 'rental' ? 'Alquiler' : 'Venta'}</span>
                                            <h4 className="popup-title">{property.title}</h4>
                                            <p className="popup-price">{new Intl.NumberFormat('en-US', { style: 'currency', currency: property.currency, maximumFractionDigits: 0 }).format(property.price)}</p>
                                        </div>
                                    </Link>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
}
