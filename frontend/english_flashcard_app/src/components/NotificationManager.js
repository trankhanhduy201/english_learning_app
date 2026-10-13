import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "../stores/actions/notificationAction";
import {
  connectNotificationSocket,
  disconnectNotificationSocket,
} from "../stores/slices/notificationSlice";

const NotificationManager = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user ?? {});
  const userId = currentUser?.id ?? currentUser?.user_id ?? null;

  useEffect(() => {
    if (!userId) {
      dispatch(disconnectNotificationSocket());
      return undefined;
    }

    dispatch(connectNotificationSocket());
    dispatch(fetchNotifications());

    return () => {
      dispatch(disconnectNotificationSocket());
    };
  }, [dispatch, userId]);

  return null;
};

export default NotificationManager;
