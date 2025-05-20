import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wifi, WifiOff } from "lucide-react";

type ConnectionQualityProps = {
  quality: "excellent" | "good" | "fair" | "poor" | "disconnected";
  latency?: number;
  packetLoss?: number;
};

const ConnectionQuality: React.FC<ConnectionQualityProps> = ({
  quality = "good",
  latency = 25,
  packetLoss = 0.5,
}) => {
  const getQualityColor = () => {
    switch (quality) {
      case "excellent":
        return "bg-green-500";
      case "good":
        return "bg-green-400";
      case "fair":
        return "bg-yellow-400";
      case "poor":
        return "bg-orange-500";
      case "disconnected":
        return "bg-red-500";
      default:
        return "bg-green-400";
    }
  };

  const getQualityProgress = () => {
    switch (quality) {
      case "excellent":
        return 95;
      case "good":
        return 75;
      case "fair":
        return 50;
      case "poor":
        return 25;
      case "disconnected":
        return 0;
      default:
        return 75;
    }
  };

  const getQualityText = () => {
    switch (quality) {
      case "excellent":
        return "Excellent";
      case "good":
        return "Good";
      case "fair":
        return "Fair";
      case "poor":
        return "Poor";
      case "disconnected":
        return "Disconnected";
      default:
        return "Good";
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {quality === "disconnected" ? (
              <WifiOff className="h-4 w-4 text-red-500" />
            ) : (
              <Wifi
                className={`h-4 w-4 ${
                  quality === "poor" ? "text-orange-500" : "text-green-500"
                }`}
              />
            )}
            <span className="text-sm font-medium">
              Connection Quality: {getQualityText()}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Latency: {latency}ms
            </span>
            <span className="text-xs text-muted-foreground">
              Packet Loss: {packetLoss}%
            </span>
          </div>
        </div>
        <Progress
          value={getQualityProgress()}
          className={`h-1.5 ${getQualityColor()}`}
        />
      </CardContent>
    </Card>
  );
};

export default ConnectionQuality;
