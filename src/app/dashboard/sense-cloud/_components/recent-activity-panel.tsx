"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type RecentActivityItem = {
  id: string;
  action: string;
  file: string;
  user: string;
  timestamp: string;
  avatar: string;
};

type RecentActivityPanelProps = {
  recentActivity: RecentActivityItem[];
  formatTimeAgo: (timestamp: string) => string;
};

const RecentActivityPanel = ({
  recentActivity,
  formatTimeAgo,
}: RecentActivityPanelProps) => (
  <ScrollArea
    data-testid="dashboard-sense-cloud-recent-activity"
    className="flex-1"
  >
    <div className="p-4 space-y-4">
      {recentActivity.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={activity.avatar} />
            <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{activity.user}</span>
              <span className="text-muted-foreground">
                {activity.action === "edited" && "edited"}
                {activity.action === "shared" && "shared"}
                {activity.action === "uploaded" && "uploaded"}
                {activity.action === "commented" && "commented on"}
              </span>
              <span className="font-medium truncate">{activity.file}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatTimeAgo(activity.timestamp)}
            </div>
          </div>
        </div>
      ))}
    </div>
  </ScrollArea>
);

export default RecentActivityPanel;
