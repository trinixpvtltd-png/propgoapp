import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type Pricing = 
  | { mode: 'PerUnit'; pricePerUnit: number; unit: string; computedTotal: number }
  | { mode: 'Total'; totalPrice: number };

export interface Listing {
  id: string;
  typeOfProperty: string;
  authority?: string;
  for: string; // sale or rent
  category?: string; // Optional: required only for Land/Plot per spec
  title: string;
  photos: { uri: string }[];
  address: string;
  society?: string;
  areaLocality?: string;
  area: number;
  city: string;
  district: string;
  state: string;
  pincode: string;
  description: string;
  pricing: Pricing;
  areaUnit: string;
  documents: { uri: string; name?: string; mimeType?: string }[];
  createdAt: string;
  updatedAt?: string;
  // Layout & property specifics
  floor?: number;
  numberOfFloors?: number;
  rooms?: number;
  bathrooms?: number;
  balconies?: number;
  amenities?: string[];
  yearOfConstruction?: number;
}

interface ListingsContextShape {
  listings: Listing[];
  addListing: (l: Listing) => void;
  updateListing: (id: string, data: Partial<Listing>) => void;
  getListing: (id: string) => Listing | undefined;
}

const ListingsContext = createContext<ListingsContextShape | undefined>(undefined);

export const ListingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [listings, setListings] = useState<Listing[]>([]);

  const addListing = useCallback((l: Listing) => {
    setListings(prev => [l, ...prev]);
  }, []);

  const updateListing = useCallback((id: string, data: Partial<Listing>) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l));
  }, []);

  const getListing = useCallback((id: string) => listings.find(l => l.id === id), [listings]);

  const value = useMemo(() => ({ listings, addListing, updateListing, getListing }), [listings, addListing, updateListing, getListing]);

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>;
};

export function useListings() {
  const ctx = useContext(ListingsContext);
  if (!ctx) throw new Error('useListings must be used within ListingsProvider');
  return ctx;
}
