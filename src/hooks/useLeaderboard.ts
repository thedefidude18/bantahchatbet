import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface LeaderboardUser {
  id: string;
  name: string;
  username: string;
  avatar_url: string;
  groups_joined: number;
  events_won: number;
  total_winnings: number;
  rank: number;
}

export function useLeaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      // First, get all users with their event participation
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          name,
          username,
          avatar_url,
          event_participants (
            prediction,
            event:events (
              wager_amount,
              status
            )
          )
        `);

      if (usersError) throw usersError;

      // For chat participants, use a count query
      const { data: chatData, error: chatError } = await supabase
        .rpc('count_user_chats', { }) // Create this function if it doesn't exist
        .select('user_id, count');

      if (chatError) {
        console.warn('Error fetching chat participants:', chatError);
      }

      // Create a map of user_id to chat count
      const chatCountMap = new Map(
        (chatData || []).map(item => [item.user_id, parseInt(item.count)])
      );

      // Process user data
      const processedUsers = usersData.map(user => ({
        id: user.id,
        name: user.name || 'Anonymous User',
        username: user.username || `user_${user.id.slice(0, 8)}`,
        avatar_url: user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        groups_joined: chatCountMap.get(user.id) || 0,
        events_won: (user.event_participants || []).filter(ep => 
          ep.event.status === 'completed' && ep.prediction === true
        ).length,
        total_winnings: (user.event_participants || [])
          .filter(ep => ep.event.status === 'completed' && ep.prediction === true)
          .reduce((sum, ep) => sum + (ep.event.wager_amount || 0), 0),
        rank: 0
      }));

      // Sort and assign ranks
      const sortedUsers = processedUsers.sort((a, b) => {
        const aScore = a.groups_joined * 10 + a.events_won * 20 + a.total_winnings;
        const bScore = b.groups_joined * 10 + b.events_won * 20 + b.total_winnings;
        return bScore - aScore;
      });

      sortedUsers.forEach((user, index) => {
        user.rank = index + 1;
      });

      setUsers(sortedUsers);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { users, loading, fetchLeaderboard };
}
