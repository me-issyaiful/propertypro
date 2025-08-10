import { supabase } from '../lib/supabase';

class ReportService {
  /**
   * Create a new report
   */
  async createReport(reportData: {
    propertyId: string;
    reporterId?: string;
    reporterName: string;
    reporterEmail: string;
    type: string;
    reason: string;
    description?: string;
    priority?: string;
  }): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert({
          property_id: reportData.propertyId,
          reporter_id: reportData.reporterId || null,
          reporter_name: reportData.reporterName,
          reporter_email: reportData.reporterEmail,
          type: reportData.type,
          reason: reportData.reason,
          description: reportData.description || null,
          priority: reportData.priority || 'medium',
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating report:', error);
      return null;
    }
  }
}

export const reportService = new ReportService();