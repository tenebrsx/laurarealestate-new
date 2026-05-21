export interface Property {
    id: string;
    title: string;
    location: string;
    price: number;
    currency: string;
    formattedPrice?: string;
    priceUnit?: string;
    operationType: 'sale' | 'rental';
    operationTypes?: string[];
    propertyType: string;
    latitude?: number;
    longitude?: number;
    bedrooms: number;
    bathrooms: number;
    parking?: number;
    area: number;
    imageUrl: string;
    description?: string;
    images?: string[];
    amenities?: string[];
}
