import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface UserFavorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
  property?: {
    id: string;
    title: string;
    price: number;
    priceUnit: 'juta' | 'miliar';
    imageUrl: string;
    location: {
      city: string;
      province: string;
    };
    type: string;
    purpose: 'jual' | 'sewa';
  };
}

class FavoriteService {
  /**
   * Check if a property is favorited by the user
   */
  async isFavorited(propertyId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('property_id', propertyId)
        .maybeSingle();

      if (error) {
        console.error('Error checking favorite status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }

  /**
   * Add a property to user's favorites
   */
  async addToFavorites(propertyId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: userId,
          property_id: propertyId
        });

      if (error) {
        // If it's a duplicate key error, it's already favorited
        if (error.code === '23505') {
          return true;
        }
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  }

  /**
   * Remove a property from user's favorites
   */
  async removeFromFavorites(propertyId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('property_id', propertyId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  }

  /**
   * Toggle favorite status for a property
   */
  async toggleFavorite(propertyId: string, userId: string): Promise<{ isFavorited: boolean; success: boolean }> {
    try {
      const isFavorited = await this.isFavorited(propertyId, userId);

      if (isFavorited) {
        const success = await this.removeFromFavorites(propertyId, userId);
        return { isFavorited: false, success };
      } else {
        const success = await this.addToFavorites(propertyId, userId);
        return { isFavorited: true, success };
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return { isFavorited: false, success: false };
    }
  }

  /**
   * Get all favorites for a user
   */
  async getUserFavorites(userId: string): Promise<UserFavorite[]> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          id,
          user_id,
          property_id,
          created_at,
          property:listings(
            id,
            title,
            price,
            price_unit,
            property_type,
            purpose,
            province:locations!listings_province_id_fkey(name),
            city:locations!listings_city_id_fkey(name),
            property_media(media_url, is_primary)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match UserFavorite interface
      return (data || []).map(favorite => {
        const property = favorite.property as any;
        const primaryImage = property?.property_media?.find((media: any) => media.is_primary)?.media_url ||
                           property?.property_media?.[0]?.media_url ||
                           'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg';

        return {
          id: favorite.id,
          userId: favorite.user_id,
          propertyId: favorite.property_id,
          createdAt: favorite.created_at,
          property: property ? {
            id: property.id,
            title: property.title,
            price: property.price,
            priceUnit: property.price_unit,
            imageUrl: primaryImage,
            location: {
              city: property.city?.name || '',
              province: property.province?.name || ''
            },
            type: property.property_type,
            purpose: property.purpose
          } : undefined
        };
      });
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      return [];
    }
  }

  /**
   * Get favorite count for a property
   */
  async getPropertyFavoriteCount(propertyId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', propertyId);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Error getting favorite count:', error);
      return 0;
    }
  }

  /**
   * Get multiple favorite statuses for properties
   */
  async getFavoriteStatuses(propertyIds: string[], userId: string): Promise<Record<string, boolean>> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('property_id')
        .eq('user_id', userId)
        .in('property_id', propertyIds);

      if (error) throw error;

      const favoriteStatuses: Record<string, boolean> = {};
      propertyIds.forEach(id => {
        favoriteStatuses[id] = false;
      });

      (data || []).forEach(favorite => {
        favoriteStatuses[favorite.property_id] = true;
      });

      return favoriteStatuses;
    } catch (error) {
      console.error('Error getting favorite statuses:', error);
      return {};
    }
  }
}

export const favoriteService = new FavoriteService();