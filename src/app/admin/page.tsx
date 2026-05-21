import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProperties } from '@/services/easybroker';
import { Property } from '@/types/property';
import { getOverridesStore } from '@/services/overrides';
import { formatCurrency } from '@/utils/format';

export const dynamic = 'force-dynamic';

interface AdminDashboardPageProps {
  searchParams: Promise<{
    query?: string;
    page?: string;
    filter?: string;
  }>;
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const params = await searchParams;
  const query = params.query || '';
  const filter = params.filter || 'all'; // 'all' or 'edited'
  const currentPage = Number(params.page) || 1;
  const limit = 24; // Show 24 per page for admin view

  // Fetch properties using our search engine
  const { properties, pagination } = await getProperties(limit, currentPage, { 
    query, 
    onlyOverridden: filter === 'edited' 
  });
  const overrides = await getOverridesStore();

  // Helper for generating page links preserving query params
  const createPageUrl = (pageNumber: number) => {
    const searchParamsObj = new URLSearchParams();
    searchParamsObj.set('page', pageNumber.toString());
    if (query) searchParamsObj.set('query', query);
    if (filter !== 'all') searchParamsObj.set('filter', filter);
    return `/admin?${searchParamsObj.toString()}`;
  };

  return (
    <div className="admin-container animate-fade-in" suppressHydrationWarning>
      <div className="admin-page-header" suppressHydrationWarning>
        <h2>Gestión de Propiedades</h2>
        <p>Busque y seleccione cualquier propiedad de sus {pagination.total} listados de EasyBroker para forzar overrides en tiempo real.</p>
      </div>

      {/* Modern Search bar */}
      <div className="admin-search-wrap" suppressHydrationWarning>
        <div className="admin-filter-bar">
          <Link
            href={`/admin?filter=all${query ? `&query=${encodeURIComponent(query)}` : ''}`}
            className={`admin-filter-pill ${filter === 'all' ? 'active' : ''}`}
          >
            Todas las Propiedades
          </Link>
          <Link
            href={`/admin?filter=edited${query ? `&query=${encodeURIComponent(query)}` : ''}`}
            className={`admin-filter-pill ${filter === 'edited' ? 'active' : ''}`}
          >
            Modificadas Manualmente
          </Link>
        </div>

        <form action="/admin" method="GET" className="admin-search-form" suppressHydrationWarning>
          {filter !== 'all' && <input type="hidden" name="filter" value={filter} />}
          <div className="admin-search-input-group" suppressHydrationWarning>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="admin-search-icon">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              name="query"
              placeholder="Buscar por título, ubicación, tipo..."
              defaultValue={query}
              className="admin-search-input"
              suppressHydrationWarning
            />
          </div>
          <button type="submit" className="admin-search-btn">Buscar</button>
          {query && (
            <Link href="/admin" className="admin-search-clear-btn">
              Limpiar
            </Link>
          )}
        </form>
      </div>

      {/* Grid displaying the properties */}
      {properties.length > 0 ? (
        <div className="admin-grid">
          {properties.map((prop: Property) => {
            const hasOverride = !!overrides[prop.id];
            return (
              <div key={prop.id} className="admin-card">
                <div className="admin-card-img-wrap">
                  <Image 
                    src={prop.imageUrl} 
                    alt={prop.title}
                    fill
                    sizes="300px"
                    className="admin-card-img" 
                    unoptimized
                  />
                  {hasOverride && (
                    <span className="admin-card-override-badge">Editada</span>
                  )}
                </div>
                <div className="admin-card-body">
                  <div className="admin-card-meta">
                    <span className="admin-card-id">{prop.id}</span>
                    <span className="admin-card-badge-type">{prop.propertyType}</span>
                  </div>
                  <h3 className="admin-card-title">{prop.title}</h3>
                  
                  {/* Inline Metrics Ribbon */}
                  <div className="admin-card-specs">
                    {prop.bedrooms > 0 && (
                      <>
                        <span>🛏️ {prop.bedrooms} hab</span>
                        <span>•</span>
                      </>
                    )}
                    {prop.bathrooms > 0 && (
                      <>
                        <span>🛁 {prop.bathrooms} bañ</span>
                        <span>•</span>
                      </>
                    )}
                    <span>📐 {prop.area} m²</span>
                  </div>

                  <span className="admin-card-price">{formatCurrency(prop.price, prop.currency)}</span>
                  
                  <div className="admin-card-footer">
                    <Link href={`/admin/${prop.id}`} className="btn-admin-edit">
                      Editar Propiedad
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="admin-empty-state glass-panel">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent-primary)', marginBottom: 'var(--space-md)' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <h3>No se encontraron propiedades</h3>
          <p>Intente buscar con un término diferente o verifique si la propiedad está publicada en EasyBroker.</p>
          <Link href="/admin" className="admin-search-btn" style={{ textDecoration: 'none', display: 'inline-block', marginTop: 'var(--space-md)' }}>
            Ver todas las propiedades
          </Link>
        </div>
      )}

      {/* Smart Pagination Controls */}
      {pagination.totalPages > 1 && (
        <nav className="pagination" aria-label="Paginación" style={{ marginTop: 'var(--space-2xl)' }} suppressHydrationWarning>
          {currentPage > 1 ? (
            <Link href={createPageUrl(currentPage - 1)} className="pagination-btn">
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
            <Link href={createPageUrl(currentPage + 1)} className="pagination-btn">
              Siguiente →
            </Link>
          ) : (
            <span className="pagination-btn disabled">Siguiente →</span>
          )}
        </nav>
      )}
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
