// EasyBroker API Integration Service
import { Property } from "@/types/property";

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

// Maps EasyBroker response to our localized PropertyCard interface
export function mapPropertyData(data: EasyBrokerProperty) {
    // Use the first operation for price details (usually Sale or Rent)
    const mainOperation = data.operations?.[0];

    return {
        id: data.public_id,
        title: data.title,
        location: typeof data.location === 'object' ? (data.location?.name || 'Ubicación no disponible') : (data.location || 'Ubicación no disponible'),
        price: mainOperation ? mainOperation.amount : 0,
        currency: mainOperation ? mainOperation.currency : 'USD',
        formattedPrice: mainOperation?.formatted_amount || '',
        priceUnit: mainOperation?.unit || 'total',
        operationType: (mainOperation?.type === 'rental' ? 'rental' : 'sale') as 'sale' | 'rental',
        propertyType: data.property_type || 'Propiedad',
        latitude: typeof data.location === 'object' ? data.location?.latitude : undefined,
        longitude: typeof data.location === 'object' ? data.location?.longitude : undefined,
        bedrooms: data.bedrooms || 0,
        bathrooms: data.bathrooms || 0,
        parking: data.parking_spaces || 0,
        area: data.construction_size || 0,
        imageUrl: data.title_image_full || data.images?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
        description: data.description || '',
        images: data.images?.map(img => img.url) || []
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

    try {
        let url = `https://api.easybroker.com/v1/properties?page=${page}&limit=${limit}`;

        // Append filters dynamically if they exist
        if (filters) {
            if (filters.property_type) url += `&search[property_types][]=${encodeURIComponent(filters.property_type)}`;
            if (filters.location) url += `&search[locations][]=${encodeURIComponent(filters.location)}`;
            if (filters.operation_type) url += `&search[operations][]=${encodeURIComponent(filters.operation_type)}`;
            if (filters.min_price) url += `&search[min_price]=${filters.min_price}`;
            if (filters.max_price) url += `&search[max_price]=${filters.max_price}`;
            if (filters.currency) url += `&search[currency]=${encodeURIComponent(filters.currency)}`;
            if (filters.bedrooms) url += `&search[bedrooms]=${filters.bedrooms}`;
            if (filters.bathrooms) url += `&search[bathrooms]=${filters.bathrooms}`;

            // Note: EasyBroker API uses min_construction_size/max_construction_size for area metrics
            if (filters.min_area) url += `&search[min_construction_size]=${filters.min_area}`;
            if (filters.max_area) url += `&search[max_construction_size]=${filters.max_area}`;
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
        const properties = json.content.map(mapPropertyData);
        const total = json.pagination?.total || properties.length;
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
        return mapPropertyData(data);
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
