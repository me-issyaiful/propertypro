/**
 * Listing information from database
 */
export interface Listing {
  /** Unique identifier for the listing */
  id: string;
  /** User ID who created the listing */
  user_id: string;
  /** Listing title */
  title: string;
  /** Detailed description */
  description: string;
  /** Numeric price value */
  price: number;
  /** Price unit */
  price_unit: 'juta' | 'miliar';
  /** Property type */
  property_type: 'rumah' | 'apartemen' | 'kondominium' | 'ruko' | 'gedung_komersial' | 'ruang_industri' | 'tanah' | 'lainnya';
  /** Listing purpose */
  purpose: 'jual' | 'sewa';
  /** Number of bedrooms (optional) */
  bedrooms: number | null;
  /** Number of bathrooms (optional) */
  bathrooms: number | null;
  /** Building size in square meters (optional) */
  building_size: number | null;
  /** Land size in square meters (optional) */
  land_size: number | null;
  /** Province ID (optional) */
  province_id: string | null;
  /** City ID (optional) */
  city_id: string | null;
  /** District ID (optional) */
  district_id: string | null;
  /** Full address (optional) */
  address: string | null;
  /** Postal code (optional) */
  postal_code: string | null;
  /** Array of property features (optional) */
  features: string[] | null;
  /** Listing status */
  status: 'active' | 'draft' | 'inactive' | 'pending' | 'rejected' | 'rented' | 'sold';
  /** Number of views */
  views: number;
  /** Number of inquiries */
  inquiries: number;
  /** Whether the listing is promoted */
  is_promoted: boolean;
  /** ISO date string when the listing was created */
  created_at: string;
  /** ISO date string when the listing was last updated */
  updated_at: string;
  /** Number of floors/levels (optional) */
  floors: number | null;
}

/**
 * Property media information
 */
export interface PropertyMedia {
  /** Unique identifier for the media */
  id: string;
  /** Associated listing ID */
  listing_id: string;
  /** Media URL */
  media_url: string;
  /** Media type */
  media_type: string;
  /** Whether this is the primary media */
  is_primary: boolean;
  /** ISO date string when the media was created */
  created_at: string;
  /** ISO date string when the media was last updated */
  updated_at: string;
}

/**
 * Listing form data for create/edit
 */
export interface ListingFormData {
  /** Listing title */
  title: string;
  /** Detailed description */
  description: string;
  /** Property type */
  propertyType: 'rumah' | 'apartemen' | 'ruko' | 'tanah' | 'gedung_komersial' | 'ruang_industri' | 'kondominium' | 'lainnya';
  /** Listing purpose */
  purpose: 'jual' | 'sewa';
  /** Numeric price value */
  price: number;
  /** Price unit */
  priceUnit: 'juta' | 'miliar';
  /** Number of bedrooms */
  bedrooms: number;
  /** Number of bathrooms */
  bathrooms: number;
  /** Building size in square meters */
  buildingSize: number;
  /** Land size in square meters */
  landSize: number;
  /** Number of floors/levels */
  floors?: number;
  /** Province ID */
  province: string;
  /** City ID */
  city: string;
  /** District ID */
  district: string;
  /** Full address */
  address: string;
  /** Array of property features */
  features: string[];
  /** Array of image URLs */
  images: string[];
  /** Whether to make the listing premium */
  makePremium: boolean;
  /** Number of floors/levels */
  floors?: number;
}

/**
 * User listing with additional frontend data
 */
export interface UserListing {
  /** Unique identifier for the listing */
  id: string;
  /** Listing title */
  title: string;
  /** Property type */
  type: string;
  /** Listing purpose */
  purpose: 'jual' | 'sewa';
  /** Numeric price value */
  price: number;
  /** Price unit */
  priceUnit: 'juta' | 'miliar';
  /** Listing status */
  status: 'active' | 'inactive' | 'expired' | 'pending';
  /** Whether the listing is premium */
  isPremium: boolean;
  /** ISO date string when premium expires (optional) */
  premiumExpiresAt?: string;
  /** Number of views */
  views: number;
  /** ISO date string when the listing was created */
  createdAt: string;
  /** Primary image URL */
  image: string;
  /** Location information */
  location: {
    /** City name */
    city: string;
    /** Province name */
    province: string;
  };
  /** Number of bedrooms (optional) */
  bedrooms?: number;
  /** Number of bathrooms (optional) */
  bathrooms?: number;
  /** Building size in square meters (optional) */
  buildingSize?: number;
  /** Land size in square meters (optional) */
  landSize?: number;
  /** Number of floors/levels (optional) */
  floors?: number;
  /** Number of floors/levels (optional) */
  floors?: number;
}

/**
 * Listing filter options
 */
export interface ListingFilters {
  /** Status filter */
  status?: string;
  /** Property type filter */
  type?: string;
  /** Purpose filter */
  purpose?: string;
  /** Price range filter */
  priceRange?: [number | null, number | null];
  /** Minimum price filter */
  minPrice?: number;
  /** Maximum price filter */
  maxPrice?: number;
  /** Minimum bedrooms filter */
  minBedrooms?: number;
  /** Maximum bedrooms filter */
  maxBedrooms?: number;
  /** Minimum bathrooms filter */
  minBathrooms?: number;
  /** Maximum bathrooms filter */
  maxBathrooms?: number;
  /** Minimum building size filter */
  minBuildingSize?: number;
  /** Maximum building size filter */
  maxBuildingSize?: number;
  /** Minimum land size filter */
  minLandSize?: number;
  /** Maximum land size filter */
  maxLandSize?: number;
  /** Minimum floors filter */
  minFloors?: number;
  /** Maximum floors filter */
  maxFloors?: number;
  /** Features filter */
  features?: string[];
  /** Location filter */
  location?: {
    /** Province ID */
    province?: string;
    /** City ID */
    city?: string;
    /** District ID */
    district?: string;
  };
  /** Sort option */
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'views' | 'premium' | 'building_size_asc' | 'building_size_desc' | 'land_size_asc' | 'land_size_desc';
}

/**
 * Property feature categories
 */
export interface FeatureCategory {
  /** Category name */
  name: string;
  /** Features in this category */
  features: {
    /** Feature ID */
    id: string;
    /** Feature label */
    label: string;
    /** Feature icon */
    icon?: string;
  }[];
}

/**
 * Predefined property features
 */
export const PROPERTY_FEATURES: FeatureCategory[] = [
  {
    name: 'Parking',
    features: [
      { id: 'garage', label: 'Garage' },
      { id: 'carport', label: 'Carport' },
      { id: 'street_parking', label: 'Street Parking' }
    ]
  },
  {
    name: 'Outdoor Spaces',
    features: [
      { id: 'garden', label: 'Garden' },
      { id: 'patio', label: 'Patio' },
      { id: 'balcony', label: 'Balcony' },
      { id: 'swimming_pool', label: 'Swimming Pool' }
    ]
  },
  {
    name: 'Security',
    features: [
      { id: 'cctv', label: 'CCTV' },
      { id: 'gated_community', label: 'Gated Community' },
      { id: 'security_system', label: 'Security System' }
    ]
  },
  {
    name: 'Interior Amenities',
    features: [
      { id: 'air_conditioning', label: 'Air Conditioning' },
      { id: 'built_in_wardrobes', label: 'Built-in Wardrobes' },
      { id: 'storage', label: 'Storage' }
    ]
  },
  {
    name: 'Kitchen Features',
    features: [
      { id: 'modern_appliances', label: 'Modern Appliances' },
      { id: 'kitchen_island', label: 'Kitchen Island' },
      { id: 'pantry', label: 'Pantry' }
    ]
  },
  {
    name: 'Additional Rooms',
    features: [
      { id: 'study', label: 'Study' },
      { id: 'home_office', label: 'Home Office' },
      { id: 'entertainment_room', label: 'Entertainment Room' }
    ]
  },
  {
    name: 'Utilities',
    features: [
      { id: 'solar_panels', label: 'Solar Panels' },
      { id: 'water_tank', label: 'Water Tank' },
      { id: 'backup_generator', label: 'Backup Generator' }
    ]
  },
  {
    name: 'Layout Options',
    features: [
      { id: 'open_floor_plan', label: 'Open Floor Plan' },
      { id: 'separate_dining', label: 'Separate Dining Room' },
      { id: 'master_bedroom_downstairs', label: 'Master Bedroom Downstairs' },
      { id: 'modern_kitchen', label: 'Modern Kitchen' }
    ]
  }
];

/**
 * Get all available property features as a flat array
 */
export const getAllPropertyFeatures = (): { id: string; label: string; icon?: string; category: string }[] => {
  return PROPERTY_FEATURES.flatMap(category => 
    category.features.map(feature => ({
      ...feature,
      category: category.name
    }))
  );
};

/**
 * Get feature label by ID
 */
export const getFeatureLabelById = (featureId: string): string => {
  const feature = getAllPropertyFeatures().find(f => f.id === featureId);
  return feature?.label || featureId;
};