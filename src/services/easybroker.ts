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
    const explicitImages = data.images || (data as any).property_images || [];
    const canonicalCover = explicitImages.length > 0 ? explicitImages[0].url : data.title_image_full;

    const baseTitle = cleanPropertyTitle(data.title);

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
        bedrooms: override?.bedrooms ?? (data.bedrooms || 0),
        bathrooms: override?.bathrooms ?? (data.bathrooms || 0),
        parking: data.parking_spaces || 0,
        area: override?.area ?? (data.construction_size || 0),
        imageUrl: (override?.images && override.images.length > 0) ? override.images[0] : (canonicalCover || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80'),
        description: override?.description || data.description || '',
        images: override?.images || explicitImages.map(img => img.url)
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
}

export async function getProperties(limit = 20, page = 1, filters?: FilterParams) {
    const apiKey = process.env.EASYBROKER_API_KEY;

    // If no API key, return mock data to prevent build crashing during demo
    if (!apiKey) {
        console.warn("No EASYBROKER_API_KEY found. Returning mock data.");
        return { properties: getMockProperties(), pagination: { total: 3, page: 1, totalPages: 1 } };
    }

    // Determine if we have any active search values
    const hasActiveFilters = !!(filters && Object.keys(filters).some(key => {
        const val = filters[key as keyof FilterParams];
        return val !== undefined && val !== null && val !== '';
    }));

    try {
        // Fetch a larger page size (up to 50) if filtering is active to maximize candidates
        const fetchLimit = hasActiveFilters ? Math.max(50, limit) : limit;
        let url = `https://api.easybroker.com/v1/properties?page=${page}&limit=${fetchLimit}`;

        // Forward core search values to API only if filters are active
        if (hasActiveFilters && filters) {
            if (filters.property_type) url += `&search[property_types][]=${encodeURIComponent(filters.property_type)}`;
            if (filters.operation_type) url += `&search[operations][]=${encodeURIComponent(filters.operation_type)}`;
        }

        const res = await fetch(url, {
            headers: {
                'X-Authorization': apiKey,
                'Content-Type': 'application/json',
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!res.ok) {
            throw new Error(`EasyBroker API responded with status: ${res.status}`);
        }

        const json = await res.json();
        
        const overrides = getOverridesStore();
        
        // Map raw EasyBroker properties (injecting operation preference and overrides)
        let properties = json.content.map((prop: EasyBrokerProperty) => 
            mapPropertyData(prop, filters?.operation_type, overrides[prop.public_id])
        );

        // --- LAYER 2: PROGRAMMATIC HARDENING LAYER ---
        if (hasActiveFilters && filters) {
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
                properties = properties.filter((p: Property) => p.price >= minP);
            }

            // Max Price
            if (filters.max_price) {
                const maxP = Number(filters.max_price);
                properties = properties.filter((p: Property) => p.price <= maxP);
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

        // Adjust returned array length to target page limit size
        const total = hasActiveFilters ? properties.length : (json.pagination?.total || properties.length);
        
        // Paginate the programmatically filtered subset if filters were active
        if (hasActiveFilters && properties.length > limit) {
            const startIdx = (page - 1) * limit;
            properties = properties.slice(startIdx, startIdx + limit);
        }

        const totalPages = Math.ceil(total / limit);

        return {
            properties,
            pagination: {
                total,
                page,
                totalPages,
            }
        };
    } catch (error) {
        console.error("Error fetching EasyBroker properties:", error);
        return { properties: getMockProperties(), pagination: { total: 3, page: 1, totalPages: 1 } }; // Fallback
    }
}

export async function getPropertyById(id: string): Promise<Property> {
    const apiKey = process.env.EASYBROKER_API_KEY;

    if (!apiKey) {
        return getMockProperties()[0];
    }

    try {
        const res = await fetch(`https://api.easybroker.com/v1/properties/${id}`, {
            headers: {
                'X-Authorization': apiKey,
                'Content-Type': 'application/json',
            },
            next: { revalidate: 3600 }
        });

        if (!res.ok) {
            throw new Error(`EasyBroker API responded with status: ${res.status}`);
        }

        const data = await res.json();
        const overrides = getOverridesStore();
        return mapPropertyData(data, undefined, overrides[data.public_id]);
    } catch (error) {
        console.error(`Error fetching property ${id}:`, error);
        return getMockProperties()[0];
    }
}

// Fallback Mock Data matching the EasyBroker mapped format
function getMockProperties() {
    return [
        {
            id: 'prop-1',
            title: 'Modern Glass Villa',
            location: 'Beverly Hills, CA',
            price: 4500000,
            currency: 'USD',
            operationType: 'sale' as const,
            propertyType: 'Casa',
            bedrooms: 5,
            bathrooms: 4.5,
            area: 600,
            imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80',
            description: 'An architectural masterpiece featuring floor-to-ceiling glass walls and panoramic views.',
            images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3']
        },
        {
            id: 'prop-2',
            title: 'Minimalist Desert Retreat',
            location: 'Scottsdale, AZ',
            price: 2100000,
            currency: 'USD',
            operationType: 'sale' as const,
            propertyType: 'Casa',
            bedrooms: 3,
            bathrooms: 3,
            area: 320,
            imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
            description: 'Elegant desert living with seamless indoor-outdoor flow.',
            images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3']
        },
        {
            id: 'prop-3',
            title: 'Oceanfront Penthouse',
            location: 'Miami, FL',
            price: 8900000,
            currency: 'USD',
            operationType: 'sale' as const,
            propertyType: 'Apartamento',
            bedrooms: 4,
            bathrooms: 5,
            area: 850,
            imageUrl: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
            description: 'Luxury sky home overlooking the pristine beaches of Miami.',
            images: ['https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3']
        }
    ];
}
