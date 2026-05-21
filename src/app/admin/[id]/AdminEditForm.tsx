'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyOverride } from '@/services/overrides';
import { Property } from '@/types/property';
import { Save, Trash2, ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface AdminEditFormProps {
  property: Property;
  initialOverride?: PropertyOverride;
}

export default function AdminEditForm({ property, initialOverride }: AdminEditFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  
  // Initialize state with current override values or empty strings to fall back to EasyBroker originals
  const [title, setTitle] = useState(initialOverride?.title || '');
  const [description, setDescription] = useState(initialOverride?.description || '');
  const [price, setPrice] = useState<string>(initialOverride?.price !== undefined ? String(initialOverride.price) : '');
  const [currency, setCurrency] = useState(initialOverride?.currency || 'USD');
  const [operationType, setOperationType] = useState<string>(initialOverride?.operationType || '');
  const [propertyType, setPropertyType] = useState(initialOverride?.propertyType || '');
  const [bedrooms, setBedrooms] = useState<string>(initialOverride?.bedrooms !== undefined ? String(initialOverride.bedrooms) : '');
  const [bathrooms, setBathrooms] = useState<string>(initialOverride?.bathrooms !== undefined ? String(initialOverride.bathrooms) : '');
  const [area, setArea] = useState<string>(initialOverride?.area !== undefined ? String(initialOverride.area) : '');

  // Gallery images list state
  const [images, setImages] = useState<string[]>(initialOverride?.images || property.images || []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isValidPreview, setIsValidPreview] = useState(false);

  // Handle adding image
  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    setImages(prev => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
    setIsValidPreview(false);
  };

  // Handle removing image
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Shift image index left (up in ordering)
  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Shift image index right (down in ordering)
  const handleMoveRight = (index: number) => {
    if (index === images.length - 1) return;
    setImages(prev => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleRevert = async () => {
    const confirmRevert = window.confirm(
      '¿Está seguro de que desea eliminar todos los cambios manuales y restaurar los datos originales de EasyBroker para esta propiedad?'
    );
    if (!confirmRevert) return;

    setIsReverting(true);
    try {
      const res = await fetch(`/api/overrides?id=${property.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Overrides eliminados con éxito. Se han restaurado los datos originales de EasyBroker.');
        // Reset states to empty to fall back to EasyBroker
        setTitle('');
        setDescription('');
        setPrice('');
        setCurrency('USD');
        setOperationType('');
        setPropertyType('');
        setBedrooms('');
        setBathrooms('');
        setArea('');
        setImages(property.images || []);
        
        router.refresh();
      } else {
        alert('Error al intentar eliminar los overrides.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de red al intentar restaurar.');
    } finally {
      setIsReverting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const payload: PropertyOverride = {
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        price: price !== '' ? Number(price) : undefined,
        currency: price !== '' ? currency : undefined,
        operationType: (operationType as 'sale' | 'rental') || undefined,
        propertyType: propertyType || undefined,
        bedrooms: bedrooms !== '' ? Number(bedrooms) : undefined,
        bathrooms: bathrooms !== '' ? Number(bathrooms) : undefined,
        area: area !== '' ? Number(area) : undefined,
        images: images.length > 0 ? images : undefined,
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

  const isTitleOverridden = title.trim() !== '';
  const isPropertyTypeOverridden = propertyType !== '';
  const isOperationTypeOverridden = operationType !== '';
  const isDescriptionOverridden = description.trim() !== '';
  const isPriceOverridden = price !== '';
  const isAreaOverridden = area !== '';
  const isBedroomsOverridden = bedrooms !== '';
  const isBathroomsOverridden = bathrooms !== '';
  const isImagesOverridden = JSON.stringify(images) !== JSON.stringify(property.images || []);

  return (
    <form onSubmit={handleSave} className="admin-editor-wrap">
      {initialOverride && (
        <div className="admin-quick-revert-bar" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-lg)' }}>
          <button
            type="button"
            className="admin-btn-revert"
            onClick={handleRevert}
            disabled={isSaving || isReverting}
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            <Trash2 size={14} />
            {isReverting ? 'Restaurando...' : 'Restaurar CRM Original'}
          </button>
        </div>
      )}
      
      {/* SECTION 1: BASIC INFORMATION OVERRIDES */}
      <div className="admin-form-section">
        <h3 className="section-title">Información Básica</h3>
        
        <div className="admin-form-group">
          <label className="admin-label">
            Título de la Propiedad
            {isTitleOverridden && <span className="override-indicator-badge">Modificado</span>}
          </label>
          <input 
            type="text" 
            className={`admin-input ${isTitleOverridden ? 'is-overridden' : ''}`} 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder={property.title} 
          />
          <span className="admin-helper-text">Dejar en blanco para usar el título original de EasyBroker: <em>&quot;{property.title}&quot;</em></span>
        </div>

        <div className="admin-grid-cols-2">
          <div className="admin-form-group">
            <label className="admin-label">
              Tipo de Propiedad
              {isPropertyTypeOverridden && <span className="override-indicator-badge">Modificado</span>}
            </label>
            <select
              className={`admin-input ${isPropertyTypeOverridden ? 'is-overridden' : ''}`}
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="">Original ({property.propertyType})</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Casa">Casa</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Local Comercial">Local Comercial</option>
              <option value="Oficina">Oficina</option>
              <option value="Terreno">Solar / Terreno</option>
              <option value="Villa">Villa</option>
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">
              Tipo de Operación
              {isOperationTypeOverridden && <span className="override-indicator-badge">Modificado</span>}
            </label>
            <select
              className={`admin-input ${isOperationTypeOverridden ? 'is-overridden' : ''}`}
              value={operationType}
              onChange={(e) => setOperationType(e.target.value)}
            >
              <option value="">Original ({property.operationType === 'sale' ? 'Venta' : 'Alquiler'})</option>
              <option value="sale">Venta</option>
              <option value="rental">Alquiler</option>
            </select>
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-label">
            Descripción de Marketing
            {isDescriptionOverridden && <span className="override-indicator-badge">Modificado</span>}
          </label>
          <textarea 
            className={`admin-textarea ${isDescriptionOverridden ? 'is-overridden' : ''}`} 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder={property.description || "Escriba una descripción de marketing atractiva aquí..."} 
          />
          <span className="admin-helper-text">Dejar en blanco para usar la descripción original.</span>
        </div>
      </div>

      {/* SECTION 2: PRICING & SPECIFICATIONS */}
      <div className="admin-form-section">
        <h3 className="section-title">Precio y Especificaciones</h3>
        
        <div className="admin-grid-cols-3">
          <div className="admin-form-group">
            <label className="admin-label">
              Precio Personalizado
              {isPriceOverridden && <span className="override-indicator-badge">Modificado</span>}
            </label>
            <input 
              type="number" 
              className={`admin-input ${isPriceOverridden ? 'is-overridden' : ''}`} 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              placeholder={String(property.price)} 
            />
            <span className="admin-helper-text">Original: {formatCurrency(property.price, property.currency)}</span>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">
              Moneda
              {isPriceOverridden && currency !== property.currency && <span className="override-indicator-badge">Modificado</span>}
            </label>
            <select
              className={`admin-input ${isPriceOverridden && currency !== property.currency ? 'is-overridden' : ''}`}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={price === ''}
            >
              <option value="USD">Dólares (USD)</option>
              <option value="DOP">Pesos Dominicanos (DOP)</option>
            </select>
            <span className="admin-helper-text">Original: {property.currency}</span>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">
              Superficie (m²)
              {isAreaOverridden && <span className="override-indicator-badge">Modificado</span>}
            </label>
            <input 
              type="number" 
              className={`admin-input ${isAreaOverridden ? 'is-overridden' : ''}`} 
              value={area} 
              onChange={(e) => setArea(e.target.value)} 
              placeholder={String(property.area)} 
            />
            <span className="admin-helper-text">Original: {property.area} m²</span>
          </div>
        </div>

        <div className="admin-grid-cols-2">
          <div className="admin-form-group">
            <label className="admin-label">
              Dormitorios / Habitaciones
              {isBedroomsOverridden && <span className="override-indicator-badge">Modificado</span>}
            </label>
            <input 
              type="number" 
              className={`admin-input ${isBedroomsOverridden ? 'is-overridden' : ''}`} 
              value={bedrooms} 
              onChange={(e) => setBedrooms(e.target.value)} 
              placeholder={String(property.bedrooms)} 
            />
            <span className="admin-helper-text">Original: {property.bedrooms}</span>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">
              Baños
              {isBathroomsOverridden && <span className="override-indicator-badge">Modificado</span>}
            </label>
            <input 
              type="number" 
              step="0.5"
              className={`admin-input ${isBathroomsOverridden ? 'is-overridden' : ''}`} 
              value={bathrooms} 
              onChange={(e) => setBathrooms(e.target.value)} 
              placeholder={String(property.bathrooms)} 
            />
            <span className="admin-helper-text">Original: {property.bathrooms}</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: IMAGE GALLERY & COVER REORDERING */}
      <div className="admin-form-section">
        <h3 className="section-title">
          Galería de Imágenes y Portada
          {isImagesOverridden && <span className="override-indicator-badge">Modificado</span>}
        </h3>
        <p className="section-description">
          La primera imagen (posición 1) se establecerá automáticamente como la <strong>foto de portada principal</strong> en las tarjetas de catálogo y sliders principales. Rearranje el orden con las flechas o agregue URLs personalizadas.
        </p>

        {/* Dynamic Image Grid */}
        <div className="admin-gallery-grid">
          {images.map((imgUrl, index) => (
            <div key={`${imgUrl}-${index}`} className={`admin-gallery-card ${index === 0 ? 'is-cover' : ''}`}>
              <div className="gallery-img-wrap">
                <img src={imgUrl} alt={`Foto ${index + 1}`} className="gallery-thumbnail" />
                <span className="gallery-index-badge">{index + 1}</span>
                {index === 0 && <span className="gallery-cover-badge">Portada</span>}
              </div>
              <div className="gallery-card-controls">
                <button
                  type="button"
                  className="gallery-ctrl-btn"
                  onClick={() => handleMoveLeft(index)}
                  disabled={index === 0}
                  title="Mover arriba / izquierda"
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  type="button"
                  className="gallery-ctrl-btn"
                  onClick={() => handleMoveRight(index)}
                  disabled={index === images.length - 1}
                  title="Mover abajo / derecha"
                >
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  className="gallery-ctrl-btn remove-btn"
                  onClick={() => handleRemoveImage(index)}
                  title="Eliminar de la galería"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Custom Image URL Form group */}
        <div className="admin-add-image-form mt-lg">
          <label className="admin-label">Agregar Nueva Imagen (URL)</label>
          <div className="admin-add-image-input-wrap">
            <input
              type="text"
              placeholder="Pegue la URL de la imagen (ej: https://host.com/foto.jpg)"
              value={newImageUrl}
              onChange={(e) => {
                setNewImageUrl(e.target.value);
                setIsValidPreview(false);
              }}
              className="admin-input add-img-input"
            />
            <button type="button" onClick={handleAddImage} className="btn-admin-add-img">
              <Plus size={16} />
              Agregar Foto
            </button>
          </div>

          {newImageUrl.trim().startsWith('http') && (
            <div className="img-preview-container animate-fade-in" style={{ marginBlock: 'var(--space-sm)' }}>
              <img 
                src={newImageUrl} 
                alt="Vista previa" 
                onLoad={() => setIsValidPreview(true)}
                onError={() => setIsValidPreview(false)}
                className={`preview-thumbnail ${isValidPreview ? 'valid' : 'invalid'}`}
              />
              <span className="preview-label" style={{ color: isValidPreview ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                {isValidPreview ? '✓ URL válida para imagen' : '✗ URL inválida o no carga'}
              </span>
            </div>
          )}

          <span className="admin-helper-text">
            Sube la imagen a un hosting de fotos (como Cloudinary, Imgur, Postimages) y pegue el enlace directo para añadirla aquí.
          </span>
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="admin-form-actions mt-xl" style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
        <button type="submit" className="admin-btn-save" disabled={isSaving || isReverting}>
          <Save size={18} />
          {isSaving ? 'Guardando...' : 'Guardar Cambios y Forzar Override'}
        </button>
        {initialOverride && (
          <button
            type="button"
            className="admin-btn-revert"
            onClick={handleRevert}
            disabled={isSaving || isReverting}
          >
            <Trash2 size={18} />
            {isReverting ? 'Restaurando...' : 'Restaurar CRM Original'}
          </button>
        )}
      </div>
    </form>
  );
}
