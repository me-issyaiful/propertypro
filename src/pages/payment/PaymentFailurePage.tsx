import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const PaymentFailurePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const orderId = searchParams.get('orderId');
  const errorCode = searchParams.get('error_code');
  const errorMessage = searchParams.get('error_message') || 'Your payment could not be processed. Please try again.';
  
  const handleRetry = () => {
    // Navigate back to premium upgrade page with the same property ID
    navigate(`/premium/upgrade?propertyId=${searchParams.get('propertyId') || ''}`);
  };
  
  return (
    <Layout>
      <Helmet>
        <title>Payment Failed | Properti Pro</title>
        <meta name="description" content="Your payment could not be processed." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="bg-neutral-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle size={40} className="text-red-600" />
                </div>
                
                <h1 className="text-3xl font-bold text-neutral-900 mb-4">
                  Payment Failed
                </h1>
                
                <p className="text-lg text-neutral-600 mb-2">
                  {errorMessage}
                </p>
                
                {errorCode && (
                  <p className="text-sm text-neutral-500">
                    Error code: {errorCode}
                  </p>
                )}
              </div>
              
              {orderId && (
                <div className="bg-neutral-50 rounded-lg p-6 mb-8">
                  <h2 className="text-lg font-semibold text-neutral-800 mb-4">Order Information</h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Order ID:</span>
                      <span className="font-medium">{orderId}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 flex items-center justify-center"
                >
                  <RefreshCw size={18} className="mr-2" />
                  Try Again
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="border border-neutral-300 bg-white text-neutral-800 font-semibold py-3 px-6 rounded-lg hover:bg-neutral-50 transition-all duration-300 flex items-center justify-center"
                >
                  <ArrowLeft size={18} className="mr-2" />
                  Return to Home
                </button>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-neutral-500">
                  If you continue to experience issues, please contact our support team at{' '}
                  <a href="mailto:support@propertipro.id" className="text-primary hover:underline">
                    support@propertipro.id
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentFailurePage;