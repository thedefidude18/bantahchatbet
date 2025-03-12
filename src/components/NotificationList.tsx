export function NotificationList() {
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