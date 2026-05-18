import Link from 'next/link';
import PropertyCard from '@/components/properties/PropertyCard';
import PropertiesFilterWrapper from '@/components/properties/PropertiesFilterWrapper';
import { getProperties } from '@/services/easybroker';
import { Property } from '@/types/property';
import './properties.css';

interface PropertiesPageProps {
    searchParams: Promise<{
        page?: string;
        property_type?: string;
        location?: string;
        operation_type?: 'sale' | 'rental';
        min_price?: number;
        max_price?: number;
        currency?: string;
        bedrooms?: string;
        bathrooms?: string;
        min_area?: string;
        max_area?: string;
    }>;
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;

    // Construct filters from URL params
    const filters: Record<string, string | number> = {};
    if (params.property_type) filters.property_type = params.property_type;
    if (params.location) filters.location = params.location;
    if (params.operation_type) filters.operation_type = params.operation_type;
    if (params.min_price) filters.min_price = params.min_price;
    if (params.max_price) filters.max_price = params.max_price;
    if (params.currency) filters.currency = params.currency;
    if (params.bedrooms) filters.bedrooms = params.bedrooms;
    if (params.bathrooms) filters.bathrooms = params.bathrooms;
    if (params.min_area) filters.min_area = params.min_area;
    if (params.max_area) filters.max_area = params.max_area;

    const { properties, pagination } = await getProperties(20, currentPage, filters);

    // Helper for pagination links to preserve filters
    const createPageUrl = (pageNumber: number) => {
        const query = new URLSearchParams();
        query.set('page', pageNumber.toString());
        if (filters.property_type) query.set('property_type', String(filters.property_type));
        if (filters.location) query.set('location', String(filters.location));
        if (filters.operation_type) query.set('operation_type', String(filters.operation_type));
        if (filters.min_price) query.set('min_price', String(filters.min_price));
        if (filters.max_price) query.set('max_price', String(filters.max_price));
        if (filters.currency) query.set('currency', String(filters.currency));
        if (filters.bedrooms) query.set('bedrooms', String(filters.bedrooms));
        if (filters.bathrooms) query.set('bathrooms', String(filters.bathrooms));
        if (filters.min_area) query.set('min_area', String(filters.min_area));
        if (filters.max_area) query.set('max_area', String(filters.max_area));
        return `/properties?${query.toString()}`;
    };

    return (
        <div className="properties-page">
            <div className="container" style={{ paddingTop: 'var(--space-2xl)' }}>

                {/* Advanced Filtering Trigger */}
                <PropertiesFilterWrapper />

                {/* Results count */}
                <div className="results-header">
                    <p className="results-count">
                        {pagination.total} propiedades encontradas
                    </p>
                </div>

                <div className="properties-grid animate-fade-in">
                    {properties.map((property: Property) => (
                        <PropertyCard key={property.id} {...property} />
                    ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                    <nav className="pagination" aria-label="Paginación">
                        {currentPage > 1 ? (
                            <Link
                                href={createPageUrl(currentPage - 1)}
                                className="pagination-btn"
                            >
                                ← Anterior
                            </Link>
                        ) : (
                            <span className="pagination-btn disabled">← Anterior</span>
                        )}

                        <div className="pagination-pages">
                            {generatePageNumbers(currentPage, pagination.totalPages).map((pageNum, i) =>
                                pageNum === '...' ? (
                                    <span key={`ellipsis-${i}`} className="pagination-ellipsis">…</span>
                                ) : (
                                    <Link
                                        key={pageNum}
                                        href={createPageUrl(Number(pageNum))}
                                        className={`pagination-page ${Number(pageNum) === currentPage ? 'active' : ''}`}
                                    >
                                        {pageNum}
                                    </Link>
                                )
                            )}
                        </div>

                        {currentPage < pagination.totalPages ? (
                            <Link
                                href={createPageUrl(currentPage + 1)}
                                className="pagination-btn"
                            >
                                Siguiente →
                            </Link>
                        ) : (
                            <span className="pagination-btn disabled">Siguiente →</span>
                        )}
                    </nav>
                )}
            </div>
        </div>
    );
}

// Generate smart page number array with ellipsis
function generatePageNumbers(current: number, total: number): (number | string)[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | string)[] = [1];

    if (current > 3) pages.push('...');

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push('...');

    pages.push(total);
    return pages;
}
