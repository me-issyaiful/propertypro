import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  propertyCount: number;
  createdAt: string;
  updatedAt: string;
}

class CategoryService {
  /**
   * Get all categories with optional filtering
   */
  async getAllCategories(filters?: { isActive?: boolean; search?: string }): Promise<Category[]> {
    try {
      let query = supabase
        .from('categories')
        .select('*');

      // Apply filters
      if (filters) {
        if (filters.isActive !== undefined) {
          query = query.eq('is_active', filters.isActive);
        }
        
        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
        }
      }
      
      // Execute query
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      
      // Map database categories to Category interface
      return (data || []).map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        icon: category.icon || '',
        isActive: category.is_active || false,
        propertyCount: category.property_count || 0,
        createdAt: category.created_at,
        updatedAt: category.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Get a single category by ID
   */
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        icon: data.icon || '',
        isActive: data.is_active || false,
        propertyCount: data.property_count || 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  }
}

export const categoryService = new CategoryService();