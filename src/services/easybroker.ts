import { Property } from "@/types/property";
import { getOverridesStore, PropertyOverride } from "./overrides";

export interface EasyBrokerImage {
    url: string;
}

export interface EasyBrokerProperty {
    public_id: string;
    title: string;
    location: {
        name: string;
        latitude?: number;
        longitude?: number;
        street?: string;
        postal_code?: string;
        show_exact_location?: boolean;
        hide_exact_location?: boolean;
        exterior_number?: string;
        interior_number?: string;
    };
    operations: {
        type: string;
        amount: number;
        currency: string;
        formatted_amount?: string;
        unit?: string;
    }[];
    bedrooms: number | null;
    bathrooms: number | null;
    parking_spaces: number | null;
    property_type: string;
    construction_size: number | null;
    lot_size?: number | null;
    title_image_full: string;
    images?: EasyBrokerImage[];
    description?: string;
}

// Programmatically cleans and normalizes title casing and redundant transaction tags
export function cleanPropertyTitle(title: string): string {
    if (!title) return '';

    let cleaned = title.trim();

    // 1. Detect if entire title is all-caps: "APARTAMENTO EN NACO" -> Title Case: "Apartamento En Naco"
    if (cleaned === cleaned.toUpperCase()) {
        cleaned = cleaned.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    }

    // 2. Remove redundant transaction action prefixes at the start (e.g., "Vendo", "Alquilo", "En venta")
    // This matches leading keywords including combinations like "Alquiler o Venta", "Vendo o Alquilo", "O Venta", "O Alquiler"
    const prefixRegex = /^(alquiler\s*y\s*venta|venta\s*y\s*alquiler|alquiler\s*o\s*venta|venta\s*o\s*alquiler|vendo\s*y\s*alquilo|vendo\s*y\s*rento|vendo\s*\/\s*alquilo|vendo|alquilo|se\s+vende|se\s+alquila|en\s+venta|alquiler\s+de|alquiler|o\s+venta|o\s+alquiler)\s*(?:en\s+|el\s+|la\s+|un\s+|una\s+|de\s+)?/i;
    cleaned = cleaned.replace(prefixRegex, '');

    // 3. Clean up any leftover leading punctuation or spaces (e.g. " ! Oficina" -> "Oficina")
    cleaned = cleaned.replace(/^[\s!¡\-·•\/\\]+/, '');

    // 4. Ensure the title starts with a capital letter
    if (cleaned.length > 0) {
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }

    // 5. Normalize any individual words in all-caps (e.g. "PIANTINI" -> "Piantini", "NACO" -> "Naco")
    // Keep common abbreviations or acronyms intact (USD, PH, etc.)
    cleaned = cleaned.replace(/\b([A-Z]{3,})\b/g, (match) => {
        const acronyms = ['USD', 'RD$', 'CRM', 'USA', 'PH', 'Apto', 'Apartamento'];
        if (acronyms.includes(match)) return match;
        return match.charAt(0) + match.slice(1).toLowerCase();
    });

    // 6. Fallback in case of over-stripping
    if (cleaned.length < 5) {
        return title;
    }

    return cleaned;
}

// Helper to extract square meters/area from property title or description
export function extractAreaFromText(title: string, description: string): number {
    const texts = [title, description];
    
    const areaRegex = /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:m²|mt²|mts²|(?:m2|mt2|mts2|metros\s+cuadrados|metros|mts|mt|mtrs)\b)/i;

    for (const text of texts) {
        if (!text) continue;
        
        // Remove accents to match robustly (e.g. á -> a, ² is kept or matched in regex)
        const normalizedText = text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
            
        const match = normalizedText.match(areaRegex);
        if (match) {
            const numStr = match[1].replace(/,/g, '');
            const value = parseFloat(numStr);
            if (!isNaN(value) && value > 0) {
                return value;
            }
        }
    }
    
    return 0;
}

// Helper to extract bedrooms from property title or description
export function extractBedroomsFromText(title: string, description: string): number {
    const texts = [title, description];
    // Match numbers followed by variations of habitaciones, habs, hab, dormitorios, dorms
    const regex = /(\d+(?:\.5)?)\s*(?:habitaciones|habitacion|habs\b|hab\b|dormitorios|dormitorio|dorms\b|dorm\b)/i;

    for (const text of texts) {
        if (!text) continue;
        const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const match = normalized.match(regex);
        if (match) {
            const val = parseFloat(match[1]);
            if (!isNaN(val) && val > 0) return Math.floor(val);
        }
    }
    return 0;
}

// Helper to extract bathrooms from property title or description
export function extractBathroomsFromText(title: string, description: string): number {
    const texts = [title, description];
    
    // Pattern 1: Explicit decimal (e.g. 2.5 baños)
    const decimalRegex = /(\d+\.5)\s*(?:banos|bano|banos\s+completos|b\b)/i;
    // Pattern 2: X y medio baños (e.g. 2 y medio baños)
    const yMedioRegex = /(\d+)\s*(?:y\s+medio)\s*(?:banos|bano|b\b)/i;
    // Pattern 3: X baños y medio (e.g. 2 baños y medio)
    const banosYMedioRegex = /(\d+)\s*(?:banos|bano|b\b)\s+y\s+medio/i;
    // Pattern 4: Simple integer count (e.g. 2 baños)
    const integerRegex = /(\d+)\s*(?:banos|bano|banos\s+completos|b\b)/i;
    // Pattern 5: Omitted integer but half bathroom mentioned (e.g. 1/2 baño, medio baño, baño de visitas)
    const halfOnlyRegex = /(?:1\/2\s*bano|medio\s*bano|bano\s*de\s*visitas|bano\s*de\s*visita)/i;

    for (const text of texts) {
        if (!text) continue;
        const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Try decimal first
        const decMatch = normalized.match(decimalRegex);
        if (decMatch) {
            const val = parseFloat(decMatch[1]);
            if (!isNaN(val) && val > 0) return val;
        }

        // Try X y medio
        const ymMatch = normalized.match(yMedioRegex);
        if (ymMatch) {
            const val = parseInt(ymMatch[1]);
            if (!isNaN(val) && val > 0) return val + 0.5;
        }

        // Try X baños y medio
        const bymMatch = normalized.match(banosYMedioRegex);
        if (bymMatch) {
            const val = parseInt(bymMatch[1]);
            if (!isNaN(val) && val > 0) return val + 0.5;
        }

        // Try integer
        const intMatch = normalized.match(integerRegex);
        if (intMatch) {
            const val = parseFloat(intMatch[1]);
            if (!isNaN(val) && val > 0) return val;
        }

        // Try half only
        if (halfOnlyRegex.test(normalized)) {
            return 0.5;
        }
    }
    return 0;
}

// Helper to extract parking spaces from property title or description
export function extractParkingFromText(title: string, description: string): number {
    const texts = [title, description];
    // Match numbers followed by variations of parqueos, parqueo, estacionamientos, estacionamiento, parq, garajes, garaje
    const regex = /(\d+)\s*(?:parqueos|parqueo|estacionamientos|estacionamiento|parq\b|garajes|garaje)/i;

    for (const text of texts) {
        if (!text) continue;
        const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const match = normalized.match(regex);
        if (match) {
            const val = parseInt(match[1]);
            if (!isNaN(val) && val > 0) return val;
        }
    }
    return 0;
}

interface AmenityRule {
    id: string;
    label: string;
    regex: RegExp;
}

export const AMENITY_RULES: AmenityRule[] = [
    { id: 'terraza', label: 'Terraza / Área Social', regex: /(?:terraza|area\s+social|sociales|rooftop|roof\s+top)/i },
    { id: 'piscina', label: 'Piscina / Jacuzzi', regex: /(?:piscina|alberca|jacuzzi|picuzzi|pool)/i },
    { id: 'estudio', label: 'Estudio / Estar Familiar', regex: /(?:estudio|estar\s+familiar|estar\s+de\s+tv|family\s+room|family\s+estar|sala\s+de\s+estar)/i },
    { id: 'balcon', label: 'Balcón', regex: /(?:balcon)/i },
    { id: 'gimnasio', label: 'Gimnasio', regex: /(?:gimnasio|gym)/i },
    { id: 'planta', label: 'Planta Eléctrica Full', regex: /(?:planta\s+electrica|planta\s+full|planta\s+de\s+emergencia|generador\s+electrico|planta\s+de\s+luz)/i },
    { id: 'seguridad', label: 'Seguridad 24/7', regex: /(?:seguridad\s+24|vigilancia\s+24|camaras\s+de\s+seguridad|control\s+de\s+acceso|porton\s+electrico|seguridad\s+privada|guardian|vigilancia)/i },
    { id: 'ascensor', label: 'Ascensor', regex: /(?:ascensor|elevador)/i },
    { id: 'servicio', label: 'Cuarto de Servicio', regex: /(?:cuarto\s+de\s+servicio|habitacion\s+de\s+servicio|c\/s|cuarto\s+de\s+empleada|area\s+de\s+servicio|hab\s+de\s+servicio)/i },
    { id: 'locker', label: 'Locker / Depósito', regex: /(?:locker|deposito|almacenamiento|maletero)/i },
    { id: 'lobby', label: 'Lobby Climatizado', regex: /(?:lobby|recepcion)/i },
    { id: 'closet', label: 'Walk-in Closet', regex: /(?:walk-in\s+closet|walk\s+in\s+closet|w\/c|vestidor|closet\s+de\s+pared)/i },
    { id: 'madera', label: 'Terminación en Roble / Caoba', regex: /(?:madera\s+preciosa|maderas\s+preciosas|roble|caoba|madera\s+importada)/i },
    { id: 'cocina', label: 'Cocina Modular / Fría', regex: /(?:cocina\s+fria|cocina\s+caliente|cocina\s+modular|cocina\s+equipada|desayunador)/i },
    { id: 'agua', label: 'Cisterna / Pozo', regex: /(?:cisterna|pozo|pozo\s+tubular|bomba\s+de\s+agua)/i },
];

export function extractAmenitiesFromText(description: string): string[] {
    if (!description) return [];
    
    // Normalize accents to match robustly
    const normalized = description
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const matched: string[] = [];
    for (const rule of AMENITY_RULES) {
        if (rule.regex.test(normalized)) {
            matched.push(rule.label);
        }
    }
    return matched;
}


// Maps EasyBroker response to our localized PropertyCard interface
export function mapPropertyData(data: EasyBrokerProperty, preferredOperation?: 'sale' | 'rental', override?: PropertyOverride) {
    // Select preferred operation or default to first
    let mainOperation = data.operations?.[0];
    if (preferredOperation && data.operations) {
        const matched = data.operations.find(op => op.type === preferredOperation);
        if (matched) mainOperation = matched;
    }

    const operationTypes = data.operations?.map(op => op.type === 'rental' ? 'rental' : 'sale') || [];

    // EasyBroker API often caches `title_image_full` and ignores manual CRM re-ordering.
    // By extracting the explicitly ordered `images` array first, we bypass the cache and guarantee
    // the client's drag-and-drop placement is perfectly respected as the hero cover.
    const explicitImages = data.images || (data as unknown as Record<string, unknown>).property_images as EasyBrokerImage[] | undefined || [];
    const canonicalCover = explicitImages.length > 0 ? explicitImages[0].url : data.title_image_full;

    const baseTitle = cleanPropertyTitle(data.title);

    // Dynamic fallback chain for property area
    let area = override?.area ?? (data.construction_size || data.lot_size || 0);
    if (!area) {
        area = extractAreaFromText(data.title, data.description || '');
    }

    // Dynamic fallback chain for property bedrooms
    let bedrooms = override?.bedrooms ?? (data.bedrooms || 0);
    const parsedBedrooms = extractBedroomsFromText(data.title, data.description || '');
    if (parsedBedrooms > bedrooms) {
        bedrooms = parsedBedrooms;
    } else if (!bedrooms) {
        bedrooms = parsedBedrooms;
    }

    // Dynamic fallback chain for property bathrooms
    let bathrooms = override?.bathrooms ?? (data.bathrooms || 0);
    const parsedBathrooms = extractBathroomsFromText(data.title, data.description || '');
    if (parsedBathrooms > bathrooms) {
        bathrooms = parsedBathrooms;
    } else if (!bathrooms) {
        bathrooms = parsedBathrooms;
    }

    // Dynamic fallback chain for property parking
    let parking = data.parking_spaces || 0;
    const parsedParking = extractParkingFromText(data.title, data.description || '');
    if (parsedParking > parking) {
        parking = parsedParking;
    } else if (!parking) {
        parking = parsedParking;
    }

    const descriptionText = override?.description || data.description || '';
    const amenities = extractAmenitiesFromText(descriptionText);

    return {
        id: data.public_id,
        title: override?.title || baseTitle,
        location: typeof data.location === 'object' ? (data.location?.name || 'Ubicación no disponible') : (data.location || 'Ubicación no disponible'),
        price: override?.price ?? (mainOperation ? mainOperation.amount : 0),
        currency: override?.currency || (mainOperation ? mainOperation.currency : 'USD'),
        formattedPrice: mainOperation?.formatted_amount || '',
        priceUnit: mainOperation?.unit || 'total',
        operationType: override?.operationType || ((mainOperation?.type === 'rental' ? 'rental' : 'sale') as 'sale' | 'rental'),
        operationTypes,
        propertyType: override?.propertyType || data.property_type || 'Propiedad',
        latitude: typeof data.location === 'object' ? data.location?.latitude : undefined,
        longitude: typeof data.location === 'object' ? data.location?.longitude : undefined,
        bedrooms,
        bathrooms,
        parking,
        area,
        imageUrl: (override?.images && override.images.length > 0) ? override.images[0] : (canonicalCover || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80'),
        description: descriptionText,
        images: override?.images || explicitImages.map((img: { url: string }) => img.url),
        amenities
    };
}

export interface FilterParams {
    property_type?: string;
    location?: string;
    min_price?: number;
    max_price?: number;
    currency?: string;
    operation_type?: 'sale' | 'rental';
    bedrooms?: string;
    bathrooms?: string;
    min_area?: string;
    max_area?: string;
    query?: string;
    onlyOverridden?: boolean;
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delayMs = 1000): Promise<Response> {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url, options);
            if (res.ok) {
                return res;
            }
            if (res.status !== 429 && res.status !== 503) {
                return res;
            }
            console.warn(`EasyBroker API returned ${res.status} for ${url}. Retrying in ${delayMs}ms... (Attempt ${i + 1}/${retries})`);
        } catch (error) {
            if (i === retries - 1) throw error;
            console.warn(`EasyBroker API request failed for ${url}: ${error}. Retrying in ${delayMs}ms... (Attempt ${i + 1}/${retries})`);
        }
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2;
    }
    return fetch(url, options);
}

// Fetches all published properties from EasyBroker in parallel and caches the consolidated list.
export async function getAllProperties(): Promise<Property[]> {
    const apiKey = process.env.EASYBROKER_API_KEY;

    if (!apiKey) {
        console.warn("No EASYBROKER_API_KEY found. Returning empty list.");
        return [];
    }

    try {
        const limit = 50; // Max allowed by EasyBroker API to minimize requests
        
        // 1. Fetch first page to get pagination info (specifically total count)
        const firstPageUrl = `https://api.easybroker.com/v1/properties?page=1&limit=${limit}&search[statuses][]=published`;
        
        const firstPageRes = await fetchWithRetry(firstPageUrl, {
            headers: {
                'X-Authorization': apiKey,
                'Content-Type': 'application/json',
            },
            next: { tags: ['properties'], revalidate: 300 } // Cache for 5 minutes (300s)
        });

        if (!firstPageRes.ok) {
            throw new Error(`EasyBroker API page 1 failed with status: ${firstPageRes.status}`);
        }

        const firstPageJson = await firstPageRes.json();
        const firstPageContent: EasyBrokerProperty[] = firstPageJson.content || [];
        
        const total = firstPageJson.pagination?.total || firstPageContent.length;
        const totalPages = Math.ceil(total / limit);

        let allRawProperties = [...firstPageContent];

        // 2. Fetch subsequent pages in parallel
        if (totalPages > 1) {
            const fetchPromises = [];
            for (let p = 2; p <= totalPages; p++) {
                const url = `https://api.easybroker.com/v1/properties?page=${p}&limit=${limit}&search[statuses][]=published`;
                fetchPromises.push(
                    fetchWithRetry(url, {
                        headers: {
                            'X-Authorization': apiKey,
                            'Content-Type': 'application/json',
                        },
                        next: { tags: ['properties'], revalidate: 300 }
                    }).then(async (res) => {
                        if (!res.ok) {
                            console.error(`EasyBroker API page ${p} failed with status: ${res.status}`);
                            return [];
                        }
                        const json = await res.json();
                        return (json.content as EasyBrokerProperty[]) || [];
                    }).catch(err => {
                        console.error(`Error fetching page ${p} of EasyBroker properties:`, err);
                        return [];
                    })
                );
            }

            const additionalPages = await Promise.all(fetchPromises);
            for (const pageContent of additionalPages) {
                allRawProperties = allRawProperties.concat(pageContent);
            }
        }

        // 3. Map properties data (incorporating manual overrides)
        const overrides = await getOverridesStore();
        const mappedProperties = allRawProperties.map((prop) =>
            mapPropertyData(prop, undefined, overrides[prop.public_id])
        );

        // 4. De-duplicate properties with identical key specifications to clean the catalog
        const seenSignatures = new Set<string>();
        const uniqueProperties: Property[] = [];

        for (const prop of mappedProperties) {
            // Generate a signature combining normalized title, area, bedrooms, bathrooms, and price
            const normTitle = prop.title.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
            const signature = `${normTitle}_${prop.area}_${prop.bedrooms}_${prop.bathrooms}_${prop.price}_${prop.location.toLowerCase().trim()}`;

            if (!seenSignatures.has(signature)) {
                seenSignatures.add(signature);
                uniqueProperties.push(prop);
            } else {
                console.log(`[DEDUPLICATE] Removing duplicate CRM listing: "${prop.title}" (${prop.id})`);
            }
        }

        return uniqueProperties;
    } catch (error) {
        console.error("Error fetching all EasyBroker properties:", error);
        return []; // Fallback to empty list on overall failure
    }
}

const USD_TO_DOP = 60;

export function convertPrice(amount: number, from: string, to: string): number {
    const f = from?.toUpperCase() || 'USD';
    const t = to?.toUpperCase() || 'USD';
    if (f === t) return amount;
    if (f === 'USD' && t === 'DOP') return amount * USD_TO_DOP;
    if (f === 'DOP' && t === 'USD') return amount / USD_TO_DOP;
    return amount;
}

export async function getProperties(limit = 20, page = 1, filters?: FilterParams) {
    try {
        let properties = await getAllProperties();

        // Programmatic filtering over the ENTIRE consolidated catalog
        if (filters) {
            if (filters.onlyOverridden) {
                const overrides = await getOverridesStore();
                properties = properties.filter((p: Property) => !!overrides[p.id]);
            }

            // General Query Search (Searches title, location, propertyType, description)
            if (filters.query) {
                const q = filters.query.toLowerCase().trim();
                properties = properties.filter((p: Property) =>
                    p.title.toLowerCase().includes(q) ||
                    p.location.toLowerCase().includes(q) ||
                    p.propertyType.toLowerCase().includes(q) ||
                    (p.description && p.description.toLowerCase().includes(q))
                );
            }

            // Location Substring Hardening
            if (filters.location) {
                const locQuery = filters.location.toLowerCase().trim();
                properties = properties.filter((p: Property) =>
                    p.location.toLowerCase().includes(locQuery)
                );
            }

            // Operation Type Filtering
            if (filters.operation_type) {
                properties = properties.filter((p: Property) =>
                    p.operationType === filters.operation_type
                );
            }

            // Property Type Filtering
            if (filters.property_type) {
                const pType = filters.property_type.toLowerCase();
                properties = properties.filter((p: Property) =>
                    p.propertyType.toLowerCase() === pType
                );
            }

            // Min Price
            if (filters.min_price) {
                const minP = Number(filters.min_price);
                const filterCurrency = filters.currency || 'USD';
                properties = properties.filter((p: Property) => {
                    const convertedPrice = convertPrice(p.price, p.currency, filterCurrency);
                    return convertedPrice >= minP;
                });
            }

            // Max Price
            if (filters.max_price) {
                const maxP = Number(filters.max_price);
                const filterCurrency = filters.currency || 'USD';
                properties = properties.filter((p: Property) => {
                    const convertedPrice = convertPrice(p.price, p.currency, filterCurrency);
                    return convertedPrice <= maxP;
                });
            }

            // Bedrooms count (supports '6+' mapping)
            if (filters.bedrooms) {
                const minBeds = parseInt(filters.bedrooms);
                properties = properties.filter((p: Property) => p.bedrooms >= minBeds);
            }

            // Bathrooms count
            if (filters.bathrooms) {
                const minBaths = parseFloat(filters.bathrooms);
                properties = properties.filter((p: Property) => p.bathrooms >= minBaths);
            }

            // Construction Area Range
            if (filters.min_area) {
                const minA = Number(filters.min_area);
                properties = properties.filter((p: Property) => p.area >= minA);
            }
            if (filters.max_area) {
                const maxA = Number(filters.max_area);
                properties = properties.filter((p: Property) => p.area <= maxA);
            }
        }

        const total = properties.length;
        const totalPages = Math.ceil(total / limit);

        // Paginate the programmatically filtered subset
        const startIdx = (page - 1) * limit;
        properties = properties.slice(startIdx, startIdx + limit);

        return {
            properties,
            pagination: {
                total,
                page,
                totalPages,
            }
        };
    } catch (error) {
        console.error("Error in getProperties processing:", error);
        return { properties: [], pagination: { total: 0, page: 1, totalPages: 1 } };
    }
}

export async function getPropertyById(id: string): Promise<Property | null> {
    const apiKey = process.env.EASYBROKER_API_KEY;

    if (!apiKey) {
        console.warn("No EASYBROKER_API_KEY found. Returning null for details.");
        return null;
    }

    try {
        const res = await fetchWithRetry(`https://api.easybroker.com/v1/properties/${id}`, {
            headers: {
                'X-Authorization': apiKey,
                'Content-Type': 'application/json',
            },
            next: { tags: ['properties', `property-${id}`], revalidate: 3600 }
        });

        if (!res.ok) {
            throw new Error(`EasyBroker API responded with status: ${res.status}`);
        }

        const data = await res.json();
        const overrides = await getOverridesStore();
        return mapPropertyData(data, undefined, overrides[data.public_id]);
    } catch (error) {
        console.error(`Error fetching property ${id}:`, error);
        return null;
    }
}

export async function getSimilarProperties(currentProperty: Property, limit = 3): Promise<Property[]> {
    try {
        const allProperties = await getAllProperties();
        
        // Filter out the current property
        const candidates = allProperties.filter(p => p.id !== currentProperty.id);

        const currentLocLower = currentProperty.location.toLowerCase();
        const currentTypeLower = currentProperty.propertyType.toLowerCase();

        // Extract neighborhood/sector if possible (first part of location string)
        const currentSector = currentProperty.location.split(',')[0].trim().toLowerCase();

        const scored = candidates.map(p => {
            let score = 0;
            const pLocLower = p.location.toLowerCase();
            const pTypeLower = p.propertyType.toLowerCase();
            const pSector = p.location.split(',')[0].trim().toLowerCase();

            // 1. Property Type Match (Primary criteria alongside Location)
            if (pTypeLower === currentTypeLower) {
                score += 15;
            } else if (
                (pTypeLower.includes('apto') || pTypeLower.includes('apartamento')) &&
                (currentTypeLower.includes('apto') || currentTypeLower.includes('apartamento'))
            ) {
                score += 10; // Treat apartment variations as strong match
            }

            // 2. Location Match
            if (pLocLower === currentLocLower) {
                score += 25; // Exact location match
            } else if (pSector && currentSector && (pSector.includes(currentSector) || currentSector.includes(pSector))) {
                score += 20; // Same neighborhood/sector match
            } else if (pLocLower.includes(currentSector) || currentLocLower.includes(pSector)) {
                score += 15; // Partial location match
            }

            // 3. Operation Type Match (Sale/Rental consistency)
            if (p.operationType === currentProperty.operationType) {
                score += 10;
            }

            // 4. Price Proximity (Highly relevant for buyers/renters)
            if (currentProperty.price > 0 && p.price > 0) {
                const ratio = p.price / currentProperty.price;
                if (ratio >= 0.8 && ratio <= 1.2) {
                    score += 10; // Within 20%
                } else if (ratio >= 0.6 && ratio <= 1.4) {
                    score += 5; // Within 40%
                }
            }

            // 5. Size Proximity
            if (currentProperty.area > 0 && p.area > 0) {
                const areaRatio = p.area / currentProperty.area;
                if (areaRatio >= 0.8 && areaRatio <= 1.2) {
                    score += 5;
                }
            }

            return { property: p, score };
        });

        // Sort by score descending and return top matches
        return scored
            .filter(item => item.score > 0) // Only recommend if there is some similarity
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.property);
    } catch (error) {
        console.error("Error computing similar properties:", error);
        // Fallback: return any other properties
        try {
            const allProperties = await getAllProperties();
            return allProperties.filter(p => p.id !== currentProperty.id).slice(0, limit);
        } catch {
            return [];
        }
    }
}


