import fs from 'fs';
import path from 'path';
import { db } from './firebase-admin';

export interface PropertyOverride {
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
}

export type OverridesStore = Record<string, PropertyOverride>;

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'overrides.json');

// Helper to get local overrides
function getLocalOverridesStore(): OverridesStore {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return {};
    }
    const fileContents = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading local overrides store:', error);
    return {};
  }
}

// Dynamic, serverless-safe function to retrieve all overrides
export async function getOverridesStore(): Promise<OverridesStore> {
  if (db) {
    try {
      const snapshot = await db.collection('property_overrides').get();
      const store: OverridesStore = {};
      snapshot.forEach((doc: any) => {
        store[doc.id] = doc.data() as PropertyOverride;
      });
      return store;
    } catch (error) {
      console.error('Error fetching overrides from Firestore, falling back to local JSON:', error);
      return getLocalOverridesStore();
    }
  }
  return getLocalOverridesStore();
}

// Get override for single property
export async function getOverrideForProperty(id: string): Promise<PropertyOverride | undefined> {
  if (db) {
    try {
      const doc = await db.collection('property_overrides').doc(id).get();
      if (doc.exists) {
        return doc.data() as PropertyOverride;
      }
      return undefined;
    } catch (error) {
      console.error(`Error fetching override for property ${id} from Firestore, falling back to local JSON:`, error);
      const store = getLocalOverridesStore();
      return store[id];
    }
  }
  const store = getLocalOverridesStore();
  return store[id];
}

// Save override for property
export async function saveOverrideForProperty(id: string, override: PropertyOverride): Promise<boolean> {
  // Ensure all empty string overrides are converted back to undefined to allow fallback to EasyBroker
  const cleanedOverride = { ...override };
  Object.keys(cleanedOverride).forEach(key => {
    if ((cleanedOverride as Record<string, unknown>)[key] === '') {
      delete (cleanedOverride as Record<string, unknown>)[key];
    }
  });

  if (db) {
    try {
      // Use set with merge: true to combine changes
      await db.collection('property_overrides').doc(id).set(cleanedOverride, { merge: true });
      return true;
    } catch (error) {
      console.error(`Error saving override for property ${id} to Firestore, falling back to local JSON:`, error);
      // Fall through to local save if Firestore write fails
    }
  }

  try {
    const store = getLocalOverridesStore();
    store[id] = { ...store[id], ...cleanedOverride };
    fs.writeFileSync(dataFilePath, JSON.stringify(store, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error saving override locally for property ${id}:`, error);
    return false;
  }
}

// Delete override for property (needed for Phase 2 Revert)
export async function deleteOverrideForProperty(id: string): Promise<boolean> {
  if (db) {
    try {
      await db.collection('property_overrides').doc(id).delete();
      return true;
    } catch (error) {
      console.error(`Error deleting override for property ${id} from Firestore, falling back to local JSON:`, error);
      // Fall through to local delete
    }
  }

  try {
    const store = getLocalOverridesStore();
    if (store[id]) {
      delete store[id];
      fs.writeFileSync(dataFilePath, JSON.stringify(store, null, 2), 'utf-8');
    }
    return true;
  } catch (error) {
    console.error(`Error deleting override locally for property ${id}:`, error);
    return false;
  }
}
