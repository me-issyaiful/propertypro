import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  GoogleMap, 
  useLoadScript, 
  MarkerF, 
  InfoWindowF, 
  MarkerClustererF 
} from '@react-google-maps/api';
import { 
  MapPin, 
  School, 
  Utensils, 
  Trees, 
  Bus, 
  ShoppingBag, 
  Coffee, 
  Building, 
  AlertTriangle 
} from 'lucide-react';
import { placesService, PlaceType, NearbyPlace } from '../../services/placesService';

// Define the map container style
const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

// Define the map options
const defaultMapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  clickableIcons: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

// Define the marker clusterer options
const defaultClustererOptions = {
  imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
  gridSize: 50,
  minimumClusterSize: 3,
  zoomOnClick: true,
};

// Define the amenity categories
const amenityCategories = [
  { id: 'school', label: 'Schools', icon: School, color: '#3B82F6' },
  { id: 'restaurant', label: 'Restaurants', icon: Utensils, color: '#F59E0B' },
  { id: 'park', label: 'Parks', icon: Trees, color: '#10B981' },
  { id: 'transit_station', label: 'Transport', icon: Bus, color: '#6366F1' },
  { id: 'shopping_mall', label: 'Shopping', icon: ShoppingBag, color: '#EC4899' },
  { id: 'cafe', label: 'Cafes', icon: Coffee, color: '#8B5CF6' },
];

interface PropertyMapProps {
  propertyId: string;
  propertyTitle: string;
  location: {
    latitude?: number;
    longitude?: number;
    address: string;
    district: string;
    city: string;
    province: string;
  };
  searchRadius?: number; // in kilometers
}

const PropertyMap: React.FC<PropertyMapProps> = React.memo(({ 
  propertyId, 
  propertyTitle, 
  location,
  searchRadius = 2 // Default to 2km if not specified
}) => {
  // Load the Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  // State for the map
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  // State for the selected marker
  const [selectedMarker, setSelectedMarker] = useState<NearbyPlace | null>(null);
  
  // State for the nearby places
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  
  // State for loading and error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for active amenity filters
  const [activeFilters, setActiveFilters] = useState<string[]>(
    amenityCategories.map(cat => cat.id)
  );

  // Determine the center of the map
  const center = useMemo(() => {
    if (location.latitude && location.longitude) {
      return {
        lat: location.latitude,
        lng: location.longitude,
      };
    }
    
    // Default to Jakarta if no coordinates are provided
    return {
      lat: -6.2088,
      lng: 106.8456,
    };
  }, [location.latitude, location.longitude]);

  // Memoize map options to prevent unnecessary re-renders
  const mapOptions = useMemo(() => ({
    ...defaultMapOptions,
    zoom: 15,
  }), []);

  // Memoize clusterer options to prevent unnecessary re-renders
  const clustererOptions = useMemo(() => ({
    ...defaultClustererOptions,
  }), []);

  // Callback when the map is loaded
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  // Callback when the map is unmounted
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Fetch nearby places when the map is loaded
  useEffect(() => {
    if (!map || !isLoaded || !location.latitude || !location.longitude) return;

    const fetchNearbyPlaces = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const places = await placesService.getNearbyPlaces(
          map,
          { lat: location.latitude!, lng: location.longitude! },
          searchRadius * 1000 // Convert km to meters
        );
        
        setNearbyPlaces(places);
      } catch (err) {
        console.error('Error fetching nearby places:', err);
        setError('Failed to load nearby amenities. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNearbyPlaces();
  }, [map, isLoaded, location.latitude, location.longitude, propertyId, searchRadius]);

  // Filter places based on active filters
  const filteredPlaces = useMemo(() => {
    return nearbyPlaces.filter(place => 
      place.types.some(type => activeFilters.includes(type))
    );
  }, [nearbyPlaces, activeFilters]);

  // Toggle a filter
  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => {
      if (prev.includes(filterId)) {
        return prev.filter(id => id !== filterId);
      } else {
        return [...prev, filterId];
      }
    });
  };

  // Get marker icon for a place type
  const getMarkerIcon = (place: NearbyPlace) => {
    const placeType = place.types.find(type => 
      amenityCategories.some(cat => cat.id === type)
    );
    
    const category = amenityCategories.find(cat => cat.id === placeType);
    
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: category?.color || '#F7941D',
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: '#FFFFFF',
      scale: 8,
    };
  };

  // Handle marker click
  const handleMarkerClick = (place: NearbyPlace) => {
    setSelectedMarker(place);
  };

  // Render loading state
  if (!isLoaded) {
    return (
      <div className="bg-neutral-100 rounded-lg h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render error state
  if (loadError) {
    return (
      <div className="bg-neutral-100 rounded-lg h-[400px] flex items-center justify-center">
        <div className="text-center text-red-600">
          <AlertTriangle size={32} className="mx-auto mb-2" />
          <p>Error loading map. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative rounded-lg overflow-hidden shadow-md" style={mapContainerStyle} aria-label="Map showing property location and nearby amenities">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          options={mapOptions}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {/* Property Marker */}
          <MarkerF
            position={center}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#F7941D',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#FFFFFF',
              scale: 12,
            }}
            title={propertyTitle}
            aria-label={`Property location: ${propertyTitle}`}
          >
            <InfoWindowF position={center}>
              <div className="p-2">
                <h3 className="font-semibold text-sm">{propertyTitle}</h3>
                <p className="text-xs text-neutral-600">{location.address}</p>
              </div>
            </InfoWindowF>
          </MarkerF>

          {/* Nearby Places Markers */}
          {filteredPlaces.length > 0 && (
            <MarkerClustererF options={clustererOptions}>
              {(clusterer) => (
                <>
                  {filteredPlaces.map((place) => (
                    <MarkerF
                      key={place.id}
                      position={place.location}
                      clusterer={clusterer}
                      icon={getMarkerIcon(place)}
                      title={place.name}
                      onClick={() => handleMarkerClick(place)}
                      aria-label={`Nearby amenity: ${place.name}, type: ${place.types.join(', ')}`}
                    />
                  ))}
                </>
              )}
            </MarkerClustererF>
          )}

          {/* Selected Marker Info Window */}
          {selectedMarker && (
            <InfoWindowF
              position={selectedMarker.location}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2 max-w-xs">
                <h3 className="font-semibold text-sm">{selectedMarker.name}</h3>
                <p className="text-xs text-neutral-600">{selectedMarker.vicinity}</p>
                {selectedMarker.rating && (
                  <p className="text-xs text-yellow-600">
                    Rating: {selectedMarker.rating} ★ ({selectedMarker.userRatingsTotal} reviews)
                  </p>
                )}
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      </div>

      {/* Amenity Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-medium text-neutral-800 mb-3 flex items-center">
          <MapPin size={18} className="mr-2 text-primary" />
          Nearby Amenities
        </h3>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-3 flex items-center">
            <AlertTriangle size={18} className="mr-2" />
            {error}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          {amenityCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeFilters.includes(category.id);
            
            return (
              <button
                key={category.id}
                onClick={() => toggleFilter(category.id)}
                className={`flex items-center px-3 py-1.5 rounded-full text-sm transition-colors ${
                  isActive 
                    ? 'bg-primary text-white' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
                aria-pressed={isActive}
                aria-label={`Toggle ${category.label} filter`}
              >
                <Icon size={14} className="mr-1.5" />
                {category.label}
              </button>
            );
          })}
        </div>
        
        {isLoading && (
          <div className="flex justify-center mt-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          </div>
        )}
        
        {!isLoading && filteredPlaces.length === 0 && !error && (
          <p className="text-sm text-neutral-500 mt-3 text-center">
            No amenities found within {searchRadius}km of this property.
          </p>
        )}
      </div>

      {/* Accessibility Description (visually hidden but available to screen readers) */}
      <div className="sr-only">
        <h3>Map Information</h3>
        <p>
          This map shows the location of {propertyTitle} at {location.address}, {location.district}, {location.city}, {location.province}.
          {filteredPlaces.length > 0 && (
            <>
              There are {filteredPlaces.length} amenities within {searchRadius}km of this property, including:
              {amenityCategories.map(category => {
                const count = filteredPlaces.filter(place => 
                  place.types.includes(category.id)
                ).length;
                return count > 0 ? ` ${count} ${category.label},` : '';
              })}
            </>
          )}
        </p>
      </div>
    </div>
  );
});

export default PropertyMap;