import React, { useState, useEffect } from 'react';
import { Trophy, Users, Clock, Wallet } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from './LoadingSpinner';

interface ChallengeStats {
  totalChallenges: number;
  activeChallenges: number;
  completedChallenges: number;
  totalVolume: number;
  avgAmount: number;
  popularGameTypes: { game_type: string; count: number }[];
  recentOutcomes: {
    id: string;
    title: string;
    winner_id: string;
    amount: number;
    completed_at: string;
    winner: { name: string };
  }[];
}

export const AdminChallengeStats: React.FC = () => {
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const { data: challengeStats, error } = await supabase.rpc('get_challenge_stats');
      
      if (error) throw error;
      setStats(challengeStats);
    } catch (error) {
      console.error('Error loading challenge stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(loadStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#242538] rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#CCFF00]/20 rounded-lg">
              <Trophy className="w-6 h-6 text-[#CCFF00]" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Challenges</p>
              <p className="text-2xl font-bold text-white">{stats.totalChallenges}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#242538] rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#CCFF00]/20 rounded-lg">
              <Users className="w-6 h-6 text-[#CCFF00]" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Active Challenges</p>
              <p className="text-2xl font-bold text-white">{stats.activeChallenges}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#242538] rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#CCFF00]/20 rounded-lg">
              <Clock className="w-6 h-6 text-[#CCFF00]" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Completed</p>
              <p className="text-2xl font-bold text-white">{stats.completedChallenges}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#242538] rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#CCFF00]/20 rounded-lg">
              <Wallet className="w-6 h-6 text-[#CCFF00]" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Volume</p>
              <p className="text-2xl font-bold text-white">₦{stats.totalVolume.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Game Types */}
      <div className="bg-[#242538] rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Popular Game Types</h2>
        <div className="space-y-4">
          {stats.popularGameTypes.map((game) => (
            <div key={game.game_type} className="flex items-center justify-between">
              <span className="text-white">{game.game_type}</span>
              <div className="flex items-center gap-2">
                <span className="text-white/60">{game.count} challenges</span>
                <div 
                  className="h-2 bg-[#CCFF00]/20 rounded-full w-32"
                  style={{
                    background: `linear-gradient(to right, #CCFF00 ${(game.count / stats.totalChallenges) * 100}%, rgba(204, 255, 0, 0.2) 0%)`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Outcomes */}
      <div className="bg-[#242538] rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Outcomes</h2>
        <div className="space-y-4">
          {stats.recentOutcomes.map((outcome) => (
            <div 
              key={outcome.id}
              className="flex items-center justify-between bg-[#1a1b2e] p-4 rounded-lg"
            >
              <div>
                <h3 className="text-white font-medium">{outcome.title}</h3>
                <p className="text-white/60 text-sm">
                  Winner: {outcome.winner.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[#CCFF00] font-medium">
                  ₦{outcome.amount.toLocaleString()}
                </p>
                <p className="text-white/60 text-sm">
                  {new Date(outcome.completed_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};