import React from 'react';
import { getPropertyById } from '@/services/easybroker';
import { getOverridesStore } from '@/services/overrides';
import AdminEditForm from './AdminEditForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Note: getPropertyById automatically merges overrides into the property object.
  // However, the form needs to know which fields are explicitly overridden vs which are original,
  // so we also pull the raw override data explicitly.
  const property = await getPropertyById(id);
  
  if (!property) {
    notFound();
  }
  
  const overrides = getOverridesStore();
  const currentOverride = overrides[id];

  return (
    <div className="admin-container animate-fade-in">
      <Link href="/admin" className="admin-back-link">
        <ArrowLeft size={16} />
        Volver al Panel
      </Link>
      
      <div className="admin-page-header">
        <h2>Editar Propiedad: {id}</h2>
        <p>Los cambios guardados aquí sobreescribirán en tiempo real los datos importados de EasyBroker en todo el sitio web.</p>
      </div>
      
      <AdminEditForm property={property} initialOverride={currentOverride} />
    </div>
  );
}
