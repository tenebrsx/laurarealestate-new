import Link from 'next/link';
import PropertyCard from '@/components/properties/PropertyCard';
import PropertiesFilterBar from '@/components/properties/PropertiesFilterBar';
import { getProperties } from '@/services/easybroker';
import { Property } from '@/types/property';
import './properties.css';

interface PropertiesPageProps {
    searchParams: Promise<{
        page?: string;
        property_type?: string;
        location?: string;
        operation_type?: 'sale' | 'rental';
    }>;
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;

    // Construct filters from URL params
    const filters: any = {};
    if (params.property_type) filters.property_type = params.property_type;
    if (params.location) filters.location = params.location;
    if (params.operation_type) filters.operation_type = params.operation_type;

    const { properties, pagination } = await getProperties(20, currentPage, filters);

    // Helper for pagination links to preserve filters
    const createPageUrl = (pageNumber: number) => {
        const query = new URLSearchParams();
        query.set('page', pageNumber.toString());
        if (filters.property_type) query.set('property_type', filters.property_type);
        if (filters.location) query.set('location', filters.location);
        if (filters.operation_type) query.set('operation_type', filters.operation_type);
        return `/properties?${query.toString()}`;
    };

    return (
        <div className="properties-page">
            <div className="container" style={{ paddingTop: 'var(--space-2xl)' }}>

                <PropertiesFilterBar />

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
