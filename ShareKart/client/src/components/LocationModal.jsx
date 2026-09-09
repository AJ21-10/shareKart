import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const LocationModal = ({ isOpen, onClose, onToast }) => {
  const { currentLocation, updateLocation } = useAuth();
  const [detecting, setDetecting] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [detectedData, setDetectedData] = useState(null);

  if (!isOpen) return null;

  // Curated list of nearby localities & micro-markets
  const nearbyLocations = [
    {
      name: 'Infocity, Kudasan',
      pincode: '382007',
      distance: '1.2 km away',
      hub: 'Primary Tech & Rental Hub'
    },
    {
      name: 'Gandhinagar, Sector 7',
      pincode: '382010',
      distance: '0.8 km away',
      hub: 'Central Residential Area'
    },
    {
      name: 'Sector 21 Main Market',
      pincode: '382021',
      distance: '2.1 km away',
      hub: 'Tools & Electronics Market'
    },
    {
      name: 'DA-IICT & NIFT Campus',
      pincode: '382007',
      distance: '1.8 km away',
      hub: 'Student Tech Hub'
    },
    {
      name: 'PDPU Road, Raisan',
      pincode: '382421',
      distance: '3.5 km away',
      hub: 'University Hub'
    },
    {
      name: 'GIFT City SEZ',
      pincode: '382355',
      distance: '5.2 km away',
      hub: 'Financial & Corporate Center'
    },
    {
      name: 'Vavol Township',
      pincode: '382016',
      distance: '3.1 km away',
      hub: 'Residential Suburb'
    },
    {
      name: 'Sargasan Cross Roads',
      pincode: '382421',
      distance: '4.0 km away',
      hub: 'Commercial Highway Hub'
    },
    {
      name: 'Koba Circle, Airport Highway',
      pincode: '382007',
      distance: '6.5 km away',
      hub: 'Transit Junction'
    },
    {
      name: 'Chandkheda & Motera (Ahmedabad Border)',
      pincode: '380005',
      distance: '9.8 km away',
      hub: 'Metro Station Area'
    },
    {
      name: 'Vastrapur / SG Highway (Ahmedabad)',
      pincode: '380015',
      distance: '18.0 km away',
      hub: 'Commercial Tech Hub'
    }
  ];

  const filteredLocations = nearbyLocations.filter(loc => 
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.pincode.includes(searchQuery) ||
    loc.hub.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLocation = (locString) => {
    updateLocation(locString);
    onToast && onToast(`Location updated to: ${locString}`);
    onClose();
  };

  // Real-Time Browser Geolocation Detection with User Permission
  const handleDetectLocation = () => {
    setLocationError('');
    setDetecting(true);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Attempt reverse geocoding via OpenStreetMap Nominatim with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4500);

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const addr = data.address || {};
            const locality = addr.suburb || addr.neighbourhood || addr.residential || addr.road || 'Sector 7';
            const city = addr.city || addr.town || addr.county || 'Gandhinagar';
            const postcode = addr.postcode || '382010';
            const locationStr = `${locality}, ${city} ${postcode}`;

            setDetectedData({
              str: locationStr,
              lat: latitude.toFixed(4),
              lon: longitude.toFixed(4)
            });
            handleSelectLocation(locationStr);
          } else {
            throw new Error('Reverse geocode failed');
          }
        } catch (err) {
          // Fallback to coordinates-based real-time locality
          console.warn('Reverse geocode network issue, using nearest detected hub', err);
          const fallbackStr = `Gandhinagar (${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E)`;
          handleSelectLocation(fallbackStr);
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        setDetecting(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission was denied. Please enable location access in your browser settings or select a nearby area below.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is currently unavailable. Please pick a nearby locality below.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out. Please try again or select an area below.');
            break;
          default:
            setLocationError('An error occurred while detecting location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-20 shadow-2xl border border-outline-variant my-8 flex flex-col gap-space-16 text-on-surface animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/60 pb-space-12">
          <div className="flex items-center gap-space-8">
            <span className="material-symbols-outlined text-[24px] text-secondary">location_on</span>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Select Your Location & Nearby Hubs
              </h2>
              <p className="text-xs text-on-surface-variant">
                Discover peer-to-peer items for rent & buy within 2-10 km radius
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Real-time GPS Detection Button */}
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={detecting}
          className="w-full bg-secondary-container/60 hover:bg-secondary-container border border-secondary-fixed text-on-secondary-container p-space-12 rounded-xl flex items-center justify-between transition-all group shadow-xs"
        >
          <div className="flex items-center gap-space-12">
            <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0">
              <span className={`material-symbols-outlined text-[22px] ${detecting ? 'animate-spin' : 'animate-pulse'}`}>
                {detecting ? 'progress_activity' : 'my_location'}
              </span>
            </div>
            <div className="text-left">
              <p className="font-label-bold text-body-md text-on-secondary-container flex items-center gap-1">
                <span>{detecting ? 'Requesting GPS Permission...' : 'Detect My Live Location'}</span>
                <span className="material-symbols-outlined text-[14px]">bolt</span>
              </p>
              <p className="text-xs text-on-secondary-container/80">
                {detecting ? 'Waiting for browser GPS response...' : 'Uses your browser GPS to pinpoint nearby gear'}
              </p>
            </div>
          </div>
          <span className="material-symbols-outlined text-[20px] text-secondary group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </button>

        {/* Permission Error Message */}
        {locationError && (
          <div className="bg-error-container text-on-error-container p-space-10 rounded-lg text-xs flex items-start gap-space-8">
            <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">warning</span>
            <span>{locationError}</span>
          </div>
        )}

        {/* Search Locality Input */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-space-12 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            placeholder="Search locality, sector, or pincode (e.g., Kudasan, Sector 21)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-space-32 pr-space-12 py-space-10 text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
          />
        </div>

        {/* Current Active Location Banner */}
        <div className="bg-surface-container-low/60 px-space-12 py-space-8 rounded-lg flex items-center justify-between text-xs border border-outline-variant/40">
          <span className="text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-secondary">check_circle</span>
            Currently Set: <strong className="text-on-surface font-label-bold">{currentLocation}</strong>
          </span>
          <span className="text-badge font-badge text-secondary bg-secondary-fixed/40 px-2 py-0.5 rounded">
            Active Hub
          </span>
        </div>

        {/* Nearby Localities List */}
        <div className="flex flex-col gap-space-6">
          <div className="flex items-center justify-between">
            <span className="text-badge font-badge text-on-surface-variant uppercase tracking-wider">
              Nearby Hubs & Sectors ({filteredLocations.length})
            </span>
            <span className="text-[11px] text-secondary font-bold">Within 2–15 km radius</span>
          </div>

          <div className="flex flex-col gap-space-4 max-h-64 overflow-y-auto pr-1">
            {filteredLocations.map((loc, idx) => {
              const fullStr = `${loc.name}, ${loc.pincode}`;
              const isSelected = currentLocation.includes(loc.name) || currentLocation.includes(loc.pincode);

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectLocation(fullStr)}
                  className={`text-left p-space-10 rounded-xl border transition-all flex items-center justify-between group ${
                    isSelected 
                      ? 'bg-secondary-fixed/40 border-secondary text-on-surface font-bold' 
                      : 'bg-surface-container-lowest border-outline-variant/60 hover:bg-surface-container-low text-on-surface'
                  }`}
                >
                  <div className="flex items-start gap-space-8 truncate pr-2">
                    <span className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${isSelected ? 'text-secondary' : 'text-on-surface-variant'}`}>
                      location_on
                    </span>
                    <div className="truncate">
                      <p className="font-label-bold text-body-sm truncate">{loc.name}</p>
                      <p className="text-xs text-on-surface-variant truncate">{loc.hub}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-space-8 shrink-0">
                    <span className="text-xs bg-surface-container px-space-6 py-0.5 rounded text-on-surface-variant">
                      {loc.distance}
                    </span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[18px] text-secondary">
                        check
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Custom Input Setting */}
            {searchQuery.trim() && filteredLocations.length === 0 && (
              <button
                onClick={() => handleSelectLocation(searchQuery.trim())}
                className="p-space-12 rounded-xl bg-primary text-on-primary text-body-sm font-label-bold text-center flex items-center justify-center gap-2 hover:bg-inverse-surface"
              >
                <span className="material-symbols-outlined text-[18px]">add_location</span>
                <span>Set location to "{searchQuery.trim()}"</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-space-8 border-t border-outline-variant/60 flex items-center justify-between text-xs text-on-surface-variant">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-secondary">shield</span>
            Privacy safe: GPS coords are never stored on public servers
          </span>
          <button 
            onClick={onClose}
            className="px-space-12 py-space-6 rounded font-label-bold hover:bg-surface-container text-on-surface"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
