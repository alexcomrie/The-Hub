import { Business, Product } from '@shared/schema';

// Re-export the types from the shared schema
export { Business, Product };

// Add any additional business-related types or interfaces here
export interface BusinessWithProducts extends Business {
  products?: Product[];
}

export interface BusinessSearchParams {
  query?: string;
  category?: string;
  location?: string;
  page?: number;
  limit?: number;
}