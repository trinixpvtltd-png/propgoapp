import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import { CITIES, nearbyCities, haversineKm } from '../utils/geo';

type LocationCtx = {
  coords?: { latitude: number; longitude: number };
  currentCity?: string;
  suggestions: string[];
  setManualCity: (city: string) => void;
  refresh: () => Promise<void>;
};

const Ctx = createContext<LocationCtx | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>();
  const [manualCity, setManualCity] = useState<string | undefined>();

  async function refresh() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
  }

  useEffect(() => {
    refresh();
  }, []);

  const currentCity = useMemo(() => {
    if (manualCity) return manualCity;
    if (!coords) return undefined;
    // Pick nearest city from list
    const closest = [...CITIES]
      .map((c) => ({ name: c.name, d: haversineKm(coords.latitude, coords.longitude, c.lat, c.lon) }))
      .sort((a, b) => a.d - b.d)[0];
    return closest?.name;
  }, [coords, manualCity]);

  const suggestions = useMemo(() => {
    if (!coords) return [];
    return nearbyCities(coords.latitude, coords.longitude, 300);
  }, [coords]);

  const value = useMemo<LocationCtx>(() => ({
    coords,
    currentCity,
    suggestions,
    setManualCity: setManualCity,
    refresh,
  }), [coords, currentCity, suggestions]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocationCtx() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLocationCtx must be used within LocationProvider');
  return ctx;
}
