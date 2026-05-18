'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyOverride } from '@/services/overrides';
import { Property } from '@/types/property';
import { Save } from 'lucide-react';

interface AdminEditFormProps {
  property: Property;
  initialOverride?: PropertyOverride;
}

export default function AdminEditForm({ property, initialOverride }: AdminEditFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize state with current override values or empty strings to allow fallbacks
  const [title, setTitle] = useState(initialOverride?.title || '');
  const [description, setDescription] = useState(initialOverride?.description || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const payload: PropertyOverride = {
        title: title.trim(),
        description: description.trim(),
      };
      
      const res = await fetch('/api/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: property.id, override: payload }),
      });
      
      if (res.ok) {
        alert('Override guardado exitosamente. La página web ahora mostrará estos datos.');
        router.refresh();
      } else {
        alert('Error al guardar el override.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de red al guardar.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="admin-editor-wrap">
      <div className="admin-form-group">
        <label className="admin-label">Título de la Propiedad</label>
        <input 
          type="text" 
          className="admin-input" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder={property.title} 
        />
        <span className="admin-helper-text">Dejar en blanco para usar el título original generado por EasyBroker.</span>
      </div>

      <div className="admin-form-group">
        <label className="admin-label">Descripción Atractiva</label>
        <textarea 
          className="admin-textarea" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Escriba una descripción de marketing más atractiva aquí..." 
        />
        <span className="admin-helper-text">Dejar en blanco para usar la descripción original de la propiedad.</span>
      </div>

      <button type="submit" className="admin-btn-save" disabled={isSaving}>
        <Save size={18} />
        {isSaving ? 'Guardando...' : 'Guardar Cambios y Forzar Override'}
      </button>
    </form>
  );
}
