import { useState, useEffect } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number; // meters
  address: string;
  campusZone: string;
  city: string;
  geofenceStatus: 'Inside Safe Campus Zone' | 'Near Boundary' | 'Off-Campus / Remote' | 'Emergency Dispatch Radius';
  timestamp: string;
  source: 'GPS_HARDWARE' | 'NETWORK_TRIANGULATION' | 'CAMPUS_LOCATION_BEACON';
  isTrackingActive: boolean;
  permissionState?: 'granted' | 'denied' | 'prompt' | 'unavailable';
  isRealGpsActive?: boolean;
  speed?: number | null;
  heading?: number | null;
}

export const CAMPUS_ZONES = [
  {
    id: 'zone-gate1',
    label: 'Ramon Magsaysay HS - Main Gate 1',
    address: 'España Blvd cor. Don Quijote St, Sampaloc, Manila / QC Border',
    city: 'Metro Manila',
    lat: 14.6091,
    lng: 121.0003,
    geofenceStatus: 'Inside Safe Campus Zone' as const
  },
  {
    id: 'zone-shs-building',
    label: 'Senior High School Building (Grade 11-12 Wing)',
    address: 'RMHS SHS Academic Building, 3rd Floor, Room 304',
    city: 'Metro Manila',
    lat: 14.6094,
    lng: 121.0007,
    geofenceStatus: 'Inside Safe Campus Zone' as const
  },
  {
    id: 'zone-guidance-clinic',
    label: 'Guidance & Counseling Center / School Clinic',
    address: 'Ground Floor, Student Services Annex, RMHS Campus',
    city: 'Metro Manila',
    lat: 14.6088,
    lng: 120.9998,
    geofenceStatus: 'Inside Safe Campus Zone' as const
  },
  {
    id: 'zone-canteen-oval',
    label: 'Campus Canteen & Athletic Field',
    address: 'East Quadrangle & Student Center, RMHS',
    city: 'Metro Manila',
    lat: 14.6097,
    lng: 121.0012,
    geofenceStatus: 'Inside Safe Campus Zone' as const
  },
  {
    id: 'zone-sdo-qc',
    label: 'DepEd Schools Division Office (SDO QC)',
    address: 'Nueva Ecija St., Bago Bantay, Quezon City',
    city: 'Quezon City',
    lat: 14.6488,
    lng: 121.0400,
    geofenceStatus: 'Off-Campus / Remote' as const
  },
  {
    id: 'zone-pnp-stn10',
    label: 'PNP Station 10 - WCPD Emergency Desk',
    address: 'Kamuning Rd cor. EDSA, Quezon City',
    city: 'Quezon City',
    lat: 14.6322,
    lng: 121.0333,
    geofenceStatus: 'Emergency Dispatch Radius' as const
  },
  {
    id: 'zone-brgy-central',
    label: 'Barangay Central Hall & BVAWC Protection Desk',
    address: 'Brgy. Central Administrative Center, Quezon City',
    city: 'Quezon City',
    lat: 14.6401,
    lng: 121.0450,
    geofenceStatus: 'Emergency Dispatch Radius' as const
  }
];

export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

// In-memory geocode cache to prevent API flooding
const geocodeCache = new Map<string, { address: string; city: string }>();

async function fetchReverseGeocode(lat: number, lng: number): Promise<{ address: string; city: string }> {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  if (geocodeCache.has(key)) {
    return geocodeCache.get(key)!;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: { 'Accept-Language': 'en' },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.display_name) {
        const addrObj = data.address || {};
        const cityStr = addrObj.city || addrObj.town || addrObj.village || addrObj.suburb || addrObj.county || 'Local City';
        const res = {
          address: data.display_name,
          city: cityStr
        };
        geocodeCache.set(key, res);
        return res;
      }
    }
  } catch (e) {
    // Silently handle if offline or network restricted
  }

  const fallback = {
    address: `Real-time GPS (${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E)`,
    city: 'Live Device Location'
  };
  geocodeCache.set(key, fallback);
  return fallback;
}

let currentLocationData: LocationData = {
  latitude: 14.6091,
  longitude: 121.0003,
  accuracy: 3.5,
  address: 'Ramon Magsaysay High School, España Blvd, Manila / QC',
  campusZone: 'Ramon Magsaysay HS - Main Gate 1',
  city: 'Metro Manila',
  geofenceStatus: 'Inside Safe Campus Zone',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  source: 'CAMPUS_LOCATION_BEACON',
  isTrackingActive: true,
  permissionState: 'prompt',
  isRealGpsActive: false
};

const listeners = new Set<(loc: LocationData) => void>();
let liveTickerInterval: any = null;
let watchId: number | null = null;

export function getLocationData(): LocationData {
  return { ...currentLocationData };
}

export function subscribeLocationUpdates(callback: (loc: LocationData) => void): () => void {
  listeners.add(callback);
  callback({ ...currentLocationData });
  return () => {
    listeners.delete(callback);
  };
}

function notifyListeners() {
  const data = { ...currentLocationData };
  listeners.forEach(cb => cb(data));
}

export async function updateLocationFromCoords(
  lat: number, 
  lng: number, 
  accuracy: number, 
  source: 'GPS_HARDWARE' | 'NETWORK_TRIANGULATION' | 'CAMPUS_LOCATION_BEACON',
  speed?: number | null,
  heading?: number | null
) {
  let closestZone = CAMPUS_ZONES[0];
  let minDistance = calculateDistanceMeters(lat, lng, closestZone.lat, closestZone.lng);

  for (const zone of CAMPUS_ZONES) {
    const dist = calculateDistanceMeters(lat, lng, zone.lat, zone.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestZone = zone;
    }
  }

  let status: 'Inside Safe Campus Zone' | 'Near Boundary' | 'Off-Campus / Remote' | 'Emergency Dispatch Radius';
  let zoneLabel: string;
  let resolvedAddress = currentLocationData.address;
  let resolvedCity = currentLocationData.city;

  if (source === 'GPS_HARDWARE' || source === 'NETWORK_TRIANGULATION') {
    const geo = await fetchReverseGeocode(lat, lng);
    resolvedAddress = geo.address;
    resolvedCity = geo.city;

    if (minDistance <= 200) {
      status = closestZone.geofenceStatus === 'Emergency Dispatch Radius' ? 'Emergency Dispatch Radius' : 'Inside Safe Campus Zone';
      zoneLabel = `On-Campus: ${closestZone.label}`;
    } else if (minDistance <= 600) {
      status = 'Near Boundary';
      zoneLabel = `Near Campus (${minDistance}m from ${closestZone.label})`;
    } else {
      status = closestZone.geofenceStatus === 'Emergency Dispatch Radius' ? 'Emergency Dispatch Radius' : 'Off-Campus / Remote';
      zoneLabel = `${resolvedCity} (${(minDistance / 1000).toFixed(1)}km to Campus)`;
    }
  } else {
    if (minDistance <= 200) {
      status = closestZone.geofenceStatus === 'Emergency Dispatch Radius' ? 'Emergency Dispatch Radius' : 'Inside Safe Campus Zone';
      zoneLabel = closestZone.label;
      resolvedAddress = closestZone.address;
      resolvedCity = closestZone.city;
    } else if (minDistance <= 600) {
      status = 'Near Boundary';
      zoneLabel = `Near ${closestZone.label} (${minDistance}m away)`;
      resolvedAddress = `${closestZone.address} (Within ${minDistance}m radius)`;
      resolvedCity = closestZone.city;
    } else {
      status = closestZone.geofenceStatus === 'Emergency Dispatch Radius' ? 'Emergency Dispatch Radius' : 'Off-Campus / Remote';
      zoneLabel = `Campus Beacon (${(minDistance / 1000).toFixed(2)}km to Campus)`;
      resolvedAddress = `Beacon Position (${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E)`;
      resolvedCity = closestZone.city;
    }
  }

  currentLocationData = {
    ...currentLocationData,
    latitude: parseFloat(lat.toFixed(6)),
    longitude: parseFloat(lng.toFixed(6)),
    accuracy: Math.round(accuracy),
    campusZone: zoneLabel,
    address: resolvedAddress,
    city: resolvedCity,
    geofenceStatus: status,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    source,
    isTrackingActive: true,
    isRealGpsActive: source === 'GPS_HARDWARE',
    permissionState: source === 'GPS_HARDWARE' ? 'granted' : currentLocationData.permissionState,
    speed: speed ?? null,
    heading: heading ?? null
  };

  notifyListeners();
}

function startLiveTicker() {
  if (liveTickerInterval) clearInterval(liveTickerInterval);
  liveTickerInterval = setInterval(() => {
    if (!currentLocationData.isTrackingActive) return;
    
    currentLocationData = {
      ...currentLocationData,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    notifyListeners();
  }, 1000);
}

export function startAutoLocationTracking() {
  currentLocationData.isTrackingActive = true;
  startLiveTicker();
  notifyListeners();

  if ('geolocation' in navigator) {
    try {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = pos.coords.accuracy || 5.0;
          updateLocationFromCoords(lat, lng, acc, 'GPS_HARDWARE', pos.coords.speed, pos.coords.heading);
        },
        (err) => {
          console.warn('Geolocation access warning:', err.message);
          currentLocationData.permissionState = err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable';
          currentLocationData.isRealGpsActive = false;
          notifyListeners();
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    } catch (e) {
      console.warn('Geolocation setup failed:', e);
    }
  } else {
    currentLocationData.permissionState = 'unavailable';
    notifyListeners();
  }
}

export function requestHardwareGpsFix(): Promise<LocationData> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      currentLocationData.permissionState = 'unavailable';
      notifyListeners();
      resolve({ ...currentLocationData });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy || 3.0;
        await updateLocationFromCoords(lat, lng, acc, 'GPS_HARDWARE', pos.coords.speed, pos.coords.heading);
        resolve({ ...currentLocationData });
      },
      (err) => {
        console.warn('GPS Hardware fix error:', err.message);
        currentLocationData.permissionState = err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable';
        currentLocationData.isRealGpsActive = false;
        notifyListeners();
        resolve({ ...currentLocationData });
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  });
}

export function stopAutoLocationTracking() {
  if (watchId !== null && 'geolocation' in navigator) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  if (liveTickerInterval) {
    clearInterval(liveTickerInterval);
    liveTickerInterval = null;
  }
  currentLocationData.isTrackingActive = false;
  notifyListeners();
}

export function setPresetZone(zoneId: string) {
  const found = CAMPUS_ZONES.find(z => z.id === zoneId);
  if (found) {
    updateLocationFromCoords(found.lat, found.lng, 2.5, 'CAMPUS_LOCATION_BEACON');
  }
}

export function refreshCurrentLocation(): Promise<LocationData> {
  return requestHardwareGpsFix();
}

// React Hook for automatic location tracking
export function useLocationTracker() {
  const [location, setLocation] = useState<LocationData>(getLocationData());

  useEffect(() => {
    startAutoLocationTracking();
    const unsubscribe = subscribeLocationUpdates((newLoc) => {
      setLocation(newLoc);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    location,
    refreshLocation: refreshCurrentLocation,
    requestGps: requestHardwareGpsFix,
    setZone: setPresetZone,
    startTracking: startAutoLocationTracking,
    stopTracking: stopAutoLocationTracking,
    zones: CAMPUS_ZONES
  };
}

