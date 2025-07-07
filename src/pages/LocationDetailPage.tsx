import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PropertyCard from '../components/common/PropertyCard';
import { 
  MapPin, 
  Home, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Bed, 
  Bath, 
  Move, 
  DollarSign,
  SortAsc,
  Grid,
  List as ListIcon,
  Loader
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Property } from '../types';
import { listingService } from '../services/listingService';
import { locationService } from '../services/locationService';
import { useToast } from '../contexts/ToastContext';

const LocationDetailPage: React.FC = () => {
  const { locationSlug } = useParams<{ locationSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showError } = useToast();
  
  // State for location and properties
  const [location, setLocation] = useState<any>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  
  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[string, string]>(['', '']);
  const [propertyType, setPropertyType] = useState<string>(searchParams.get('type') || '');
  const [bedrooms, setBedrooms] = useState<string>(searchParams.get('bedrooms') || '');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sortBy') || 'popularity');
  
  useEffect(() => {
    if (locationSlug) {
      fetchLocationDetails();
    }
  }, [locationSlug]);
  
  useEffect(() => {
    if (location) {
      fetchProperties();
    }
  }, [location, currentPage, sortBy]);
  
  const fetchLocationDetails = async () => {
    try {
      // Find location by slug
      const locations = await locationService.getAllLocations({ search: locationSlug });
      const matchedLocation = locations.find(loc => loc.slug === locationSlug);
      
      if (!matchedLocation) {
        throw new Error('Location not found');
      }
      
      setLocation(matchedLocation);
    } catch (error) {
      console.error('Error fetching location details:', error);
      showError('Error', 'Failed to load location details. Please try again.');
    }
  };
  
  const fetchProperties = async () => {
    if (!location) return;
    
    setIsLoading(true);
    try {
      // Prepare filters
      const filters: any = {
        status: 'active'
      };
      
      // Add location filter based on location type
      if (location.type === 'provinsi') {
        filters.location = { province: location.id };
      } else if (location.type === 'kota') {
        filters.location = { city: location.id };
      } else if (location.type === 'kecamatan') {
        filters.location = { district: location.id };
      }
      
      // Add property type filter if selected
      if (propertyType) {
        filters.type = propertyType;
      }
      
      // Add bedrooms filter if selected
      if (bedrooms) {
        filters.minBedrooms = parseInt(bedrooms);
      }
      
      // Add price range filter if set
      if (priceRange[0]) {
        filters.minPrice = parseFloat(priceRange[0]);
      }
      if (priceRange[1]) {
        filters.maxPrice = parseFloat(priceRange[1]);
      }
      
      // Add sorting
      switch (sortBy) {
        case 'popularity':
          filters.sortBy = 'views';
          break;
        case 'price_low':
          filters.sortBy = 'price_asc';
          break;
        case 'price_high':
          filters.sortBy = 'price_desc';
          break;
        case 'newest':
          filters.sortBy = 'newest';
          break;
        default:
          filters.sortBy = 'views';
      }
      
      // Fetch properties
      const { data, count } = await listingService.getAllListings(
        filters,
        currentPage,
        pageSize
      );
      
      setProperties(data);
      setTotalCount(count);
    } catch (error) {
      console.error('Error fetching properties:', error);
      showError('Error', 'Failed to load properties. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const applyFilters = () => {
    // Update URL parameters
    const params = new URLSearchParams();
    
    if (propertyType) {
      params.set('type', propertyType);
    }
    
    if (bedrooms) {
      params.set('bedrooms', bedrooms);
    }
    
    if (priceRange[0]) {
      params.set('minPrice', priceRange[0]);
    }
    
    if (priceRange[1]) {
      params.set('maxPrice', priceRange[1]);
    }
    
    if (sortBy !== 'popularity') {
      params.set('sortBy', sortBy);
    }
    
    setSearchParams(params);
    setCurrentPage(1);
    fetchProperties();
  };
  
  const resetFilters = () => {
    setPriceRange(['', '']);
    setPropertyType('');
    setBedrooms('');
    setSortBy('popularity');
    setSearchParams({});
    setCurrentPage(1);
    fetchProperties();
  };
  
  if (!location && !isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="font-heading text-2xl font-bold mb-4">Location Not Found</h2>
            <p className="mb-6">Sorry, the location you are looking for does not exist or has been removed.</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Helmet>
        <title>{location ? `Properties in ${location.name}` : 'Loading...'} | Properti Pro</title>
        <meta 
          name="description" 
          content={location ? `Discover properties in ${location.name}. Find houses, apartments, and more for sale or rent.` : 'Loading properties...'}
        />
      </Helmet>
      
      <div className="bg-neutral-100 py-8">
        <div className="container mx-auto px-4">
          {/* Location Header */}
          {location && (
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between">
                <div>
                  <div className="flex items-center text-primary mb-2">
                    <MapPin size={16} className="mr-1" />
                    <span className="text-sm">
                      {location.type === 'kecamatan' ? 'District' : 
                       location.type === 'kota' ? 'City' : 'Province'}
                    </span>
                  </div>
                  <h1 className="font-heading font-bold text-3xl md:text-4xl text-accent mb-2">
                    Properties in {location.name}
                  </h1>
                  <p className="text-neutral-600">
                    Discover {totalCount} properties available in {location.name}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                >
                  <Filter size={18} className="mr-2" />
                  Filters
                  {showFilters ? <ChevronUp size={16} className="ml-2" /> : <ChevronDown size={16} className="ml-2" />}
                </button>
                
                <div className="ml-4">
                  <select
                    className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      const params = new URLSearchParams(searchParams);
                      params.set('sortBy', e.target.value);
                      setSearchParams(params);
                    }}
                  >
                    <option value="popularity">Most Popular</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm text-neutral-600 mr-2">View:</span>
                <div className="flex border rounded overflow-hidden">
                  <button 
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-neutral-700'}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid View"
                  >
                    <Grid size={16} />
                  </button>
                  <button 
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-neutral-700'}`}
                    onClick={() => setViewMode('list')}
                    aria-label="List View"
                  >
                    <ListIcon size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Price Range
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <DollarSign size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                        <input
                          type="number"
                          placeholder="Min"
                          className="w-full pl-8 pr-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([e.target.value, priceRange[1]])}
                        />
                      </div>
                      <span>-</span>
                      <div className="relative flex-1">
                        <DollarSign size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                        <input
                          type="number"
                          placeholder="Max"
                          className="w-full pl-8 pr-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], e.target.value])}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Property Type */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Property Type
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                    >
                      <option value="">All Types</option>
                      <option value="rumah">House</option>
                      <option value="apartemen">Apartment</option>
                      <option value="kondominium">Condominium</option>
                      <option value="ruko">Shop House</option>
                      <option value="tanah">Land</option>
                      <option value="gedung_komersial">Commercial Building</option>
                      <option value="ruang_industri">Industrial Space</option>
                      <option value="lainnya">Other</option>
                    </select>
                  </div>
                  
                  {/* Bedrooms */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Bedrooms
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-end space-x-2">
                    <button
                      onClick={applyFilters}
                      className="flex-1 btn-primary py-2"
                    >
                      Apply Filters
                    </button>
                    <button
                      onClick={resetFilters}
                      className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Active Filters */}
          {(propertyType || bedrooms || priceRange[0] || priceRange[1]) && (
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-neutral-700">Active Filters:</span>
                
                {propertyType && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                    <Home size={14} className="mr-1" />
                    {propertyType === 'rumah' ? 'House' : 
                     propertyType === 'apartemen' ? 'Apartment' : 
                     propertyType === 'kondominium' ? 'Condominium' : 
                     propertyType === 'ruko' ? 'Shop House' : 
                     propertyType === 'tanah' ? 'Land' : 
                     propertyType === 'gedung_komersial' ? 'Commercial Building' : 
                     propertyType === 'ruang_industri' ? 'Industrial Space' : 'Other'}
                  </span>
                )}
                
                {bedrooms && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                    <Bed size={14} className="mr-1" />
                    {bedrooms}+ Bedrooms
                  </span>
                )}
                
                {priceRange[0] && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                    <DollarSign size={14} className="mr-1" />
                    Min: {priceRange[0]}
                  </span>
                )}
                
                {priceRange[1] && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                    <DollarSign size={14} className="mr-1" />
                    Max: {priceRange[1]}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Properties Grid/List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center">
                <Loader size={40} className="animate-spin text-primary mb-4" />
                <p className="text-neutral-600">Loading properties in {location?.name || ''}...</p>
              </div>
            </div>
          ) : properties.length > 0 ? (
            <>
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-6'
              }>
                {properties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
              
              {/* Pagination */}
              {totalCount > pageSize && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50"
                    >
                      Previous
                    </button>
                    
                    <div className="text-neutral-700">
                      Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home size={32} className="text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                No properties found
              </h3>
              <p className="text-neutral-600 mb-4">
                We couldn't find any properties matching your criteria in {location?.name}.
              </p>
              <button 
                onClick={resetFilters}
                className="btn-primary"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LocationDetailPage;