import { create } from 'zustand';
import { Notification } from '@/types/notification';
import { getNotifications, markNotificationsAsRead } from '@/api/notification';

type State = {
  notifications: Notification[];
  hasUnread: boolean;
  fetchNotifications: () => Promise<void>;
  addNotification: (n: Notification) => void;
  markAllAsRead: () => Promise<void>;
};

export const useNotifications = create<State>((set, get) => ({
  notifications: [],
  hasUnread: false,

  fetchNotifications: async () => {
    const notifications = await getNotifications(); 
    set({
      notifications,
      hasUnread: notifications.some(n => !n.isRead)
    });
  },

  addNotification: (notif) => {
    const updated = [notif, ...get().notifications];
    set({
      notifications: updated,
      hasUnread: updated.some(n => !n.isRead)
    });
  },

  markAllAsRead: async () => {
    const timestamps = get().notifications
      .filter(n => !n.isRead)
      .map(n => n.timestamp);
    await markNotificationsAsRead(timestamps);
    const updated = get().notifications.map(n => ({ ...n, isRead: true }));
    set({ notifications: updated, hasUnread: false });
  }
}));
