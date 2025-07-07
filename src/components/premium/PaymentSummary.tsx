import React from 'react';
import { CreditCard, Calendar, Shield } from 'lucide-react';
import { PremiumPlan } from '../../types/premium';
import { XenditPaymentMethod, XenditPaymentChannel } from '../../types/xendit';

interface PaymentSummaryProps {
  plan: PremiumPlan;
  selectedMethod: XenditPaymentMethod | null;
  selectedChannel: XenditPaymentChannel | null;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  plan,
  selectedMethod,
  selectedChannel
}) => {
  const getMethodName = (method: XenditPaymentMethod | null): string => {
    switch (method) {
      case 'credit_card':
        return 'Credit/Debit Card';
      case 'virtual_account':
        return 'Virtual Account';
      case 'e_wallet':
        return 'E-Wallet';
      case 'retail_outlet':
        return 'Retail Outlet';
      case 'qr_code':
        return 'QR Code';
      default:
        return 'Not selected';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">Payment Summary</h3>
      
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Calendar size={20} className="text-yellow-600 mr-3" />
            <div>
              <div className="font-medium">{plan.name}</div>
              <div className="text-sm text-neutral-500">{plan.duration} days</div>
            </div>
          </div>
          <div className="text-lg font-bold">${plan.price}</div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CreditCard size={20} className="text-neutral-500 mr-3" />
            <div>
              <div className="font-medium">Payment Method</div>
              <div className="text-sm text-neutral-500">
                {selectedMethod ? getMethodName(selectedMethod) : 'Not selected'}
                {selectedChannel && ` - ${selectedChannel}`}
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-neutral-200">
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Total</span>
            <span className="text-yellow-600">${plan.price}</span>
          </div>
        </div>
        
        <div className="pt-4 flex items-center text-sm text-neutral-500">
          <Shield size={16} className="mr-2" />
          <span>Secure payment processed by Xendit</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;