import React from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  read_at: Date | null;
  metadata: any;
}

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  return (
    <div>
      {notification.type === "challenge_received" ? (
        <div>
          <p>You have been challenged!</p>Challenger: {notification.metadata.challenger_username}
          <p>Game: {notification.metadata.game_type}</p>
        </div>
      ) : (<p>Notification: {notification.title}</p>)}
    </div>
  );
};

export const NotificationList: React.FC = () => {
  const { notifications, loading, hasMore, loadMore } = useNotification();

  return (
    <div className="notifications-container">
      {notifications.map(notification => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
      
      {loading && (
        <div className="loading-spinner">Loading...</div>
      )}
      
      {hasMore && !loading && (
        <button 
          onClick={loadMore}
          className="load-more-button"
        >
          Load More
        </button>
      )}
      
      {!hasMore && notifications.length > 0 && (
        <div className="no-more-notifications">
          No more notifications
        </div>
      )}
      
      {!loading && notifications.length === 0 && (
        <div className="no-notifications">
          No notifications yet
        </div>
      )}
    </div>
  );
}