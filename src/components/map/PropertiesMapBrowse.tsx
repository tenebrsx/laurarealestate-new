'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Property } from '@/types/property';
import { formatCurrency } from '@/utils/format';
import { BedDouble, Bath, Maximize, MapPin, ChevronRight } from 'lucide-react';
import PropertiesFilterWrapper from '@/components/properties/PropertiesFilterWrapper';
import './map-browse.css';

interface PropertiesMapBrowseProps {
    properties: Property[];
}

// Custom hook to handle programmatic flying/panning to active coordinates
function MapController({ activeProperty }: { activeProperty: Property | null }) {
    const map = useMap();
    useEffect(() => {
        if (activeProperty && activeProperty.latitude && activeProperty.longitude) {
            map.flyTo([activeProperty.latitude, activeProperty.longitude], 15, {
                animate: true,
                duration: 1.5
            });
        }
    }, [activeProperty, map]);
    return null;
}

export default function PropertiesMapBrowse({ properties }: PropertiesMapBrowseProps) {
    const [mounted, setMounted] = useState(false);
    const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
    const [activeProperty, setActiveProperty] = useState<Property | null>(null);
    
    // Store refs to programmatically open popups when sidebar cards are clicked
    const markerRefs = useRef<Record<string, L.Marker | null>>({});

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
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

    // Default center point (Santo Domingo roughly)
    const defaultCenter: [number, number] = [18.4861, -69.9312];

    const handleCardClick = (property: Property) => {
        setActiveProperty(property);
        // Safely open the Leaflet popup programmatically
        const markerRef = markerRefs.current[property.id];
        if (markerRef) {
            markerRef.openPopup();
        }
    };

    if (!mounted) return <div className="map-loading-full">Cargando mapa interactivo...</div>;

    return (
        <div className="map-browse-container">
            <div className="map-sidebar glass-panel">
                <div className="map-sidebar-header">
                    <span className="text-eyebrow text-gold">Laura Alba Real Estate</span>
                    <h1 className="sidebar-title">Propiedades</h1>
                    <p className="sidebar-subtitle">
                        {mappableProperties.length === 0 
                            ? 'No hay propiedades en este rango' 
                            : `Mostrando ${mappableProperties.length} en el mapa`}
                    </p>
                    <PropertiesFilterWrapper />
                </div>
                <div className="map-property-list">
                    {mappableProperties.map(property => {
                        const isHovered = hoveredPropertyId === property.id;
                        const isActive = activeProperty?.id === property.id;
                        
                        return (
                            <div 
                                key={property.id} 
                                className={`map-sidebar-card ${isActive ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
                                onMouseEnter={() => setHoveredPropertyId(property.id)}
                                onMouseLeave={() => setHoveredPropertyId(null)}
                                onClick={() => handleCardClick(property)}
                            >
                                <div className="card-img" style={{ backgroundImage: `url(${property.imageUrl})` }}>
                                    <div className="card-badge">
                                        {property.operationTypes && property.operationTypes.includes('sale') && property.operationTypes.includes('rental') ? (
                                            'Alq / Vta'
                                        ) : (
                                            property.operationType === 'rental' ? 'Alquiler' : 'Venta'
                                        )}
                                    </div>
                                </div>
                                <div className="card-info">
                                    <span className="card-category text-gold">{property.propertyType}</span>
                                    <h3>{property.title}</h3>
                                    
                                    {/* Location marker snippet */}
                                    {property.location && (
                                        <div className="card-location">
                                            <MapPin size={12} className="text-gold" />
                                            <span>{property.location}</span>
                                        </div>
                                    )}

                                    <p className="price">{formatCurrency(property.price, property.currency)}</p>
                                    
                                    {/* Premium Inline Metrics Ribbon */}
                                    <div className="card-metrics">
                                        {property.bedrooms && property.bedrooms > 0 ? (
                                            <div className="metric-item">
                                                <BedDouble size={14} className="text-gold" />
                                                <span>{property.bedrooms} hab</span>
                                            </div>
                                        ) : null}
                                        {property.bathrooms && property.bathrooms > 0 ? (
                                            <div className="metric-item">
                                                <Bath size={14} className="text-gold" />
                                                <span>{property.bathrooms} bañ</span>
                                            </div>
                                        ) : null}
                                        {property.area && property.area > 0 ? (
                                            <div className="metric-item">
                                                <Maximize size={14} className="text-gold" />
                                                <span>{property.area} m²</span>
                                            </div>
                                        ) : null}
                                    </div>

                                    {/* Glass Link Button */}
                                    <Link 
                                        href={`/properties/${property.id}`} 
                                        className="card-detail-btn text-gold"
                                        onClick={(e) => e.stopPropagation()} // Prevent card centering on button click
                                    >
                                        <span>Ver Propiedad</span>
                                        <ChevronRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="map-view-wrapper">
                <MapContainer
                    center={defaultCenter}
                    zoom={12}
                    scrollWheelZoom={true}
                    className="leaflet-full-map"
                >
                    {/* Use light_all tiles to match global forced light theme */}
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />

                    {/* Interactive Fly-To pan handler */}
                    <MapController activeProperty={activeProperty} />

                    {mappableProperties.map(property => {
                        const isHovered = hoveredPropertyId === property.id;
                        const isActive = activeProperty?.id === property.id;
                        const isHighlighted = isHovered || isActive;

                        const customIcon = L.divIcon({
                            className: `custom-price-marker ${isHighlighted ? 'active' : ''}`,
                            html: `<div class="price-bubble ${isHighlighted ? 'active' : ''}">${formatMapPrice(property.price, property.currency)}</div>`,
                            iconSize: [0, 0],
                            iconAnchor: [20, 10],
                        });

                        return (
                            <Marker
                                key={property.id}
                                position={[property.latitude!, property.longitude!]}
                                icon={customIcon}
                                ref={(ref) => {
                                    if (ref) {
                                        markerRefs.current[property.id] = ref;
                                    } else {
                                        delete markerRefs.current[property.id];
                                    }
                                }}
                                eventHandlers={{
                                    click: () => {
                                        setActiveProperty(property);
                                    }
                                }}
                            >
                                <Popup className="custom-popup">
                                    <div className="popup-card-wrapper">
                                        <div className="popup-img" style={{ backgroundImage: `url(${property.imageUrl})` }}>
                                            <div className="popup-badge">
                                                {property.operationType === 'rental' ? 'Alquiler' : 'Venta'}
                                            </div>
                                        </div>
                                        <div className="popup-content">
                                            <span className="text-eyebrow text-gold" style={{ fontSize: '0.65rem', letterSpacing: '0.05em', marginBottom: '2px', display: 'block' }}>
                                                {property.propertyType}
                                            </span>
                                            <h4 className="popup-title">{property.title}</h4>
                                            <p className="popup-price text-gold">{formatCurrency(property.price, property.currency)}</p>
                                            
                                            {/* Mini popup metrics */}
                                            <div className="popup-metrics">
                                                {property.bedrooms && property.bedrooms > 0 ? (
                                                    <span>{property.bedrooms} hab</span>
                                                ) : null}
                                                {property.bedrooms && property.bedrooms > 0 && property.bathrooms && property.bathrooms > 0 ? (
                                                    <span className="dot">•</span>
                                                ) : null}
                                                {property.bathrooms && property.bathrooms > 0 ? (
                                                    <span>{property.bathrooms} bañ</span>
                                                ) : null}
                                                {property.bathrooms && property.bathrooms > 0 && property.area && property.area > 0 ? (
                                                    <span className="dot">•</span>
                                                ) : null}
                                                {property.area && property.area > 0 ? (
                                                    <span>{property.area} m²</span>
                                                ) : null}
                                            </div>

                                            <Link href={`/properties/${property.id}`} className="popup-detail-link btn-gold">
                                                Ver Propiedad
                                            </Link>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
}
