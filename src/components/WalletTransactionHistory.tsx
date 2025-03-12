import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ArrowDownRight, ArrowUpRight, Lock, Trophy, X, RotateCcw, CircleDot } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { formatNaira } from '../utils/currency';
import LoadingSpinner from './LoadingSpinner';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
  reference: string;
  metadata?: any;
  wallet?: {
    real_balance: number;
    bonus_balance: number;
  };
}

interface TransactionDetailsModalProps {
  transaction: Transaction;
  onClose: () => void;
}

interface TransactionItemProps {
  transaction: Transaction;
}

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'deposit':
      return <ArrowDownRight className="w-5 h-5 text-green-500" />;
    case 'withdrawal':
      return <ArrowUpRight className="w-5 h-5 text-red-500" />;
    case 'bet_lock':
      return <Lock className="w-5 h-5 text-orange-500" />;
    case 'bet_win':
      return <Trophy className="w-5 h-5 text-green-500" />;
    case 'bet_loss':
      return <X className="w-5 h-5 text-red-500" />;
    case 'bet_refund':
      return <RotateCcw className="w-5 h-5 text-blue-500" />;
    default:
      return <CircleDot className="w-5 h-5 text-gray-500" />;
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'success':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => setShowDetails(true)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getTransactionIcon(transaction.type)}
          <div>
            <div className="font-medium">
              {transaction.type.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </div>
            <div className="text-sm text-gray-500">
              {format(new Date(transaction.created_at), 'MMM d, yyyy HH:mm')}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-medium ${
            ['withdrawal', 'bet_loss'].includes(transaction.type) ? 'text-red-600' : 'text-green-600'
          }`}>
            {['withdrawal', 'bet_loss'].includes(transaction.type) ? '-' : '+'}
            {formatNaira(transaction.amount)}
          </div>
          <div className={`text-xs px-2 py-1 rounded-full inline-block ${
            getStatusBadgeColor(transaction.status)
          }`}>
            {formatStatus(transaction.status)}
          </div>
        </div>
      </div>

      {showDetails && (
        <TransactionDetailsModal
          transaction={transaction}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

const WalletTransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'bets' | 'deposits'>('all');
  const { currentUser } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchTransactions();

    // Subscribe to real-time updates for both transactions and wallet_transactions
    const subscription = supabase
      .channel('wallet_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${currentUser?.id}`
        },
        (payload) => {
          console.log('Transaction updated:', payload);
          fetchTransactions();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `user_id=eq.${currentUser?.id}`
        },
        (payload) => {
          console.log('Wallet transaction updated:', payload);
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser?.id, filter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('transactions')
        .select(`
          *,
          wallet:wallets!transactions_wallet_id_fkey (
            real_balance,
            bonus_balance
          )
        `)
        .eq('user_id', currentUser?.id)
        .order('created_at', { ascending: false });

      if (filter === 'bets') {
        query = query.in('type', ['bet_lock', 'bet_win', 'bet_loss', 'bet_refund']);
      } else if (filter === 'deposits') {
        query = query.in('type', ['deposit', 'withdrawal']);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast.showError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // Remove or comment out the renderDebugInfo function
  /*
  const renderDebugInfo = (transaction: Transaction) => {
    if (process.env.NODE_ENV !== 'development') return null;

    return (
      <div className="text-xs text-gray-400 mt-1">
        <div>ID: {transaction.id}</div>
        <div>Created: {new Date(transaction.created_at).toISOString()}</div>
        <div>Status: {transaction.status}</div>
        <pre>{JSON.stringify(transaction.metadata, null, 2)}</pre>
      </div>
    );
  };
  */

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Transaction History</h2>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'all' ? 'bg-[#7440FF] text-white' : 'bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('bets')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'Events' ? 'bg-[#7440FF] text-white' : 'bg-gray-100'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setFilter('deposits')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'deposits' ? 'bg-[#7440FF] text-white' : 'bg-gray-100'
            }`}
          >
            Deposits
          </button>
        </div>
      </div>

      <div className="divide-y">
        {loading ? (
          <div className="p-8 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No transactions found
          </div>
        ) : (
          transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        )}
      </div>
    </div>
  );
};

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ transaction, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full">
        <h3 className="text-lg font-semibold mb-4">Transaction Details</h3>
        
        <div className="space-y-2">
          <div>
            <span className="font-medium">Status:</span> 
            <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
              getStatusBadgeColor(transaction.status)
            }`}>
              {formatStatus(transaction.status)}
            </span>
          </div>
          
          <div>
            <span className="font-medium">Reference:</span> 
            <span className="ml-2">{transaction.reference}</span>
          </div>
          
          <div>
            <span className="font-medium">Amount:</span> 
            <span className="ml-2">{formatNaira(transaction.amount)}</span>
          </div>
          
          <div>
            <span className="font-medium">Date:</span> 
            <span className="ml-2">
              {format(new Date(transaction.created_at), 'PPpp')}
            </span>
          </div>

          {transaction.metadata && (
            <div>
              <span className="font-medium">Payment Details:</span>
              <pre className="mt-2 bg-gray-50 p-2 rounded text-sm">
                {JSON.stringify(transaction.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-black text-white py-2 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default WalletTransactionHistory;
