export interface Message {
  id: string;
  senderId: string;
  senderDisplayName: string;
  senderImageUrl: string | null;
  recipientId: string;
  recipientDisplayName: string;
  recipientImageUrl: string | null;
  content: string;
  dateRead: string | null;
  messageSent: string;
}

export interface CreateMessage {
  recipientId: string;
  content: string;
}
