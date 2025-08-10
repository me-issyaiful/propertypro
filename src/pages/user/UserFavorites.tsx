import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Trash2, 
  Eye, 
  MapPin, 
  Home, 
  AlertCircle,
  Loader
} from 'lucide-react';
import { formatPrice } from '../../utils/formatter';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { favoriteService, UserFavorite } from '../../services/favoriteService';

const UserFavorites: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const userFavorites = await favoriteService.getUserFavorites(user.id);
      setFavorites(userFavorites);
    } catch (err: any) {
      console.error('Error loading favorites:', err);
      setError(err.message || 'Failed to load favorites. Please try again.');
      showError('Error', err.message || 'Failed to load favorites. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (propertyId: string) => {
    if (!user) return;

    setRemovingId(propertyId);

    try {
      const success = await favoriteService.removeFromFavorites(propertyId, user.id);
      
      if (success) {
        setFavorites(prev => prev.filter(fav => fav.propertyId !== propertyId));
        showSuccess('Removed from Favorites', 'Property has been removed from your favorites.');
      } else {
        showError('Error', 'Failed to remove property from favorites. Please try again.');
      }
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      showError('Error', error.message || 'Failed to remove property from favorites.');
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader size={40} className="animate-spin text-primary mb-4" />
          <p className="text-neutral-600">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center text-red-600 mb-4">
          <AlertCircle size={24} className="mr-2" />
          <h2 className="text-xl font-semibold">Error</h2>
        </div>
        <p className="text-neutral-700 mb-4">{error}</p>
        <button 
          onClick={loadFavorites}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Favorites | User Area</title>
        <meta name="description" content="View and manage your favorite properties" />
      </Helmet>
      
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2 flex items-center">
            <Heart size={28} className="mr-3 text-red-500" />
            My Favorites
          </h1>
          <p className="text-neutral-600">
            Properties you've saved for later viewing
          </p>
        </div>
        
        {/* Favorites List */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(favorite => (
              <div key={favorite.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {favorite.property && (
                  <>
                    <div className="relative h-48">
                      <Link to={`/properti/${favorite.propertyId}`}>
                        <img
                          src={favorite.property.imageUrl}
                          alt={favorite.property.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </Link>
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => handleRemoveFavorite(favorite.propertyId)}
                          disabled={removingId === favorite.propertyId}
                          className="bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors duration-300 disabled:opacity-50"
                          aria-label="Remove from favorites"
                        >
                          {removingId === favorite.propertyId ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-md uppercase ${
                          favorite.property.purpose === 'jual' ? 'bg-primary text-white' : 'bg-green-500 text-white'
                        }`}>
                          {favorite.property.purpose === 'jual' ? 'For Sale' : 'For Rent'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="mb-2">
                        <span className="text-xs text-neutral-500 uppercase">
                          {favorite.property.type === 'rumah' ? 'House' : 
                           favorite.property.type === 'apartemen' ? 'Apartment' : 
                           favorite.property.type === 'kondominium' ? 'Condominium' : 
                           favorite.property.type === 'ruko' ? 'Shop House' : 
                           favorite.property.type === 'tanah' ? 'Land' : 
                           favorite.property.type === 'gedung_komersial' ? 'Commercial' : 
                           favorite.property.type === 'ruang_industri' ? 'Industrial' : 'Property'}
                        </span>
                      </div>
                      
                      <h3 className="font-heading font-semibold text-lg mb-1 line-clamp-2 h-14">
                        <Link 
                          to={`/properti/${favorite.propertyId}`} 
                          className="hover:text-primary transition-colors"
                        >
                          {favorite.property.title}
                        </Link>
                      </h3>
                      
                      <p className="text-primary font-heading font-bold text-lg mb-3">
                        {formatPrice(favorite.property.price, favorite.property.priceUnit)}
                        {favorite.property.purpose === 'sewa' && (
                          <span className="text-sm font-normal text-neutral-500">/month</span>
                        )}
                      </p>

                      <div className="flex items-center text-neutral-500 text-sm mb-3">
                        <MapPin size={16} className="mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {favorite.property.location.city}, {favorite.property.location.province}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-500">
                        Saved on {new Date(favorite.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={32} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No Favorites Yet
            </h3>
            <p className="text-neutral-600 mb-6">
              Start exploring properties and save the ones you like to see them here.
            </p>
            <Link to="/jual" className="btn-primary">
              Browse Properties
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default UserFavorites;