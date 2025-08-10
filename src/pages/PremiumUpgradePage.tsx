import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PremiumComparisonTable from '../components/premium/PremiumComparisonTable';
import PaymentForm from '../components/premium/PaymentForm';
import PaymentMethodSelector from '../components/premium/PaymentMethodSelector';
import PaymentSummary from '../components/premium/PaymentSummary';
import { Crown, CheckCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { BillingDetails } from '../types/premium';
import { premiumService } from '../services/premiumService';
import { xenditService } from '../services/xenditService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { XenditPaymentMethod, XenditPaymentChannel } from '../types/xendit';

const PremiumUpgradePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const isRenewal = searchParams.get('renewal') === 'true';
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  
  const [currentStep, setCurrentStep] = useState<'comparison' | 'payment_method' | 'payment_details' | 'processing' | 'success'>('comparison');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<XenditPaymentMethod | null>(null);
  const [selectedPaymentChannel, setSelectedPaymentChannel] = useState<XenditPaymentChannel | null>(null);
  const [xenditInvoiceUrl, setXenditInvoiceUrl] = useState<string | null>(null);

  const premiumPlan = premiumService.getPremiumPlans()[0];

  useEffect(() => {
    // If this is a renewal, skip the comparison step
    if (isRenewal && propertyId) {
      setCurrentStep('payment_method');
    }
  }, [isRenewal, propertyId]);

  const handleUpgradeClick = () => {
    setCurrentStep('payment_method');
  };

  const handlePaymentMethodSelect = (method: XenditPaymentMethod, channel?: XenditPaymentChannel) => {
    setSelectedPaymentMethod(method);
    setSelectedPaymentChannel(channel || null);
  };

  const handlePaymentMethodSubmit = () => {
    if (!selectedPaymentMethod) {
      showError('Payment Method Required', 'Please select a payment method to continue.');
      return;
    }
    
    setCurrentStep('payment_details');
  };

  const handlePaymentDetailsSubmit = async (details: BillingDetails) => {
    if (!propertyId) {
      showError('Error', 'Property ID is required');
      return;
    }

    if (!user) {
      showError('Error', 'You must be logged in to upgrade to premium');
      return;
    }

    setBillingDetails(details);
    setIsLoading(true);
    setCurrentStep('processing');

    try {
      // Add user ID to billing details
      const billingWithUser = {
        ...details,
        userId: user.id
      };

      // Create payment record
      const orderId = `premium-${propertyId}-${Date.now()}`;
      const payment = await premiumService.createPayment({
        orderId,
        amount: premiumPlan.price,
        currency: premiumPlan.currency,
        billingDetails: billingWithUser
      });

      if (!payment) {
        throw new Error('Failed to create payment record');
      }

      // Create Xendit invoice
      const xenditResponse = await xenditService.createInvoice({
        orderId,
        amount: premiumPlan.price,
        billingDetails: details,
        description: `${premiumPlan.name} - ${premiumPlan.duration} days`,
        items: [{
          id: premiumPlan.id,
          name: premiumPlan.name,
          price: premiumPlan.price,
          quantity: 1
        }],
        successRedirectUrl: `${window.location.origin}/premium/success?orderId=${orderId}`,
        failureRedirectUrl: `${window.location.origin}/premium/failure?orderId=${orderId}`,
        paymentMethods: selectedPaymentMethod ? [selectedPaymentMethod] : undefined
      });

      // Store the invoice URL
      setXenditInvoiceUrl(xenditResponse.invoice_url);

      // Open Xendit checkout page
      const paymentResult = await xenditService.openCheckoutPage(xenditResponse.invoice_url);

      if (paymentResult.status === 'success') {
        // Update payment status
        await premiumService.updatePaymentStatus(payment.id, 'success', xenditResponse.id);

        // Create premium listing
        await premiumService.createPremiumListing({
          propertyId,
          userId: user.id,
          planId: premiumPlan.id,
          paymentId: payment.id
        });

        setPaymentData({
          transaction_id: xenditResponse.id,
          order_id: orderId,
          payment_type: selectedPaymentMethod,
          transaction_time: new Date().toISOString(),
          transaction_status: 'settlement',
          gross_amount: premiumPlan.price.toString()
        });
        
        setCurrentStep('success');
        showSuccess('Payment Successful', 'Your premium listing has been activated successfully.');
      } else if (paymentResult.status === 'pending') {
        await premiumService.updatePaymentStatus(payment.id, 'pending');
        showError('Payment Pending', 'Your payment is being processed. You will receive a confirmation email shortly.');
        navigate('/dashboard/premium');
      } else {
        await premiumService.updatePaymentStatus(payment.id, 'failed');
        showError('Payment Failed', 'Your payment could not be processed. Please try again.');
        setCurrentStep('payment_method');
      }
    } catch (error) {
      console.error('Payment error:', error);
      showError('Payment Error', 'An error occurred while processing your payment. Please try again.');
      setCurrentStep('payment_method');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'comparison':
        return (
          <div className="space-y-8">
            <PremiumComparisonTable />
            <div className="text-center">
              <button
                onClick={handleUpgradeClick}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold py-4 px-8 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 flex items-center mx-auto text-lg"
              >
                <Crown size={24} className="mr-3" />
                Upgrade to Premium - ${premiumPlan.price}
              </button>
            </div>
          </div>
        );

      case 'payment_method':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <button
                onClick={() => setCurrentStep('comparison')}
                className="inline-flex items-center text-neutral-600 hover:text-neutral-800 mb-6"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Comparison
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <PaymentMethodSelector
                    selectedMethod={selectedPaymentMethod}
                    selectedChannel={selectedPaymentChannel}
                    onSelectMethod={handlePaymentMethodSelect}
                  />
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handlePaymentMethodSubmit}
                      disabled={!selectedPaymentMethod}
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CreditCard size={20} className="mr-2" />
                      Continue to Payment
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <PaymentSummary
                  plan={premiumPlan}
                  selectedMethod={selectedPaymentMethod}
                  selectedChannel={selectedPaymentChannel}
                />
              </div>
            </div>
          </div>
        );

      case 'payment_details':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <button
                onClick={() => setCurrentStep('payment_method')}
                className="inline-flex items-center text-neutral-600 hover:text-neutral-800 mb-6"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Payment Method
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PaymentForm
                  onSubmit={handlePaymentDetailsSubmit}
                  isLoading={isLoading}
                  amount={premiumPlan.price}
                  currency={premiumPlan.currency}
                  paymentMethod={selectedPaymentMethod}
                  paymentChannel={selectedPaymentChannel}
                />
              </div>
              
              <div className="lg:col-span-1">
                <PaymentSummary
                  plan={premiumPlan}
                  selectedMethod={selectedPaymentMethod}
                  selectedChannel={selectedPaymentChannel}
                />
              </div>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">Processing Your Payment</h2>
            <p className="text-neutral-600">
              Please wait while we process your payment. Do not close this window.
            </p>
            
            {xenditInvoiceUrl && (
              <div className="mt-6">
                <p className="text-sm text-neutral-500 mb-2">
                  If you were not redirected to the payment page, please click the button below:
                </p>
                <a
                  href={xenditInvoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300"
                >
                  Go to Payment Page
                </a>
              </div>
            )}
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-neutral-800 mb-4">
              Welcome to Premium!
            </h2>
            <p className="text-lg text-neutral-600 mb-8">
              Your property listing has been upgraded successfully. Your premium features are now active.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 max-w-md mx-auto">
              <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
              <ul className="text-sm text-green-700 space-y-1 text-left">
                <li>• Your listing is now featured at the top of search results</li>
                <li>• Premium badge and golden border are active</li>
                <li>• Analytics dashboard is available</li>
                <li>• You can upload up to 20 images</li>
              </ul>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate(`/dashboard/premium`)}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 mr-4"
              >
                View Analytics Dashboard
              </button>
              <button
                onClick={() => navigate(`/properti/${propertyId}`)}
                className="btn-secondary"
              >
                View Your Listing
              </button>
            </div>

            {paymentData && (
              <div className="mt-8 p-4 bg-neutral-50 rounded-lg max-w-md mx-auto">
                <h4 className="font-semibold text-neutral-800 mb-2">Payment Details</h4>
                <div className="text-sm text-neutral-600 space-y-1">
                  <p>Transaction ID: {paymentData.transaction_id}</p>
                  <p>Amount: ${premiumPlan.price}</p>
                  <p>Status: Completed</p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Upgrade to Premium | Properti Pro</title>
        <meta name="description" content="Upgrade your property listing to premium and get 3x more visibility, detailed analytics, and priority placement." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="bg-neutral-100 py-12">
        <div className="container mx-auto px-4">
          {/* Progress Indicator */}
          {currentStep !== 'success' && (
            <div className="max-w-3xl mx-auto mb-8">
              <div className="flex items-center justify-center space-x-4">
                <div className={`flex items-center ${
                  currentStep === 'comparison' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === 'comparison' ? 'bg-yellow-100 border-2 border-yellow-600' : 'bg-green-100'
                  }`}>
                    {currentStep === 'comparison' ? '1' : <CheckCircle size={20} />}
                  </div>
                  <span className="ml-2 font-medium">Choose Plan</span>
                </div>
                
                <div className={`w-16 h-0.5 ${
                  ['payment_method', 'payment_details', 'processing'].includes(currentStep) ? 'bg-yellow-600' : 'bg-neutral-300'
                }`}></div>
                
                <div className={`flex items-center ${
                  ['payment_method', 'payment_details', 'processing'].includes(currentStep) ? 'text-yellow-600' : 'text-neutral-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === 'payment_method' ? 'bg-yellow-100 border-2 border-yellow-600' : 
                    ['payment_details', 'processing'].includes(currentStep) ? 'bg-green-100' : 'bg-neutral-100'
                  }`}>
                    {currentStep === 'payment_method' ? '2' : 
                     ['payment_details', 'processing'].includes(currentStep) ? <CheckCircle size={20} /> : '2'}
                  </div>
                  <span className="ml-2 font-medium">Payment Method</span>
                </div>
                
                <div className={`w-16 h-0.5 ${
                  ['payment_details', 'processing'].includes(currentStep) ? 'bg-yellow-600' : 'bg-neutral-300'
                }`}></div>
                
                <div className={`flex items-center ${
                  ['payment_details', 'processing'].includes(currentStep) ? 'text-yellow-600' : 'text-neutral-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === 'payment_details' ? 'bg-yellow-100 border-2 border-yellow-600' : 
                    currentStep === 'processing' ? 'bg-green-100' : 'bg-neutral-100'
                  }`}>
                    {currentStep === 'payment_details' ? '3' : 
                     currentStep === 'processing' ? <CheckCircle size={20} /> : '3'}
                  </div>
                  <span className="ml-2 font-medium">Payment Details</span>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="max-w-6xl mx-auto">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PremiumUpgradePage;