export interface Notification {
  id: string;
  user_id: string;
  notification_type: NotificationType; // Changed from 'type'
  title: string;
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
  read_at?: string;
  updated_at?: string;
}

export type NotificationType = 
  | 'event_win'
  | 'event_loss'
  | 'new_event'
  | 'event_update'
  | 'event_created'
  | 'event_participation'
  | 'event_joined'
  | 'event_milestone'
  | 'join_request_received'
  | 'event_join_request_accepted'
  | 'event_join_request_declined'
  | 'earnings'
  | 'follow'
  | 'group_message'
  | 'direct_message'
  | 'group_mention'
  | 'leaderboard_update'
  | 'challenge'
  | 'challenge_response'
  | 'group_achievement'
  | 'group_role'
  | 'referral'
  | 'welcome_bonus'
  | 'system'
  | 'challenge_received'
  | 'challenge_accepted'
  | 'challenge_declined'
  | 'challenge_completed'
  | 'challenge_expired'
  | 'challenge_winner'
  | 'challenge_loser';
