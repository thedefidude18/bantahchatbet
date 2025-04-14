import React, { useState } from 'react';
import { Trophy, Crown, Star, Users, Wallet } from 'lucide-react';
import MobileFooterNav from '../components/MobileFooterNav';
import ProfileCard from '../components/ProfileCard';
import { useLeaderboard } from '../hooks/useLeaderboard';
import PageHeader from '../components/PageHeader';

const Leaderboard: React.FC = () => {
  const { users, loading } = useLeaderboard();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'weekly' | 'monthly'>('all');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1b2e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#CCFF00]"></div>
      </div>
    );
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-[#CCFF00] text-black";
      case 2:
        return "bg-[#7C3AED] text-white";
      case 3:
        return "bg-[#242538] text-white";
      default:
        return "bg-white/10 text-white/60";
    }
  };

  const getAchievementCount = (eventsWon: number) => {
    if (eventsWon >= 20) return 3;
    if (eventsWon >= 10) return 2;
    if (eventsWon >= 5) return 1;
    return 0;
  };

  return (
    <div className="min-h-screen bg-[#1a1b2e] pb-20">
      <PageHeader title="Leaderboard" />
      
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Time Filter Tabs */}
        <div className="flex gap-2 mb-6 bg-[#242538] rounded-xl p-1">
          {['all', 'weekly', 'monthly'].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter as any)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === filter 
                  ? 'bg-primary text-white' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Leaderboard List */}
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUserId(user.id)}
              className="bg-[#242538] rounded-xl p-4 cursor-pointer hover:bg-[#2a2b40] transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Avatar and Rank */}
                <div className="relative">
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-12 h-12 rounded-full border-2 border-[#1a1b2e]"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${getRankStyle(user.rank)}`}>
                    {user.rank}
                  </div>
                  {user.rank === 1 && (
                    <div className="absolute -top-1 -right-1">
                      <Crown className="w-4 h-4 text-[#CCFF00]" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{user.name}</h3>
                    <span className="text-sm text-white/60">@{user.username}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-sm text-white/60">
                      <Trophy className="w-3.5 h-3.5 text-[#CCFF00]" />
                      {user.events_won}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-white/60">
                      <Users className="w-3.5 h-3.5 text-[#CCFF00]" />
                      {user.groups_joined}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-white/60">
                      <Wallet className="w-3.5 h-3.5 text-[#CCFF00]" />
                      ₦{user.total_winnings.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Achievement Stars */}
                <div className="flex items-center gap-0.5">
                  {[...Array(getAchievementCount(user.events_won))].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#CCFF00] fill-[#CCFF00]" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedUserId && (
        <ProfileCard
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}

      <MobileFooterNav />
    </div>
  );
};

export default Leaderboard;