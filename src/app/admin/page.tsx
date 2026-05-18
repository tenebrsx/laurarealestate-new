import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProperties } from '@/services/easybroker';
import { getOverridesStore } from '@/services/overrides';

// Force dynamic rendering for the admin panel so new edits appear instantly
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const data = await getProperties(50, 1);
  const properties = data.properties || [];
  const overrides = getOverridesStore();

  return (
    <div className="admin-container animate-fade-in">
      <div className="admin-page-header">
        <h2>Gestión de Propiedades</h2>
        <p>Seleccione una propiedad para forzar su título, editar su descripción y gestionar su galería.</p>
      </div>

      <div className="admin-grid">
        {properties.map(prop => {
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
                />
                {hasOverride && (
                  <span className="admin-card-override-badge">Editada</span>
                )}
              </div>
              <div className="admin-card-body">
                <span className="admin-card-id">{prop.id}</span>
                <h3 className="admin-card-title">{prop.title}</h3>
                <span className="admin-card-price">{prop.formattedPrice || `${prop.price} ${prop.currency}`}</span>
                
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
    </div>
  );
}
