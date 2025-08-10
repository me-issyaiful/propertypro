import { supabase } from '../lib/supabase';
import { Property, PropertyType, ListingStatus } from '../types';
import { ListingFormData, UserListing } from '../types/listing';
import { premiumService } from './premiumService';
import { PremiumListing } from '../types/premium';

interface ListingFilters {
  status?: string;
  type?: string;
  purpose?: string;
  priceRange?: [number | null, number | null];
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minBuildingSize?: number;
  maxBuildingSize?: number;
  minLandSize?: number;
  maxLandSize?: number;
  minFloors?: number;
  maxFloors?: number;
  features?: string[];
  location?: {
    province?: string;
    city?: string;
    district?: string;
  };
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'views' | 'premium' | 'building_size_asc' | 'building_size_desc' | 'land_size_asc' | 'land_size_desc';
}

interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  price_unit: 'juta' | 'miliar';
  property_type: 'rumah' | 'apartemen' | 'kondominium' | 'ruko' | 'gedung_komersial' | 'ruang_industri' | 'tanah' | 'lainnya';
  purpose: 'jual' | 'sewa';
  bedrooms: number | null;
  bathrooms: number | null;
  building_size: number | null;
  land_size: number | null;
  province_id: string | null;
  city_id: string | null;
  district_id: string | null;
  address: string | null;
  postal_code: string | null;
  features: string[] | null;
  status: 'active' | 'draft' | 'inactive' | 'pending' | 'rejected' | 'rented' | 'sold';
  views: number;
  inquiries: number;
  is_promoted: boolean;
  created_at: string;
  updated_at: string;
  floors: number | null;
}

class ListingService {
}