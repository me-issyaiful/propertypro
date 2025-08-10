import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import PropertyCard from '../common/PropertyCard';
import { Property } from '../../types';
import { listingService } from '../../services/listingService';
import { useToast } from '../../contexts/ToastContext';

const FeaturedProperties: React.FC = () => {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useToast();

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get featured/promoted properties
      const { data: propertiesData } = await listingService.getAllListings(
        { 
          sortBy: 'premium',
          status: 'active'
        },
        1, // page
        6  // pageSize
      );
      
      // Ensure we always set an array to prevent .map() errors
      if (Array.isArray(propertiesData)) {
        setFeaturedProperties(propertiesData);
      } else {
        console.error('Expected array from getAllListings but received:', propertiesData);
        setFeaturedProperties([]);
      }
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load featured properties. Please try again.';
      setError(errorMessage);
      showError('Error', errorMessage);
      setFeaturedProperties([]); // ADDED: Clear properties on error
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-12 bg-neutral-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-accent mb-2">
                Properti Unggulan
              </h2>
              <p className="text-neutral-600">
                Temukan properti terbaik dan terbaru dari seluruh Indonesia
              </p>
            </div>
          </div>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <section className="py-12 bg-neutral-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-accent mb-2">
                Properti Unggulan
              </h2>
              <p className="text-neutral-600">
                Temukan properti terbaik dan terbaru dari seluruh Indonesia
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-accent mb-2">
              Failed to Load Properties
            </h2>
            <p className="text-neutral-600 mb-4">
              {error}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={fetchFeaturedProperties}
                className="btn-primary"
              >
                Try Again
              </button>
              <Link
                to="/jual"
                className="btn-secondary"
              >
                Browse All Properties
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (featuredProperties.length === 0) {
    // MODIFIED: Display a message if no properties are found (but no error occurred)
    return (
      <section className="py-12 bg-neutral-100">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-accent mb-2">
              Properti Unggulan
            </h2>
            <p className="text-neutral-600 mb-4">
              Tidak ada properti unggulan yang tersedia saat ini.
            </p>
            <Link
              to="/jual"
              className="flex items-center justify-center text-primary font-medium mt-4 md:mt-0 hover:underline"
            >
              Lihat Semua Properti <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-accent mb-2">
              Properti Unggulan
            </h2>
            <p className="text-neutral-600">
              Temukan properti terbaik dan terbaru dari seluruh Indonesia
            </p>
          </div>
          <Link
            to="/jual"
            className="flex items-center text-primary font-medium mt-4 md:mt-0 hover:underline"
          >
            Lihat Semua <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;