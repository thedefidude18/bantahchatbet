import React, { useState } from 'react';
import { Trophy, Crown, Star, Sparkles, ArrowLeft } from 'lucide-react';
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500"></div>
      </div>
    );
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-200 to-yellow-100 text-yellow-700";
      case 2:
        return "bg-gradient-to-r from-blue-200 to-blue-100 text-blue-700";
      case 3:
        return "bg-gradient-to-r from-orange-200 to-orange-100 text-orange-700";
      default:
        return "bg-purple-100 text-purple-700";
    }
  };

  const getAchievementCount = (eventsWon: number) => {
    if (eventsWon >= 20) return 3;
    if (eventsWon >= 10) return 2;
    if (eventsWon >= 5) return 1;
    return 0;
  };

  return (
    <div className="min-h-screen bg-[#1a1b2e]">
      <PageHeader title="Leaderboard" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="divide-y divide-gray-100">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`px-6 py-4 flex items-center hover:bg-gray-50 transition-all duration-200 cursor-pointer
                    ${user.rank <= 3 ? 'hover:shadow-md' : ''}`}
                >
                  {/* Avatar with Rank Badge */}
                  <div className="relative">
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className={`w-12 h-12 rounded-full border-2 
                        ${user.rank === 1 ? 'border-yellow-400' : 
                          user.rank === 2 ? 'border-blue-400' : 
                          user.rank === 3 ? 'border-orange-400' : 'border-gray-200'}`}
                    />
                    {/* Rank Badge */}
                    <div className={`absolute -bottom-2 -left-2 w-6 h-6 flex items-center justify-center rounded-full font-bold text-sm shadow-md ${getRankStyle(user.rank)}`}>
                      {user.rank}
                    </div>
                    {/* Crown for #1 */}
                    {user.rank === 1 && (
                      <div className="absolute -top-2 -right-2">
                        <Crown className="w-5 h-5 text-yellow-500 animate-bounce" />
                      </div>
                    )}
                  </div>

                  {/* Name and Achievements */}
                  <div className="ml-4 flex-1">
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-gray-500 text-sm">@{user.username}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(getAchievementCount(user.events_won))].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-purple-400 fill-purple-400" />
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Groups</p>
                      <p className="font-bold text-gray-900">{user.groups_joined}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Wins</p>
                      <p className="font-bold text-gray-900">{user.events_won}</p>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="text-sm text-gray-500">Earnings</p>
                      <p className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        ₦{user.total_winnings.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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