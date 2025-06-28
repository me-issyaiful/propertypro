import { supabase } from '../lib/supabase';
import { PremiumListing, PremiumPlan, PaymentData, BillingDetails } from '../types/premium';
import { format } from 'date-fns';

class PremiumService {
  /**
   * Get premium plans configuration
   */
  getPremiumPlans(): PremiumPlan[] {
    return [
      {
        id: 'premium-monthly',
        name: 'Premium Listing',
        price: 29.99,
        currency: 'USD',
        duration: 30,
        description: 'Boost your property visibility with premium features',
        features: [
          'Featured placement at top of search results',
          'Golden highlighted border',
          'Larger photo gallery (up to 20 images)',
          'Extended listing duration (30 days)',
          'Virtual tour integration',
          'Detailed analytics dashboard',
          'Priority customer support',
          'Social media promotion'
        ]
      }
    ];
  }

  /**
   * Create a new premium listing in Supabase
   */
  async createPremiumListing(data: {
    propertyId: string;
    userId: string;
    planId: string;
    paymentId: string;
  }): Promise<PremiumListing | null> {
    try {
      const plan = this.getPremiumPlans().find(p => p.id === data.planId);
      if (!plan) {
        throw new Error('Premium plan not found');
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + plan.duration);

      // Create initial analytics data
      const analyticsData = {
        views: 0,
        inquiries: 0,
        favorites: 0,
        conversion_rate: 0,
        daily_views: [],
        top_sources: []
      };

      // Insert into premium_listings table
      const { data: premiumData, error } = await supabase
        .from('premium_listings')
        .insert({
          property_id: data.propertyId,
          user_id: data.userId,
          plan_id: data.planId,
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          payment_id: data.paymentId,
          analytics_views: 0,
          analytics_inquiries: 0,
          analytics_favorites: 0,
          analytics_conversion_rate: 0,
          analytics_daily_views: [],
          analytics_top_sources: []
        })
        .select()
        .single();

      if (error) throw error;

      // Update the property to mark it as promoted
      await supabase
        .from('listings')
        .update({ is_promoted: true })
        .eq('id', data.propertyId);

      // Transform to PremiumListing interface
      return this.transformDbRecordToPremiumListing(premiumData, plan);
    } catch (error) {
      console.error('Error creating premium listing:', error);
      return null;
    }
  }

  /**
   * Create a payment record in Supabase
   */
  async createPayment(data: {
    orderId: string;
    amount: number;
    currency: string;
    billingDetails: BillingDetails;
  }): Promise<PaymentData | null> {
    try {
      // Find the advertiser account for the user
      const { data: advertiserData, error: advertiserError } = await supabase
        .from('advertiser_accounts')
        .select('id')
        .eq('user_id', data.billingDetails.userId || '')
        .single();

      if (advertiserError && advertiserError.code !== 'PGRST116') {
        throw advertiserError;
      }

      let advertiserId = advertiserData?.id;

      // If no advertiser account exists, create one
      if (!advertiserId) {
        const { data: newAdvertiser, error: createError } = await supabase
          .from('advertiser_accounts')
          .insert({
            user_id: data.billingDetails.userId || null,
            company_name: data.billingDetails.company || `${data.billingDetails.firstName} ${data.billingDetails.lastName}`,
            contact_email: data.billingDetails.email,
            contact_phone: data.billingDetails.phone,
            billing_address: {
              address: data.billingDetails.address,
              city: data.billingDetails.city,
              postal_code: data.billingDetails.postalCode,
              country: data.billingDetails.country
            },
            status: 'active'
          })
          .select('id')
          .single();

        if (createError) throw createError;
        advertiserId = newAdvertiser.id;
      }

      // Insert payment record
      const { data: paymentData, error } = await supabase
        .from('ad_payments')
        .insert({
          advertiser_id: advertiserId,
          amount: data.amount,
          currency: data.currency,
          status: 'pending',
          payment_method: '',
          transaction_id: null,
          payment_date: null
        })
        .select()
        .single();

      if (error) throw error;

      // Transform to PaymentData interface
      return {
        id: paymentData.id,
        orderId: data.orderId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentData.status,
        paymentMethod: paymentData.payment_method || '',
        transactionId: paymentData.transaction_id,
        createdAt: paymentData.created_at,
        updatedAt: paymentData.updated_at,
        billingDetails: data.billingDetails
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      return null;
    }
  }

  /**
   * Update payment status in Supabase
   */
  async updatePaymentStatus(paymentId: string, status: PaymentData['status'], transactionId?: string): Promise<PaymentData | null> {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (transactionId) {
        updates.transaction_id = transactionId;
      }

      if (status === 'success') {
        updates.payment_date = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('ad_payments')
        .update(updates)
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;

      // Get billing details (in a real app, you'd store this with the payment)
      const billingDetails: BillingDetails = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'ID'
      };

      // Transform to PaymentData interface
      return {
        id: data.id,
        orderId: `order-${data.id}`, // In a real app, you'd store the order ID
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        paymentMethod: data.payment_method || '',
        transactionId: data.transaction_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        billingDetails
      };
    } catch (error) {
      console.error('Error updating payment status:', error);
      return null;
    }
  }

  /**
   * Get a premium listing by property ID from Supabase
   */
  async getPremiumListing(propertyId: string): Promise<PremiumListing | null> {
    try {
      const { data, error } = await supabase
        .from('premium_listings')
        .select('*')
        .eq('property_id', propertyId)
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return null;
      }

      // Get the plan
      const plan = this.getPremiumPlans().find(p => p.id === data.plan_id);
      if (!plan) {
        throw new Error('Premium plan not found');
      }

      // Transform to PremiumListing interface
      return this.transformDbRecordToPremiumListing(data, plan);
    } catch (error) {
      console.error('Error getting premium listing:', error);
      return null;
    }
  }

  /**
   * Get all premium listings for a user from Supabase
   */
  async getUserPremiumListings(userId: string): Promise<PremiumListing[]> {
    try {
      const { data, error } = await supabase
        .from('premium_listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform to PremiumListing interface
      const premiumListings: PremiumListing[] = [];
      for (const record of data || []) {
        const plan = this.getPremiumPlans().find(p => p.id === record.plan_id);
        if (plan) {
          premiumListings.push(this.transformDbRecordToPremiumListing(record, plan));
        }
      }

      return premiumListings;
    } catch (error) {
      console.error('Error getting user premium listings:', error);
      return [];
    }
  }

  /**
   * Get all payments for a user from Supabase
   */
  async getUserPayments(userId: string): Promise<PaymentData[]> {
    try {
      // First get the user's premium listings to get payment IDs
      const { data: premiumListings, error: listingsError } = await supabase
        .from('premium_listings')
        .select('payment_id')
        .eq('user_id', userId);

      if (listingsError) throw listingsError;

      if (!premiumListings || premiumListings.length === 0) {
        return [];
      }

      const paymentIds = premiumListings
        .map(listing => listing.payment_id)
        .filter(Boolean) as string[];

      if (paymentIds.length === 0) {
        return [];
      }

      // Get the payments
      const { data: payments, error: paymentsError } = await supabase
        .from('ad_payments')
        .select('*')
        .in('id', paymentIds)
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Transform to PaymentData interface
      return (payments || []).map(payment => ({
        id: payment.id,
        orderId: `order-${payment.id}`, // In a real app, you'd store the order ID
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.payment_method || '',
        transactionId: payment.transaction_id,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at,
        billingDetails: {
          // In a real app, you'd store and retrieve the billing details
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          postalCode: '',
          country: 'ID'
        }
      }));
    } catch (error) {
      console.error('Error getting user payments:', error);
      return [];
    }
  }

  /**
   * Update analytics for a premium listing in Supabase
   */
  async updateAnalytics(propertyId: string, type: 'view' | 'inquiry' | 'favorite'): Promise<void> {
    try {
      // Get the premium listing
      const { data, error } = await supabase
        .from('premium_listings')
        .select('*')
        .eq('property_id', propertyId)
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return;
      }

      // Prepare updates based on the type
      const updates: any = {};
      switch (type) {
        case 'view':
          updates.analytics_views = data.analytics_views + 1;
          break;
        case 'inquiry':
          updates.analytics_inquiries = data.analytics_inquiries + 1;
          break;
        case 'favorite':
          updates.analytics_favorites = data.analytics_favorites + 1;
          break;
      }

      // Update daily views if it's a view
      if (type === 'view') {
        const today = new Date().toISOString().split('T')[0];
        const dailyViews = data.analytics_daily_views || [];
        
        const todayEntry = dailyViews.find((entry: any) => entry.date === today);
        if (todayEntry) {
          todayEntry.views += 1;
        } else {
          dailyViews.push({ date: today, views: 1 });
        }
        
        updates.analytics_daily_views = dailyViews;
      }

      // Calculate conversion rate
      if (type === 'inquiry' || type === 'view') {
        const views = type === 'view' ? data.analytics_views + 1 : data.analytics_views;
        const inquiries = type === 'inquiry' ? data.analytics_inquiries + 1 : data.analytics_inquiries;
        
        if (views > 0) {
          updates.analytics_conversion_rate = parseFloat(((inquiries / views) * 100).toFixed(1));
        }
      }

      // Update the premium listing
      await supabase
        .from('premium_listings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);
    } catch (error) {
      console.error('Error updating premium analytics:', error);
    }
  }

  /**
   * Check and update expired premium listings in Supabase
   */
  async checkExpiredListings(): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      // Update expired listings
      await supabase
        .from('premium_listings')
        .update({
          status: 'expired',
          updated_at: now
        })
        .eq('status', 'active')
        .lt('end_date', now);

      // Update is_promoted flag on listings
      const { data: expiredListings } = await supabase
        .from('premium_listings')
        .select('property_id')
        .eq('status', 'expired');

      if (expiredListings && expiredListings.length > 0) {
        const propertyIds = expiredListings.map(listing => listing.property_id);
        
        // Check if there are any active premium listings for these properties
        for (const propertyId of propertyIds) {
          const { count } = await supabase
            .from('premium_listings')
            .select('*', { count: 'exact', head: true })
            .eq('property_id', propertyId)
            .eq('status', 'active')
            .gt('end_date', now);
          
          // If no active premium listings, update is_promoted to false
          if (count === 0) {
            await supabase
              .from('listings')
              .update({ is_promoted: false })
              .eq('id', propertyId);
          }
        }
      }
    } catch (error) {
      console.error('Error checking expired listings:', error);
    }
  }

  /**
   * Transform a database record to a PremiumListing interface
   */
  private transformDbRecordToPremiumListing(record: any, plan: PremiumPlan): PremiumListing {
    // Create premium features
    const features = [
      { id: 'featured', name: 'Featured Placement', description: 'Top of search results', icon: 'Star', enabled: true },
      { id: 'highlight', name: 'Highlighted Border', description: 'Golden border styling', icon: 'Crown', enabled: true },
      { id: 'gallery', name: 'Extended Gallery', description: 'Up to 20 images', icon: 'Image', enabled: true },
      { id: 'duration', name: 'Extended Duration', description: '30 days listing', icon: 'Calendar', enabled: true },
      { id: 'analytics', name: 'Analytics Dashboard', description: 'Detailed insights', icon: 'BarChart', enabled: true },
      { id: 'virtual-tour', name: 'Virtual Tour', description: '360° property view', icon: 'Eye', enabled: true }
    ];

    // Transform daily views
    const dailyViews = (record.analytics_daily_views || []).map((entry: any) => ({
      date: entry.date,
      views: entry.views
    }));

    // Transform top sources
    const topSources = (record.analytics_top_sources || []).map((entry: any) => ({
      source: entry.source,
      count: entry.count
    }));

    return {
      id: record.id,
      propertyId: record.property_id,
      userId: record.user_id,
      plan,
      status: record.status,
      startDate: record.start_date,
      endDate: record.end_date,
      paymentId: record.payment_id,
      features,
      analytics: {
        views: record.analytics_views,
        inquiries: record.analytics_inquiries,
        favorites: record.analytics_favorites,
        conversionRate: record.analytics_conversion_rate,
        dailyViews,
        topSources
      },
      createdAt: record.created_at,
      updatedAt: record.updated_at
    };
  }
}

export const premiumService = new PremiumService();