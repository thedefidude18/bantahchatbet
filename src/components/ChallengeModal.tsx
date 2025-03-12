import React, { useState } from 'react';
import { X, Trophy, Calendar, Clock, AlertCircle, Info } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import LoadingSpinner from './LoadingSpinner';

type GameType = 'FIFA' | 'NBA2K' | 'OTHER';
type Platform = 'PS5' | 'XBOX' | 'PC';

interface ChallengeModalProps {
  challengerId: string;
  challengedId: string;
  challengedName: string;
  challengedUsername: string;
  challengedAvatar: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({
  challengerId,
  challengedId,
  challengedName,
  challengedUsername,
  challengedAvatar,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [challengeData, setChallengeData] = useState({
    title: '',
    amount: 100,
    scheduledDate: '',
    scheduledTime: '',
    expirationHours: 24,
    rules: '',
    evidence: 'SCREENSHOT' as 'SCREENSHOT' | 'VIDEO' | 'BOTH',
    gameType: '' as GameType,
    platform: '' as Platform
  });
  
  const { wallet } = useWallet();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      if (!wallet || wallet.real_balance < challengeData.amount) {
        toast.showError('Insufficient balance');
        return;
      }
      
      // If there's a scheduled date/time, set it
      let status = 'pending';
      let scheduledAt = null;
      
      if (challengeData.scheduledDate && challengeData.scheduledTime) {
        scheduledAt = new Date(`${challengeData.scheduledDate}T${challengeData.scheduledTime}`).toISOString();
        status = 'pending'; // Scheduled challenges start as pending
      }
      
      // Calculate expiration time
      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + challengeData.expirationHours);

      const { error } = await supabase
        .from('challenges')
        .insert({
          challenger_id: challengerId,
          challenged_id: challengedId,
          amount: challengeData.amount,
          title: challengeData.title,
          game_type: challengeData.gameType,
          platform: challengeData.platform,
          scheduled_at: scheduledAt,
          expires_at: expirationTime.toISOString(),
          rules: challengeData.rules,
          required_evidence: challengeData.evidence,
          status: status
        });

      if (error) throw error;

      onSuccess?.();
      toast.showSuccess('Challenge created successfully!'); // Changed from toast.show to toast.showSuccess
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.showError('Failed to create challenge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-xl">
        <div className="p-2 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#CCFF00]" />
            <div className="flex items-center gap-2">
              <img
                src={challengedAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${challengedId}`}
                alt={challengedName}
                className="w-6 h-6 rounded-full"
              />
              <h2 className="text-base font-semibold">Challenge {challengedName}</h2>
            </div>
            <div className="relative">
              <button 
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setShowTooltip(!showTooltip)}
                aria-label="Challenge information"
              >
                <Info className="w-3 h-3 text-gray-500" />
              </button>
              {showTooltip && (
                <div className="absolute z-50 top-full left-0 mt-1 w-56 p-2 bg-white rounded-lg shadow-lg border text-xs">
                  <h4 className="font-semibold mb-1">How Challenges Work:</h4>
                  <ul className="space-y-0.5 list-disc pl-3 text-[11px]">
                    <li>Set amount, date, time, and rules</li>
                    <li>Opponent must accept before expiration</li>
                    <li>Both submit evidence of outcome</li>
                    <li>Winner receives challenge amount</li>
                    <li>No winner = amounts refunded</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {/* Title */}
            <div className="col-span-2">
              <input
                type="text"
                value={challengeData.title}
                onChange={e => setChallengeData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-1.5 border rounded-lg text-sm"
                placeholder="Challenge title"
                required
              />
            </div>

            {/* Amount */}
            <div className="col-span-2">
              <div className="relative">
                <input
                  type="number"
                  value={challengeData.amount}
                  onChange={e => setChallengeData(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                  className="w-full px-3 py-1.5 border rounded-lg text-sm"
                  min="100"
                  placeholder="Amount (₦)"
                  required
                />
                {wallet && (
                  <p className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                    {wallet.real_balance < challengeData.amount ? (
                      <span className="text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Insufficient
                      </span>
                    ) : (
                      <span className="text-green-600">₦{wallet.real_balance.toLocaleString()}</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Date and Time */}
            <div className="flex items-center gap-1 border rounded-lg px-2">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="date"
                value={challengeData.scheduledDate}
                onChange={e => setChallengeData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                className="w-full py-1.5 text-sm focus:outline-none"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="flex items-center gap-1 border rounded-lg px-2">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="time"
                value={challengeData.scheduledTime}
                onChange={e => setChallengeData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                className="w-full py-1.5 text-sm focus:outline-none"
                required
              />
            </div>

            {/* Game Type and Platform */}
            <select
              value={challengeData.gameType}
              onChange={e => setChallengeData(prev => ({ ...prev, gameType: e.target.value as GameType }))}
              className="px-3 py-1.5 border rounded-lg text-sm"
              required
            >
              <option value="">Select Game</option>
              <option value="FIFA">FIFA</option>
              <option value="NBA2K">NBA 2K</option>
              <option value="OTHER">Other</option>
            </select>

            <select
              value={challengeData.platform}
              onChange={e => setChallengeData(prev => ({ ...prev, platform: e.target.value as Platform }))}
              className="px-3 py-1.5 border rounded-lg text-sm"
              required
            >
              <option value="">Platform</option>
              <option value="PS5">PS5</option>
              <option value="XBOX">Xbox</option>
              <option value="PC">PC</option>
            </select>

            {/* Expiration */}
            <div className="col-span-2">
              <select
                value={challengeData.expirationHours}
                onChange={e => setChallengeData(prev => ({ ...prev, expirationHours: parseInt(e.target.value) }))}
                className="w-full px-3 py-1.5 border rounded-lg text-sm"
                required
              >
                <option value="1">Expires in 1 hour</option>
                <option value="3">Expires in 3 hours</option>
                <option value="6">Expires in 6 hours</option>
                <option value="12">Expires in 12 hours</option>
                <option value="24">Expires in 24 hours</option>
                <option value="48">Expires in 48 hours</option>
              </select>
            </div>

            {/* Rules */}
            <div className="col-span-2">
              <textarea
                value={challengeData.rules}
                onChange={e => setChallengeData(prev => ({ ...prev, rules: e.target.value }))}
                className="w-full px-3 py-1.5 border rounded-lg text-sm"
                rows={2}
                placeholder="Challenge rules (optional)"
              />
            </div>

            {/* Evidence Required */}
            <div className="col-span-2">
              <select
                value={challengeData.evidence}
                onChange={e => setChallengeData(prev => ({ ...prev, evidence: e.target.value as 'SCREENSHOT' | 'VIDEO' | 'BOTH' }))}
                className="w-full px-3 py-1.5 border rounded-lg text-sm"
                required
              >
                <option value="SCREENSHOT">Screenshot Required</option>
                <option value="VIDEO">Video Required</option>
                <option value="BOTH">Both Screenshot & Video</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="col-span-2 bg-[#CCFF00] text-black py-2 rounded-xl font-semibold disabled:opacity-50 hover:bg-[#CCFF00]/90 transition-colors text-sm"
            >
              {loading ? <LoadingSpinner /> : 'Send Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChallengeModal;
