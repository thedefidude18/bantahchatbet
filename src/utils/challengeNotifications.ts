import { supabase } from '../lib/supabase';
import { NotificationType } from '../types/notifications';

interface ChallengeNotificationParams {
  userId: string;
  challengeId: string;
  challengeTitle: string;
  amount: number;
  opponentName: string;
  opponentUsername: string;
}

export const sendChallengeNotification = async (
  type: NotificationType,
  params: ChallengeNotificationParams
) => {
  const notificationContent = {
    challenge_received: {
      title: '🎮 New Challenge Received',
      content: `@${params.opponentUsername} has challenged you to "${params.challengeTitle}" for ₦${params.amount.toLocaleString()}`
    },
    challenge_accepted: {
      title: '✅ Challenge Accepted',
      content: `@${params.opponentUsername} accepted your challenge "${params.challengeTitle}"`
    },
    challenge_declined: {
      title: '❌ Challenge Declined',
      content: `@${params.opponentUsername} declined your challenge "${params.challengeTitle}"`
    },
    challenge_completed: {
      title: '🏁 Challenge Completed',
      content: `Your challenge "${params.challengeTitle}" with @${params.opponentUsername} has been completed`
    },
    challenge_winner: {
      title: '🏆 Challenge Won!',
      content: `Congratulations! You won the challenge "${params.challengeTitle}" against @${params.opponentUsername}. You earned ₦${params.amount.toLocaleString()}`
    },
    challenge_loser: {
      title: '😔 Challenge Lost',
      content: `You lost the challenge "${params.challengeTitle}" against @${params.opponentUsername}`
    },
    challenge_expired: {
      title: '⏰ Challenge Expired',
      content: `Your challenge "${params.challengeTitle}" with @${params.opponentUsername} has expired`
    }
  };

  const content = notificationContent[type];
  if (!content) return;

  return await supabase.from('notifications').insert({
    user_id: params.userId,
    notification_type: type,
    title: content.title,
    content: content.content,
    metadata: {
      challenge_id: params.challengeId,
      challenge_title: params.challengeTitle,
      amount: params.amount,
      opponent_username: params.opponentUsername
    }
  });
};