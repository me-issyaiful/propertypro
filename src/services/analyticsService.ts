import { supabase } from '../lib/supabase';
import { AnalyticsData } from '../types/analytics';
import { format, subDays } from 'date-fns';
import { mockAnalyticsData } from '../data/analytics';

class AnalyticsService {
  /**
   * Get complete analytics data
   */
  async getAnalyticsData(dateRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<AnalyticsData> {
    try {
      // Calculate date range
      const endDate = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case '7d':
          startDate = subDays(endDate, 7);
          break;
        case '30d':
          startDate = subDays(endDate, 30);
          break;
        case '90d':
          startDate = subDays(endDate, 90);
          break;
        case '1y':
          startDate = subDays(endDate, 365);
          break;
        default:
          startDate = subDays(endDate, 30);
      }
      
      // Get overview statistics
      const overview = await this.getOverviewStats();
      
      // Get listings by type
      const listingsByType = await this.getListingsByType();
      
      // Get listings by location
      const listingsByLocation = await this.getListingsByLocation();
      
      // Get listings by purpose
      const listingsByPurpose = await this.getListingsByPurpose();
      
      // Get active listings today and this week
      const activeListingsToday = await this.getActiveListingsCount(1);
      const activeListingsThisWeek = await this.getActiveListingsCount(7);
      
      // Get user registrations over time
      const userRegistrations = await this.getUserRegistrationsOverTime(startDate, endDate);
      
      // Get popular locations
      const popularLocations = await this.getPopularLocations();
      
      // Get popular categories
      const popularCategories = await this.getPopularCategories();
      
      // Get price analysis
      const priceAnalysis = await this.getPriceAnalysis();
      
      // Get performance metrics
      const performanceMetrics = await this.getPerformanceMetrics(startDate, endDate);
      
      // Get agent performance
      const agentPerformance = await this.getAgentPerformance();
      
      return {
        overview,
        listingsByType,
        listingsByLocation,
        listingsByPurpose,
        activeListingsToday,
        activeListingsThisWeek,
        userRegistrations,
        popularLocations,
        popularCategories,
        priceAnalysis,
        performanceMetrics,
        agentPerformance,
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      
      // Return mock data as fallback
      return mockAnalyticsData;
    }
  }

  /**
   * Get overview statistics
   */
  private async getOverviewStats(): Promise<AnalyticsData['overview']> {
    try {
      // Get total listings count
      const { count: totalListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true });
      
      // Get active listings count
      const { count: activeListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      
      // Get total users count
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      
      // Get total agents count
      const { count: totalAgents } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'agent');
      
      // Get total views
      const { data: viewsData } = await supabase
        .from('listings')
        .select('views');
      
      const totalViews = viewsData?.reduce((sum, item) => sum + (item.views || 0), 0) || 0;
      
      // Get total inquiries
      const { data: inquiriesData } = await supabase
        .from('listings')
        .select('inquiries');
      
      const totalInquiries = inquiriesData?.reduce((sum, item) => sum + (item.inquiries || 0), 0) || 0;
      
      // Calculate conversion rate
      const conversionRate = totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0;
      
      // Get average price
      const { data: priceData } = await supabase
        .from('listings')
        .select('price, price_unit');
      
      let totalPrice = 0;
      let count = 0;
      
      if (priceData) {
        priceData.forEach(item => {
          // Convert to billions for consistent calculation
          const priceInBillions = item.price_unit === 'miliar' ? item.price : item.price / 1000;
          totalPrice += priceInBillions;
          count++;
        });
      }
      
      const averagePrice = count > 0 ? totalPrice / count : 0;
      
      return {
        totalListings: totalListings || 0,
        activeListings: activeListings || 0,
        totalUsers: totalUsers || 0,
        totalAgents: totalAgents || 0,
        totalViews,
        totalInquiries,
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        averagePrice: parseFloat(averagePrice.toFixed(1)),
      };
    } catch (error) {
      console.error('Error fetching overview stats:', error);
      return mockAnalyticsData.overview;
    }
  }

  /**
   * Get listings by type
   */
  private async getListingsByType(): Promise<{ [key: string]: number }> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('property_type')
        .order('property_type');
      
      if (error) throw error;
      
      const result: { [key: string]: number } = {};
      
      if (data) {
        data.forEach(item => {
          result[item.property_type] = (result[item.property_type] || 0) + 1;
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching listings by type:', error);
      return mockAnalyticsData.listingsByType;
    }
  }

  /**
   * Get listings by location
   */
  private async getListingsByLocation(): Promise<AnalyticsData['listingsByLocation']> {
    try {
      // Get province IDs and counts
      const { data, error } = await supabase
        .from('listings')
        .select('province_id')
        .order('province_id');
      
      if (error) throw error;
      
      // Count listings by province
      const provinceCounts: { [key: string]: number } = {};
      
      if (data) {
        data.forEach(item => {
          if (item.province_id) {
            provinceCounts[item.province_id] = (provinceCounts[item.province_id] || 0) + 1;
          }
        });
      }
      
      // Get province names
      const provinceIds = Object.keys(provinceCounts);
      
      if (provinceIds.length === 0) {
        return mockAnalyticsData.listingsByLocation;
      }
      
      const { data: provinces } = await supabase
        .from('locations')
        .select('id, name')
        .in('id', provinceIds)
        .eq('type', 'provinsi');
      
      // Calculate total for percentage
      const total = Object.values(provinceCounts).reduce((sum, count) => sum + count, 0);
      
      // Map to result format
      const result: AnalyticsData['listingsByLocation'] = [];
      
      if (provinces) {
        provinces.forEach(province => {
          const count = provinceCounts[province.id] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          result.push({
            province: province.name,
            count,
            percentage: parseFloat(percentage.toFixed(1)),
          });
        });
      }
      
      // Sort by count descending
      result.sort((a, b) => b.count - a.count);
      
      return result;
    } catch (error) {
      console.error('Error fetching listings by location:', error);
      return mockAnalyticsData.listingsByLocation;
    }
  }

  /**
   * Get listings by purpose
   */
  private async getListingsByPurpose(): Promise<AnalyticsData['listingsByPurpose']> {
    try {
      // Get counts by purpose
      const { data, error } = await supabase
        .from('listings')
        .select('purpose')
        .order('purpose');
      
      if (error) throw error;
      
      let jual = 0;
      let sewa = 0;
      
      if (data) {
        data.forEach(item => {
          if (item.purpose === 'jual') {
            jual++;
          } else if (item.purpose === 'sewa') {
            sewa++;
          }
        });
      }
      
      return { jual, sewa };
    } catch (error) {
      console.error('Error fetching listings by purpose:', error);
      return mockAnalyticsData.listingsByPurpose;
    }
  }

  /**
   * Get active listings count within a time period
   */
  private async getActiveListingsCount(days: number): Promise<number> {
    try {
      const startDate = subDays(new Date(), days);
      
      const { count } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('created_at', startDate.toISOString());
      
      return count || 0;
    } catch (error) {
      console.error(`Error fetching active listings for last ${days} days:`, error);
      return days === 1 ? mockAnalyticsData.activeListingsToday : mockAnalyticsData.activeListingsThisWeek;
    }
  }

  /**
   * Get user registrations over time
   */
  private async getUserRegistrationsOverTime(
    startDate: Date,
    endDate: Date
  ): Promise<AnalyticsData['userRegistrations']> {
    try {
      // Get all user registrations within date range
      const { data, error } = await supabase
        .from('user_profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at');
      
      if (error) throw error;
      
      // Group by date
      const registrationsByDate: { [date: string]: number } = {};
      
      if (data) {
        data.forEach(user => {
          const date = user.created_at.split('T')[0]; // YYYY-MM-DD
          registrationsByDate[date] = (registrationsByDate[date] || 0) + 1;
        });
      }
      
      // Get total users before start date for cumulative count
      const { count: initialCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', startDate.toISOString());
      
      // Generate result with all dates in range
      const result: AnalyticsData['userRegistrations'] = [];
      let cumulativeCount = initialCount || 0;
      
      // Generate all dates in range
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const count = registrationsByDate[dateStr] || 0;
        cumulativeCount += count;
        
        result.push({
          date: dateStr,
          count,
          cumulative: cumulativeCount,
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching user registrations over time:', error);
      return mockAnalyticsData.userRegistrations;
    }
  }

  /**
   * Get popular locations
   */
  private async getPopularLocations(): Promise<AnalyticsData['popularLocations']> {
    try {
      // Get locations with property counts
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .gt('property_count', 0)
        .order('property_count', { ascending: false })
        .limit(8);
      
      if (error) throw error;
      
      // Calculate growth (mock data for now)
      const result: AnalyticsData['popularLocations'] = [];
      
      if (data) {
        data.forEach(location => {
          // In a real implementation, you would calculate actual growth
          // by comparing current property count with historical data
          const growth = Math.random() * 25; // Random growth between 0-25%
          
          result.push({
            name: location.name,
            type: location.type,
            count: location.property_count || 0,
            growth: parseFloat(growth.toFixed(1)),
          });
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching popular locations:', error);
      return mockAnalyticsData.popularLocations;
    }
  }

  /**
   * Get popular categories
   */
  private async getPopularCategories(): Promise<AnalyticsData['popularCategories']> {
    try {
      // Get categories with property counts
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .gt('property_count', 0)
        .order('property_count', { ascending: false });
      
      if (error) throw error;
      
      // Calculate total for percentage
      const total = data?.reduce((sum, category) => sum + (category.property_count || 0), 0) || 0;
      
      // Calculate growth (mock data for now)
      const result: AnalyticsData['popularCategories'] = [];
      
      if (data) {
        data.forEach(category => {
          // In a real implementation, you would calculate actual growth
          // by comparing current property count with historical data
          const growth = Math.random() * 20; // Random growth between 0-20%
          const count = category.property_count || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          result.push({
            name: category.name,
            count,
            percentage: parseFloat(percentage.toFixed(1)),
            growth: parseFloat(growth.toFixed(1)),
          });
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching popular categories:', error);
      return mockAnalyticsData.popularCategories;
    }
  }

  /**
   * Get price analysis
   */
  private async getPriceAnalysis(): Promise<AnalyticsData['priceAnalysis']> {
    try {
      // Get all listings with price data
      const { data, error } = await supabase
        .from('listings')
        .select('price, price_unit, property_type');
      
      if (error) throw error;
      
      // Calculate average price by type
      const pricesByType: { [type: string]: number[] } = {};
      const priceRangeCounts: { [range: string]: number } = {
        '< 500 Juta': 0,
        '500 Juta - 1 Miliar': 0,
        '1 - 2 Miliar': 0,
        '2 - 5 Miliar': 0,
        '5 - 10 Miliar': 0,
        '> 10 Miliar': 0,
      };
      
      if (data) {
        data.forEach(listing => {
          // Convert to billions for consistent calculation
          const priceInBillions = listing.price_unit === 'miliar' 
            ? listing.price 
            : listing.price / 1000;
          
          // Add to prices by type
          if (!pricesByType[listing.property_type]) {
            pricesByType[listing.property_type] = [];
          }
          pricesByType[listing.property_type].push(priceInBillions);
          
          // Count by price range
          const priceInMillions = priceInBillions * 1000;
          
          if (priceInMillions < 500) {
            priceRangeCounts['< 500 Juta']++;
          } else if (priceInMillions < 1000) {
            priceRangeCounts['500 Juta - 1 Miliar']++;
          } else if (priceInMillions < 2000) {
            priceRangeCounts['1 - 2 Miliar']++;
          } else if (priceInMillions < 5000) {
            priceRangeCounts['2 - 5 Miliar']++;
          } else if (priceInMillions < 10000) {
            priceRangeCounts['5 - 10 Miliar']++;
          } else {
            priceRangeCounts['> 10 Miliar']++;
          }
        });
      }
      
      // Calculate averages
      const averageByType: { [type: string]: number } = {};
      
      Object.entries(pricesByType).forEach(([type, prices]) => {
        if (prices.length > 0) {
          const sum = prices.reduce((total, price) => total + price, 0);
          averageByType[type] = parseFloat((sum / prices.length).toFixed(1));
        }
      });
      
      // Calculate total for percentages
      const total = Object.values(priceRangeCounts).reduce((sum, count) => sum + count, 0);
      
      // Format price ranges
      const priceRanges = Object.entries(priceRangeCounts).map(([range, count]) => ({
        range,
        count,
        percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
      }));
      
      return {
        averageByType,
        priceRanges,
      };
    } catch (error) {
      console.error('Error fetching price analysis:', error);
      return mockAnalyticsData.priceAnalysis;
    }
  }

  /**
   * Get performance metrics over time
   */
  private async getPerformanceMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<AnalyticsData['performanceMetrics']> {
    try {
      // Initialize result array with dates
      const result: AnalyticsData['performanceMetrics'] = [];
      
      // Generate all dates in range
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        
        // Add empty entry for this date
        result.push({
          date: dateStr,
          views: 0,
          inquiries: 0,
          newListings: 0,
          newUsers: 0,
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Get new listings per day
      const { data: newListingsData, error: listingsError } = await supabase
        .from('listings')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (listingsError) throw listingsError;
      
      // Get new users per day
      const { data: newUsersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (usersError) throw usersError;
      
      // Process new listings data
      if (newListingsData) {
        newListingsData.forEach(listing => {
          const date = listing.created_at.split('T')[0]; // YYYY-MM-DD
          const entry = result.find(item => item.date === date);
          if (entry) {
            entry.newListings++;
          }
        });
      }
      
      // Process new users data
      if (newUsersData) {
        newUsersData.forEach(user => {
          const date = user.created_at.split('T')[0]; // YYYY-MM-DD
          const entry = result.find(item => item.date === date);
          if (entry) {
            entry.newUsers++;
          }
        });
      }
      
      // For views and inquiries, we would need to have tables that track these events
      // For now, we'll use mock data for these metrics
      result.forEach(entry => {
        entry.views = Math.floor(Math.random() * 5000) + 3000;
        entry.inquiries = Math.floor(Math.random() * 400) + 200;
      });
      
      return result;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return mockAnalyticsData.performanceMetrics;
    }
  }

  /**
   * Get agent performance
   */
  private async getAgentPerformance(): Promise<AnalyticsData['agentPerformance']> {
    try {
      // Get top agents by listing count
      const { data: agents, error } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .eq('role', 'agent')
        .limit(5);
      
      if (error) throw error;
      
      // Get listings for each agent
      const result: AnalyticsData['agentPerformance'] = [];
      
      if (agents) {
        for (const agent of agents) {
          // Get agent's listings
          const { data: listings } = await supabase
            .from('listings')
            .select('id, status, views, inquiries')
            .eq('user_id', agent.id);
          
          if (listings && listings.length > 0) {
            const totalListings = listings.length;
            const activeListings = listings.filter(l => l.status === 'active').length;
            const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
            const totalInquiries = listings.reduce((sum, l) => sum + (l.inquiries || 0), 0);
            const conversionRate = totalViews > 0 
              ? parseFloat(((totalInquiries / totalViews) * 100).toFixed(1)) 
              : 0;
            
            result.push({
              agentId: agent.id,
              agentName: agent.full_name,
              totalListings,
              activeListings,
              totalViews,
              totalInquiries,
              conversionRate,
            });
          }
        }
      }
      
      // Sort by total views descending
      result.sort((a, b) => b.totalViews - a.totalViews);
      
      return result;
    } catch (error) {
      console.error('Error fetching agent performance:', error);
      return mockAnalyticsData.agentPerformance;
    }
  }
}

export const analyticsService = new AnalyticsService();