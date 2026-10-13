import { memo, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { markNotificationAsRead } from "../stores/actions/notificationAction";

const NotificationBell = memo(() => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const { items, unreadCount, loading, websocketStatus } = useSelector(
    (state) => state.notifications || {},
  );

  const sortedItems = useMemo(
    () => [...(items || [])].sort((a, b) => Number(new Date(b.created_at)) - Number(new Date(a.created_at))),
    [items],
  );

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  return (
    <div className="position-relative me-3">
      <button
        type="button"
        className="btn btn-link position-relative text-dark p-0"
        aria-label="Notifications"
        onClick={() => setIsOpen((value) => !value)}
      >
        <i className="bi bi-bell fs-4" />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="dropdown-menu show position-absolute end-0 mt-2 shadow-sm border-0"
          style={{ minWidth: 320, maxHeight: 420, overflowY: "auto" }}
        >
          <div className="d-flex justify-content-between align-items-center border-bottom px-3 py-2">
            <strong>Notifications</strong>
            <small className="text-muted">{websocketStatus}</small>
          </div>

          {loading && (
            <div className="px-3 py-2 text-muted small">Loading notifications...</div>
          )}

          {!loading && sortedItems.length === 0 && (
            <div className="px-3 py-2 text-muted small">No notifications yet.</div>
          )}

          {!loading && sortedItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`list-group-item list-group-item-action border-0 text-start ${item.is_read ? "text-muted" : "bg-light"}`}
              onClick={() => !item.is_read && handleMarkAsRead(item.id)}
            >
              <div className="d-flex justify-content-between align-items-start gap-2">
                <strong className="small">{item.title}</strong>
                {!item.is_read && <span className="badge bg-primary rounded-pill">New</span>}
              </div>
              <div className="small mt-1">{item.message}</div>
              <div className="small text-muted mt-1">
                {item.created_at ? new Date(item.created_at).toLocaleString() : "Just now"}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default NotificationBell;
