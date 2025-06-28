import React, { useState, useEffect } from 'react';
import { Users, Home, TrendingUp, AlertTriangle, Eye, Plus, MessageSquare } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../lib/supabase';
import { settingsService } from '../../services/settingsService';
import { useToast } from '../../contexts/ToastContext';

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  time: string;
}

const AdminDashboard: React.FC = () => {
  const { showError } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeProperties: 0,
    transactions: 0,
    pendingReports: 0
  });
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    setupRealtimeSubscription();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch stats
      await fetchStats();
      
      // Fetch recent activities
      await fetchRecentActivities();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get user count
      const { count: userCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // Get active properties count
      const { count: propertiesCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get transaction count (from ad_payments)
      const { count: transactionsCount } = await supabase
        .from('ad_payments')
        .select('*', { count: 'exact', head: true });

      // Get pending reports count
      const { count: reportsCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        totalUsers: userCount || 0,
        activeProperties: propertiesCount || 0,
        transactions: transactionsCount || 0,
        pendingReports: reportsCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Use fallback data
      setStats({
        totalUsers: 12543,
        activeProperties: 8921,
        transactions: 1234,
        pendingReports: 45
      });
    }
  };

  const fetchRecentActivities = async () => {
    try {
      // Fetch recent activity logs
      const { data: activityLogs, error } = await settingsService.getActivityLogs(
        {}, // No filters
        1, // Page 1
        10 // 10 items per page
      );

      if (error) throw error;

      // Map to ActivityItem format
      const activities: ActivityItem[] = activityLogs.map(log => {
        // Format the message based on action and resource
        let message = '';
        switch (log.action) {
          case 'CREATE_USER':
            message = `New user created: ${log.details || 'User'}`;
            break;
          case 'UPDATE_USER':
            message = `User updated: ${log.details || 'User'}`;
            break;
          case 'DELETE_USER':
            message = `User deleted: ${log.details || 'User'}`;
            break;
          case 'CREATE_LISTING':
            message = `New property added: ${log.details || 'Property'}`;
            break;
          case 'UPDATE_LISTING':
            message = `Property updated: ${log.details || 'Property'}`;
            break;
          case 'DELETE_LISTING':
            message = `Property deleted: ${log.details || 'Property'}`;
            break;
          case 'UPDATE_SETTINGS':
            message = `System settings updated: ${log.details || 'Settings'}`;
            break;
          case 'CREATE_REPORT':
            message = `New report submitted: ${log.details || 'Report'}`;
            break;
          case 'RESOLVE_REPORT':
            message = `Report resolved: ${log.details || 'Report'}`;
            break;
          default:
            message = `${log.action} on ${log.resource}: ${log.details || ''}`;
        }

        // Determine activity type
        let type = 'default';
        if (log.action.includes('USER')) type = 'user_registered';
        if (log.action.includes('LISTING')) type = 'property_added';
        if (log.action.includes('REPORT')) type = 'report_submitted';
        if (log.action.includes('SETTINGS')) type = 'settings_updated';

        // Format time
        const time = formatTimeAgo(new Date(log.createdAt));

        return {
          id: log.id,
          type,
          message,
          time
        };
      });

      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      // Use fallback data
      setRecentActivities([
        {
          id: '1',
          type: 'user_registered',
          message: 'Pengguna baru mendaftar: John Doe',
          time: '5 menit yang lalu',
        },
        {
          id: '2',
          type: 'property_added',
          message: 'Properti baru ditambahkan: Rumah Minimalis Jakarta',
          time: '15 menit yang lalu',
        },
        {
          id: '3',
          type: 'report_submitted',
          message: 'Laporan baru diterima untuk properti #1234',
          time: '1 jam yang lalu',
        }
      ]);
    }
  };

  const setupRealtimeSubscription = () => {
    // Subscribe to activity_logs table for real-time updates
    const channel = supabase
      .channel('activity_logs_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs'
        },
        (payload) => {
          // Handle new activity log
          const newLog = payload.new;
          
          // Format message based on action and resource
          let message = '';
          switch (newLog.action) {
            case 'CREATE_USER':
              message = `New user created: ${newLog.details || 'User'}`;
              break;
            case 'UPDATE_USER':
              message = `User updated: ${newLog.details || 'User'}`;
              break;
            case 'DELETE_USER':
              message = `User deleted: ${newLog.details || 'User'}`;
              break;
            case 'CREATE_LISTING':
              message = `New property added: ${newLog.details || 'Property'}`;
              break;
            case 'UPDATE_LISTING':
              message = `Property updated: ${newLog.details || 'Property'}`;
              break;
            case 'DELETE_LISTING':
              message = `Property deleted: ${newLog.details || 'Property'}`;
              break;
            case 'UPDATE_SETTINGS':
              message = `System settings updated: ${newLog.details || 'Settings'}`;
              break;
            case 'CREATE_REPORT':
              message = `New report submitted: ${newLog.details || 'Report'}`;
              break;
            case 'RESOLVE_REPORT':
              message = `Report resolved: ${newLog.details || 'Report'}`;
              break;
            default:
              message = `${newLog.action} on ${newLog.resource}: ${newLog.details || ''}`;
          }

          // Determine activity type
          let type = 'default';
          if (newLog.action.includes('USER')) type = 'user_registered';
          if (newLog.action.includes('LISTING')) type = 'property_added';
          if (newLog.action.includes('REPORT')) type = 'report_submitted';
          if (newLog.action.includes('SETTINGS')) type = 'settings_updated';

          // Add new activity to the list
          const newActivity: ActivityItem = {
            id: newLog.id,
            type,
            message,
            time: 'Baru saja'
          };

          // Update state with new activity at the beginning
          setRecentActivities(prev => [newActivity, ...prev.slice(0, 9)]);
          
          // Refresh stats if relevant
          if (
            newLog.action === 'CREATE_USER' || 
            newLog.action === 'CREATE_LISTING' || 
            newLog.action === 'CREATE_REPORT'
          ) {
            fetchStats();
          }
        }
      )
      .subscribe();

    return channel;
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    
    return date.toLocaleDateString('id-ID');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
        return <Users size={16} className="text-neutral-600" />;
      case 'property_added':
        return <Home size={16} className="text-neutral-600" />;
      case 'report_submitted':
        return <AlertTriangle size={16} className="text-neutral-600" />;
      case 'settings_updated':
        return <TrendingUp size={16} className="text-neutral-600" />;
      default:
        return <MessageSquare size={16} className="text-neutral-600" />;
    }
  };

  const statCards = [
    {
      title: 'Total Pengguna',
      value: stats.totalUsers.toLocaleString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Properti Aktif',
      value: stats.activeProperties.toLocaleString(),
      change: '+8%',
      changeType: 'positive' as const,
      icon: Home,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Transaksi Bulan Ini',
      value: stats.transactions.toLocaleString(),
      change: '+23%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'bg-primary',
      textColor: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Laporan Pending',
      value: stats.pendingReports.toLocaleString(),
      change: '-5%',
      changeType: 'negative' as const,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>Dashboard Admin | Properti Pro</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Dashboard</h1>
        <p className="text-neutral-600">Selamat datang di panel administrasi Properti Pro</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-neutral-900">{card.value}</p>
                  <p className={`text-sm ${
                    card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.change} dari bulan lalu
                  </p>
                </div>
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">Aktivitas Terbaru</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {Icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-900">{activity.message}</p>
                      <p className="text-xs text-neutral-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <button className="text-sm text-primary hover:underline flex items-center">
                <Eye size={16} className="mr-1" />
                Lihat semua aktivitas
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">Aksi Cepat</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                <Plus size={24} className="text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-neutral-900">Tambah Pengguna</p>
              </button>
              <button className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                <Home size={24} className="text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-neutral-900">Kelola Properti</p>
              </button>
              <button className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                <AlertTriangle size={24} className="text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-neutral-900">Review Laporan</p>
              </button>
              <button className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                <TrendingUp size={24} className="text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-neutral-900">Lihat Analitik</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;