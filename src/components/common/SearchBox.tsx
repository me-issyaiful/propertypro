import React, { useState, useEffect } from 'react';
import { Search, MapPin, Home, Filter, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { locationService } from '../../services/locationService';

interface SearchBoxProps {
  variant?: 'hero' | 'compact';
  initialFilters?: {
    purpose?: 'jual' | 'sewa';
    province?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
  };
}

const SearchBox: React.FC<SearchBoxProps> = ({ 
  variant = 'hero',
  initialFilters = {}
}) => {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState<'jual' | 'sewa'>(initialFilters.purpose || 'jual');
  const [selectedProvince, setSelectedProvince] = useState(initialFilters.province || '');
  const [selectedType, setSelectedType] = useState(initialFilters.type || '');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Price filters
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialFilters.minPrice || 0,
    initialFilters.maxPrice || 10000
  ]);
  
  const [provinces, setProvinces] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    const loadProvinces = async () => {
      setIsLoading(true);
      try {
        const data = await locationService.getProvinces();
        setProvinces(data);
      } catch (error) {
        console.error('Failed to load provinces:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProvinces();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (selectedProvince) {
      params.append('province', selectedProvince);
    }
    if (selectedType) {
      params.append('type', selectedType);
    }
    if (priceRange[0] > 0) {
      params.append('minPrice', priceRange[0].toString());
    }
    if (priceRange[1] < 10000) {
      params.append('maxPrice', priceRange[1].toString());
    }
    
    navigate(`/${purpose}?${params.toString()}`);
  };

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="w-full">
              <div className="relative">
                <Home size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                <select
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">Semua Tipe Properti</option>
                  <option value="rumah">Rumah</option>
                  <option value="apartemen">Apartemen</option>
                  <option value="kondominium">Kondominium</option>
                  <option value="ruko">Ruko</option>
                  <option value="tanah">Tanah</option>
                  <option value="gedung_komersial">Gedung Komersial</option>
                  <option value="ruang_industri">Ruang Industri</option>
                  <option value="lainnya">Lainnya</option>
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
              <div className="w-full p-4 border rounded-lg bg-neutral-50">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Rentang Harga (Juta)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  />
                  <div className="flex justify-between text-xs text-neutral-500 mt-1">
                    <span>Rp {priceRange[0]} Juta</span>
                    <span>Rp {priceRange[1]} Juta</span>
                  </div>
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
        <div className="mb-6 flex rounded-lg overflow-hidden">
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

        <div className="grid md:grid-cols-2 gap-4 mb-6">
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
            <Home size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            <select
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Semua Tipe</option>
              <option value="rumah">Rumah</option>
              <option value="apartemen">Apartemen</option>
              <option value="kondominium">Kondominium</option>
              <option value="ruko">Ruko</option>
              <option value="tanah">Tanah</option>
              <option value="gedung_komersial">Gedung Komersial</option>
              <option value="ruang_industri">Ruang Industri</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Rentang Harga (Juta)
          </label>
          <div className="px-2">
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            />
            <div className="flex justify-between text-sm text-neutral-600 mt-2">
              <span>Rp {priceRange[0]} Juta</span>
              <span>Rp {priceRange[1]} Juta</span>
            </div>
          </div>
        </div>

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