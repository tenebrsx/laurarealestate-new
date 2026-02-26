export interface Property {
    id: string;
    title: string;
    location: string;
    price: number;
    currency: string;
    operationType: 'sale' | 'rental';
    bedrooms: number;
    bathrooms: number;
    area: number;
    imageUrl: string;
    description?: string;
    images?: string[];
}
