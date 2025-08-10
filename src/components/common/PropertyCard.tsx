import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  MapPin, 
  Loader,
  Bed, 
  Bath, 
  Move, 
  Home,
  Star,
  Car,
  Droplets,
  Trees,
  Tv,
  Utensils,
  Briefcase,
  Sun,
  Shield,
  LayoutGrid
} from 'lucide-react';
import { Property } from '../../types';
import { formatPrice } from '../../utils/formatter';
import PremiumPropertyCard from '../premium/PremiumPropertyCard';
import { getFeatureLabelById } from '../../types/listing';

interface PropertyCardProps {
  property: Property;
}

// Feature icon mapping
const featureIcons: Record<string, React.ElementType> = {
  // Parking
  garage: Car,
  carport: Car,
  street_parking: Car,
  
  // Outdoor spaces
  garden: Trees,
  patio: Trees,
  balcony: Trees,
  swimming_pool: Droplets,
  
  // Security
  cctv: Shield,
  gated_community: Shield,
  security_system: Shield,
  
  // Interior amenities
  air_conditioning: Sun,
  built_in_wardrobes: Home,
  storage: Home,
  
  // Kitchen features
  modern_appliances: Utensils,
  kitchen_island: Utensils,
  pantry: Utensils,
  
  // Additional rooms
  study: Briefcase,
  home_office: Briefcase,
  entertainment_room: Tv,
  
  // Layout options
  open_floor_plan: LayoutGrid,
  separate_dining: LayoutGrid,
  master_bedroom_downstairs: Bed,
  modern_kitchen: Utensils,
  
  // Utilities
  solar_panels: Sun,
  water_tank: Droplets,
  backup_generator: Home
};

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  // Check if property has premium details
  if (property.premiumDetails) {
    return (
      <PremiumPropertyCard 
        property={property} 
        premiumListing={property.premiumDetails}
      />
    );
  }

  // Standard property card
  const {
    id,
    title,
    price,
    priceUnit,
    purpose,
    type,
    location,
    bedrooms,
    bathrooms,
    buildingSize,
    floors,
    images,
    features,
    views,
    description
  } = property;

  // Get up to 3 featured amenities to display as icons
  const featuredAmenities = features
    .filter(feature => featureIcons[feature])
    .slice(0, 3);

  return (
    <div className="card group">
      {/* Image */}
      <div className="relative overflow-hidden h-48">
        <Link to={`/properti/${id}`}>
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>
        <div className="absolute top-2 right-2 z-10">
          <button 
            className="bg-white p-1.5 rounded-full shadow-md hover:bg-primary hover:text-white transition-colors duration-300"
            aria-label="Simpan properti ini"
          >
            <Heart size={18} />
          </button>
        </div>
        <div className="absolute top-2 left-2 z-10">
          <span className={`text-xs font-medium px-2 py-1 rounded-md uppercase ${purpose === 'jual' ? 'bg-primary text-white' : 'bg-success-500 text-white'}`}>
            {purpose === 'jual' ? 'Dijual' : 'Disewa'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-neutral-500 uppercase">
            {type === 'rumah' ? 'House' : 
             type === 'apartemen' ? 'Apartment' : 
             type === 'kondominium' ? 'Condominium' : 
             type === 'ruko' ? 'Shop House' : 
             type === 'tanah' ? 'Land' : 
             type === 'gedung_komersial' ? 'Commercial' : 
             type === 'ruang_industri' ? 'Industrial' : 'Property'}
          </span>
        </div>
        <h3 className="font-heading font-semibold text-lg mb-1 line-clamp-2 h-14">
          <Link to={`/properti/${id}`} className="hover:text-primary transition-colors">
            {title}
          </Link>
        </h3>
        
        <p className="text-primary font-heading font-bold text-lg mb-3">
          {formatPrice(price, priceUnit)}
          {purpose === 'sewa' && <span className="text-sm font-normal text-neutral-500">/bulan</span>}
        </p>

        <div className="flex items-center mb-2">
          <span className="text-xs text-neutral-500 ml-1">({views} views)</span>
        </div>

        {/* Brief description */}
        <p className="text-sm text-neutral-600 mb-3 line-clamp-2 h-10">
          {description?.substring(0, 100)}...
        </p>

        <div className="flex items-center text-neutral-500 text-sm mb-3">
          <MapPin size={16} className="mr-1 flex-shrink-0" />
          <span className="truncate">
            {location.district ? `${location.district}, ${location.city}` : location.city}
          </span>
        </div>

        {/* Features */}
        <div className="flex justify-between text-neutral-700 border-t border-neutral-200 pt-3 flex-wrap gap-2">
          {bedrooms !== undefined && (
            <div className="flex items-center">
              <Bed size={16} className="mr-1" />
              <span className="text-sm">{bedrooms}</span>
            </div>
          )}
          
          {bathrooms !== undefined && (
            <div className="flex items-center">
              <Bath size={16} className="mr-1" />
              <span className="text-sm">{bathrooms}</span>
            </div>
          )}
          
          {buildingSize !== undefined && (
            <div className="flex items-center">
              <Move size={16} className="mr-1" />
              <span className="text-sm">{buildingSize} m²</span>
            </div>
          )}
          
          {floors !== undefined && (
            <div className="flex items-center">
              <Home size={16} className="mr-1" />
              <span className="text-sm">{floors} floor{floors > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        
        {/* Featured Amenities */}
        {featuredAmenities.length > 0 && (
          <div className="flex flex-wrap justify-start gap-3 mt-3 pt-2 border-t border-neutral-200">
            {featuredAmenities.map((feature, index) => {
              const Icon = featureIcons[feature];
              return (
                <div key={index} className="flex items-center text-neutral-600" title={getFeatureLabelById(feature)}>
                  <Icon size={14} className="mr-1" />
                  <span className="text-xs">{getFeatureLabelById(feature)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;