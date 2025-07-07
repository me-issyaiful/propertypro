/**
 * Xendit API configuration
 */
export interface XenditConfig {
  /** API key for Xendit */
  apiKey: string;
  /** Whether to use production environment */
  isProduction: boolean;
}

/**
 * Xendit payment methods
 */
export type XenditPaymentMethod = 
  | 'credit_card' 
  | 'virtual_account' 
  | 'e_wallet' 
  | 'retail_outlet' 
  | 'qr_code' 
  | 'direct_debit';

/**
 * Xendit payment channel
 */
export type XenditPaymentChannel = 
  | 'BCA' 
  | 'BNI' 
  | 'BRI' 
  | 'MANDIRI' 
  | 'PERMATA' 
  | 'ALFAMART' 
  | 'INDOMARET' 
  | 'OVO' 
  | 'DANA' 
  | 'LINKAJA' 
  | 'SHOPEEPAY' 
  | 'GOPAY' 
  | 'QRIS';

/**
 * Xendit payment request
 */
export interface XenditPaymentRequest {
  /** External ID (order ID) */
  externalID: string;
  /** Payment amount */
  amount: number;
  /** Payment description */
  description: string;
  /** Invoice duration in seconds (optional) */
  invoiceDuration?: number;
  /** Customer details */
  customer?: {
    /** Customer given names */
    givenNames: string;
    /** Customer surname */
    surname: string;
    /** Customer email */
    email: string;
    /** Customer mobile number */
    mobileNumber?: string;
    /** Customer addresses */
    addresses?: Array<{
      /** Country */
      country: string;
      /** Street line 1 */
      streetLine1: string;
      /** Street line 2 (optional) */
      streetLine2?: string;
      /** City */
      city: string;
      /** Province/state */
      province?: string;
      /** Postal code */
      postalCode?: string;
    }>;
  };
  /** Customer notification preferences */
  customerNotificationPreference?: {
    /** Invoice created notification */
    invoiceCreated?: Array<'email' | 'sms' | 'whatsapp'>;
    /** Invoice reminder notification */
    invoiceReminder?: Array<'email' | 'sms' | 'whatsapp'>;
    /** Invoice paid notification */
    invoicePaid?: Array<'email' | 'sms' | 'whatsapp'>;
    /** Invoice expired notification */
    invoiceExpired?: Array<'email' | 'sms' | 'whatsapp'>;
  };
  /** Success redirect URL */
  successRedirectURL?: string;
  /** Failure redirect URL */
  failureRedirectURL?: string;
  /** Payment methods */
  paymentMethods?: XenditPaymentMethod[];
  /** Fixed payment method and channel */
  fixedPaymentMethod?: {
    /** Payment method */
    type: XenditPaymentMethod;
    /** Payment channel */
    channel?: XenditPaymentChannel;
  };
  /** Fees */
  fees?: Array<{
    /** Fee type */
    type: 'ADMIN' | 'PLATFORM';
    /** Fee value */
    value: number;
  }>;
  /** Whether to send email to customer */
  shouldSendEmail?: boolean;
  /** Invoice items */
  items?: Array<{
    /** Item name */
    name: string;
    /** Item quantity */
    quantity: number;
    /** Item price */
    price: number;
    /** Item category (optional) */
    category?: string;
    /** Item URL (optional) */
    url?: string;
  }>;
}

/**
 * Xendit payment response
 */
export interface XenditPaymentResponse {
  /** Invoice ID */
  id: string;
  /** External ID (order ID) */
  external_id: string;
  /** User ID */
  user_id: string;
  /** Payment status */
  status: 'PENDING' | 'PAID' | 'SETTLED' | 'EXPIRED' | 'FAILED';
  /** Merchant name */
  merchant_name: string;
  /** Merchant profile picture URL */
  merchant_profile_picture_url: string;
  /** Payment amount */
  amount: number;
  /** Payment description */
  description: string;
  /** Invoice URL */
  invoice_url: string;
  /** Available payment methods */
  available_payment_methods: XenditPaymentMethod[];
  /** Should exclude credit card */
  should_exclude_credit_card: boolean;
  /** Should send email */
  should_send_email: boolean;
  /** Created timestamp */
  created: string;
  /** Updated timestamp */
  updated: string;
  /** Mid label */
  mid_label: string;
  /** Currency */
  currency: string;
  /** Success redirect URL */
  success_redirect_url: string;
  /** Failure redirect URL */
  failure_redirect_url: string;
  /** Credit card charge */
  credit_card_charge_id?: string;
  /** Payment method */
  payment_method?: XenditPaymentMethod;
  /** Payment channel */
  payment_channel?: XenditPaymentChannel;
  /** Payment destination */
  payment_destination?: string;
  /** Paid amount */
  paid_amount?: number;
  /** Paid at timestamp */
  paid_at?: string;
  /** Payer email */
  payer_email?: string;
  /** Bank code */
  bank_code?: string;
  /** Retail outlet name */
  retail_outlet_name?: string;
  /** E-wallet type */
  ewallet_type?: string;
}

/**
 * Xendit payment notification
 */
export interface XenditPaymentNotification {
  /** Invoice ID */
  id: string;
  /** External ID (order ID) */
  external_id: string;
  /** User ID */
  user_id: string;
  /** Payment status */
  status: 'PENDING' | 'PAID' | 'SETTLED' | 'EXPIRED' | 'FAILED';
  /** Payment amount */
  amount: number;
  /** Paid amount */
  paid_amount: number;
  /** Bank code */
  bank_code?: string;
  /** Retail outlet name */
  retail_outlet_name?: string;
  /** E-wallet type */
  ewallet_type?: string;
  /** Payment method */
  payment_method: XenditPaymentMethod;
  /** Payment channel */
  payment_channel: XenditPaymentChannel;
  /** Payment timestamp */
  payment_timestamp: string;
  /** Created timestamp */
  created: string;
  /** Updated timestamp */
  updated: string;
  /** Currency */
  currency: string;
}

/**
 * Xendit refund request
 */
export interface XenditRefundRequest {
  /** Amount to refund */
  amount: number;
  /** External refund ID */
  externalRefundID: string;
  /** Payment ID to refund */
  paymentID: string;
}

/**
 * Xendit refund response
 */
export interface XenditRefundResponse {
  /** Refund ID */
  id: string;
  /** Payment ID */
  payment_id: string;
  /** User ID */
  user_id: string;
  /** External refund ID */
  external_refund_id: string;
  /** Amount */
  amount: number;
  /** Channel code */
  channel_code: string;
  /** Status */
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  /** Refund fee amount */
  refund_fee_amount: number;
  /** Created timestamp */
  created: string;
  /** Updated timestamp */
  updated: string;
  /** Metadata */
  metadata?: Record<string, any>;
}