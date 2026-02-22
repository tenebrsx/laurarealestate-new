// EasyBroker API Integration Service

export interface EasyBrokerImage {
    url: string;
}

export interface EasyBrokerProperty {
    public_id: string;
    title: string;
    location: string;
    operations: {
        type: string;
        amount: number;
        currency: string;
    }[];
    bedrooms: number | null;
    bathrooms: number | null;
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
        location: data.location,
        price: mainOperation ? mainOperation.amount : 0,
        currency: mainOperation ? mainOperation.currency : 'USD',
        bedrooms: data.bedrooms || 0,
        bathrooms: data.bathrooms || 0,
        area: data.construction_size || 0,
        imageUrl: data.title_image_full || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
        description: data.description || '',
        images: data.images?.map(img => img.url) || []
    };
}

export async function getProperties(limit = 9, page = 1) {
    const apiKey = process.env.EASYBROKER_API_KEY;

    // If no API key, return mock data to prevent build crashing during demo
    if (!apiKey) {
        console.warn("No EASYBROKER_API_KEY found. Returning mock data.");
        return getMockProperties();
    }

    try {
        const res = await fetch(`https://api.easybroker.com/v1/properties?page=${page}&limit=${limit}`, {
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
        return json.content.map(mapPropertyData);
    } catch (error) {
        console.error("Error fetching EasyBroker properties:", error);
        return getMockProperties(); // Fallback
    }
}

export async function getPropertyById(id: string) {
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
            bedrooms: 4,
            bathrooms: 5,
            area: 850,
            imageUrl: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
            description: 'Luxury sky home overlooking the pristine beaches of Miami.',
            images: ['https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3']
        }
    ];
}
