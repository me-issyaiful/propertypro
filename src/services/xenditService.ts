import axios from 'axios';
import { 
  XenditConfig, 
  XenditPaymentRequest, 
  XenditPaymentResponse, 
  XenditRefundRequest, 
  XenditRefundResponse,
  XenditPaymentMethod,
  XenditPaymentChannel
} from '../types/xendit';
import { BillingDetails } from '../types/premium';

class XenditService {
  private config: XenditConfig;
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_XENDIT_API_KEY || 'xnd_development_your_key_here',
      isProduction: import.meta.env.VITE_XENDIT_IS_PRODUCTION === 'true',
    };

    this.baseUrl = this.config.isProduction
      ? 'https://api.xendit.co'
      : 'https://api.xendit.co';

    // Basic auth with API key as username and empty password
    const auth = btoa(`${this.config.apiKey}:`);
    this.headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create a payment invoice
   */
  async createInvoice(paymentData: {
    orderId: string;
    amount: number;
    billingDetails: BillingDetails;
    description?: string;
    items?: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>;
    successRedirectUrl?: string;
    failureRedirectUrl?: string;
    paymentMethods?: XenditPaymentMethod[];
  }): Promise<XenditPaymentResponse> {
    try {
      // In a real implementation, this would call your backend API
      // which then calls Xendit API with server key
      // For now, we'll simulate the API call for development
      
      // Prepare the request payload
      const payload: XenditPaymentRequest = {
        externalID: paymentData.orderId,
        amount: paymentData.amount,
        description: paymentData.description || 'Premium Listing Payment',
        invoiceDuration: 86400, // 24 hours
        customer: {
          givenNames: paymentData.billingDetails.firstName,
          surname: paymentData.billingDetails.lastName,
          email: paymentData.billingDetails.email,
          mobileNumber: paymentData.billingDetails.phone,
          addresses: [
            {
              country: paymentData.billingDetails.country,
              streetLine1: paymentData.billingDetails.address,
              city: paymentData.billingDetails.city,
              postalCode: paymentData.billingDetails.postalCode,
            },
          ],
        },
        customerNotificationPreference: {
          invoiceCreated: ['email'],
          invoicePaid: ['email'],
        },
        successRedirectURL: paymentData.successRedirectUrl || window.location.origin + '/payment/success',
        failureRedirectURL: paymentData.failureRedirectUrl || window.location.origin + '/payment/failure',
        paymentMethods: paymentData.paymentMethods || [
          'credit_card',
          'virtual_account',
          'e_wallet',
          'retail_outlet',
          'qr_code',
        ],
        shouldSendEmail: true,
        items: paymentData.items?.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          category: 'Premium',
        })),
      };

      // For development, simulate a successful response
      if (import.meta.env.DEV) {
        console.log('Creating Xendit invoice (simulated):', payload);
        
        // Simulate API response
        const simulatedResponse: XenditPaymentResponse = {
          id: `xendit-invoice-${Date.now()}`,
          external_id: paymentData.orderId,
          user_id: 'user_id',
          status: 'PENDING',
          merchant_name: 'Properti Pro',
          merchant_profile_picture_url: 'https://example.com/logo.png',
          amount: paymentData.amount,
          description: payload.description,
          invoice_url: `https://checkout-staging.xendit.co/web/${Date.now()}`,
          available_payment_methods: payload.paymentMethods || [],
          should_exclude_credit_card: false,
          should_send_email: true,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          mid_label: 'Properti Pro',
          currency: 'IDR',
          success_redirect_url: payload.successRedirectURL || '',
          failure_redirect_url: payload.failureRedirectURL || '',
        };
        
        return simulatedResponse;
      }

      // Make the actual API call to Xendit
      const response = await axios.post<XenditPaymentResponse>(
        `${this.baseUrl}/v2/invoices`,
        payload,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Xendit invoice creation failed:', error);
      throw error;
    }
  }

  /**
   * Get invoice status
   */
  async getInvoiceStatus(invoiceId: string): Promise<XenditPaymentResponse> {
    try {
      // For development, simulate a successful response
      if (import.meta.env.DEV) {
        console.log('Getting Xendit invoice status (simulated):', invoiceId);
        
        // Simulate API response
        const simulatedResponse: XenditPaymentResponse = {
          id: invoiceId,
          external_id: `order-${Date.now()}`,
          user_id: 'user_id',
          status: 'PAID',
          merchant_name: 'Properti Pro',
          merchant_profile_picture_url: 'https://example.com/logo.png',
          amount: 29.99,
          description: 'Premium Listing Payment',
          invoice_url: `https://checkout-staging.xendit.co/web/${Date.now()}`,
          available_payment_methods: ['credit_card', 'virtual_account', 'e_wallet'],
          should_exclude_credit_card: false,
          should_send_email: true,
          created: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          updated: new Date().toISOString(),
          mid_label: 'Properti Pro',
          currency: 'IDR',
          success_redirect_url: window.location.origin + '/payment/success',
          failure_redirect_url: window.location.origin + '/payment/failure',
          payment_method: 'credit_card',
          payment_channel: 'CREDIT_CARD',
          paid_amount: 29.99,
          paid_at: new Date().toISOString(),
          payer_email: 'customer@example.com',
        };
        
        return simulatedResponse;
      }

      // Make the actual API call to Xendit
      const response = await axios.get<XenditPaymentResponse>(
        `${this.baseUrl}/v2/invoices/${invoiceId}`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get Xendit invoice status:', error);
      throw error;
    }
  }

  /**
   * Process a refund
   */
  async createRefund(refundData: XenditRefundRequest): Promise<XenditRefundResponse> {
    try {
      // For development, simulate a successful response
      if (import.meta.env.DEV) {
        console.log('Creating Xendit refund (simulated):', refundData);
        
        // Simulate API response
        const simulatedResponse: XenditRefundResponse = {
          id: `xendit-refund-${Date.now()}`,
          payment_id: refundData.paymentID,
          user_id: 'user_id',
          external_refund_id: refundData.externalRefundID,
          amount: refundData.amount,
          channel_code: 'CREDIT_CARD',
          status: 'COMPLETED',
          refund_fee_amount: 0,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        };
        
        return simulatedResponse;
      }

      // Make the actual API call to Xendit
      const response = await axios.post<XenditRefundResponse>(
        `${this.baseUrl}/refunds`,
        refundData,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Xendit refund creation failed:', error);
      throw error;
    }
  }

  /**
   * Get refund status
   */
  async getRefundStatus(refundId: string): Promise<XenditRefundResponse> {
    try {
      // For development, simulate a successful response
      if (import.meta.env.DEV) {
        console.log('Getting Xendit refund status (simulated):', refundId);
        
        // Simulate API response
        const simulatedResponse: XenditRefundResponse = {
          id: refundId,
          payment_id: `payment-${Date.now()}`,
          user_id: 'user_id',
          external_refund_id: `refund-${Date.now()}`,
          amount: 29.99,
          channel_code: 'CREDIT_CARD',
          status: 'COMPLETED',
          refund_fee_amount: 0,
          created: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          updated: new Date().toISOString(),
        };
        
        return simulatedResponse;
      }

      // Make the actual API call to Xendit
      const response = await axios.get<XenditRefundResponse>(
        `${this.baseUrl}/refunds/${refundId}`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get Xendit refund status:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    requestBody: string,
    headerSignature: string,
    webhookKey: string
  ): boolean {
    try {
      // In a real implementation, you would verify the signature
      // For now, we'll return true for development
      console.log('Verifying Xendit webhook signature (simulated)');
      return true;
    } catch (error) {
      console.error('Failed to verify Xendit webhook signature:', error);
      return false;
    }
  }

  /**
   * Open Xendit checkout page
   */
  openCheckoutPage(invoiceUrl: string): Promise<{
    status: 'success' | 'pending' | 'failed' | 'closed';
    invoiceId?: string;
  }> {
    return new Promise((resolve) => {
      // Open the invoice URL in a new window
      const checkoutWindow = window.open(invoiceUrl, '_blank');
      
      // For development, simulate a successful payment after 3 seconds
      if (import.meta.env.DEV) {
        setTimeout(() => {
          if (checkoutWindow) {
            checkoutWindow.close();
          }
          
          // Simulate a successful payment
          resolve({
            status: 'success',
            invoiceId: `xendit-invoice-${Date.now()}`,
          });
        }, 3000);
      }
      
      // In a real implementation, you would listen for a callback or poll the invoice status
      // For now, we'll just resolve with a success status for development
    });
  }

  /**
   * Get available payment methods
   */
  getAvailablePaymentMethods(): {
    id: XenditPaymentMethod;
    name: string;
    channels?: Array<{
      id: XenditPaymentChannel;
      name: string;
    }>;
  }[] {
    return [
      {
        id: 'credit_card',
        name: 'Credit/Debit Card',
      },
      {
        id: 'virtual_account',
        name: 'Virtual Account',
        channels: [
          { id: 'BCA', name: 'BCA' },
          { id: 'BNI', name: 'BNI' },
          { id: 'BRI', name: 'BRI' },
          { id: 'MANDIRI', name: 'Mandiri' },
          { id: 'PERMATA', name: 'Permata' },
        ],
      },
      {
        id: 'e_wallet',
        name: 'E-Wallet',
        channels: [
          { id: 'OVO', name: 'OVO' },
          { id: 'DANA', name: 'DANA' },
          { id: 'LINKAJA', name: 'LinkAja' },
          { id: 'SHOPEEPAY', name: 'ShopeePay' },
          { id: 'GOPAY', name: 'GoPay' },
        ],
      },
      {
        id: 'retail_outlet',
        name: 'Retail Outlet',
        channels: [
          { id: 'ALFAMART', name: 'Alfamart' },
          { id: 'INDOMARET', name: 'Indomaret' },
        ],
      },
      {
        id: 'qr_code',
        name: 'QR Code',
        channels: [
          { id: 'QRIS', name: 'QRIS' },
        ],
      },
    ];
  }
}

export const xenditService = new XenditService();