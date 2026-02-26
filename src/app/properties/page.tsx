import Link from 'next/link';
import PropertyCard from '@/components/properties/PropertyCard';
import { getProperties } from '@/services/easybroker';
import { Property } from '@/types/property';
import './properties.css';

interface PropertiesPageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;
    const { properties, pagination } = await getProperties(20, currentPage);

    return (
        <div className="properties-page">
            <div className="container" style={{ paddingTop: 'var(--space-2xl)' }}>
                {/* Results count */}
                <p className="results-count">
                    {pagination.total} propiedades encontradas
                </p>

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
                                href={`/properties?page=${currentPage - 1}`}
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
                                        href={`/properties?page=${pageNum}`}
                                        className={`pagination-page ${Number(pageNum) === currentPage ? 'active' : ''}`}
                                    >
                                        {pageNum}
                                    </Link>
                                )
                            )}
                        </div>

                        {currentPage < pagination.totalPages ? (
                            <Link
                                href={`/properties?page=${currentPage + 1}`}
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
