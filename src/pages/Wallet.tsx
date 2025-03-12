import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import WalletCard from '../components/WalletCard';
import WalletTransactionHistory from '../components/WalletTransactionHistory';
import MobileFooterNav from '../components/MobileFooterNav';
import { useToast } from '../contexts/ToastContext';
import { useWallet } from '../contexts/WalletContext';

const Wallet: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { refreshWallet } = useWallet();

  useEffect(() => {
    const status = searchParams.get('status');
    const reference = searchParams.get('reference');
    
    if (status === 'success') {
      // Refresh wallet data to show new balance
      refreshWallet();
      
      toast.showSuccess('Payment successful! Your wallet has been credited.');
      // Log the reference for debugging
      console.log('Payment Reference:', reference);
      
      // Clean up the URL
      navigate('/wallet', { replace: true });
    }
  }, [searchParams, toast, navigate, refreshWallet]);

  return (
    <div className="min-h-screen bg-[#EDEDED]">
      {/* Header */}
      <div className="bg-white text-black flex items-center p-4 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold ml-2">Wallet</h1>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        <WalletCard />
        <WalletTransactionHistory />
      </div>

      <MobileFooterNav />
    </div>
  );
};

export default Wallet;
