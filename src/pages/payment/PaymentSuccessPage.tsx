import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { CheckCircle, ArrowRight, Download } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { xenditService } from '../../services/xenditService';
import { useToast } from '../../contexts/ToastContext';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showError } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  
  const orderId = searchParams.get('orderId');
  const invoiceId = searchParams.get('id');
  
  useEffect(() => {
    if (invoiceId) {
      verifyPayment(invoiceId);
    } else {
      setIsLoading(false);
    }
  }, [invoiceId]);
  
  const verifyPayment = async (id: string) => {
    try {
      const paymentStatus = await xenditService.getInvoiceStatus(id);
      
      if (paymentStatus.status === 'PAID' || paymentStatus.status === 'SETTLED') {
        setPaymentDetails(paymentStatus);
      } else {
        showError('Payment Verification Failed', 'We could not verify your payment. Please contact customer support.');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      showError('Payment Verification Error', 'An error occurred while verifying your payment. Please contact customer support.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownloadReceipt = () => {
    if (!paymentDetails) return;
    
    // Create receipt data
    const receiptData = {
      orderId: paymentDetails.external_id,
      invoiceId: paymentDetails.id,
      date: new Date().toISOString(),
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
      paymentMethod: paymentDetails.payment_method,
      paymentChannel: paymentDetails.payment_channel,
      status: paymentDetails.status,
      customerName: `${paymentDetails.customer?.given_names || ''} ${paymentDetails.customer?.surname || ''}`,
      customerEmail: paymentDetails.customer?.email || '',
    };
    
    // Convert to JSON string
    const receiptJson = JSON.stringify(receiptData, null, 2);
    
    // Create blob and download
    const blob = new Blob([receiptJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${paymentDetails.external_id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <Layout>
      <Helmet>
        <title>Payment Successful | Properti Pro</title>
        <meta name="description" content="Your payment has been successfully processed." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="bg-neutral-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-neutral-600">Verifying your payment...</p>
              </div>
            ) : (
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-green-600" />
                  </div>
                  
                  <h1 className="text-3xl font-bold text-neutral-900 mb-4">
                    Payment Successful!
                  </h1>
                  
                  <p className="text-lg text-neutral-600">
                    Your payment has been successfully processed and your premium listing is now active.
                  </p>
                </div>
                
                {paymentDetails && (
                  <div className="bg-neutral-50 rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-semibold text-neutral-800 mb-4">Payment Details</h2>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Order ID:</span>
                        <span className="font-medium">{paymentDetails.external_id}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Amount:</span>
                        <span className="font-medium">{paymentDetails.currency} {paymentDetails.amount.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Payment Method:</span>
                        <span className="font-medium">
                          {paymentDetails.payment_method} 
                          {paymentDetails.payment_channel && ` - ${paymentDetails.payment_channel}`}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Date:</span>
                        <span className="font-medium">
                          {new Date(paymentDetails.paid_at || paymentDetails.updated).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Status:</span>
                        <span className="font-medium text-green-600">Paid</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleDownloadReceipt}
                      className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                    >
                      <Download size={16} className="mr-2" />
                      Download Receipt
                    </button>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/dashboard/premium')}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 flex items-center justify-center"
                  >
                    View Your Premium Dashboard
                    <ArrowRight size={18} className="ml-2" />
                  </button>
                  
                  <button
                    onClick={() => navigate('/')}
                    className="border border-neutral-300 bg-white text-neutral-800 font-semibold py-3 px-6 rounded-lg hover:bg-neutral-50 transition-all duration-300"
                  >
                    Return to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccessPage;