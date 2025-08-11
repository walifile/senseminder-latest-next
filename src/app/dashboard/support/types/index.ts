export interface Ticket {
  ticketId: string;
  subject: string;
  description: string;
  status: string;
  category: string;
  priority: string;
  createdAt: string;
  attachments: Attachment[];
}

export interface Attachment {
  name: string;
  size: string;
  type: string;
  fileKey: string;
}
