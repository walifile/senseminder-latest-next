export interface Ticket {
  ticketId: string;
  subject: string;
  description: string;
  status: string;
  category: string;
  priority: string;
  lastUpdated: string;
  createdAt: string;
  email: string;
  role?: string;
  attachments: Attachment[];
}

export interface Attachment {
  name: string;
  size: string;
  type: string;
  fileKey: string;
}

export interface Message {
  messageId: string;
  senderId: string;
  senderType: string;
  senderName?: string;
  type: string;
  content: string;
  timestamp: string;
  attachments?: {
    name: string;
    size: string;
    type: string;
    fileKey: string;
  }[];
}
