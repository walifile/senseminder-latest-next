export type ApiUser = {
  email: string;
  firstName?: string;
  lastName?: string;
  id: string;
  role: "admin" | "member";
  owner_id: string;
  createdAt: string;
  country?: string;
  organization?: string;
  phoneNumber?: string;
  status?: "active" | "pending" | string;
};
