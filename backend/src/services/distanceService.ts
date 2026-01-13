/**
 * Distance calculation service using Mapbox Directions API
 * Calculates road distance from home base to booking locations
 */

const HOME_BASE = {
  address: '19 Ijara Close, Sunninghill, Sandton',
  longitude: 28.0508,
  latitude: -26.0337,
};

interface DirectionsResponse {
  routes?: Array<{
    distance: number; // in meters
    duration: number; // in seconds
  }>;
  code?: string;
  message?: string;
}

/**
 * Calculate road distance from home base to a location
 * @param longitude - Destination longitude
 * @param latitude - Destination latitude
 * @returns Distance in kilometers
 */
export async function calculateDistanceFromBase(
  longitude: number,
  latitude: number
): Promise<number> {
  const mapboxToken = process.env.VITE_MAPBOX_TOKEN;

  if (!mapboxToken) {
    throw new Error('VITE_MAPBOX_TOKEN is not set');
  }

  try {
    // Mapbox Directions API endpoint
    // Format: {longitude},{latitude};{longitude},{latitude}
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${HOME_BASE.longitude},${HOME_BASE.latitude};${longitude},${latitude}`;

    const params = new URLSearchParams({
      access_token: mapboxToken,
      geometries: 'geojson',
      overview: 'simplified',
    });

    const response = await fetch(`${url}?${params.toString()}`);
    const data = (await response.json()) as DirectionsResponse;

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.error('Mapbox Directions API error:', data.message || 'No routes found');
      throw new Error('Unable to calculate distance');
    }

    // Convert meters to kilometers and round to 2 decimal places
    const distanceKm = Math.round((data.routes[0].distance / 1000) * 100) / 100;

    return distanceKm;
  } catch (error) {
    console.error('Error calculating distance:', error);
    throw new Error('Failed to calculate distance from base');
  }
}

/**
 * Calculate distance between two points (straight line)
 * Uses Haversine formula
 * @param lon1 - Longitude of point 1
 * @param lat1 - Latitude of point 1
 * @param lon2 - Longitude of point 2
 * @param lat2 - Latitude of point 2
 * @returns Distance in kilometers
 */
export function calculateStraightLineDistance(
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance-based pricing
 * @param basePrice - Base service price
 * @param distanceKm - Distance from home base in km
 * @returns Total price including distance charge
 */
export function calculatePriceWithDistance(basePrice: number, distanceKm: number): number {
  // Pricing structure:
  // - First 10km: included in base price
  // - 10-30km: R15 per km
  // - 30-50km: R20 per km
  // - 50km+: R25 per km

  let distanceCharge = 0;

  if (distanceKm <= 10) {
    distanceCharge = 0;
  } else if (distanceKm <= 30) {
    distanceCharge = (distanceKm - 10) * 15;
  } else if (distanceKm <= 50) {
    distanceCharge = 20 * 15 + (distanceKm - 30) * 20; // First 20km at R15, rest at R20
  } else {
    distanceCharge = 20 * 15 + 20 * 20 + (distanceKm - 50) * 25; // Tiered pricing
  }

  return Math.round((basePrice + distanceCharge) * 100) / 100;
}

export { HOME_BASE };
