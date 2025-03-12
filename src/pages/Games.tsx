import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Gamepad2, 
  Trophy, 
  Plus, 
  Map, 
  Zap, 
  Phone,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// Local components
import MobileFooterNav from '../components/MobileFooterNav';
import Header from '../components/Header';
import { ChallengeList } from '../components/ChallengeList';
import ChallengeModal from '../components/ChallengeModal';
import { ContactsList } from '../components/ContactsList';
import ActiveContentModal from '../components/modals/ActiveContentModal';

// Hooks and contexts
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { sendChallengeNotification } from '../utils/challengeNotifications';

// Types
interface User {
  id: string;
  name: string;
  username: string;
  avatar_url: string;
  bio: string;
  status?: 'online' | 'offline';
  last_seen?: string;
  stats: {
    challenges_created: number;
    challenges_won: number;
    total_earnings: number;
  };
}

interface Challenge {
  id: string;
  challenger: {
    id: string;
    name: string;
    avatar_url: string;
  };
  challenged: {
    id: string;
    name: string;
    avatar_url: string;
  };
  amount: number;
  game_type: string;
  platform: string;
  title: string;
  rules?: string;
  required_evidence?: 'SCREENSHOT' | 'VIDEO' | 'BOTH';
  created_at: string;
  scheduled_at: string | null;
  expires_at: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'expired';
  winner_id?: string;
}

const Games: React.FC = () => {
  // Change the default tab from 'users' to 'active'
  const [activeTab, setActiveTab] = useState<'users' | 'active' | 'scheduled' | 'ended'>('active');
  const [users, setUsers] = useState<User[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showActiveModal, setShowActiveModal] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'N/A';
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchChallenges();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, username, avatar_url')
        .limit(50);

      if (usersError) throw usersError;

      if (!usersData) {
        setUsers([]);
        return;
      }

      const filteredUsers = usersData
        .filter(user => user.id !== currentUser?.id)
        .map(user => ({
          id: user.id,
          name: user.name || 'Anonymous',
          username: user.username || `user_${user.id.slice(0, 8)}`,
          avatar_url: user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
          bio: '',
          status: 'offline' as const,
          stats: {
            challenges_created: 0,
            challenges_won: 0,
            total_earnings: 0
          }
        }));

      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('challenges')
        .select(`
          id,
          amount,
          game_type,
          platform,
          title,
          rules,
          required_evidence,
          created_at,
          scheduled_at,
          expires_at,
          status,
          winner_id,
          challenger:challenger_id(id, name, avatar_url),
          challenged:challenged_id(id, name, avatar_url)
        `);

      switch (activeTab) {
        case 'active':
          query = query.eq('status', 'accepted');
          break;
        case 'scheduled':
          query = query
            .eq('status', 'pending')
            .not('scheduled_at', 'is', null);
          break;
        case 'ended':
          query = query.in('status', ['completed', 'expired', 'declined']);
          break;
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChallenge = (user: User) => {
    setSelectedUser(user);
    setShowChallengeModal(true);
  };

  const handleCreateChallenge = async (challengeData: any) => {
    try {
      const { data: challenge, error } = await supabase
        .from('challenges')
        .insert([challengeData])
        .select()
        .single();

      if (error) throw error;

      // Send notification to challenged user
      await sendChallengeNotification('challenge_received', {
        userId: challengeData.challenged_id,
        challengeId: challenge.id,
        challengeTitle: challengeData.title,
        amount: challengeData.amount,
        opponentName: currentUser?.name || '',
        opponentUsername: currentUser?.username || ''
      });

      // Refresh challenges list
      fetchChallenges();
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.showError('Failed to create challenge');
    }
  };

  const handleChallengeResponse = async (challengeId: string, accept: boolean) => {
    try {
      const { data: challenge, error } = await supabase
        .from('challenges')
        .update({ status: accept ? 'accepted' : 'declined' })
        .eq('id', challengeId)
        .select()
        .single();

      if (error) throw error;

      // Send notification to challenger
      await sendChallengeNotification(
        accept ? 'challenge_accepted' : 'challenge_declined',
        {
          userId: challenge.challenger_id,
          challengeId: challenge.id,
          challengeTitle: challenge.title,
          amount: challenge.amount,
          opponentName: currentUser?.name || '',
          opponentUsername: currentUser?.username || ''
        }
      );

      fetchChallenges();
    } catch (error) {
      console.error('Error responding to challenge:', error);
      toast.showError('Failed to respond to challenge');
    }
  };

  const renderUsersList = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-[#242538] rounded-xl p-3 hover:bg-[#2a2b42] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#242538]
                    ${user.status === 'online' ? 'bg-[#CCFF00]' : 'bg-gray-400'}`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-white truncate">{user.name}</h3>
                  <span className="text-sm text-white/60">@{user.username}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-white/60">
                    <Trophy className="w-3.5 h-3.5 text-[#CCFF00]" />
                    {user.stats.challenges_won}
                  </span>
                  <span className="flex items-center gap-1 text-white/60">
                    <Zap className="w-3.5 h-3.5 text-[#CCFF00]" />
                    {user.stats.challenges_created}
                  </span>
                  <span className="flex items-center gap-1 text-white/60">
                    <DollarSign className="w-3.5 h-3.5 text-[#CCFF00]" />
                    ₦{user.stats.total_earnings.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleChallenge(user)}
                className="flex-shrink-0 bg-[#CCFF00] text-black px-4 py-1.5 rounded-full text-sm font-medium hover:bg-opacity-90 transition-colors"
              >
                Challenge
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="border-t border-white/10 pt-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Invite Friends
          </h3>
          <ContactsList />
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-8">
      <Gamepad2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
      <p className="text-white/60">No {activeTab} challenges found</p>
    </div>
  );

  const renderChallengesList = () => (
    <div className="space-y-3">
      {challenges.map((challenge) => (
        <div
          key={challenge.id}
          onClick={() => navigate(`/challenges/${challenge.id}`)}
          className="bg-[#242538] rounded-xl p-4 hover:bg-[#2a2b42] transition-colors cursor-pointer"
        >
          {/* Title and Amount */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-medium">{challenge.title || 'Untitled Challenge'}</h3>
            <span className="text-[#CCFF00] font-medium">
              ₦{challenge.amount.toLocaleString()}
            </span>
          </div>

          {/* Players */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <img
                src={challenge.challenger.avatar_url}
                alt={challenge.challenger.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-white">{challenge.challenger.name}</span>
            </div>

            <span className="text-white/60">vs</span>

            <div className="flex items-center gap-2">
              <span className="text-white">{challenge.challenged.name}</span>
              <img
                src={challenge.challenged.avatar_url}
                alt={challenge.challenged.name}
                className="w-8 h-8 rounded-full"
              />
            </div>
          </div>

          {/* Game Details */}
          <div className="flex items-center justify-between text-sm">
            <div className="space-x-2">
              <span className="text-white/60">{challenge.game_type}</span>
              <span className="text-white/60">•</span>
              <span className="text-white/60">{challenge.platform}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white/60">
                {formatDate(challenge.scheduled_at || challenge.created_at)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(challenge.status)}`}>
                {challenge.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Add this helper function for status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'accepted':
        return 'bg-[#7440ff]/20 text-[#7440ff]';
      case 'completed':
        return 'bg-green-500/20 text-green-500';
      case 'declined':
        return 'bg-red-500/20 text-red-500';
      case 'expired':
        return 'bg-gray-500/20 text-gray-500';
      default:
        return 'bg-white/20 text-white';
    }
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'users':
        return renderUsersList();
      case 'active':
        return renderChallengesList();
      case 'scheduled':
        return renderChallengesList();
      case 'ended':
        return renderChallengesList();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1b2e] pb-[72px]">
      <Header title="Games" icon={<Gamepad2 className="w-6 h-6" />} showMenu={false} />

      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between px-4 border-b border-white/10">
          <div className="flex">
            {[
              { id: 'active', label: 'Active', icon: <Gamepad2 className="w-4 h-4" /> },
              { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
              { id: 'scheduled', label: 'Scheduled', icon: <Gamepad2 className="w-4 h-4" /> },
              { id: 'ended', label: 'Ended', icon: <Trophy className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3 py-2 flex items-center gap-1.5 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'text-[#7440ff] border-b-2 border-[#7440ff]'
                    : 'text-white/60 hover:text-white'
                  }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowActiveModal(true)}
              className="p-2 text-white/60 hover:text-[#CCFF00] transition-colors"
              title="Add New"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/taxi-share')}
              className="p-2 text-white/60 hover:text-[#CCFF00] transition-colors"
              title="Taxi Share Map"
            >
              <Map className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CCFF00]" />
          </div>
        ) : (
          <>
            {activeTab === 'users' && renderUsersList()}
            {activeTab !== 'users' && (
              challenges.length > 0 ? renderChallengesList() : renderEmptyState()
            )}
          </>
        )}
      </div>

      {showChallengeModal && selectedUser && currentUser && (
        <ChallengeModal
          challengerId={currentUser.id}
          challengedId={selectedUser.id}
          challengedName={selectedUser.name}
          challengedUsername={selectedUser.username}
          challengedAvatar={selectedUser.avatar_url}
          onClose={() => setShowChallengeModal(false)}
          onSuccess={() => {
            setShowChallengeModal(false);
            setActiveTab('challenges' as any);
          }}
        />
      )}

      {showActiveModal && (
        <ActiveContentModal
          onClose={() => setShowActiveModal(false)}
          content={renderActiveContent()}
        />
      )}

      <MobileFooterNav />
    </div>
  );
};

export default Games;
