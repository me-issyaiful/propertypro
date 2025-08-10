import React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Heart, MapPin, Bed, Bath, Move, Eye, TrendingUp, Home } from 'lucide-react';
import { Property } from '../../types';
import { PremiumListing } from '../../types/premium';
import { formatPrice } from '../../utils/formatter';
import PremiumBadge from './PremiumBadge';
import { premiumService } from '../../services/premiumService';
import { favoriteService } from '../../services/favoriteService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface PremiumPropertyCardProps {
  property: Property;
  premiumListing?: PremiumListing;
  onAnalyticsUpdate?: (type: 'view' | 'inquiry' | 'favorite') => void;
}

const PremiumPropertyCard: React.FC<PremiumPropertyCardProps> = ({ 
  property, 
  premiumListing,
  onAnalyticsUpdate
}) => {
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Defensive check to prevent crashes from null/undefined props
  if (!property) {
    console.error('PremiumPropertyCard received null or undefined property prop:', property);
    return null;
  }

  if (!premiumListing) {
    console.error('PremiumPropertyCard received null or undefined premiumListing prop:', premiumListing);
    return null;
  }
  
  // Additional check for analytics object
  if (!premiumListing.analytics) {
    console.error('PremiumPropertyCard: premiumListing.analytics is undefined. PremiumListing:', premiumListing);
    return null;
  }

  // Check if property is favorited when component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      checkFavoriteStatus();
    }
  }, [isAuthenticated, user, property.id]);

  const checkFavoriteStatus = async () => {
    if (!user) return;
    
    try {
      const favorited = await favoriteService.isFavorited(property.id, user.id);
      setIsFavorited(favorited);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

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
  } = property;

  const isPremium = !!premiumListing;

  const handleCardClick = () => {
    if (isPremium) {
      // Update analytics in Supabase
      premiumService.updateAnalytics(id, 'view');
      
      // Call the callback if provided
      if (onAnalyticsUpdate) {
        onAnalyticsUpdate('view');
      }
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !user) {
      showInfo(
        'Login Required',
        'Please log in to save properties to your favorites.'
      );
      return;
    }

    handleToggleFavorite();
  };

  const handleToggleFavorite = async () => {
    if (!user) return;

    setIsToggling(true);

    try {
      const result = await favoriteService.toggleFavorite(property.id, user.id);
      
      if (result.success) {
        setIsFavorited(result.isFavorited);
        
        if (result.isFavorited) {
          showSuccess(
            'Property Saved',
            'Property has been added to your favorites.'
          );
        } else {
          showSuccess(
            'Property Removed',
            'Property has been removed from your favorites.'
          );
        }
      } else {
        showError(
          'Error',
          'Failed to update favorites. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showError(
        'Error',
        'Failed to update favorites. Please try again.'
      );
    } finally {
      setIsToggling(false);
    }

    if (isPremium) {
      // Update analytics in Supabase
      premiumService.updateAnalytics(id, 'favorite');
    }
  };

  return (
    <div className={`
      card group relative overflow-hidden
      ${isPremium ? 'ring-2 ring-yellow-400 shadow-xl' : ''}
      ${isPremium ? 'transform hover:scale-105' : ''}
      transition-all duration-300
    `}>
      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute top-2 left-2 z-20">
          <PremiumBadge variant="crown" size="sm" />
        </div>
      )}

      {/* Premium Glow Effect */}
      {isPremium && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 pointer-events-none" />
      )}

      {/* Image */}
      <div className={`relative overflow-hidden ${isPremium ? 'h-64' : 'h-48'}`}>
        <Link to={`/properti/${id}`} onClick={handleCardClick}>
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>
        
        <div className="absolute top-2 right-2 z-10">
          <button 
            onClick={handleFavoriteClick}
            disabled={isToggling}
            className={`p-1.5 rounded-full shadow-md transition-colors duration-300 ${
              isFavorited 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white text-neutral-600 hover:bg-primary hover:text-white'
            } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Simpan properti ini"
          >
            {isToggling ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <Heart size={18} className={isFavorited ? 'fill-current' : ''} />
            )}
          </button>
        </div>
        
        <div className="absolute top-2 right-12 z-10">
          <span className={`text-xs font-medium px-2 py-1 rounded-md uppercase ${
            purpose === 'jual' ? 'bg-primary text-white' : 'bg-success-500 text-white'
          }`}>
            {purpose === 'jual' ? 'Dijual' : 'Disewa'}
          </span>
        </div>

        {/* Premium Analytics Preview */}
        {isPremium && premiumListing && (
          <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs rounded p-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <Eye size={12} className="mr-1" />
                  <span>{premiumListing.analytics.views}</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp size={12} className="mr-1" />
                  <span>{premiumListing.analytics.inquiries}</span>
                </div>
              </div>
              <div className="text-yellow-400 font-semibold">
                {premiumListing.analytics.conversionRate.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-neutral-500 uppercase">
            {type === 'rumah' ? 'Rumah' : 
             type === 'apartemen' ? 'Apartemen' : 
             type === 'ruko' ? 'Ruko' : 
             type === 'tanah' ? 'Tanah' : 'Properti'}
          </span>
        </div>
        
        <h3 className={`font-heading font-semibold mb-1 truncate ${
          isPremium ? 'text-lg' : 'text-base'
        }`}>
          <Link 
            to={`/properti/${id}`} 
            className="hover:text-primary transition-colors"
            onClick={handleCardClick}
          >
            {title}
          </Link>
        </h3>
        
        <p className={`text-primary font-heading font-bold mb-3 ${
          isPremium ? 'text-xl' : 'text-lg'
        }`}>
          {formatPrice(price, priceUnit)}
          {purpose === 'sewa' && <span className="text-sm font-normal text-neutral-500">/bulan</span>}
        </p>

        <div className="flex items-center text-neutral-500 text-sm mb-3">
          <MapPin size={16} className="mr-1 flex-shrink-0" />
          <span className="truncate">
            {location.district}, {location.city}
          </span>
        </div>

        {/* Features */}
        <div className="flex justify-between text-neutral-700 border-t border-neutral-200 pt-3">
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

        {/* Premium Features Indicator */}
        {isPremium && (
          <div className="mt-3 pt-3 border-t border-yellow-200">
            <div className="flex items-center justify-between text-xs text-yellow-700">
              <span className="font-medium">Premium Features Active</span>
              <span className="bg-yellow-100 px-2 py-1 rounded">
                {Math.ceil((new Date(premiumListing!.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumPropertyCard;