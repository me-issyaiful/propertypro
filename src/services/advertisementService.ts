import { supabase } from '../lib/supabase';
import { Advertisement, AdImpression, AdClick, AdCampaign, AdPlacement } from '../types/advertisement';

class AdvertisementService {
  // Get active ads for a specific placement
  async getAdsForPlacement(location: string, limit: number = 3): Promise<Advertisement[]> {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select(`
          *,
          campaign:ad_campaigns(*),
          placement:ad_placements(*)
        `)
        .eq('status', 'active')
        .eq('placement.location', location)
        .eq('placement.is_active', true)
        .gte('campaign.end_date', new Date().toISOString())
        .eq('campaign.status', 'active')
        .order('priority', { ascending: false })
        .order('weight', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching ads for placement:', error);
      return [];
    }
  }

  // Track ad impression
  async trackImpression(adId: string, metadata: Partial<AdImpression>): Promise<void> {
    try {
      const impressionData = {
        ad_id: adId,
        session_id: this.getSessionId(),
        page_url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        device_type: this.getDeviceType(),
        browser: this.getBrowser(),
        ...metadata
      };

      const { error } = await supabase
        .from('ad_impressions')
        .insert(impressionData);

      if (error) throw error;

      // Update impression count
      await supabase.rpc('increment_ad_impressions', { ad_id: adId });
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  }

  // Track ad click
  async trackClick(adId: string, impressionId?: string, metadata: Partial<AdClick> = {}): Promise<void> {
    try {
      const clickData = {
        ad_id: adId,
        impression_id: impressionId,
        session_id: this.getSessionId(),
        page_url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        device_type: this.getDeviceType(),
        browser: this.getBrowser(),
        ...metadata
      };

      const { error } = await supabase
        .from('ad_clicks')
        .insert(clickData);

      if (error) throw error;

      // Update click count
      await supabase.rpc('increment_ad_clicks', { ad_id: adId });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  }

  // Get ad analytics
  async getAdAnalytics(adId: string, startDate?: string, endDate?: string) {
    try {
      const dateFilter = startDate && endDate 
        ? `created_at >= '${startDate}' AND created_at <= '${endDate}'`
        : '';

      const { data: impressions, error: impressionsError } = await supabase
        .from('ad_impressions')
        .select('*')
        .eq('ad_id', adId)
        .gte('created_at', startDate || '1970-01-01')
        .lte('created_at', endDate || new Date().toISOString());

      const { data: clicks, error: clicksError } = await supabase
        .from('ad_clicks')
        .select('*')
        .eq('ad_id', adId)
        .gte('created_at', startDate || '1970-01-01')
        .lte('created_at', endDate || new Date().toISOString());

      if (impressionsError || clicksError) {
        throw impressionsError || clicksError;
      }

      const impressionCount = impressions?.length || 0;
      const clickCount = clicks?.length || 0;
      const ctr = impressionCount > 0 ? (clickCount / impressionCount) * 100 : 0;

      return {
        impressions: impressionCount,
        clicks: clickCount,
        ctr: parseFloat(ctr.toFixed(2)),
        daily_impressions: this.groupByDate(impressions || []),
        daily_clicks: this.groupByDate(clicks || []),
      };
    } catch (error) {
      console.error('Error getting ad analytics:', error);
      return null;
    }
  }

  // Helper methods
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('ad_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('ad_session_id', sessionId);
    }
    return sessionId;
  }

  private getDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private getBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  }

  private groupByDate(data: any[]): { [date: string]: number } {
    return data.reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
  }
}

export const advertisementService = new AdvertisementService();