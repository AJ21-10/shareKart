/**
 * Location Service for Sharekart
 * Handles browser geolocation with multi-tier fallback:
 * 1. Browser Geolocation (low-accuracy mode for instant desktop & mobile compatibility)
 * 2. Reverse Geocoding via OpenStreetMap Nominatim
 * 3. Automatic Live IP Geolocation (via ipwho.is / ipapi.co) so detection NEVER fails
 */

/**
 * Checks the current browser geolocation permission state without triggering a prompt
 * @returns {Promise<'granted' | 'prompt' | 'denied' | 'unsupported'>}
 */
export const checkLocationPermission = async () => {
  if (!navigator.geolocation) return 'unsupported';
  if (!navigator.permissions || !navigator.permissions.query) return 'prompt';

  try {
    const status = await navigator.permissions.query({ name: 'geolocation' });
    return status.state; // 'granted', 'prompt', or 'denied'
  } catch {
    return 'prompt';
  }
};

/**
 * Live IP-based geolocation fallback
 * Used when browser GPS is blocked, unavailable (e.g. desktop PCs without GPS), or times out.
 */
export const getIpLocation = async () => {
  // Primary IP service: ipwho.is (fast, HTTPS, no key required)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false) {
        const city = data.city || 'Gandhinagar';
        const region = data.region || 'Gujarat';
        const postal = data.postal || '382019';
        const locationName = `${city}, ${region}${postal ? ` ${postal}` : ''}`;
        return {
          success: true,
          locationName,
          coords: {
            latitude: data.latitude || 23.216,
            longitude: data.longitude || 72.683,
            accuracy: 1000
          },
          address: {
            locality: city,
            city,
            state: region,
            postcode: postal
          },
          source: 'ip'
        };
      }
    }
  } catch (e) {
    console.warn('[locationService] ipwho.is lookup failed, trying backup', e);
  }

  // Secondary IP service: ipapi.co
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data && !data.error) {
        const city = data.city || 'Gandhinagar';
        const region = data.region || 'Gujarat';
        const postal = data.postal || '382010';
        const locationName = `${city}, ${region}${postal ? ` ${postal}` : ''}`;
        return {
          success: true,
          locationName,
          coords: {
            latitude: data.latitude || 23.216,
            longitude: data.longitude || 72.683,
            accuracy: 2000
          },
          address: {
            locality: city,
            city,
            state: region,
            postcode: postal
          },
          source: 'ip'
        };
      }
    }
  } catch (err) {
    console.warn('[locationService] ipapi.co lookup failed', err);
  }

  // Curated regional fallback
  return {
    success: true,
    locationName: 'Gandhinagar, Sector 7 382010',
    coords: { latitude: 23.2167, longitude: 72.6833, accuracy: 5000 },
    address: { locality: 'Sector 7', city: 'Gandhinagar', state: 'Gujarat', postcode: '382010' },
    source: 'default'
  };
};

/**
 * Requests location permission and retrieves current coordinates,
 * reverse geocoding into neighborhood / city / pincode format.
 * Automatically falls back to live IP geolocation if GPS is unavailable or blocked,
 * ensuring that location detection NEVER fails.
 * 
 * @param {Object} options
 * @param {number} [options.timeout=5000] - Timeout in milliseconds
 * @param {boolean} [options.enableHighAccuracy=false] - Use false for universal desktop/laptop compatibility
 * @param {boolean} [options.fallbackToIp=true] - Fall back to IP detection on error
 * @returns {Promise<{
 *   success: boolean,
 *   locationName: string,
 *   coords?: { latitude: number, longitude: number, accuracy: number },
 *   address?: { locality: string, city: string, state: string, postcode: string },
 *   source?: string
 * }>}
 */
export const getCurrentLocation = ({ timeout = 5000, enableHighAccuracy = false, fallbackToIp = true } = {}) => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      if (fallbackToIp) {
        return getIpLocation().then(resolve);
      }
      return resolve({
        success: false,
        code: 'NOT_SUPPORTED',
        message: 'Geolocation is not supported by your browser.'
      });
    }

    let resolved = false;

    // Safety timeout: if browser hangs on permission prompt, fall back to IP location
    const safetyTimer = setTimeout(async () => {
      if (!resolved) {
        resolved = true;
        if (fallbackToIp) {
          const ipLoc = await getIpLocation();
          return resolve(ipLoc);
        }
        resolve({
          success: false,
          code: 'TIMEOUT',
          message: 'Location request timed out.'
        });
      }
    }, timeout);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(safetyTimer);

        const { latitude, longitude, accuracy } = position.coords;

        try {
          // Attempt reverse geocoding via OpenStreetMap Nominatim with a fast timeout
          const controller = new AbortController();
          const timerId = setTimeout(() => controller.abort(), 3500);

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
            {
              signal: controller.signal,
              headers: { 'Accept': 'application/json' }
            }
          );
          clearTimeout(timerId);

          if (response.ok) {
            const data = await response.json();
            const addr = data.address || {};

            const locality = (
              addr.suburb ||
              addr.neighbourhood ||
              addr.subdistrict ||
              addr.residential ||
              addr.road ||
              addr.village ||
              addr.hamlet ||
              addr.city_district ||
              ''
            ).trim();

            const city = (
              addr.city ||
              addr.town ||
              addr.municipality ||
              addr.county ||
              addr.state_district ||
              'Gandhinagar'
            ).trim();

            const state = (addr.state || '').trim();
            const postcode = (addr.postcode || '').trim();

            let locationName = '';
            if (locality && city) {
              locationName = `${locality}, ${city}${postcode ? ` ${postcode}` : ''}`;
            } else if (city) {
              locationName = `${city}${state ? `, ${state}` : ''}${postcode ? ` ${postcode}` : ''}`;
            } else if (data.display_name) {
              locationName = data.display_name.split(',').slice(0, 3).map(s => s.trim()).join(', ');
            } else {
              locationName = `${city} (${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E)`;
            }

            return resolve({
              success: true,
              locationName,
              coords: { latitude, longitude, accuracy },
              address: { locality, city, state, postcode },
              source: 'gps'
            });
          } else {
            throw new Error('Reverse geocode failed');
          }
        } catch (err) {
          // Fallback to IP or coordinates
          if (fallbackToIp) {
            const ipLoc = await getIpLocation();
            if (ipLoc.success) return resolve(ipLoc);
          }
          const fallbackStr = `Gandhinagar (${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E)`;
          return resolve({
            success: true,
            locationName: fallbackStr,
            coords: { latitude, longitude, accuracy },
            address: { locality: '', city: 'Gandhinagar', state: 'Gujarat', postcode: '' },
            isFallback: true,
            source: 'gps'
          });
        }
      },
      async (error) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(safetyTimer);

        // When browser GPS fails (or permission denied/unavailable on desktop):
        // Automatically fall back to live IP geolocation!
        if (fallbackToIp) {
          const ipLoc = await getIpLocation();
          return resolve(ipLoc);
        }

        let code = 'ERROR';
        let message = 'Failed to detect location.';

        if (error.code === error.PERMISSION_DENIED) {
          code = 'PERMISSION_DENIED';
          message = 'Location permission was denied. Please allow location access in your browser settings to use current location.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          code = 'POSITION_UNAVAILABLE';
          message = 'Location information is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          code = 'TIMEOUT';
          message = 'Location request timed out. Please try again.';
        }

        return resolve({
          success: false,
          code,
          message
        });
      },
      {
        enableHighAccuracy, // false ensures immediate desktop compatibility
        timeout,
        maximumAge: 60000
      }
    );
  });
};

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

export const getCoordinates = (loc) => {
  if (!loc) return null;
  if (typeof loc === 'object' && loc.lat && loc.lng) {
    return { lat: Number(loc.lat), lng: Number(loc.lng) };
  }
  const str = String(loc).toLowerCase();

  const coordsMatch = str.match(/([0-9]+\.[0-9]+)[^\d]+([0-9]+\.[0-9]+)/);
  if (coordsMatch) {
    return { lat: parseFloat(coordsMatch[1]), lng: parseFloat(coordsMatch[2]) };
  }

  for (const [key, val] of Object.entries(LOCATION_COORDINATES)) {
    if (str.includes(key)) {
      return { lat: val.lat, lng: val.lng, matchedName: val.name };
    }
  }

  return { lat: 23.2167, lng: 72.6833, matchedName: 'Gandhinagar' };
};

export const calculateDistanceKm = (loc1, loc2) => {
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
};

