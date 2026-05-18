import fs from 'fs';
import path from 'path';

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

export function getOverridesStore(): OverridesStore {
  try {
    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, JSON.stringify({}, null, 2), 'utf-8');
      return {};
    }
    const fileContents = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading overrides store:', error);
    return {};
  }
}

export function getOverrideForProperty(id: string): PropertyOverride | undefined {
  const store = getOverridesStore();
  return store[id];
}

export function saveOverrideForProperty(id: string, override: PropertyOverride): boolean {
  try {
    const store = getOverridesStore();
    // Ensure all empty string overrides are converted back to undefined to allow fallback to EasyBroker
    const cleanedOverride = { ...override };
    Object.keys(cleanedOverride).forEach(key => {
      if ((cleanedOverride as any)[key] === '') {
        delete (cleanedOverride as any)[key];
      }
    });

    store[id] = { ...store[id], ...cleanedOverride };
    fs.writeFileSync(dataFilePath, JSON.stringify(store, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error saving override for property ${id}:`, error);
    return false;
  }
}
