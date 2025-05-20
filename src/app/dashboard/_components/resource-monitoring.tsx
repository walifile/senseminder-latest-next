import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Activity,
  AlertCircle,
} from "lucide-react";

// Mock data generator for the last 20 minutes with 1-minute intervals
const generateTimeSeriesData = (baseValue: number, variance: number) => {
  const now = new Date();
  return Array.from({ length: 20 }, (_, i) => {
    const time = new Date(now.getTime() - (19 - i) * 60000);
    return {
      time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      value: Math.max(
        0,
        Math.min(100, baseValue + (Math.random() * variance * 2 - variance))
      ),
    };
  });
};

const ResourceMonitoring = () => {
  const [cpuData, setCpuData] = React.useState(generateTimeSeriesData(40, 20));
  const [memoryData, setMemoryData] = React.useState(
    generateTimeSeriesData(60, 10)
  );
  const [diskData, setDiskData] = React.useState(generateTimeSeriesData(25, 5));
  const [networkData, setNetworkData] = React.useState(
    generateTimeSeriesData(30, 15)
  );
  const [isLive, setIsLive] = React.useState(true);

  // Update data every second when live
  React.useEffect(() => {
    if (!isLive) return;

    const updateData = () => {
      const now = new Date();
      const newPoint = (data: typeof cpuData) => {
        const baseValue = data[data.length - 1].value;
        const newValue = Math.max(
          0,
          Math.min(100, baseValue + (Math.random() * 10 - 5))
        );
        return [
          ...data.slice(1),
          {
            time: now.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            value: newValue,
          },
        ];
      };

      setCpuData((prev) => newPoint(prev));
      setMemoryData((prev) => newPoint(prev));
      setDiskData((prev) => newPoint(prev));
      setNetworkData((prev) => newPoint(prev));
    };

    const interval = setInterval(updateData, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isLive]); // Only depend on isLive state

  const getStatusColor = (value: number) => {
    if (value >= 90) return "text-red-500";
    if (value >= 70) return "text-yellow-500";
    return "text-green-500";
  };

  const renderMetricCard = (
    icon: React.ReactNode,
    name: string,
    value: number,
    unit: string,
    data: typeof cpuData,
    color: string
  ) => (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${getStatusColor(value)}`}>
            {value.toFixed(1)}
            {unit}
          </span>
          {value >= 90 && <AlertCircle className="h-4 w-4 text-red-500" />}
        </div>
      </div>
      <div className="h-[100px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="time"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
            />
            <YAxis hide domain={[0, 100]} />
            <Tooltip
              content={({ active, payload }) => {
                if (
                  active &&
                  payload &&
                  payload.length &&
                  typeof payload[0].value === "number"
                ) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">
                            {payload[0].payload.time}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">
                            {payload[0].value.toFixed(1)}
                            {unit}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <Card className="col-span-full">
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <h2 className="text-xl font-semibold tracking-tight">
                Resource Monitor
              </h2>
              {isLive && (
                <Badge variant="secondary" className="text-xs">
                  Live
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Real-time system resource utilization
            </p>
          </div>
          <Button
            variant={isLive ? "default" : "outline"}
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            <Activity className="mr-2 h-4 w-4" />
            {isLive ? "Monitoring" : "Start Monitoring"}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderMetricCard(
            <Cpu className="h-4 w-4" />,
            "CPU Usage",
            cpuData[cpuData.length - 1].value,
            "%",
            cpuData,
            "#8B5CF6"
          )}
          {renderMetricCard(
            <MemoryStick className="h-4 w-4" />,
            "Memory",
            memoryData[memoryData.length - 1].value,
            "%",
            memoryData,
            "#0EA5E9"
          )}
          {renderMetricCard(
            <HardDrive className="h-4 w-4" />,
            "Disk I/O",
            diskData[diskData.length - 1].value,
            "%",
            diskData,
            "#F97316"
          )}
          {renderMetricCard(
            <Network className="h-4 w-4" />,
            "Network",
            networkData[networkData.length - 1].value,
            "%",
            networkData,
            "#10B981"
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceMonitoring;
