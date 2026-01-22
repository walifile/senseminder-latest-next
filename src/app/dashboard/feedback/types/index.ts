export type FeedbackStatus =
  | "pending"
  | "in-progress"
  | "resolved"
  | "rejected";
export type FeedbackType = "bug" | "feature" | "general";

export type ApiFeedback = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: FeedbackType;
  rating: number;
  comment: string;
  status: FeedbackStatus;
  source: string;
  metadata?: {
    page?: string;
    browser?: string;
    os?: string;
  };
  createdAt: string;
  updatedAt: string;
};
