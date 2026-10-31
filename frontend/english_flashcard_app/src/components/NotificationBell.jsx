import { memo, useMemo, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { WS_STATUS } from "../configs/notificationSocketConfig";
import { markNotificationAsRead } from "../stores/actions/notificationAction";

const NotificationBell = memo(() => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const { items, unreadCount, loading, websocketStatus } = useSelector(
    (state) => state.notifications || {},
  );
  const isConnected = websocketStatus === WS_STATUS.CONNECTED;
  const isDisconnected = websocketStatus === WS_STATUS.DISCONNECTED;
  const bellIconClassName = isDisconnected ? "bi bi-bell-slash fs-4" : "bi bi-bell fs-4";
  const statusDotClassName = isConnected ? "bg-success" : isDisconnected ? "bg-danger" : "bg-secondary";

  const sortedItems = useMemo(
    () => [...(items || [])].sort((a, b) => Number(new Date(b.created_at)) - Number(new Date(a.created_at))),
    [items],
  );

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  return (
    <Dropdown
      align="end"
      autoClose="outside"
      className="me-3"
      onToggle={(nextShow) => setIsOpen(nextShow)}
      show={isOpen}
    >
      <Dropdown.Toggle
        aria-label="Notifications"
        className="btn btn-link position-relative text-dark p-0 border-0 shadow-none fw-normal"
        id="notification-bell-toggle"
        style={{
          "--bs-btn-hover-bg": "transparent",
          "--bs-btn-hover-border-color": "transparent",
          "--bs-btn-hover-color": "inherit",
          "--bs-btn-focus-box-shadow": "none",
          "--bs-btn-active-bg": "transparent",
          "--bs-btn-active-border-color": "transparent",
          "--bs-btn-active-color": "inherit",
        }}
      >
        <i className={bellIconClassName} />
        {unreadCount > 0 && (
          <span
            className="position-absolute start-100 translate-middle badge rounded-pill bg-danger"
            style={{ top: "10px" }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu
        className="shadow-sm pb-0"
        style={{ minWidth: 420, maxHeight: 420, overflowY: "auto" }}
      >
        <div className="d-flex justify-content-between align-items-center border-bottom px-3 py-2">
          <strong>Notifications</strong>
          <small className="text-muted d-flex align-items-center gap-2">
            <span
              className={`rounded-circle ${statusDotClassName}`}
              style={{ width: 8, height: 8 }}
              aria-hidden="true"
            />
            {websocketStatus}
          </small>
        </div>

        {loading && (
          <div className="px-3 py-2 text-muted small">Loading notifications...</div>
        )}

        {!loading && sortedItems.length === 0 && (
          <div className="px-3 py-2 text-muted small">No notifications yet.</div>
        )}

        {!loading && sortedItems.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`list-group-item list-group-item-action border-0 text-start ${item.is_read ? "text-muted" : "bg-light"} p-3 ${index === sortedItems.length - 1 ? "" : "mb-2"}`}
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
      </Dropdown.Menu>
    </Dropdown>
  );
});

export default NotificationBell;
