/**
 * Service for interacting with Google Places API
 */

// Define place types
export type PlaceType = 
  | 'school' 
  | 'restaurant' 
  | 'park' 
  | 'transit_station' 
  | 'shopping_mall' 
  | 'cafe' 
  | 'hospital' 
  | 'pharmacy' 
  | 'gym' 
  | 'bank' 
  | 'supermarket';

// Define nearby place interface
export interface NearbyPlace {
  id: string;
  name: string;
  location: google.maps.LatLngLiteral;
  vicinity: string;
  types: PlaceType[];
  rating?: number;
  userRatingsTotal?: number;
  icon?: string;
}

class PlacesService {
  /**
   * Get nearby places around a location
   * @param map Google Maps instance
   * @param location Center location
   * @param radius Search radius in meters (default: 2000m = 2km)
   * @returns Array of nearby places
   */
  async getNearbyPlaces(
    map: google.maps.Map,
    location: google.maps.LatLngLiteral,
    radius: number = 2000
  ): Promise<NearbyPlace[]> {
    try {
      // Create a Places service instance
      const service = new google.maps.places.PlacesService(map);
      
      // Define the place types we want to search for
      const placeTypes: PlaceType[] = [
        'school',
        'restaurant',
        'park',
        'transit_station',
        'shopping_mall',
        'cafe',
      ];
      
      // Fetch places for each type
      const allPlaces: NearbyPlace[] = [];
      
      // Use Promise.all to fetch all place types in parallel
      await Promise.all(
        placeTypes.map(async (type) => {
          try {
            const places = await this.searchNearbyPlaces(service, location, radius, type);
            allPlaces.push(...places);
          } catch (error) {
            console.error(`Error fetching ${type} places:`, error);
            // Continue with other place types even if one fails
          }
        })
      );
      
      // Remove duplicates (some places might appear in multiple categories)
      const uniquePlaces = this.removeDuplicatePlaces(allPlaces);
      
      return uniquePlaces;
    } catch (error) {
      console.error('Error in getNearbyPlaces:', error);
      throw new Error('Failed to fetch nearby places');
    }
  }
  
  /**
   * Search for nearby places of a specific type
   * @param service Google Places service instance
   * @param location Center location
   * @param radius Search radius in meters
   * @param type Place type to search for
   * @returns Array of nearby places
   */
  private searchNearbyPlaces(
    service: google.maps.places.PlacesService,
    location: google.maps.LatLngLiteral,
    radius: number,
    type: PlaceType
  ): Promise<NearbyPlace[]> {
    return new Promise((resolve, reject) => {
      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius,
        type: type as unknown as google.maps.places.PlaceType,
      };
      
      service.nearbySearch(request, (results, status, pagination) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          // Map the results to our NearbyPlace interface
          const places: NearbyPlace[] = results.map(place => ({
            id: place.place_id || `place-${Math.random().toString(36).substr(2, 9)}`,
            name: place.name || 'Unknown Place',
            location: {
              lat: place.geometry?.location?.lat() || location.lat,
              lng: place.geometry?.location?.lng() || location.lng,
            },
            vicinity: place.vicinity || '',
            types: place.types?.filter(t => 
              placeTypes.includes(t as PlaceType)
            ) as PlaceType[] || [type],
            rating: place.rating,
            userRatingsTotal: place.user_ratings_total,
            icon: place.icon,
          }));
          
          resolve(places);
        } else {
          // If no results or error, resolve with empty array instead of rejecting
          // This prevents one failed search from breaking the entire component
          if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve([]);
          } else {
            console.warn(`Places API returned status: ${status} for type: ${type}`);
            resolve([]);
          }
        }
      });
    });
  }
  
  /**
   * Remove duplicate places from the array
   * @param places Array of places
   * @returns Array of unique places
   */
  private removeDuplicatePlaces(places: NearbyPlace[]): NearbyPlace[] {
    const uniquePlaces = new Map<string, NearbyPlace>();
    
    places.forEach(place => {
      if (!uniquePlaces.has(place.id)) {
        uniquePlaces.set(place.id, place);
      } else {
        // If the place already exists, merge the types
        const existingPlace = uniquePlaces.get(place.id)!;
        const mergedTypes = [...new Set([...existingPlace.types, ...place.types])];
        uniquePlaces.set(place.id, {
          ...existingPlace,
          types: mergedTypes as PlaceType[],
        });
      }
    });
    
    return Array.from(uniquePlaces.values());
  }
}

// List of all supported place types
const placeTypes: PlaceType[] = [
  'school',
  'restaurant',
  'park',
  'transit_station',
  'shopping_mall',
  'cafe',
  'hospital',
  'pharmacy',
  'gym',
  'bank',
  'supermarket',
];

export const placesService = new PlacesService();