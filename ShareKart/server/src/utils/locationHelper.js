/**
 * Location Helper for Sharekart Server
 * Handles location coordinate mapping, distance calculations (Haversine),
 * and nearest-location recommendations.
 */

export const LOCATION_COORDINATES = {
  'sector 7': { lat: 23.2167, lng: 72.6833, name: 'Sector 7, Gandhinagar' },
  'gandhinagar': { lat: 23.2156, lng: 72.6369, name: 'Gandhinagar' },
  'sector 14': { lat: 23.2260, lng: 72.6650, name: 'Sector 14, Gandhinagar' },
  'sector 21': { lat: 23.2415, lng: 72.6510, name: 'Sector 21, Gandhinagar' },
  'infocity': { lat: 23.1895, lng: 72.6322, name: 'Infocity, Kudasan' },
  'kudasan': { lat: 23.1820, lng: 72.6350, name: 'Kudasan, Gandhinagar' },
  'da-iict': { lat: 23.1884, lng: 72.6288, name: 'DA-IICT & NIFT Campus' },
  'nift': { lat: 23.1884, lng: 72.6288, name: 'DA-IICT & NIFT Campus' },
  'pdpu': { lat: 23.1558, lng: 72.6668, name: 'PDPU Road, Raisan' },
  'raisan': { lat: 23.1558, lng: 72.6668, name: 'PDPU Road, Raisan' },
  'gift city': { lat: 23.1594, lng: 72.6844, name: 'GIFT City SEZ' },
  'vavol': { lat: 23.2100, lng: 72.6200, name: 'Vavol Township' },
  'sargasan': { lat: 23.1800, lng: 72.6100, name: 'Sargasan Cross Roads' },
  'koba': { lat: 23.1400, lng: 72.6300, name: 'Koba Circle' },
  'chandkheda': { lat: 23.1100, lng: 72.5800, name: 'Chandkheda & Motera' },
  'motera': { lat: 23.1100, lng: 72.5800, name: 'Chandkheda & Motera' },
  'vastrapur': { lat: 23.0350, lng: 72.5250, name: 'Vastrapur / SG Highway' },
  'sg highway': { lat: 23.0350, lng: 72.5250, name: 'Vastrapur / SG Highway' },
  'ahmedabad': { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad' }
};

export function getCoordinates(loc) {
  if (!loc) return null;
  if (typeof loc === 'object' && loc.lat && loc.lng) {
    return { lat: Number(loc.lat), lng: Number(loc.lng) };
  }
  const str = String(loc).toLowerCase();

  // Check for explicit lat, lng in string (e.g. "Gandhinagar (23.216°N, 72.683°E)" or "23.216, 72.683")
  const coordsMatch = str.match(/([0-9]+\.[0-9]+)[^\d]+([0-9]+\.[0-9]+)/);
  if (coordsMatch) {
    return { lat: parseFloat(coordsMatch[1]), lng: parseFloat(coordsMatch[2]) };
  }

  // Check against known location keys
  for (const [key, val] of Object.entries(LOCATION_COORDINATES)) {
    if (str.includes(key)) {
      return { lat: val.lat, lng: val.lng, matchedName: val.name };
    }
  }

  // Fallback Gandhinagar Sector 7
  return { lat: 23.2167, lng: 72.6833, matchedName: 'Gandhinagar' };
}

export function calculateDistanceKm(loc1, loc2) {
  const c1 = getCoordinates(loc1);
  const c2 = getCoordinates(loc2);

  if (!c1 || !c2) return 2.5;

  if (
    typeof loc1 === 'string' &&
    typeof loc2 === 'string' &&
    loc1.toLowerCase().trim() === loc2.toLowerCase().trim()
  ) {
    return 0.5;
  }

  const R = 6371; // Earth radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLon = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;

  return Math.max(0.4, Math.round(dist * 10) / 10);
}
