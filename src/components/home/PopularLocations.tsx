import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { locationService } from '../../services/locationService';

interface LocationCardProps {
  name: string;
  province: string;
  image: string;
  propertyCount: number;
  slug: string;
}

const LocationCard: React.FC<LocationCardProps> = ({ 
  name, 
  province, 
  image, 
  propertyCount, 
  slug 
}) => {
  return (
    <Link
      to={`/lokasi/${slug}`}
      className="relative overflow-hidden rounded-2xl group h-full"
      aria-label={`Lihat properti di ${name}, ${province}`}
    >
      <img 
        src={image} 
        alt={`Properti di ${name}`} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 group-hover:via-black/60 transition-all duration-300 flex flex-col justify-end p-5">
        <h3 className="font-heading text-white font-semibold text-xl mb-1 transform group-hover:translate-y-0 transition-transform duration-300">
          {name}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-neutral-200 text-sm">{province}</p>
            <p className="text-white text-sm">{propertyCount.toLocaleString()} properti</p>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-0 translate-x-4">
            <ArrowRight className="text-primary" size={20} />
          </div>
        </div>
      </div>
    </Link>
  );
};

const PopularLocations: React.FC = () => {
  const [locations, setLocations] = useState<LocationCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPopularLocations();
  }, []);

  const fetchPopularLocations = async () => {
    setIsLoading(true);
    try {
      // Get popular locations from database
      const popularLocations = await locationService.getAllLocations({
        isActive: true
      });
      
      // Sort by property count and take top locations
      const sortedLocations = popularLocations
        .sort((a, b) => (b.propertyCount || 0) - (a.propertyCount || 0))
        .slice(0, 6);
      
      // Get parent locations for cities/districts
      const locationWithParents = await Promise.all(sortedLocations.map(async (location) => {
        let provinceName = '';
        
        if (location.type !== 'provinsi' && location.parentId) {
          // For cities, get the province directly
          if (location.type === 'kota') {
            const province = popularLocations.find(p => p.id === location.parentId);
            provinceName = province?.name || '';
          } 
          // For districts, get the city first, then the province
          else if (location.type === 'kecamatan') {
            const city = popularLocations.find(c => c.id === location.parentId);
            if (city && city.parentId) {
              const province = popularLocations.find(p => p.id === city.parentId);
              provinceName = province?.name || '';
            }
          }
        } else if (location.type === 'provinsi') {
          provinceName = 'Indonesia';
        }
        
        // Map location images (in a real app, these would be stored in the database)
        const locationImages: {[key: string]: string} = {
          'jakarta-selatan': 'https://images.pexels.com/photos/2437856/pexels-photo-2437856.jpeg',
          'bandung': 'https://images.pexels.com/photos/2486168/pexels-photo-2486168.jpeg',
          'surabaya': 'https://images.pexels.com/photos/1538177/pexels-photo-1538177.jpeg',
          'bali': 'https://images.pexels.com/photos/4112236/pexels-photo-4112236.jpeg',
          'yogyakarta': 'https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg',
          'semarang': 'https://images.pexels.com/photos/3254729/pexels-photo-3254729.jpeg',
          'medan': 'https://images.pexels.com/photos/2846217/pexels-photo-2846217.jpeg',
          'makassar': 'https://images.pexels.com/photos/2111766/pexels-photo-2111766.jpeg',
          'default': 'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg'
        };
        
        return {
          name: location.name,
          province: provinceName,
          image: locationImages[location.slug] || locationImages.default,
          propertyCount: location.propertyCount || 0,
          slug: location.slug
        };
      }));
      
      setLocations(locationWithParents);
    } catch (error) {
      console.error('Error fetching popular locations:', error);
      // Fallback to empty array
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-accent mb-2">
              Lokasi Populer
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Jelajahi properti di lokasi-lokasi strategis dan berkembang di seluruh Indonesia
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  if (locations.length === 0) {
    return null; // Don't show section if no locations
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-accent mb-2">
            Lokasi Populer
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Jelajahi properti di lokasi-lokasi strategis dan berkembang di seluruh Indonesia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Featured location (larger card) */}
          {locations.length > 0 && (
            <div className="md:col-span-2 md:row-span-2 h-[400px] md:h-auto">
              <LocationCard 
                name={locations[0].name}
                province={locations[0].province}
                image={locations[0].image}
                propertyCount={locations[0].propertyCount}
                slug={locations[0].slug}
              />
            </div>
          )}
          
          {/* Secondary locations */}
          {locations.slice(1, 3).map((location, index) => (
            <div key={location.slug} className="h-[200px]">
              <LocationCard 
                name={location.name}
                province={location.province}
                image={location.image}
                propertyCount={location.propertyCount}
                slug={location.slug}
              />
            </div>
          ))}
          
          {/* Additional locations */}
          {locations.slice(3).map((location, index) => (
            <div key={location.slug} className="h-[200px]">
              <LocationCard 
                name={location.name}
                province={location.province}
                image={location.image}
                propertyCount={location.propertyCount}
                slug={location.slug}
              />
            </div>
          ))}
        </div>
        
        {/* View all locations link */}
        <div className="mt-8 text-center">
          <Link 
            to="/lokasi" 
            className="inline-flex items-center text-primary font-medium hover:underline"
          >
            Lihat semua lokasi
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularLocations;