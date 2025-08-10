import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import HomePage from './pages/HomePage';
import PropertyListingPage from './pages/PropertyListingPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import LoginPage from './pages/LoginPage';
import LocationDetailPage from './pages/LocationDetailPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// New Email Confirmation Pages
import EmailConfirmationSuccessPage from './pages/EmailConfirmationSuccessPage';
import EmailConfirmationFailurePage from './pages/EmailConfirmationFailurePage';

import PremiumUpgradePage from './pages/PremiumUpgradePage';
import PremiumDashboardPage from './pages/PremiumDashboardPage';
import PremiumFeaturesPage from './pages/PremiumFeaturesPage';

import PaymentSuccessPage from './pages/payment/PaymentSuccessPage';
import PaymentFailurePage from './pages/payment/PaymentFailurePage';

import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import MyListings from './pages/dashboard/MyListings';
import AddEditListing from './pages/dashboard/AddEditListing';
import ProfileSettings from './pages/dashboard/ProfileSettings';

import UserLayout from './components/user/UserLayout';
import UserDashboard from './pages/user/UserDashboard';
import UserProfile from './pages/user/UserProfile';
import UserProperties from './pages/user/UserProperties';
import UserFavorites from './pages/user/UserFavorites';
import { supabase } from './lib/supabase';

function App() {
  useEffect(() => {
    const testSupabaseConnection = async () => {
      try {
        // Attempt to fetch a small amount of data from a public table
        // Replace 'listings' with any table you know exists and is accessible
        const { data, error } = await supabase.from('listings').select('id').limit(1);
        if (error) {
          console.error('Supabase connection test failed:', error);
        } else {
          console.log('Supabase connection test successful:', data);
        }
      } catch (err) {
        console.error('Supabase connection test caught an exception:', err);
      }
    };
    testSupabaseConnection();
  }, []);
  
  return (
    <HelmetProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/jual" element={<PropertyListingPage />} />
              <Route path="/sewa" element={<PropertyListingPage />} />
              <Route path="/lokasi/:locationSlug" element={<LocationDetailPage />} />
              <Route path="/properti/:id" element={<PropertyDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* New Email Confirmation Routes */}
              <Route path="/email-confirmation-success" element={<EmailConfirmationSuccessPage />} />
              <Route path="/email-confirmation-failure" element={<EmailConfirmationFailurePage />} />
              <Route path="/verify-email" element={<EmailConfirmationSuccessPage />} /> {/* This route is handled by the Edge Function redirect */}

              {/* Premium Routes */}
              <Route path="/premium/upgrade" element={<PremiumUpgradePage />} />
              <Route path="/premium/features" element={<PremiumFeaturesPage />} />
              
              {/* Payment Routes */}
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
              <Route path="/payment/failure" element={<PaymentFailurePage />} />

              {/* User Dashboard Routes */}
              <Route path="/dashboard" element={
                <DashboardLayout />
              }>
                <Route index element={<DashboardOverview />} />
                <Route path="listings" element={<MyListings />} />
                <Route path="listings/new" element={<AddEditListing />} />
                <Route path="listings/edit/:id" element={<AddEditListing />} />
                <Route path="profile" element={<ProfileSettings />} />
                <Route path="premium" element={<PremiumDashboardPage />} />
              </Route>

              {/* User Area Routes */}
              <Route path="/user" element={
                <UserLayout />
              }>
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="properties" element={<UserProperties />} />
                <Route path="favorites" element={<UserFavorites />} />
              </Route>
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;