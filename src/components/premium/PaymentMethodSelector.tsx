import React, { useState } from 'react';
import { 
  CreditCard, 
  Building, 
  Smartphone, 
  Store, 
  QrCode, 
  ChevronDown, 
  ChevronUp, 
  Check 
} from 'lucide-react';
import { XenditPaymentMethod, XenditPaymentChannel } from '../../types/xendit';
import { xenditService } from '../../services/xenditService';

interface PaymentMethodSelectorProps {
  selectedMethod: XenditPaymentMethod | null;
  selectedChannel: XenditPaymentChannel | null;
  onSelectMethod: (method: XenditPaymentMethod, channel?: XenditPaymentChannel) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  selectedChannel,
  onSelectMethod
}) => {
  const [expandedMethod, setExpandedMethod] = useState<XenditPaymentMethod | null>(null);
  
  const paymentMethods = xenditService.getAvailablePaymentMethods();
  
  const getMethodIcon = (methodId: XenditPaymentMethod) => {
    switch (methodId) {
      case 'credit_card':
        return <CreditCard size={24} />;
      case 'virtual_account':
        return <Building size={24} />;
      case 'e_wallet':
        return <Smartphone size={24} />;
      case 'retail_outlet':
        return <Store size={24} />;
      case 'qr_code':
        return <QrCode size={24} />;
      default:
        return <CreditCard size={24} />;
    }
  };
  
  const handleMethodClick = (methodId: XenditPaymentMethod) => {
    const method = paymentMethods.find(m => m.id === methodId);
    
    // If method has no channels, select it directly
    if (!method?.channels || method.channels.length === 0) {
      onSelectMethod(methodId);
      setExpandedMethod(null);
      return;
    }
    
    // Toggle expanded state
    if (expandedMethod === methodId) {
      setExpandedMethod(null);
    } else {
      setExpandedMethod(methodId);
    }
  };
  
  const handleChannelClick = (methodId: XenditPaymentMethod, channelId: XenditPaymentChannel) => {
    onSelectMethod(methodId, channelId);
    setExpandedMethod(null);
  };
  
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg mb-2">Select Payment Method</h3>
      
      <div className="space-y-2">
        {paymentMethods.map((method) => (
          <div key={method.id} className="border rounded-lg overflow-hidden">
            <div 
              className={`flex items-center justify-between p-4 cursor-pointer ${
                selectedMethod === method.id && !expandedMethod ? 'bg-yellow-50 border-yellow-300' : 'bg-white'
              }`}
              onClick={() => handleMethodClick(method.id)}
            >
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  selectedMethod === method.id ? 'bg-yellow-100 text-yellow-600' : 'bg-neutral-100 text-neutral-600'
                }`}>
                  {getMethodIcon(method.id)}
                </div>
                <div>
                  <div className="font-medium">{method.name}</div>
                  {selectedMethod === method.id && selectedChannel && method.channels && (
                    <div className="text-sm text-neutral-500">
                      {method.channels.find(c => c.id === selectedChannel)?.name || selectedChannel}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                {selectedMethod === method.id && !expandedMethod && !selectedChannel && (
                  <Check size={20} className="text-yellow-600 mr-2" />
                )}
                {method.channels && method.channels.length > 0 && (
                  expandedMethod === method.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />
                )}
              </div>
            </div>
            
            {/* Channels dropdown */}
            {expandedMethod === method.id && method.channels && (
              <div className="border-t border-neutral-200 bg-neutral-50 p-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {method.channels.map((channel) => (
                    <div
                      key={channel.id}
                      className={`flex items-center p-3 rounded-lg cursor-pointer ${
                        selectedMethod === method.id && selectedChannel === channel.id
                          ? 'bg-yellow-100 border border-yellow-300'
                          : 'bg-white border border-neutral-200 hover:border-yellow-300'
                      }`}
                      onClick={() => handleChannelClick(method.id, channel.id)}
                    >
                      <div className="flex-1">{channel.name}</div>
                      {selectedMethod === method.id && selectedChannel === channel.id && (
                        <Check size={16} className="text-yellow-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;