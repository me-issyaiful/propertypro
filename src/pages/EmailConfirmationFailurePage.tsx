import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { XCircle, AlertCircle, Mail } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const EmailConfirmationFailurePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get('error');
  const [errorMessage, setErrorMessage] = useState('The email confirmation link is invalid or has expired. Please try again.');

  useEffect(() => {
    switch (errorCode) {
      case 'no_token':
        setErrorMessage('No confirmation token was provided. Please ensure you clicked the full link.');
        break;
      case 'invalid_token':
        setErrorMessage('The confirmation token is invalid. It might have been used already or is incorrect.');
        break;
      case 'expired_token':
        setErrorMessage('The confirmation link has expired. Please request a new one.');
        break;
      case 'already_verified':
        setErrorMessage('Your email is already verified or your account status prevents further action.');
        break;
      case 'update_failed':
        setErrorMessage('Failed to update your account status. Please contact support.');
        break;
      case 'db_error':
        setErrorMessage('A database error occurred during verification. Please try again later.');
        break;
      case 'internal_error':
        setErrorMessage('An internal server error occurred. Please try again later.');
        break;
      default:
        setErrorMessage('The email confirmation link is invalid or has expired. Please try again.');
    }
  }, [errorCode]);

  return (
    <Layout>
      <Helmet>
        <title>Email Confirmation Failed | Properti Pro</title>
        <meta name="description" content="Email confirmation failed. The link might be invalid or expired." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="bg-neutral-100 py-12 min-h-[calc(100vh-150px)] flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={32} className="text-red-600" />
              </div>
              
              <h1 className="font-heading font-bold text-2xl text-accent mb-4">
                Email Confirmation Failed
              </h1>
              
              <p className="text-neutral-600 mb-6">
                {errorMessage}
              </p>
              
              <div className="space-y-3">
                <Link to="/forgot-password" className="w-full btn-primary flex items-center justify-center">
                  <Mail size={18} className="mr-2" />
                  Request New Link
                </Link>
                
                <Link to="/login" className="w-full btn-secondary flex items-center justify-center">
                  Login Page
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmailConfirmationFailurePage;