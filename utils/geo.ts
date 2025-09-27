export type City = { name: string; lat: number; lon: number };

export const CITIES: City[] = [
  { name: 'Mumbai', lat: 19.076, lon: 72.8777 },
  { name: 'Pune', lat: 18.5204, lon: 73.8567 },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { name: 'Hyderabad', lat: 17.385, lon: 78.4867 },
  { name: 'Noida', lat: 28.5355, lon: 77.3910 },
  { name: 'Delhi', lat: 28.7041, lon: 77.1025 },
  { name: 'Gurugram', lat: 28.4595, lon: 77.0266 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
];

const R = 6371; // Earth radius in km
const toRad = (d: number) => (d * Math.PI) / 180;

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function nearbyCities(lat: number, lon: number, maxDistanceKm = 200) {
  return CITIES
    .map((c) => ({ ...c, distance: haversineKm(lat, lon, c.lat, c.lon) }))
    .filter((c) => c.distance <= maxDistanceKm)
    .sort((a, b) => a.distance - b.distance)
    .map((c) => c.name);
}
