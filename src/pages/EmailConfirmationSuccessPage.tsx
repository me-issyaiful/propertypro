import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { CheckCircle, LogIn } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const EmailConfirmationSuccessPage: React.FC = () => {
  return (
    <Layout>
      <Helmet>
        <title>Email Confirmed! | Properti Pro</title>
        <meta name="description" content="Your email address has been successfully confirmed." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="bg-neutral-100 py-12 min-h-[calc(100vh-150px)] flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              
              <h1 className="font-heading font-bold text-2xl text-accent mb-4">
                Email Confirmed!
              </h1>
              
              <p className="text-neutral-600 mb-6">
                Your email address has been successfully confirmed. You can now log in to your account.
              </p>
              
              <Link to="/login" className="w-full btn-primary flex items-center justify-center">
                <LogIn size={18} className="mr-2" />
                Login Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmailConfirmationSuccessPage;