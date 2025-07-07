import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PropertyCard from '../components/common/PropertyCard';
import SearchBox from '../components/common/SearchBox';
import { Property } from '../types';
import { premiumService } from '../services/premiumService';
import { 
  GridIcon, 
  List, 
  SortAsc, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Bed, 
  Bath, 
  Move, 
  Home, 
  DollarSign,
  Check
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { listingService } from '../services/listingService';
import { useToast } from '../contexts/ToastContext';
import { PROPERTY_FEATURES, getAllPropertyFeatures, getFeatureLabelById } from '../types/listing';

const PropertyListingPage: React.FC = () => {
  const location = useLocation();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showError } = useToast();
  
  // Get filters from URL parameters
  const purpose = params.purpose || searchParams.get('purpose') || 'jual';
  const propertyType = searchParams.get('type');
  const province = searchParams.get('province');
  const city = searchParams.get('city');
  const district = searchParams.get('district');
  
  // Get advanced filters from URL parameters
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const minBedrooms = searchParams.get('minBedrooms') ? Number(searchParams.get('minBedrooms')) : undefined;
  const maxBedrooms = searchParams.get('maxBedrooms') ? Number(searchParams.get('maxBedrooms')) : undefined;
  const minBathrooms = searchParams.get('minBathrooms') ? Number(searchParams.get('minBathrooms')) : undefined;
  const maxBathrooms = searchParams.get('maxBathrooms') ? Number(searchParams.get('maxBathrooms')) : undefined;
  const minBuildingSize = searchParams.get('minBuildingSize') ? Number(searchParams.get('minBuildingSize')) : undefined;
  const maxBuildingSize = searchParams.get('maxBuildingSize') ? Number(searchParams.get('maxBuildingSize')) : undefined;
  const minLandSize = searchParams.get('minLandSize') ? Number(searchParams.get('minLandSize')) : undefined;
  const maxLandSize = searchParams.get('maxLandSize') ? Number(searchParams.get('maxLandSize')) : undefined;
  const minFloors = searchParams.get('minFloors') ? Number(searchParams.get('minFloors')) : undefined;
  const maxFloors = searchParams.get('maxFloors') ? Number(searchParams.get('maxFloors')) : undefined;
  
  // Get features from URL parameters (can be multiple)
  const featuresFromUrl = searchParams.getAll('features');
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sortBy') || 'premium');
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  
  // Advanced filters state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(featuresFromUrl);
  
  // Local filter state (for the filter sidebar)
  const [localFilters, setLocalFilters] = useState({
    minPrice: minPrice?.toString() || '',
    maxPrice: maxPrice?.toString() || '',
    minBedrooms: minBedrooms?.toString() || '',
    maxBedrooms: maxBedrooms?.toString() || '',
    minBathrooms: minBathrooms?.toString() || '',
    maxBathrooms: maxBathrooms?.toString() || '',
    minBuildingSize: minBuildingSize?.toString() || '',
    maxBuildingSize: maxBuildingSize?.toString() || '',
    minLandSize: minLandSize?.toString() || '',
    maxLandSize: maxLandSize?.toString() || '',
    minFloors: minFloors?.toString() || '',
    maxFloors: maxFloors?.toString() || '',
    features: [...featuresFromUrl]
  });
  
  useEffect(() => {
    fetchProperties();
  }, [
    purpose, 
    propertyType, 
    province, 
    city, 
    district, 
    sortBy, 
    currentPage,
    minPrice,
    maxPrice,
    minBedrooms,
    maxBedrooms,
    minBathrooms,
    maxBathrooms,
    minBuildingSize,
    maxBuildingSize,
    minLandSize,
    maxLandSize,
    minFloors,
    maxFloors,
    featuresFromUrl
  ]);
  
  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      // Prepare filters
      const filters: any = {
        purpose,
        sortBy,
        status: 'active'
      };
      
      if (propertyType) {
        filters.type = propertyType;
      }
      
      if (province) {
        filters.location = { province };
      }
      
      if (city) {
        filters.location = { ...filters.location, city };
      }
      
      if (district) {
        filters.location = { ...filters.location, district };
      }
      
      // Add advanced filters
      if (minPrice !== undefined) filters.minPrice = minPrice;
      if (maxPrice !== undefined) filters.maxPrice = maxPrice;
      if (minBedrooms !== undefined) filters.minBedrooms = minBedrooms;
      if (maxBedrooms !== undefined) filters.maxBedrooms = maxBedrooms;
      if (minBathrooms !== undefined) filters.minBathrooms = minBathrooms;
      if (maxBathrooms !== undefined) filters.maxBathrooms = maxBathrooms;
      if (minBuildingSize !== undefined) filters.minBuildingSize = minBuildingSize;
      if (maxBuildingSize !== undefined) filters.maxBuildingSize = maxBuildingSize;
      if (minLandSize !== undefined) filters.minLandSize = minLandSize;
      if (maxLandSize !== undefined) filters.maxLandSize = maxLandSize;
      if (minFloors !== undefined) filters.minFloors = minFloors;
      if (maxFloors !== undefined) filters.maxFloors = maxFloors;
      
      // Add features filter
      if (featuresFromUrl.length > 0) {
        filters.features = featuresFromUrl;
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
  
  const handleSortChange = (value: string) => {
    setSortBy(value);
    
    // Update URL parameters
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', value);
    setSearchParams(newParams);
  };
  
  const toggleFeature = (featureId: string) => {
    setLocalFilters(prev => {
      const newFeatures = prev.features.includes(featureId)
        ? prev.features.filter(id => id !== featureId)
        : [...prev.features, featureId];
      
      return {
        ...prev,
        features: newFeatures
      };
    });
  };
  
  const applyFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    
    // Update price filters
    if (localFilters.minPrice) {
      newParams.set('minPrice', localFilters.minPrice);
    } else {
      newParams.delete('minPrice');
    }
    
    if (localFilters.maxPrice) {
      newParams.set('maxPrice', localFilters.maxPrice);
    } else {
      newParams.delete('maxPrice');
    }
    
    // Update bedroom filters
    if (localFilters.minBedrooms) {
      newParams.set('minBedrooms', localFilters.minBedrooms);
    } else {
      newParams.delete('minBedrooms');
    }
    
    if (localFilters.maxBedrooms) {
      newParams.set('maxBedrooms', localFilters.maxBedrooms);
    } else {
      newParams.delete('maxBedrooms');
    }
    
    // Update bathroom filters
    if (localFilters.minBathrooms) {
      newParams.set('minBathrooms', localFilters.minBathrooms);
    } else {
      newParams.delete('minBathrooms');
    }
    
    if (localFilters.maxBathrooms) {
      newParams.set('maxBathrooms', localFilters.maxBathrooms);
    } else {
      newParams.delete('maxBathrooms');
    }
    
    // Update building size filters
    if (localFilters.minBuildingSize) {
      newParams.set('minBuildingSize', localFilters.minBuildingSize);
    } else {
      newParams.delete('minBuildingSize');
    }
    
    if (localFilters.maxBuildingSize) {
      newParams.set('maxBuildingSize', localFilters.maxBuildingSize);
    } else {
      newParams.delete('maxBuildingSize');
    }
    
    // Update land size filters
    if (localFilters.minLandSize) {
      newParams.set('minLandSize', localFilters.minLandSize);
    } else {
      newParams.delete('minLandSize');
    }
    
    if (localFilters.maxLandSize) {
      newParams.set('maxLandSize', localFilters.maxLandSize);
    } else {
      newParams.delete('maxLandSize');
    }
    
    // Update floors filters
    if (localFilters.minFloors) {
      newParams.set('minFloors', localFilters.minFloors);
    } else {
      newParams.delete('minFloors');
    }
    
    if (localFilters.maxFloors) {
      newParams.set('maxFloors', localFilters.maxFloors);
    } else {
      newParams.delete('maxFloors');
    }
    
    // Update features filters
    newParams.delete('features');
    localFilters.features.forEach(feature => {
      newParams.append('features', feature);
    });
    
    // Reset to page 1 when filters change
    newParams.delete('page');
    
    setSearchParams(newParams);
  };
  
  const resetFilters = () => {
    const newParams = new URLSearchParams();
    newParams.set('purpose', purpose.toString());
    if (propertyType) newParams.set('type', propertyType);
    if (province) newParams.set('province', province);
    if (city) newParams.set('city', city);
    if (district) newParams.set('district', district);
    if (sortBy !== 'premium') newParams.set('sortBy', sortBy);
    
    setSearchParams(newParams);
    
    setLocalFilters({
      minPrice: '',
      maxPrice: '',
      minBedrooms: '',
      maxBedrooms: '',
      minBathrooms: '',
      maxBathrooms: '',
      minBuildingSize: '',
      maxBuildingSize: '',
      minLandSize: '',
      maxLandSize: '',
      minFloors: '',
      maxFloors: '',
      features: []
    });
  };
  
  const pageTitle = `Properti ${purpose === 'jual' ? 'Dijual' : 'Disewa'}${propertyType ? ` - ${propertyType}` : ''}`;
  
  return (
    <Layout>
      <Helmet>
        <title>{`${pageTitle} | Properti Pro`}</title>
        <meta 
          name="description" 
          content={`Temukan properti ${purpose === 'jual' ? 'dijual' : 'disewa'} di Indonesia. Pilihan terlengkap rumah, apartemen, ruko, dan properti lainnya dengan harga terbaik.`}
        />
        <meta name="keywords" content={`properti ${purpose}, ${propertyType || 'rumah, apartemen'}, ${city || 'indonesia'}, jual beli properti, sewa properti`} />
        <link rel="canonical" href={`https://propertipro.id/${purpose}`} />
      </Helmet>
      
      <div className="bg-neutral-100 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-accent mb-4">
              {pageTitle}
            </h1>
            
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <SearchBox 
                variant="compact" 
                initialFilters={{
                  purpose: purpose as 'jual' | 'sewa',
                  province,
                  city,
                  district,
                  type: propertyType || undefined,
                  minPrice,
                  maxPrice,
                  minBedrooms,
                  maxBedrooms,
                  minBathrooms,
                  maxBathrooms,
                  minBuildingSize,
                  maxBuildingSize,
                  minLandSize,
                  maxLandSize,
                  minFloors,
                  maxFloors,
                  features: featuresFromUrl
                }}
              />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded-lg shadow-sm">
              <p className="text-neutral-700 mb-4 md:mb-0">
                Menampilkan <span className="font-semibold">{properties.length}</span> dari <span className="font-semibold">{totalCount}</span> properti
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center">
                  <span className="text-sm text-neutral-600 mr-2">Tampilan:</span>
                  <div className="flex border rounded overflow-hidden">
                    <button 
                      className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-neutral-700'}`}
                      onClick={() => setViewMode('grid')}
                      aria-label="Tampilan Grid"
                    >
                      <GridIcon size={16} />
                    </button>
                    <button 
                      className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-neutral-700'}`}
                      onClick={() => setViewMode('list')}
                      aria-label="Tampilan List"
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm text-neutral-600 mr-2">Urutkan:</span>
                  <div className="relative">
                    <div className="flex items-center border rounded p-2">
                      <SortAsc size={16} className="mr-2 text-neutral-500" />
                      <select
                        className="bg-transparent appearance-none outline-none pr-8"
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value)}
                      >
                        <option value="premium">Premium & Terbaru</option>
                        <option value="newest">Terbaru</option>
                        <option value="price_asc">Harga: Rendah ke Tinggi</option>
                        <option value="price_desc">Harga: Tinggi ke Rendah</option>
                        <option value="building_size_asc">Luas Bangunan: Kecil ke Besar</option>
                        <option value="building_size_desc">Luas Bangunan: Besar ke Kecil</option>
                        <option value="land_size_asc">Luas Tanah: Kecil ke Besar</option>
                        <option value="land_size_desc">Luas Tanah: Besar ke Kecil</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filter Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg flex items-center">
                    <Filter size={18} className="mr-2" />
                    Filters
                  </h2>
                  <button
                    onClick={resetFilters}
                    className="text-sm text-primary hover:underline"
                  >
                    Reset All
                  </button>
                </div>
                
                {/* Price Range */}
                <div className="mb-4">
                  <h3 className="font-medium text-neutral-800 mb-2 flex items-center">
                    <DollarSign size={16} className="mr-1" />
                    Price Range
                  </h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={localFilters.minPrice}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={localFilters.maxPrice}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    />
                  </div>
                </div>
                
                {/* Bedrooms */}
                <div className="mb-4">
                  <h3 className="font-medium text-neutral-800 mb-2 flex items-center">
                    <Bed size={16} className="mr-1" />
                    Bedrooms
                  </h3>
                  <div className="flex items-center space-x-2">
                    <select
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={localFilters.minBedrooms}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, minBedrooms: e.target.value }))}
                    >
                      <option value="">Min</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                      <option value="7">7</option>
                      <option value="8">8</option>
                      <option value="9">9</option>
                      <option value="10">10+</option>
                    </select>
                    <span>-</span>
                    <select
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={localFilters.maxBedrooms}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, maxBedrooms: e.target.value }))}
                    >
                      <option value="">Max</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                      <option value="7">7</option>
                      <option value="8">8</option>
                      <option value="9">9</option>
                      <option value="10">10+</option>
                    </select>
                  </div>
                </div>
                
                {/* Bathrooms */}
                <div className="mb-4">
                  <h3 className="font-medium text-neutral-800 mb-2 flex items-center">
                    <Bath size={16} className="mr-1" />
                    Bathrooms
                  </h3>
                  <div className="flex items-center space-x-2">
                    <select
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={localFilters.minBathrooms}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, minBathrooms: e.target.value }))}
                    >
                      <option value="">Min</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                      <option value="7">7+</option>
                    </select>
                    <span>-</span>
                    <select
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={localFilters.maxBathrooms}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, maxBathrooms: e.target.value }))}
                    >
                      <option value="">Max</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                      <option value="7">7+</option>
                    </select>
                  </div>
                </div>
                
                {/* Floors */}
                <div className="mb-4">
                  <h3 className="font-medium text-neutral-800 mb-2 flex items-center">
                    <Home size={16} className="mr-1" />
                    Floors/Levels
                  </h3>
                  <div className="flex items-center space-x-2">
                    <select
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={localFilters.minFloors}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, minFloors: e.target.value }))}
                    >
                      <option value="">Min</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5+</option>
                    </select>
                    <span>-</span>
                    <select
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={localFilters.maxFloors}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, maxFloors: e.target.value }))}
                    >
                      <option value="">Max</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                </div>
                
                {/* Building Size */}
                <div className="mb-4">
                  <h3 className="font-medium text-neutral-800 mb-2 flex items-center">
                    <Move size={16} className="mr-1" />
                    Building Size (m²)
                  </h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={localFilters.minBuildingSize}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, minBuildingSize: e.target.value }))}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={localFilters.maxBuildingSize}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, maxBuildingSize: e.target.value }))}
                    />
                  </div>
                </div>
                
                {/* Land Size */}
                <div className="mb-4">
                  <h3 className="font-medium text-neutral-800 mb-2 flex items-center">
                    <Move size={16} className="mr-1" />
                    Land Size (m²)
                  </h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={localFilters.minLandSize}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, minLandSize: e.target.value }))}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={localFilters.maxLandSize}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, maxLandSize: e.target.value }))}
                    />
                  </div>
                </div>
                
                {/* Features & Amenities */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setShowFeatures(!showFeatures)}
                    className="flex items-center justify-between w-full font-medium text-neutral-800 mb-2"
                  >
                    <span className="flex items-center">
                      <Check size={16} className="mr-1" />
                      Features & Amenities
                    </span>
                    {showFeatures ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {showFeatures && (
                    <div className="space-y-3 mt-2">
                      {PROPERTY_FEATURES.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="border rounded-lg p-3 bg-neutral-50">
                          <h4 className="font-medium text-neutral-700 mb-2 text-sm">{category.name}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {category.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`filter-feature-${feature.id}`}
                                  checked={localFilters.features.includes(feature.id)}
                                  onChange={() => toggleFeature(feature.id)}
                                  className="h-4 w-4 text-primary border-neutral-300 rounded focus:ring-primary"
                                />
                                <label htmlFor={`filter-feature-${feature.id}`} className="ml-2 text-xs text-neutral-700">
                                  {feature.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Apply Filters Button */}
                <button
                  onClick={applyFilters}
                  className="w-full btn-primary py-2"
                >
                  Apply Filters
                </button>
              </div>
            </div>
            
            {/* Property Listings */}
            <div className="lg:w-3/4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : properties.length > 0 ? (
                <div className={`
                  ${viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                    : 'flex flex-col space-y-4'
                  }
                `}>
                  {properties.map(property => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <h3 className="font-heading font-semibold text-xl mb-2">
                    Tidak ada properti yang ditemukan
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    Coba ubah filter pencarian Anda untuk melihat lebih banyak properti
                  </p>
                </div>
              )}
              
              {/* Pagination */}
              {totalCount > pageSize && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50"
                    >
                      Prev
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
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyListingPage;