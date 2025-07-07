import React, { useState, useEffect } from 'react';
import { Search, MapPin, Home, DollarSign, Bed, Bath, Move, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { locationService } from '../../services/locationService';
import { PROPERTY_FEATURES, getAllPropertyFeatures, FeatureCategory } from '../../types/listing';

interface SearchBoxProps {
  variant?: 'hero' | 'compact';
  initialFilters?: {
    purpose?: 'jual' | 'sewa';
    province?: string;
    city?: string;
    district?: string;
    type?: string;
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
  };
}

const SearchBox: React.FC<SearchBoxProps> = ({ 
  variant = 'hero',
  initialFilters = {}
}) => {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState<'jual' | 'sewa'>(initialFilters.purpose || 'jual');
  const [selectedProvince, setSelectedProvince] = useState(initialFilters.province || '');
  const [selectedCity, setSelectedCity] = useState(initialFilters.city || '');
  const [selectedDistrict, setSelectedDistrict] = useState(initialFilters.district || '');
  const [selectedType, setSelectedType] = useState(initialFilters.type || '');
  
  // Price filters
  const [minPrice, setMinPrice] = useState<string>(initialFilters.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState<string>(initialFilters.maxPrice?.toString() || '');
  
  // Room filters
  const [minBedrooms, setMinBedrooms] = useState<string>(initialFilters.minBedrooms?.toString() || '');
  const [maxBedrooms, setMaxBedrooms] = useState<string>(initialFilters.maxBedrooms?.toString() || '');
  const [minBathrooms, setMinBathrooms] = useState<string>(initialFilters.minBathrooms?.toString() || '');
  const [maxBathrooms, setMaxBathrooms] = useState<string>(initialFilters.maxBathrooms?.toString() || '');
  
  // Size filters
  const [minBuildingSize, setMinBuildingSize] = useState<string>(initialFilters.minBuildingSize?.toString() || '');
  const [maxBuildingSize, setMaxBuildingSize] = useState<string>(initialFilters.maxBuildingSize?.toString() || '');
  const [minLandSize, setMinLandSize] = useState<string>(initialFilters.minLandSize?.toString() || '');
  const [maxLandSize, setMaxLandSize] = useState<string>(initialFilters.maxLandSize?.toString() || '');
  
  // Floors filter
  const [minFloors, setMinFloors] = useState<string>(initialFilters.minFloors?.toString() || '');
  const [maxFloors, setMaxFloors] = useState<string>(initialFilters.maxFloors?.toString() || '');
  
  // Features filter
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(initialFilters.features || []);
  
  // Advanced filters visibility
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  
  const [provinces, setProvinces] = useState<{id: string, name: string}[]>([]);
  const [cities, setCities] = useState<{id: string, name: string, provinceId: string}[]>([]);
  const [districts, setDistricts] = useState<{id: string, name: string, cityId: string}[]>([]);
  
  const [filteredCities, setFilteredCities] = useState<{id: string, name: string, provinceId: string}[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<{id: string, name: string, cityId: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      setFilteredCities(cities.filter(city => city.provinceId === selectedProvince));
      setSelectedCity('');
      setSelectedDistrict('');
    } else {
      setFilteredCities(cities);
    }
  }, [selectedProvince, cities]);

  useEffect(() => {
    if (selectedCity) {
      setFilteredDistricts(districts.filter(district => district.cityId === selectedCity));
      setSelectedDistrict('');
    } else {
      setFilteredDistricts(districts);
    }
  }, [selectedCity, districts]);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      // Fetch provinces
      const provinceData = await locationService.getAllLocations({ type: 'provinsi', isActive: true });
      setProvinces(provinceData.map(p => ({ id: p.id, name: p.name })));
      
      // Fetch cities
      const cityData = await locationService.getAllLocations({ type: 'kota', isActive: true });
      const mappedCities = cityData.map(c => ({ 
        id: c.id, 
        name: c.name, 
        provinceId: c.parentId || '' 
      }));
      setCities(mappedCities);
      setFilteredCities(mappedCities);
      
      // Fetch districts
      const districtData = await locationService.getAllLocations({ type: 'kecamatan', isActive: true });
      const mappedDistricts = districtData.map(d => ({ 
        id: d.id, 
        name: d.name, 
        cityId: d.parentId || '' 
      }));
      setDistricts(mappedDistricts);
      setFilteredDistricts(mappedDistricts);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    params.append('purpose', purpose);
    if (selectedProvince) params.append('province', selectedProvince);
    if (selectedCity) params.append('city', selectedCity);
    if (selectedDistrict) params.append('district', selectedDistrict);
    if (selectedType) params.append('type', selectedType);
    
    // Add price filters
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    
    // Add room filters
    if (minBedrooms) params.append('minBedrooms', minBedrooms);
    if (maxBedrooms) params.append('maxBedrooms', maxBedrooms);
    if (minBathrooms) params.append('minBathrooms', minBathrooms);
    if (maxBathrooms) params.append('maxBathrooms', maxBathrooms);
    
    // Add size filters
    if (minBuildingSize) params.append('minBuildingSize', minBuildingSize);
    if (maxBuildingSize) params.append('maxBuildingSize', maxBuildingSize);
    if (minLandSize) params.append('minLandSize', minLandSize);
    if (maxLandSize) params.append('maxLandSize', maxLandSize);
    
    // Add floors filters
    if (minFloors) params.append('minFloors', minFloors);
    if (maxFloors) params.append('maxFloors', maxFloors);
    
    // Add features
    if (selectedFeatures.length > 0) {
      selectedFeatures.forEach(feature => {
        params.append('features', feature);
      });
    }
    
    navigate(`/${purpose}?${params.toString()}`);
  };

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => {
      if (prev.includes(featureId)) {
        return prev.filter(id => id !== featureId);
      } else {
        return [...prev, featureId];
      }
    });
  };

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <form onSubmit={handleSearch}>
          <div className="flex flex-wrap gap-2">
            <div className="w-full flex rounded-lg overflow-hidden">
              <button
                type="button"
                className={`px-4 py-2 font-medium ${purpose === 'jual' ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-700'}`}
                onClick={() => setPurpose('jual')}
              >
                Jual
              </button>
              <button
                type="button"
                className={`px-4 py-2 font-medium ${purpose === 'sewa' ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-700'}`}
                onClick={() => setPurpose('sewa')}
              >
                Sewa
              </button>
            </div>
            
            <div className="w-full">
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                <select
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Pilih Provinsi</option>
                  {provinces.map(province => (
                    <option key={province.id} value={province.id}>{province.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="w-full flex items-center justify-center px-4 py-2 border rounded-lg text-neutral-700 hover:bg-neutral-50"
            >
              <Filter size={18} className="mr-2" />
              {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
              {showAdvancedFilters ? <ChevronUp size={16} className="ml-2" /> : <ChevronDown size={16} className="ml-2" />}
            </button>
            
            {showAdvancedFilters && (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 p-4 border rounded-lg bg-neutral-50">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Property Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
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
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Price Range
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-1/2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-1/2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Bedrooms
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    value={minBedrooms}
                    onChange={(e) => setMinBedrooms(e.target.value)}
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Bathrooms
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    value={minBathrooms}
                    onChange={(e) => setMinBathrooms(e.target.value)}
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full btn-primary flex items-center justify-center"
              disabled={isLoading}
            >
              <Search size={18} className="mr-2" />
              Cari Properti
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <form onSubmit={handleSearch}>
        <div className="mb-4 flex rounded-lg overflow-hidden">
          <button
            type="button"
            className={`flex-1 px-4 py-2 font-medium text-center ${purpose === 'jual' ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-700'} transition-colors`}
            onClick={() => setPurpose('jual')}
          >
            Dijual
          </button>
          <button
            type="button"
            className={`flex-1 px-4 py-2 font-medium text-center ${purpose === 'sewa' ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-700'} transition-colors`}
            onClick={() => setPurpose('sewa')}
          >
            Disewa
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            <select
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Pilih Provinsi</option>
              {provinces.map(province => (
                <option key={province.id} value={province.id}>{province.name}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            <select
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!selectedProvince || isLoading}
            >
              <option value="">Pilih Kota/Kabupaten</option>
              {filteredCities.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            <select
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={!selectedCity || isLoading}
            >
              <option value="">Pilih Kecamatan</option>
              {filteredDistricts.map(district => (
                <option key={district.id} value={district.id}>{district.name}</option>
              ))}
            </select>
          </div>

          <div className="relative lg:col-span-3">
            <Home size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            <select
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Semua Tipe Properti</option>
              <option value="rumah">Rumah</option>
              <option value="apartemen">Apartemen</option>
              <option value="ruko">Ruko</option>
              <option value="tanah">Tanah</option>
              <option value="gedung_komersial">Gedung Komersial</option>
              <option value="ruang_industri">Ruang Industri</option>
              <option value="kondominium">Kondominium</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center text-primary hover:underline"
          >
            <Filter size={16} className="mr-1" />
            {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
            {showAdvancedFilters ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mb-6 p-4 border border-neutral-200 rounded-lg bg-neutral-50">
            <h3 className="font-medium text-neutral-800 mb-4">Advanced Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                  </div>
                  <span>-</span>
                  <div className="relative flex-1">
                    <DollarSign size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full pl-8 pr-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Bedrooms
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Bed size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                    <select
                      className="w-full pl-8 pr-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={minBedrooms}
                      onChange={(e) => setMinBedrooms(e.target.value)}
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
                  </div>
                  <span>-</span>
                  <div className="relative flex-1">
                    <Bed size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                    <select
                      className="w-full pl-8 pr-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={maxBedrooms}
                      onChange={(e) => setMaxBedrooms(e.target.value)}
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
              </div>
              
              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Bathrooms
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Bath size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                    <select
                      className="w-full pl-8 pr-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={minBathrooms}
                      onChange={(e) => setMinBathrooms(e.target.value)}
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
                  </div>
                  <span>-</span>
                  <div className="relative flex-1">
                    <Bath size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                    <select
                      className="w-full pl-8 pr-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={maxBathrooms}
                      onChange={(e) => setMaxBathrooms(e.target.value)}
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
              </div>
              
              {/* Floors */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Floors/Levels
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Home size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                    <select
                      className="w-full pl-8 pr-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={minFloors}
                      onChange={(e) => setMinFloors(e.target.value)}
                    >
                      <option value="">Min</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                  <span>-</span>
                  <div className="relative flex-1">
                    <Home size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                    <select
                      className="w-full pl-8 pr-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={maxFloors}
                      onChange={(e) => setMaxFloors(e.target.value)}
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
              </div>
              
              {/* Building Size */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Building Size (m²)
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Move size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full pl-8 pr-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={minBuildingSize}
                      onChange={(e) => setMinBuildingSize(e.target.value)}
                    />
                  </div>
                  <span>-</span>
                  <div className="relative flex-1">
                    <Move size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full pl-8 pr-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={maxBuildingSize}
                      onChange={(e) => setMaxBuildingSize(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Land Size */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Land Size (m²)
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Move size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full pl-8 pr-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={minLandSize}
                      onChange={(e) => setMinLandSize(e.target.value)}
                    />
                  </div>
                  <span>-</span>
                  <div className="relative flex-1">
                    <Move size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full pl-8 pr-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      value={maxLandSize}
                      onChange={(e) => setMaxLandSize(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Features Section */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowFeatures(!showFeatures)}
                className="flex items-center text-primary hover:underline mb-2"
              >
                {showFeatures ? <ChevronUp size={16} className="mr-1" /> : <ChevronDown size={16} className="mr-1" />}
                {showFeatures ? 'Hide Features & Amenities' : 'Show Features & Amenities'}
              </button>
              
              {showFeatures && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                  {PROPERTY_FEATURES.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="border rounded-lg p-3 bg-white">
                      <h4 className="font-medium text-neutral-800 mb-2">{category.name}</h4>
                      <div className="space-y-1">
                        {category.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`feature-${feature.id}`}
                              checked={selectedFeatures.includes(feature.id)}
                              onChange={() => toggleFeature(feature.id)}
                              className="h-4 w-4 text-primary border-neutral-300 rounded focus:ring-primary"
                            />
                            <label htmlFor={`feature-${feature.id}`} className="ml-2 text-sm text-neutral-700">
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
          </div>
        )}

        <button
          type="submit"
          className="w-full btn-primary flex items-center justify-center py-3"
          disabled={isLoading}
        >
          <Search size={20} className="mr-2" />
          Cari Properti
        </button>
      </form>
    </div>
  );
};

export default SearchBox;