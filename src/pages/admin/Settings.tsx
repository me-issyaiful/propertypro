import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  Shield, 
  Mail, 
  Database, 
  Globe, 
  Users, 
  Bell,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  Activity,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { SystemSettings, AdminUser, ActivityLog } from '../../types/admin';
import { settingsService } from '../../services/settingsService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import DataTable, { Column } from '../../components/admin/DataTable';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('general');
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const tabs = [
    { id: 'general', label: 'Umum', icon: SettingsIcon },
    { id: 'features', label: 'Fitur', icon: Globe },
    { id: 'security', label: 'Keamanan', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'storage', label: 'Penyimpanan', icon: Database },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'backup', label: 'Backup', icon: Database },
    { id: 'admins', label: 'Admin Users', icon: Users },
    { id: 'logs', label: 'Activity Logs', icon: Activity },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load system settings
      const systemSettings = await settingsService.getSystemSettings();
      if (systemSettings) {
        setSettings(systemSettings);
      } else {
        // Use default settings if none exist
        setSettings(getDefaultSettings());
      }

      // Load admin users
      const admins = await settingsService.getAdminUsers();
      setAdminUsers(admins);

      // Load activity logs
      const { data: logs } = await settingsService.getActivityLogs({}, 1, 50);
      setActivityLogs(logs);
    } catch (error) {
      console.error('Error loading settings data:', error);
      showError('Error', 'Failed to load settings data. Please try again.');
      // Set default settings as fallback
      setSettings(getDefaultSettings());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultSettings = (): SystemSettings => {
    return {
      general: {
        siteName: 'Properti Pro',
        siteDescription: 'Platform jual beli dan sewa properti terpercaya di Indonesia',
        siteUrl: 'https://propertipro.id',
        adminEmail: 'admin@propertipro.id',
        supportEmail: 'support@propertipro.id',
        timezone: 'Asia/Jakarta',
        language: 'id',
        currency: 'IDR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
      },
      features: {
        userRegistration: true,
        emailVerification: true,
        propertyApproval: true,
        autoPublish: false,
        guestInquiries: true,
        socialLogin: true,
        multiLanguage: false,
        darkMode: true,
        maintenance: false,
      },
      limits: {
        maxPropertiesPerUser: 50,
        maxImagesPerProperty: 20,
        maxFileSize: 10,
        sessionTimeout: 120,
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        propertyTitleMaxLength: 200,
        propertyDescriptionMaxLength: 2000,
      },
      email: {
        provider: 'smtp',
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUsername: 'noreply@propertipro.id',
        fromEmail: 'noreply@propertipro.id',
        fromName: 'Properti Pro',
        replyToEmail: 'support@propertipro.id',
        enableNotifications: true,
        enableWelcomeEmail: true,
        enablePropertyAlerts: true,
      },
      security: {
        enableTwoFactor: false,
        enableCaptcha: true,
        captchaProvider: 'recaptcha',
        enableRateLimit: true,
        rateLimitRequests: 100,
        rateLimitWindow: 15,
        enableIpBlocking: false,
        blockedIps: [],
        enableSsl: true,
        enableHsts: true,
      },
      storage: {
        provider: 'local',
        maxStorageSize: 100,
        enableImageOptimization: true,
        enableImageWatermark: false,
      },
      seo: {
        enableSitemap: true,
        enableRobotsTxt: true,
        metaTitle: 'Properti Pro - Jual Beli & Sewa Properti di Indonesia',
        metaDescription: 'Platform jual beli dan sewa properti terpercaya di Indonesia dengan ribuan pilihan properti berkualitas.',
        metaKeywords: 'properti, rumah, apartemen, jual beli properti, sewa properti, indonesia',
        ogImage: '/og-image.jpg',
        enableStructuredData: true,
      },
      social: {
        enableSocialSharing: true,
        enableSocialLogin: true,
      },
      notifications: {
        enableEmailNotifications: true,
        enableSmsNotifications: false,
        enablePushNotifications: false,
        smsProvider: 'twilio',
        pushProvider: 'firebase',
      },
      backup: {
        enableAutoBackup: true,
        backupFrequency: 'daily',
        backupRetention: 30,
        backupLocation: 'local',
        enableDatabaseBackup: true,
        enableFileBackup: true,
        lastBackupDate: new Date().toISOString(),
        nextBackupDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
      },
    };
  };

  const handleSaveSettings = async () => {
    if (!settings || !user) return;
    
    setIsSaving(true);
    try {
      const success = await settingsService.updateSystemSettings(
        settings,
        user.id,
        user.full_name
      );
      
      if (success) {
        showSuccess('Settings Saved', 'Your settings have been successfully updated.');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Error', 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset settings to default?')) {
      setSettings(getDefaultSettings());
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      const success = await settingsService.createBackup();
      
      if (success) {
        // Refresh settings to get updated backup dates
        const updatedSettings = await settingsService.getSystemSettings();
        if (updatedSettings) {
          setSettings(updatedSettings);
        }
        
        showSuccess('Backup Created', 'Database backup has been created successfully.');
      } else {
        throw new Error('Failed to create backup');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      showError('Error', 'Failed to create backup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmin = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEditAdmin = (user: AdminUser) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteAdmin = async (user: AdminUser) => {
    if (confirm(`Are you sure you want to delete admin "${user.name}"?`)) {
      try {
        const success = await settingsService.deleteAdminUser(user.id);
        
        if (success) {
          setAdminUsers(prev => prev.filter(u => u.id !== user.id));
          showSuccess('Admin Deleted', `Admin user "${user.name}" has been deleted successfully.`);
          
          // Log the activity
          if (user) {
            await settingsService.logActivity({
              userId: user.id,
              userName: user.name,
              action: 'DELETE_USER',
              resource: 'admin_users',
              resourceId: user.id,
              details: `Deleted admin user: ${user.name}`,
            });
          }
        } else {
          throw new Error('Failed to delete admin user');
        }
      } catch (error) {
        console.error('Error deleting admin user:', error);
        showError('Error', 'Failed to delete admin user. Please try again.');
      }
    }
  };

  // Admin Users table columns
  const adminColumns: Column<AdminUser>[] = [
    {
      key: 'name',
      title: 'Nama',
      sortable: true,
      render: (value, record) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-primary">
              {record.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-neutral-900">{value}</div>
            <div className="text-sm text-neutral-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Role',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value === 'superadmin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {value === 'superadmin' ? 'Super Admin' : 'Admin'}
        </span>
      ),
    },
    {
      key: 'isActive',
      title: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Aktif' : 'Tidak Aktif'}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      title: 'Login Terakhir',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString('id-ID') : 'Belum pernah',
    },
    {
      key: 'createdAt',
      title: 'Dibuat',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('id-ID'),
    },
  ];

  const renderAdminActions = (user: AdminUser) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleEditAdmin(user);
        }}
        className="p-1 text-neutral-500 hover:text-primary"
        title="Edit"
      >
        <Edit size={16} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteAdmin(user);
        }}
        className="p-1 text-neutral-500 hover:text-red-600"
        title="Hapus"
        disabled={user.role === 'superadmin'}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  // Activity Logs table columns
  const logColumns: Column<ActivityLog>[] = [
    {
      key: 'createdAt',
      title: 'Waktu',
      sortable: true,
      render: (value) => (
        <div>
          <div className="font-medium">
            {new Date(value).toLocaleDateString('id-ID')}
          </div>
          <div className="text-sm text-neutral-500">
            {new Date(value).toLocaleTimeString('id-ID', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      ),
    },
    {
      key: 'userName',
      title: 'User',
      sortable: true,
    },
    {
      key: 'action',
      title: 'Aksi',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm bg-neutral-100 px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: 'resource',
      title: 'Resource',
      sortable: true,
    },
    {
      key: 'details',
      title: 'Detail',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: 'ipAddress',
      title: 'IP Address',
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
  ];

  const renderTabContent = () => {
    if (isLoading || !settings) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nama Situs
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={settings.general.siteName}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    general: { ...prev!.general, siteName: e.target.value }
                  }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  URL Situs
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={settings.general.siteUrl}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    general: { ...prev!.general, siteUrl: e.target.value }
                  }))}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Deskripsi Situs
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={settings.general.siteDescription}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    general: { ...prev!.general, siteDescription: e.target.value }
                  }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Email Admin
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={settings.general.adminEmail}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    general: { ...prev!.general, adminEmail: e.target.value }
                  }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Email Support
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={settings.general.supportEmail}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    general: { ...prev!.general, supportEmail: e.target.value }
                  }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Timezone
                </label>
                <select
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={settings.general.timezone}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    general: { ...prev!.general, timezone: e.target.value }
                  }))}
                >
                  <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                  <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                  <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Mata Uang
                </label>
                <select
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={settings.general.currency}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    general: { ...prev!.general, currency: e.target.value }
                  }))}
                >
                  <option value="IDR">Indonesian Rupiah (IDR)</option>
                  <option value="USD">US Dollar (USD)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(settings.features).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-neutral-900">
                      {key === 'userRegistration' ? 'Registrasi Pengguna' :
                       key === 'emailVerification' ? 'Verifikasi Email' :
                       key === 'propertyApproval' ? 'Persetujuan Properti' :
                       key === 'autoPublish' ? 'Publikasi Otomatis' :
                       key === 'guestInquiries' ? 'Inquiry Tamu' :
                       key === 'socialLogin' ? 'Login Sosial' :
                       key === 'multiLanguage' ? 'Multi Bahasa' :
                       key === 'darkMode' ? 'Mode Gelap' :
                       key === 'maintenance' ? 'Mode Maintenance' : key}
                    </h4>
                    <p className="text-sm text-neutral-500">
                      {key === 'userRegistration' ? 'Izinkan pengguna baru mendaftar' :
                       key === 'emailVerification' ? 'Wajibkan verifikasi email' :
                       key === 'propertyApproval' ? 'Properti harus disetujui admin' :
                       key === 'autoPublish' ? 'Publikasi properti otomatis' :
                       key === 'guestInquiries' ? 'Izinkan inquiry tanpa login' :
                       key === 'socialLogin' ? 'Login dengan media sosial' :
                       key === 'multiLanguage' ? 'Dukungan multi bahasa' :
                       key === 'darkMode' ? 'Tema gelap untuk pengguna' :
                       key === 'maintenance' ? 'Aktifkan mode maintenance' : ''}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={value}
                      onChange={(e) => setSettings(prev => ({
                        ...prev!,
                        features: { ...prev!.features, [key]: e.target.checked }
                      }))}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-neutral-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-neutral-500">Aktifkan 2FA untuk admin</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.security.enableTwoFactor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev!,
                      security: { ...prev!.security, enableTwoFactor: e.target.checked }
                    }))}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-neutral-900">CAPTCHA</h4>
                  <p className="text-sm text-neutral-500">Aktifkan CAPTCHA untuk form</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.security.enableCaptcha}
                    onChange={(e) => setSettings(prev => ({
                      ...prev!,
                      security: { ...prev!.security, enableCaptcha: e.target.checked }
                    }))}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              {settings.security.enableCaptcha && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      CAPTCHA Provider
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={settings.security.captchaProvider}
                      onChange={(e) => setSettings(prev => ({
                        ...prev!,
                        security: { ...prev!.security, captchaProvider: e.target.value as 'recaptcha' | 'hcaptcha' }
                      }))}
                    >
                      <option value="recaptcha">Google reCAPTCHA</option>
                      <option value="hcaptcha">hCaptcha</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Site Key
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={settings.security.captchaSiteKey || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev!,
                        security: { ...prev!.security, captchaSiteKey: e.target.value }
                      }))}
                      placeholder="Site key dari provider CAPTCHA"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Secret Key
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.captchaSecret ? 'text' : 'password'}
                        className="w-full px-3 py-2 pr-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={settings.security.captchaSecretKey || ''}
                        onChange={(e) => setSettings(prev => ({
                          ...prev!,
                          security: { ...prev!.security, captchaSecretKey: e.target.value }
                        }))}
                        placeholder="Secret key dari provider CAPTCHA"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
                        onClick={() => togglePasswordVisibility('captchaSecret')}
                      >
                        {showPasswords.captchaSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Rate Limit (requests per window)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={settings.security.rateLimitRequests}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    security: { ...prev!.security, rateLimitRequests: parseInt(e.target.value) }
                  }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Rate Limit Window (menit)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={settings.security.rateLimitWindow}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    security: { ...prev!.security, rateLimitWindow: parseInt(e.target.value) }
                  }))}
                />
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Email Provider
                </label>
                <select
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={settings.email.provider}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    email: { ...prev!.email, provider: e.target.value as any }
                  }))}
                >
                  <option value="smtp">SMTP</option>
                  <option value="sendgrid">SendGrid</option>
                  <option value="mailgun">Mailgun</option>
                  <option value="ses">Amazon SES</option>
                </select>
              </div>
              
              {settings.email.provider === 'smtp' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={settings.email.smtpHost || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev!,
                        email: { ...prev!.email, smtpHost: e.target.value }
                      }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={settings.email.smtpPort || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev!,
                        email: { ...prev!.email, smtpPort: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={settings.email.smtpUsername || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev!,
                        email: { ...prev!.email, smtpUsername: e.target.value }
                      }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      SMTP Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.smtpPassword ? 'text' : 'password'}
                        className="w-full px-3 py-2 pr-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={settings.email.smtpPassword || ''}
                        onChange={(e) => setSettings(prev => ({
                          ...prev!,
                          email: { ...prev!.email, smtpPassword: e.target.value }
                        }))}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
                        onClick={() => togglePasswordVisibility('smtpPassword')}
                      >
                        {showPasswords.smtpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  From Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={settings.email.fromEmail}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    email: { ...prev!.email, fromEmail: e.target.value }
                  }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  From Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={settings.email.fromName}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    email: { ...prev!.email, fromName: e.target.value }
                  }))}
                />
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
              <div className="space-y-4">
                {['enableNotifications', 'enableWelcomeEmail', 'enablePropertyAlerts'].map((key) => (
                  <div key={key} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-neutral-900">
                        {key === 'enableNotifications' ? 'Email Notifications' :
                         key === 'enableWelcomeEmail' ? 'Welcome Email' :
                         'Property Alerts'}
                      </h4>
                      <p className="text-sm text-neutral-500">
                        {key === 'enableNotifications' ? 'Aktifkan notifikasi email' :
                         key === 'enableWelcomeEmail' ? 'Kirim email selamat datang' :
                         'Kirim alert properti baru'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.email[key as keyof typeof settings.email] as boolean}
                        onChange={(e) => setSettings(prev => ({
                          ...prev!,
                          email: { ...prev!.email, [key]: e.target.checked }
                        }))}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'backup':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle size={20} className="text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">Backup Status</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Backup terakhir: {settings.backup.lastBackupDate ? 
                      new Date(settings.backup.lastBackupDate).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Belum pernah'}
                  </p>
                  <p className="text-sm text-blue-700">
                    Backup berikutnya: {settings.backup.nextBackupDate ? 
                      new Date(settings.backup.nextBackupDate).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Tidak dijadwalkan'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={handleCreateBackup}
                disabled={isLoading}
                className="btn-primary flex items-center"
              >
                {isLoading ? (
                  <RefreshCw size={18} className="mr-2 animate-spin" />
                ) : (
                  <Download size={18} className="mr-2" />
                )}
                {isLoading ? 'Membuat Backup...' : 'Buat Backup Manual'}
              </button>
              
              <button className="btn-secondary flex items-center">
                <Upload size={18} className="mr-2" />
                Restore Backup
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-neutral-900">Auto Backup</h4>
                  <p className="text-sm text-neutral-500">Backup otomatis terjadwal</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.backup.enableAutoBackup}
                    onChange={(e) => setSettings(prev => ({
                      ...prev!,
                      backup: { ...prev!.backup, enableAutoBackup: e.target.checked }
                    }))}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Frekuensi Backup
                </label>
                <select
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={settings.backup.backupFrequency}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    backup: { ...prev!.backup, backupFrequency: e.target.value as any }
                  }))}
                  disabled={!settings.backup.enableAutoBackup}
                >
                  <option value="daily">Harian</option>
                  <option value="weekly">Mingguan</option>
                  <option value="monthly">Bulanan</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Retensi Backup (hari)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={settings.backup.backupRetention}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    backup: { ...prev!.backup, backupRetention: parseInt(e.target.value) }
                  }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Lokasi Backup
                </label>
                <select
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={settings.backup.backupLocation}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    backup: { ...prev!.backup, backupLocation: e.target.value as any }
                  }))}
                >
                  <option value="local">Local Storage</option>
                  <option value="s3">Amazon S3</option>
                  <option value="gcs">Google Cloud Storage</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'admins':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Admin Users</h3>
              <button
                onClick={handleAddAdmin}
                className="btn-primary flex items-center"
              >
                <Plus size={18} className="mr-2" />
                Tambah Admin
              </button>
            </div>
            
            <DataTable
              data={adminUsers}
              columns={adminColumns}
              actions={renderAdminActions}
              searchable
              pagination
              pageSize={10}
            />
          </div>
        );

      case 'logs':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Activity Logs</h3>
              <button className="btn-secondary flex items-center">
                <Download size={18} className="mr-2" />
                Export Logs
              </button>
            </div>
            
            <DataTable
              data={activityLogs}
              columns={logColumns}
              searchable
              pagination
              pageSize={15}
            />
          </div>
        );

      default:
        return <div>Tab content for {activeTab}</div>;
    }
  };

  return (
    <div>
      <Helmet>
        <title>Settings | Admin Properti Pro</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Settings</h1>
            <p className="text-neutral-600">Kelola pengaturan sistem dan konfigurasi platform</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetSettings}
              className="btn-secondary flex items-center"
            >
              <RefreshCw size={18} className="mr-2" />
              Reset
            </button>
            
            <button
              onClick={handleSaveSettings}
              disabled={isSaving || isLoading}
              className="btn-primary flex items-center"
            >
              {isSaving ? (
                <RefreshCw size={18} className="mr-2 animate-spin" />
              ) : (
                <Save size={18} className="mr-2" />
              )}
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon size={18} className="mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Admin User Modal */}
      {showUserModal && (
        <AdminUserModal
          user={selectedUser}
          onClose={() => setShowUserModal(false)}
          onSave={async (user) => {
            try {
              if (selectedUser) {
                // Update existing user
                const updatedUser = await settingsService.updateAdminUser(user.id, {
                  name: user.name,
                  role: user.role,
                  permissions: user.permissions,
                  isActive: user.isActive
                });
                
                if (updatedUser) {
                  setAdminUsers(prev => 
                    prev.map(u => u.id === user.id ? updatedUser : u)
                  );
                  
                  showSuccess('Admin Updated', `Admin user "${user.name}" has been updated successfully.`);
                  
                  // Log the activity
                  if (user) {
                    await settingsService.logActivity({
                      userId: user.id,
                      userName: user.name,
                      action: 'UPDATE_USER',
                      resource: 'admin_users',
                      resourceId: user.id,
                      details: `Updated admin user: ${user.name}`,
                    });
                  }
                } else {
                  throw new Error('Failed to update admin user');
                }
              } else {
                // Create new user
                const newUser = await settingsService.createAdminUser({
                  name: user.name,
                  email: user.email,
                  password: 'tempPassword123', // In a real app, you'd generate a random password or require one
                  role: user.role,
                  permissions: user.permissions,
                  isActive: user.isActive
                });
                
                if (newUser) {
                  setAdminUsers(prev => [...prev, newUser]);
                  
                  showSuccess('Admin Created', `Admin user "${user.name}" has been created successfully.`);
                  
                  // Log the activity
                  if (user) {
                    await settingsService.logActivity({
                      userId: user.id,
                      userName: user.name,
                      action: 'CREATE_USER',
                      resource: 'admin_users',
                      resourceId: user.id,
                      details: `Created new admin user: ${user.name}`,
                    });
                  }
                } else {
                  throw new Error('Failed to create admin user');
                }
              }
              
              setShowUserModal(false);
            } catch (error) {
              console.error('Error saving admin user:', error);
              showError('Error', 'Failed to save admin user. Please try again.');
            }
          }}
        />
      )}
    </div>
  );
};

// Admin User Modal Component
interface AdminUserModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onSave: (user: AdminUser) => void;
}

const AdminUserModal: React.FC<AdminUserModalProps> = ({ 
  user, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'admin' as const,
    isActive: user?.isActive ?? true,
    permissions: user?.permissions || [],
  });

  const availablePermissions = [
    'users.read', 'users.write', 'users.delete',
    'properties.read', 'properties.write', 'properties.delete',
    'categories.read', 'categories.write', 'categories.delete',
    'locations.read', 'locations.write', 'locations.delete',
    'reports.read', 'reports.write', 'reports.delete',
    'analytics.read', 'settings.read', 'settings.write',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUser: AdminUser = {
      id: user?.id || Date.now().toString(),
      ...formData,
      createdAt: user?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: user?.lastLogin || null,
    };
    
    onSave(newUser);
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, permission]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p !== permission)
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-xl font-semibold">
            {user ? 'Edit Admin User' : 'Tambah Admin User'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Nama
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                disabled={!!user} // Can't change email for existing users
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Role
              </label>
              <select
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'superadmin' }))}
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                className="h-4 w-4 text-primary border-neutral-300 rounded focus:ring-primary"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-neutral-700">
                User aktif
              </label>
            </div>
          </div>
          
          {formData.role === 'admin' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Permissions
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-neutral-200 rounded-lg p-3">
                {availablePermissions.map(permission => (
                  <label key={permission} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary border-neutral-300 rounded focus:ring-primary mr-2"
                      checked={formData.permissions.includes(permission)}
                      onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                    />
                    {permission}
                  </label>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-600 hover:text-neutral-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {user ? 'Simpan Perubahan' : 'Tambah Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;