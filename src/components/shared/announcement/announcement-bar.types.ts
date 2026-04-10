export type AnnouncementSeverity =
  | "normal"
  | "info"
  | "success"
  | "warning"
  | "critical";

export type AnnouncementPlacement = "public" | "dashboard";

export type AnnouncementItem = {
  announcement_id: string;
  title: string;
  message: string;
  severity?: AnnouncementSeverity;
  category?: string;
  dismissible?: boolean;
  version?: number;
  cta_label?: string;
  cta_url?: string;
};

export type GetAnnouncementsArgs = {
  path: string;
  placement?: AnnouncementPlacement;
  auth?: boolean;
};

export type GetAnnouncementsResponse = {
  items: AnnouncementItem[];
};
