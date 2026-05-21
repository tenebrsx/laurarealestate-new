# Admin Panel — Roadmap & Technical Spec Sheet

> **Status:** Draft  
> **Scope:** All improvements to the `/admin/*` experience **excluding** authentication (to be handled separately).  
> **Target Files:** `src/app/admin/*`, `src/services/overrides.ts`, `src/types/*`, `src/app/api/overrides/*`

---

## 1. Executive Summary

The admin panel currently provides a clean override interface for EasyBroker properties, but lacks content lifecycle tooling (revert, preview, upload) and operational visibility (stats, bulk actions). This roadmap moves the panel from a "basic form editor" to a "production-grade CMS override layer" in three phases.

---

## 2. Priority Matrix

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| **P0** | Fix CSS typo (`#white`) | 2 min | Prevents broken badge styling |
| **P0** | "Reset to Original" per property | 2–3 hrs | Critical content lifecycle feature |
| **P1** | Dashboard stats header | 1–2 hrs | Operational visibility |
| **P1** | Add missing override fields (location, parking) | 2–3 hrs | Closes data-editing gaps |
| **P2** | Live on-site preview modal | 4–6 hrs | Reduces edit-test loops |
| **P2** | Bulk "Clear Overrides" action | 3–4 hrs | Maintenance tooling |
| **P3** | Direct image upload (Cloudinary/Firebase) | 6–8 hrs | Removes external-hosting friction |
| **P3** | Media library / reusable images | 8–10 hrs | Long-term asset management |

---

## 3. Phase 1: Quick Wins (P0–P1)

### 3.1 Fix CSS Typo
- **File:** `src/app/admin/admin.css`
- **Line:** ~L343 (`.gallery-cover-badge`)
- **Bug:** `color: #white;` is invalid CSS.
- **Fix:** `color: #ffffff;` (or `color: white;`)
- **Acceptance:** Cover badge text renders white in image gallery cards.

---

### 3.2 "Reset to Original" (Remove Override)

#### Problem
Once an override is saved, there is no way to revert to the raw EasyBroker value. The only workaround is to manually copy the original text back into the field.

#### Solution
Add a **"Restaurar Original y Eliminar Override"** button to the edit form. This should call a new `DELETE` method on the overrides API.

#### Technical Spec
- **UI:** Add a destructive-style secondary button next to the Save button in `AdminEditForm.tsx`.
- **API:** Extend `/api/overrides` to accept `DELETE` with body `{ id: string }`.
- **Service:** Add `removeOverride(id: string)` in `src/services/overrides.ts` that deletes the key from `overrides.json`.
- **Behavior:** After deletion, `router.refresh()` should reload the page showing original EasyBroker data.
- **Guard:** Show a browser `confirm()` dialog before deleting to prevent accidents.

#### Files to Touch
```
src/app/admin/[id]/AdminEditForm.tsx   ← Add button + handler
src/app/api/overrides/route.ts         ← Add DELETE handler
src/services/overrides.ts              ← Add removeOverride()
```

#### Acceptance Criteria
- [ ] Button reads **"Eliminar Override y Restaurar Original"**.
- [ ] Clicking prompts a confirmation dialog.
- [ ] On confirm, the override entry is removed from `src/data/overrides.json`.
- [ ] The page refreshes and all fields show the original EasyBroker placeholders.
- [ ] The "Editada" badge disappears from the admin card when viewing the dashboard.

---

### 3.3 Dashboard Stats Header

#### Problem
There is no visibility into how many properties are overridden vs. imported raw.

#### Solution
Add a compact stats bar below the page header on `/admin`.

#### UI Spec
```
┌─────────────────────────────────────────────┐
│  Gestión de Propiedades                     │
│  ...subtitle...                             │
│                                             │
│  [ Total: 142 ]  [ Editadas: 12 ]  [ Sin Editar: 130 ]  │
└─────────────────────────────────────────────┘
```

- Use the existing `admin-page-header` styling.
- Stats pills: light border, small text, monospace numbers.
- **"Editadas"** pill uses the green badge color (`#22c55e`) for visual emphasis.

#### Data Flow
- In `src/app/admin/page.tsx`, derive counts from `overrides` object vs. `properties.length`.
- Zero client-side JS required — pure server render.

#### Acceptance Criteria
- [ ] Dashboard displays total property count from EasyBroker pagination.
- [ ] Dashboard displays count of properties with `overrides[id]` present.
- [ ] Dashboard displays count of unedited properties (total − edited).
- [ ] Numbers update immediately after an override is created or deleted.

---

### 3.4 Add Missing Override Fields

#### Problem
Location and parking spaces cannot be overridden, yet these are commonly corrected after import.

#### Solution
Add `location` and `parking` to the `PropertyOverride` type and form.

#### Data Schema Change
**File:** `src/services/overrides.ts` (or `src/types/property.ts` if `PropertyOverride` is there)
```ts
interface PropertyOverride {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  operationType?: 'sale' | 'rental';
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images?: string[];
  // NEW:
  location?: string;
  parking?: number;
}
```

#### UI Spec
- Add a new row in **"Información Básica"** section:
  - `location`: Text input, placeholder = original location.
  - `parking`: Number input, placeholder = original parking spaces.
- Add helper text showing original values.

#### Files to Touch
```
src/types/property.ts                  ← Update PropertyOverride
src/services/overrides.ts              ← Ensure new fields are persisted
src/app/admin/[id]/AdminEditForm.tsx   ← Add inputs
src/services/easybroker.ts             ← Ensure getPropertyById merges these fields
```

#### Acceptance Criteria
- [ ] Admin can override `location` and `parking`.
- [ ] Overridden values appear on the public property detail page.
- [ ] Public property cards reflect overridden location if implemented there.

---

## 4. Phase 2: Medium Features (P2)

### 4.1 Live On-Site Preview

#### Problem
Editors must save, switch tabs, and navigate the public site to see results. This creates a slow feedback loop.

#### Solution
Add a **"Vista Previa"** button that opens a modal rendering the public `PropertyDetail` component (or a lightweight `PropertyCard`) with the *draft* override state applied.

#### Technical Spec
- Create a new client component: `src/app/admin/[id]/PreviewModal.tsx`.
- Accept `draftProperty: Property` as a prop.
- Inside the modal, reuse the existing `PropertyCard` component used on the homepage, or render a compact detail view.
- Trigger: **"Vista Previa"** button next to **"Guardar"**.
- The preview is computed client-side by merging `property` with current form state into a temporary object.

#### UI Spec
```
┌──────────────────────────────────────────────┐
│  Vista Previa en Vivo                    [X] │
├──────────────────────────────────────────────┤
│                                              │
│   [ Renders PropertyCard or DetailView     │
│     using current form values as overrides ] │
│                                              │
└──────────────────────────────────────────────┘
```

#### Files to Touch
```
src/app/admin/[id]/PreviewModal.tsx      ← New
src/app/admin/[id]/AdminEditForm.tsx     ← Add preview button + modal trigger
src/components/property/PropertyCard.tsx ← Confirm it accepts draft data
```

#### Acceptance Criteria
- [ ] Modal opens without saving to the server.
- [ ] Title, price, description, image order, and property type all reflect current form values.
- [ ] Modal is dismissible with an overlay click or close button.
- [ ] Modal does not mutate any persisted data.

---

### 4.2 Bulk "Clear Overrides"

#### Problem
If an agency rebrands or changes pricing strategy, manually removing overrides one by one is impractical.

#### Solution
Add a **"Acciones en Masa"** dropdown to the admin dashboard with a single initial action: **"Eliminar Todos los Overrides"**.

#### Technical Spec
- **UI:** A small toolbar above the grid with a `<select>` + **"Ejecutar"** button.
- **API:** Extend `/api/overrides` with a `DELETE` batch variant, or a `POST /api/overrides/clear` endpoint.
- **Guard:** Hard `confirm()` with text: *"Esto eliminará todos los overrides personalizados y no se puede deshacer. ¿Continuar?"*
- **Service:** `clearAllOverrides()` in `src/services/overrides.ts` rewrites `overrides.json` as `{}`.

#### Files to Touch
```
src/app/admin/page.tsx                   ← Add bulk action UI
src/app/api/overrides/route.ts           ← Or new route /api/overrides/clear
src/services/overrides.ts                ← Add clearAllOverrides()
```

#### Acceptance Criteria
- [ ] Bulk action dropdown is only visible when at least one override exists.
- [ ] Confirmation dialog blocks accidental execution.
- [ ] After execution, `overrides.json` contains only `{}`.
- [ ] Dashboard refreshes and all "Editada" badges disappear.

---

## 5. Phase 3: Advanced Media (P3)

### 5.1 Direct Image Upload

#### Problem
Users must manually upload images to external hosts and paste URLs. This is error-prone and slow for non-technical users.

#### Solution
Replace the URL-only input with a drag-and-drop file uploader that posts to Cloudinary or Firebase Storage, then appends the returned URL to the gallery.

#### Technical Spec
- **Uploader:** Use `react-dropzone` or a native `<input type="file" multiple accept="image/*">` wrapper.
- **Backend:** Create `POST /api/upload` route.
  - If using **Cloudinary**: Use `cloudinary` SDK with unsigned preset.
  - If using **Firebase Storage**: Use `firebase-admin` to write to a dedicated `uploads/` bucket path.
- **Client:** Show upload progress per file. On success, auto-add the returned URL to the `images` array.
- **Validation:** Max 5MB per file, restrict to `image/jpeg`, `image/png`, `image/webp`.

#### UI Spec
- Replace the URL input row with a dropzone:
```
┌─────────────────────────────────────────────┐
│  [+] Arrastre fotos aquí o haga clic        │
│      para subir (Máx 5MB, JPG/PNG/WEBP)    │
└─────────────────────────────────────────────┘
```
- Show thumbnails of uploading files with a progress spinner.

#### Files to Touch
```
src/app/admin/[id]/ImageUploader.tsx     ← New drag-and-drop component
src/app/api/upload/route.ts              ← New upload handler
src/app/admin/admin.css                  ← Upload zone styling
```

#### Acceptance Criteria
- [ ] User can drag and drop up to 10 images at once.
- [ ] Images upload and their URLs appear in the gallery grid automatically.
- [ ] Invalid file types are rejected with a clear alert.
- [ ] Oversized files are rejected before upload begins.

---

### 5.2 Reusable Media Library (Future)

- Maintain a global array of previously uploaded image URLs in a new `src/data/media-library.json`.
- In the uploader, show a "Recientes" tab to pick previously uploaded images without re-uploading.
- This becomes relevant once upload volume justifies it.

---

## 6. API Contract Changes

### Current
```
POST /api/overrides
Body: { id: string, override: PropertyOverride }
```

### Proposed Additions
```
DELETE /api/overrides
Body: { id: string }
Response: { success: boolean }

POST /api/overrides/clear
Body: {} (empty)
Response: { cleared: number }

POST /api/upload
Content-Type: multipart/form-data
Body: files[]
Response: { urls: string[] }
```

---

## 7. Data Persistence Map

| Feature | Reads From | Writes To |
|---------|------------|-----------|
| Overrides | `src/data/overrides.json` | `src/data/overrides.json` |
| Property source | EasyBroker API | N/A (read-only) |
| Uploaded images | N/A | Cloudinary / Firebase Storage |
| Media library (future) | `src/data/media-library.json` | `src/data/media-library.json` |

---

## 8. UI/UX Style Guide for Admin Changes

- **Buttons:**
  - Primary: `background: #0f172a`, hover → `var(--accent-primary)`.
  - Destructive: `background: #ef4444` (for Remove Override / Delete).
  - Secondary: `background: transparent`, border `1px solid #e2e8f0`.
- **Badges:** Keep existing green `#22c55e` for positive states.
- **Modals:** Use a centered overlay with `backdrop-filter: blur(4px)` and `background: rgba(0,0,0,0.3)`.
- **Inputs:** Keep existing `admin-input` / `admin-textarea` classes for consistency.

---

## 9. Suggested Implementation Order

1. **Day 1 (30 min):** Fix CSS typo `#white`.
2. **Day 1 (3 hrs):** Implement "Reset to Original" (DELETE endpoint + UI button).
3. **Day 2 (2 hrs):** Add dashboard stats header to `/admin`.
4. **Day 2–3 (3 hrs):** Add missing override fields (`location`, `parking`).
5. **Week 2 (6 hrs):** Build live preview modal.
6. **Week 2 (4 hrs):** Add bulk clear overrides action.
7. **Week 3+ (8 hrs):** Direct image upload integration.

---

## 10. Open Questions for Stakeholder

1. **Image hosting:** Do you have a preferred provider (Cloudinary free tier, Firebase Storage, Supabase Storage)?
2. **Preview fidelity:** Should the preview render the full public `PropertyDetail` page layout, or just the `PropertyCard` used in listings?
3. **Bulk actions scope:** Beyond "clear all overrides," are there other bulk operations needed (e.g., bulk change operation type to "sale")?
4. **Revert granularity:** Should "reset" remove the *entire* property override object, or should we support per-field resets (e.g., reset only title but keep custom images)?

---

*Document created for implementation tracking. Check off acceptance criteria as phases are completed.*
