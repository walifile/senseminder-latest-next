export interface Notification {
  userId: string;
  timestamp: string;
  title: string;
  content: string;
  route?: string;
  severity: 'info' | 'warning' | 'critical';
  type: string; // <== required field causing TS error
  isRead: boolean;
}