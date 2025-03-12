import React from 'react';
import { usePaystack } from '../hooks/usePaystack';
import { useToast } from '../contexts/ToastContext';
import { PaystackScript } from './PaystackScript';
import { useWallet } from '../contexts/WalletContext';

interface PaystackWidgetProps {
  amount: number;
  onSuccess?: () => void;
  onClose?: () => void;
  className?: string;
}

export const PaystackWidget: React.FC<PaystackWidgetProps> = ({ 
  amount, 
  onSuccess, 
  onClose,
  className = ''
}) => {
  const { initializePayment, loading, isScriptReady } = usePaystack();
  const { wallet } = useWallet();
  const toast = useToast();

  const handlePayment = async () => {
    if (!isScriptReady) {
      toast.showError('Payment system is still loading. Please try again.');
      return;
    }

    if (!wallet?.id) {
      toast.showError('Wallet not initialized. Please refresh the page.');
      return;
    }

    try {
      const success = await initializePayment(amount);
      if (success) {
        toast.showSuccess('Payment successful!');
        onSuccess?.();
      } else {
        onClose?.();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      console.error('Payment error:', error);
      toast.showError(errorMessage);
      onClose?.();
    }
  };

  return (
    <>
      <PaystackScript />
      <button
        onClick={handlePayment}
        disabled={loading || !isScriptReady}
        className={`px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? 'Processing...' : isScriptReady ? 'Pay with Paystack' : 'Loading...'}
      </button>
    </>
  );
};
