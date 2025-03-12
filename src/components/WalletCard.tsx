import React, { useState } from 'react';
import { Wallet as WalletIcon, ArrowDownRight, ArrowUpRight, Send, X } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { usePaystack } from '../hooks/usePaystack';
import LoadingSpinner from './LoadingSpinner';
import { PaystackWidget } from './PaystackWidget';
import { TransferForm } from './TransferForm';
import { formatNaira, formatUSD, convertNGNtoUSD } from '../utils/currency';
import { PaystackWithdrawalWidget } from './PaystackWithdrawalWidget';

const WalletCard: React.FC = () => {
  const { wallet, loading } = useWallet();
  const { initializeTransfer, loading: withdrawalLoading } = usePaystack();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal' | 'transfer'>('deposit');
  const [amount, setAmount] = useState('');
  const [balanceType, setBalanceType] = useState<'real' | 'bonus'>('real');
  const toast = useToast();

  const balance = wallet?.real_balance || 0;
  const bonusBalance = wallet?.bonus_balance || 0;
  const usdEquivalent = convertNGNtoUSD(balance);

  const getAvailableBalance = () => balanceType === 'real' ? balance : bonusBalance;

  const handleWithdrawal = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) < 100) {
      toast.showError('Please enter a valid amount (minimum ₦100)');
      return;
    }

    const availableBalance = getAvailableBalance();
    if (Number(amount) > availableBalance) {
      toast.showError(`Insufficient ${balanceType} balance`);
      return;
    }

    try {
      const result = await initializeTransfer({
        amount: Number(amount),
        bankName: 'Bank Transfer',
        accountNumber: 'Pending',
        accountName: 'Pending',
        balanceType: balanceType
      });

      if (result.success) {
        setShowPaymentModal(false);
        setAmount('');
        toast.showSuccess('Withdrawal initiated successfully');
      }
    } catch (error: any) {
      toast.showError(error.message || 'Withdrawal failed');
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-black to-gray-900 rounded-xl p-4 flex justify-center items-center h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  const ActionButton = ({ icon: Icon, label, color, onClick }: any) => (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-2 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 group"
    >
      <div className={`p-1.5 ${color} rounded-lg transition-transform group-hover:scale-110`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-medium text-white">{label}</span>
    </button>
  );

  return (
    <div className="space-y-3">
      <div className="bg-[#7440FF] rounded-xl p-5">
        {/* Balance Section */}
        <div className="flex items-center gap-4 mb-5">
          <div className="p-2.5 bg-white/10 rounded-xl">
            <WalletIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{formatNaira(balance)}</h2>
              <span className="text-sm text-white/100">{formatUSD(usdEquivalent)} USD</span>
            </div>
            <div className="flex gap-3 mt-1 text-sm text-white/60">
              <span>Real: {formatNaira(balance)}</span>
              <span>•</span>
              <span>Bonus: {formatNaira(bonusBalance)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <ActionButton
            icon={ArrowDownRight}
            label="Deposit"
            color="bg-green-500/10 text-green-500"
            onClick={() => {
              setTransactionType('deposit');
              setAmount('');
              setShowPaymentModal(true);
            }}
          />
          <ActionButton
            icon={ArrowUpRight}
            label="Withdraw"
            color="bg-red-500/10 text-red-500"
            onClick={() => {
              setTransactionType('withdrawal');
              setAmount('');
              setShowPaymentModal(true);
            }}
          />
          <ActionButton
            icon={Send}
            label="Transfer"
            color="bg-blue-500/10 text-blue-500"
            onClick={() => {
              setTransactionType('transfer');
              setAmount('');
              setShowTransferModal(true);
            }}
          />
        </div>
      </div>

      {/* Payment/Withdrawal Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 w-full max-w-sm relative">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute right-4 top-4 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>

            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {transactionType === 'deposit' ? 'Add Funds' : 'Withdraw Funds'}
                </h3>
                <p className="text-sm text-white/60">Enter amount below</p>
              </div>

              {transactionType === 'withdrawal' && (
                <div className="grid grid-cols-2 gap-2">
                  {['real', 'bonus'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setBalanceType(type as 'real' | 'bonus')}
                      className={`p-3 rounded-lg text-left transition-all ${
                        balanceType === type
                          ? 'bg-white/10 border border-white/20'
                          : 'bg-white/5'
                      } ${type === 'bonus' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={type === 'bonus'}
                    >
                      <div className="text-sm text-white/60">{type} Balance</div>
                      <div className="text-white font-medium">
                        {formatNaira(type === 'real' ? balance : bonusBalance)}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">₦</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white px-8 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/20"
                  placeholder="0.00"
                  min="100"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[1000, 2000, 5000, 10000, 20000, 50000].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    className="px-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-sm transition-colors"
                  >
                    ₦{quickAmount.toLocaleString()}
                  </button>
                ))}
              </div>

              <div>
                {transactionType === 'deposit' ? (
                  <PaystackWidget
                    amount={Number(amount)}
                    onSuccess={() => {
                      setShowPaymentModal(false);
                      setAmount('');
                    }}
                    onClose={() => setShowPaymentModal(false)}
                  />
                ) : (
                  <PaystackWithdrawalWidget
                    amount={Number(amount)}
                    balanceType={balanceType}
                    onSuccess={() => {
                      setShowPaymentModal(false);
                      setAmount('');
                    }}
                    onClose={() => setShowPaymentModal(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <TransferForm
          amount={Number(amount)}
          onClose={() => setShowTransferModal(false)}
          onSuccess={() => {
            setShowTransferModal(false);
            setAmount('');
          }}
        />
      )}
    </div>
  );
};

export default WalletCard;

