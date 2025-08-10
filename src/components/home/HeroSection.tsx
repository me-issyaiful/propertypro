import React, { useState, useEffect } from 'react';
import SearchBox from '../common/SearchBox';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext'; // ADD THIS LINE

interface Stats {
  totalProperties: number;
  totalPropertiesForSale: number;
  totalPropertiesForRent: number;
  totalUsers: number;
}

const HeroSection: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    totalPropertiesForSale: 0,
    totalPropertiesForRent: 0,
    totalUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useToast(); // ADD THIS LINE

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Get total properties count
      const { count: propertiesCount, error: propertiesError } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true });
      if (propertiesError) throw propertiesError; // ADDED: Error check

      // Get total properties for sale count
      const { count: propertiesforsaleCount, error: forSaleError } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('purpose', 'jual');
      if (forSaleError) throw forSaleError; // ADDED: Error check
      
      // Get total properties for rent count
      const { count: propertiesforrentCount, error: forRentError } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('purpose', 'sewa');
      if (forRentError) throw forRentError; // ADDED: Error check
      
      // Get total users count
      const { count: usersCount, error: usersError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .in('role', ['user', 'agent'])
        .eq('status', 'active');
      if (usersError) throw usersError; // ADDED: Error check
      
      setStats({
        totalProperties: propertiesCount || 0,
        totalPropertiesForSale: propertiesforsaleCount || 0,
        totalPropertiesForRent: propertiesforrentCount || 0,
        totalUsers: usersCount || 0
      });
    } catch (error: any) { // MODIFIED: Catch error as 'any'
      console.error('Error fetching stats:', error);
      showError('Error', error.message || 'Failed to load hero section statistics.'); // ADDED: User feedback
      // Use fallback values if there's an error
      setStats({
        totalProperties: 0, // MODIFIED: Set to 0 on error
        totalPropertiesForSale: 0,
        totalPropertiesForRent: 0,
        totalUsers: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative">
      {/* Hero Image */}
      <div 
        className="relative h-[500px] bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
        
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-3xl">
            <h1 className="font-heading font-bold text-white text-3xl md:text-4xl lg:text-5xl mb-4">
              Temukan Rumah Impian Anda di <span className="text-primary">Properti Pro</span>
            </h1>
            <p className="text-white text-lg md:text-xl mb-8 max-w-2xl">
              Platform jual beli dan sewa properti terpercaya dengan ribuan pilihan properti di seluruh Indonesia
            </p>
            
            <div className="w-full lg:max-w-3xl">
              <SearchBox variant="hero" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="bg-white py-4 shadow-md">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="font-heading font-bold text-2xl text-primary">
                {isLoading ? '...' : stats.totalProperties.toLocaleString()}+
              </p>
              <p className="text-neutral-600 text-sm">Properti Tersedia</p>
            </div>
            <div className="text-center">
              <p className="font-heading font-bold text-2xl text-primary">
                {isLoading ? '...' : stats.totalPropertiesForSale.toLocaleString()}+
              </p>
              <p className="text-neutral-600 text-sm">Properti Dijual</p>
            </div>
            <div className="text-center">
              <p className="font-heading font-bold text-2xl text-primary">
                {isLoading ? '...' : stats.totalPropertiesForRent.toLocaleString()}+
              </p>
              <p className="text-neutral-600 text-sm">Properti Disewa</p>
            </div>
            <div className="text-center">
              <p className="font-heading font-bold text-2xl text-primary">
                {isLoading ? '...' : stats.totalUsers.toLocaleString()}+
              </p>
              <p className="text-neutral-600 text-sm">Jumlah User</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;